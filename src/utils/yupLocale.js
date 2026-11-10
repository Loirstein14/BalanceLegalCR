import * as yup from 'yup';

//Mensajes de Yup en español para toda la app, así no hay que escribirlos campo por campo.
//${label} es el nombre que se le pone a cada campo con .label('Nombre') en el esquema.
//Se importa una sola vez en main.jsx
yup.setLocale({
  mixed: {
    required: '${label} es requerido',
    notType: '${label} no tiene un valor válido',
    oneOf: '${label} no tiene un valor permitido',
  },
  string: {
    min: '${label} debe tener al menos ${min} caracteres',
    max: '${label} no puede superar ${max} caracteres',
    email: '${label} no tiene un formato de correo válido',
    matches: '${label} no tiene el formato correcto',
  },
  number: {
    min: '${label} debe ser mayor o igual a ${min}',
    max: '${label} debe ser menor o igual a ${max}',
    integer: '${label} debe ser un número entero',
    positive: '${label} debe ser mayor que 0',
  },
  date: {
    min: '${label} no puede ser anterior a ${min}',
  },
  array: {
    min: 'Seleccione al menos ${min} ${label}',
  },
});
