<?php

use Psr\Log\LoggerInterface;

/**
 * Acceso a la base de datos con mysqli.
 *
 * - Consultas preparadas: cada método recibe un arreglo opcional $params.
 *   En el SQL se usa ? en lugar de concatenar valores:
 *       $db->executeSQL("SELECT * FROM products WHERE id = ?", [$id]);
 *   Se ejecutan con mysqli::execute_query (PHP 8.2+), que prepara la
 *   sentencia, enlaza los valores y la ejecuta. Así se evita la inyección SQL.
 *
 * - Transacciones: transaction() abre UNA conexión, ejecuta todas las
 *   sentencias dentro de ella y hace COMMIT; si algo falla hace ROLLBACK.
 *   Fuera de una transacción cada método abre y cierra su propia conexión.
 */
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
	/**
	 * Establecer la conexión (si no hay una abierta)
	 */
	public function connect() {
		if ($this->link !== null) {
			return;
		}
		// Desde PHP 8.1 mysqli lanza mysqli_sql_exception ante cualquier error
		mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		$this->link = mysqli_init();
		// Enteros como int en JSON, igual con o sin parámetros (DECIMAL sigue siendo texto)
		$this->link->options(MYSQLI_OPT_INT_AND_FLOAT_NATIVE, 1);
		$this->link->real_connect($this->host, $this->username, $this->password, $this->dbname);
		// Tildes y ñ correctas entre PHP y MySQL 8
		$this->link->set_charset('utf8mb4');
	}
	/**
	 * Cerrar la conexión, salvo que haya una transacción en curso
	 */
	private function close() {
		if (!$this->inTransaction && $this->link !== null) {
			$this->link->close();
			$this->link = null;
		}
	}
	/**
	 * Ejecuta la sentencia: preparada si hay parámetros, directa si no
	 */
	private function run($sql, array $params) {
		$this->connect();
		if (empty($params)) {
			return $this->link->query($sql);
		}
		return $this->link->execute_query($sql, array_values($params));
	}
	/**
	 * Manejo de errores: dentro de una transacción se relanza la excepción
	 * para que transaction() haga ROLLBACK; fuera de ella se responde el error.
	 */
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
		// Compatibilidad: executeSQL($sql, "asoc")
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
	/**
	 * Ejecutar varias sentencias como una sola unidad (todo o nada).
	 *   $id = $db->transaction(function ($db) use ($data) {
	 *       $id = $db->executeSQL_DML_last("INSERT ...", [...]);
	 *       $db->executeSQL_DML("UPDATE ...", [...]);
	 *       return $id;
	 *   });
	 * @param callable $callback recibe esta misma conexión
	 * @return mixed lo que devuelva el callback
	 */
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
			// Las excepciones de negocio (validaciones) las maneja el controlador
			throw $e;
		}
	}
}
