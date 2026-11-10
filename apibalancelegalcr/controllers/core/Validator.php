<?php
//Validaciones del lado de la API (no hay que confiar solo en el formulario de React,
//cualquiera puede mandar datos con Postman). Se usa así:
//  $v = new Validator($data);
//  $v->required('name', 'Nombre')->maxLength('name', 120, 'Nombre');
//  $v->validate(); //si hay errores tira una ValidationException
//Ojo: menos required, las demás reglas no hacen nada si el campo viene vacío
class Validator
{
    private array $data;
    private array $errors = [];

    public function __construct($data)
    {
        $this->data = is_object($data) ? get_object_vars($data) : (array) $data;
    }

    private function value(string $field)
    {
        $value = $this->data[$field] ?? null;
        return is_string($value) ? trim($value) : $value;
    }

    private function isEmpty($value): bool
    {
        return $value === null || $value === '' || (is_array($value) && count($value) === 0);
    }

    public function addError(string $field, string $message): self
    {
        //Nada más se guarda el primer error de cada campo
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = $message;
        }
        return $this;
    }

    public function required(string $field, string $label): self
    {
        if ($this->isEmpty($this->value($field))) {
            $this->addError($field, "$label es requerido");
        }
        return $this;
    }

    public function minLength(string $field, int $min, string $label): self
    {
        $value = $this->value($field);
        if (!$this->isEmpty($value) && mb_strlen((string) $value) < $min) {
            $this->addError($field, "$label debe tener al menos $min caracteres");
        }
        return $this;
    }

    public function maxLength(string $field, int $max, string $label): self
    {
        $value = $this->value($field);
        if (!$this->isEmpty($value) && mb_strlen((string) $value) > $max) {
            $this->addError($field, "$label no puede superar $max caracteres");
        }
        return $this;
    }

    public function integer(string $field, int $min, int $max, string $label): self
    {
        $value = $this->value($field);
        if ($this->isEmpty($value)) {
            return $this;
        }
        if (filter_var($value, FILTER_VALIDATE_INT) === false) {
            $this->addError($field, "$label debe ser un número entero");
        } elseif ((int) $value < $min || (int) $value > $max) {
            $this->addError($field, "$label debe estar entre $min y $max");
        }
        return $this;
    }

    public function decimal(string $field, float $min, float $max, string $label): self
    {
        $value = $this->value($field);
        if ($this->isEmpty($value)) {
            return $this;
        }
        if (!is_numeric($value)) {
            $this->addError($field, "$label debe ser un número");
        } elseif ((float) $value < $min || (float) $value > $max) {
            $this->addError($field, "$label debe estar entre $min y $max");
        }
        return $this;
    }

    public function email(string $field, string $label): self
    {
        $value = $this->value($field);
        if (!$this->isEmpty($value) && filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            $this->addError($field, "$label no tiene un formato de correo válido");
        }
        return $this;
    }

    public function pattern(string $field, string $regex, string $message): self
    {
        $value = $this->value($field);
        if (!$this->isEmpty($value) && !preg_match($regex, (string) $value)) {
            $this->addError($field, $message);
        }
        return $this;
    }

    public function in(string $field, array $allowed, string $label): self
    {
        $value = $this->value($field);
        //Se comparan como texto porque 60 y "60" son lo mismo
        if (!$this->isEmpty($value) && !in_array((string) $value, array_map('strval', $allowed), true)) {
            $this->addError($field, "$label no tiene un valor permitido");
        }
        return $this;
    }

    //Fecha AAAA-MM-DD; con $notPast no deja poner fechas pasadas
    public function date(string $field, string $label, bool $notPast = false): self
    {
        $value = $this->value($field);
        if ($this->isEmpty($value)) {
            return $this;
        }
        $date = DateTime::createFromFormat('!Y-m-d', (string) $value);
        if (!$date || $date->format('Y-m-d') !== $value) {
            $this->addError($field, "$label no es una fecha válida");
        } elseif ($notPast && $date < new DateTime('today')) {
            $this->addError($field, "$label no puede ser anterior a hoy");
        }
        return $this;
    }

    //Hora HH:MM en formato de 24 horas
    public function time(string $field, string $label): self
    {
        return $this->pattern($field, '/^([01]\d|2[0-3]):[0-5]\d(:00)?$/', "$label no es una hora válida (HH:MM)");
    }

    //La hora de fin tiene que ser después de la de inicio
    public function timeRange(string $startField, string $endField, string $label): self
    {
        $start = $this->value($startField);
        $end = $this->value($endField);
        if (!$this->isEmpty($start) && !$this->isEmpty($end) && !isset($this->errors[$endField])
            && substr((string) $end, 0, 5) <= substr((string) $start, 0, 5)) {
            $this->addError($endField, "$label debe ser mayor que la hora de inicio");
        }
        return $this;
    }

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function validate(): void
    {
        if ($this->fails()) {
            throw new ValidationException($this->errors);
        }
    }
}
