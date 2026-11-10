//Opciones y formatos de los servicios (los mismos valores que valida la API)

//Modalidad de atención (igual al ENUM de la BD)
export const MODALITY_OPTIONS = [
  { value: 'in_person', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'home', label: 'A domicilio' },
];

//Duración: bloques de 1 o 2 horas (el profe dijo que nada más pequeño que eso)
export const DURATION_OPTIONS = [
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
];

export const modalityLabel = (value) => MODALITY_OPTIONS.find((o) => o.value === value)?.label ?? value;

export const durationLabel = (minutes) =>
  DURATION_OPTIONS.find((o) => o.value === Number(minutes))?.label ?? `${minutes} minutos`;

export const formatPrice = (price) => `₡${Number(price).toLocaleString('es-CR')}`;
