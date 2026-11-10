<?php

use Psr\Log\LoggerInterface;

//Clase para conectarse a la BD con mysqli
//Ojo: ahora los métodos reciben un arreglo de parámetros (opcional).
//En el SQL se pone ? en vez de meter los valores directo, por ejemplo:
//  $db->executeSQL("SELECT * FROM products WHERE id = ?", [$id]);
//MySQL recibe los valores aparte, entonces no hay chance de inyección SQL.
//Para guardar varias cosas juntas (todo o nada) se usa transaction().
class MySqlConnect {
	private $username;
	private $password;
	private $host;
	private $dbname;
	private $link = null;
	private $inTransaction = false;

	private $log;

	public function __construct() {
		// Parametros de conexión
		$this->username = Config::get('DB_USERNAME');
		$this->password = Config::get('DB_PASSWORD');
		$this->host = Config::get('DB_HOST');
		$this->dbname = Config::get('DB_DBNAME');
		//Instancia Log
		$this->log = new Logger();
	}
	//Conectarse a la BD (si ya hay una conexión abierta se usa esa)
	public function connect() {
		if ($this->link !== null) {
			return;
		}
		//Con esto cualquier error de MySQL se tira como excepción
		mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		$this->link = mysqli_init();
		//Para que los id vengan como número y no como texto en el JSON
		$this->link->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, 1);
		$this->link->real_connect($this->host, $this->username, $this->password, $this->dbname);
		//Para que las tildes y la ñ lleguen bien
		$this->link->set_charset('utf8mb4');
	}
	//Cerrar la conexión (menos si estamos en medio de una transacción)
	private function close() {
		if (!$this->inTransaction && $this->link !== null) {
			$this->link->close();
			$this->link = null;
		}
	}
	//Si trae parámetros la ejecuta como consulta preparada, si no, normal
	private function run($sql, array $params) {
		$this->connect();
		if (empty($params)) {
			return $this->link->query($sql);
		}
		return $this->link->execute_query($sql, array_values($params));
	}
	//Si estamos en una transacción se tira el error para que se haga el ROLLBACK,
	//si no, se responde el error de una vez
	private function fail(Throwable $e) {
		if ($this->inTransaction) {
			throw $e;
		}
		$this->close();
		handleException($e);
	}
	/**
	 * Ejecutar una setencia SQL tipo SELECT
	 * @param $sql - string sentencia SQL (con ? para los valores)
	 * @param $params - array valores para los ?, en orden
	 * @param $resultType - tipo de formato del resultado (obj,asoc,num)
	 * @return array|null lista de filas
	 */
	public function executeSQL($sql, $params = [], $resultType = "obj") {
		//Por si se llama como antes: executeSQL($sql, "asoc")
		if (is_string($params)) {
			$resultType = $params;
			$params = [];
		}
		$lista = NULL;
		try {
			$result = $this->run($sql, $params);
			while ($row = match ($resultType) {
				"asoc" => $result->fetch_assoc(),
				"num" => $result->fetch_row(),
				default => $result->fetch_object(),
			}) {
				$lista[] = $row;
			}
			$result->free();
			$this->close();
			return $lista;
		} catch (Throwable $e) {
			$this->fail($e);
		}
	}
	/**
	 * Ejecutar una setencia SQL tipo INSERT, UPDATE, DELETE
	 * @return int número de filas afectadas
	 */
	public function executeSQL_DML($sql, $params = []) {
		try {
			$this->run($sql, $params);
			$num_results = $this->link->affected_rows;
			$this->close();
			return $num_results;
		} catch (Throwable $e) {
			$this->fail($e);
		}
	}
	/**
	 * Ejecutar una setencia SQL tipo INSERT
	 * @return int último id insertado
	 */
	public function executeSQL_DML_last($sql, $params = []) {
		try {
			$this->run($sql, $params);
			$lastId = $this->link->insert_id;
			$this->close();
			return $lastId;
		} catch (Throwable $e) {
			$this->fail($e);
		}
	}
	//Ejecuta varias consultas como si fueran una sola (todo o nada).
	//Si alguna se cae, se deshace todo con ROLLBACK. Se usa así:
	//  $id = $db->transaction(function ($db) {
	//      $id = $db->executeSQL_DML_last("INSERT ...", [...]);
	//      $db->executeSQL_DML("UPDATE ...", [...]);
	//      return $id;
	//  });
	public function transaction(callable $callback) {
		try {
			$this->connect();
			$this->link->begin_transaction();
			$this->inTransaction = true;
			$result = $callback($this);
			$this->link->commit();
			$this->inTransaction = false;
			$this->close();
			return $result;
		} catch (Throwable $e) {
			if ($this->inTransaction) {
				$this->link->rollback();
				$this->inTransaction = false;
			}
			$this->close();
			//Los errores (de validación o de la BD) los maneja el controlador
			throw $e;
		}
	}
}
