import * as yup from 'yup';

//Campo numérico que si queda vacío dice "es requerido" y no "no es un número"
//(un input type="number" vacío llega como '' y Yup lo convierte en NaN)
export const numberField = (label) =>
  yup
    .number()
    .transform((value, original) => (original === '' || original === null ? undefined : value))
    .typeError(`${label} debe ser un número`)
    .label(label);

//Hoy a las 00:00, para validar que no pongan fechas pasadas
export const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

//Imagen: revisa tipo y tamaño. required=true si es obligatoria
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_MB = 2;
export const imageField = (required = false) =>
  yup
    .mixed()
    .nullable()
    .label('Imagen')
    .test('required', 'Imagen es requerida', (file) => !required || file instanceof File)
    .test('type', 'La imagen debe ser JPG, PNG o WEBP', (file) => !(file instanceof File) || IMAGE_TYPES.includes(file.type))
    .test('size', `La imagen no puede superar ${MAX_IMAGE_MB} MB`, (file) => !(file instanceof File) || file.size <= MAX_IMAGE_MB * 1024 * 1024);
