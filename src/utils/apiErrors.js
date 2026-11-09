import toast from 'react-hot-toast';

//Muestra los errores que devuelve la API al guardar.
//La API responde { status, message, errors: { campo: mensaje } } (422 validación, 409 conflicto).
//Con setError (de useForm) cada mensaje aparece debajo de su campo; además se muestra un toast.
export function handleApiError(error, setError) {
  const data = error?.response?.data;
  if (data?.errors && setError) {
    Object.entries(data.errors).forEach(([field, message]) => {
      setError(field, { type: 'server', message });
    });
  }
  if (!error?.response) {
    toast.error('No se pudo conectar con el servidor');
    return;
  }
  toast.error(data?.message || 'No se pudo completar la operación');
}
