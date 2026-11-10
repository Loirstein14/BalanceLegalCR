import toast from 'react-hot-toast';

//Para mostrar los errores que manda la API cuando se guarda algo.
//La API responde { status, message, errors: { campo: mensaje } } (422 validación, 409 conflicto).
//Con setError (de useForm) cada error sale debajo de su campo y además se tira un toast
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
