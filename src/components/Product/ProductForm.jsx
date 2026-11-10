import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import { FormTextField } from '../Form/FormTextField';
import { FormSelect } from '../Form/FormSelect';
import { FormImageInput } from '../Form/FormImageInput';
import { numberField, imageField } from '../../utils/yupHelpers';
import { handleApiError } from '../../utils/apiErrors';
import { DELIVERY_FORMAT_OPTIONS, MAX_DELIVERY_DAYS } from '../../utils/productOptions';

//Validaciones del formulario (las mismas que revisa la API)
const productSchema = yup.object({
  name: yup.string().trim().required().min(3).max(120).label('Nombre'),
  description: yup.string().trim().required().min(10).max(1000).label('Descripción'),
  price: numberField('Precio').required().min(1).max(9999999),
  category_id: yup.number().typeError('Categoría es requerida').required().label('Categoría'),
  delivery_format: yup.string().required('Formato de entrega es requerido').label('Formato de entrega'),
  delivery_days: numberField('Tiempo de entrega').required().integer().min(0).max(MAX_DELIVERY_DAYS),
  image: imageField(false), //No es obligatoria; si viene tiene que ser JPG/PNG/WEBP y máximo 2 MB
});

//Valores con los que arranca el formulario vacío
const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  delivery_format: '',
  delivery_days: '',
  image: null,
};

//El mismo formulario sirve para CREAR (/product/create) y MODIFICAR (/product/update/:id).
//Si la ruta trae id, se carga el producto y se guarda con PUT; si no, se crea con POST
export function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const IMG_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  const [categories, setCategories] = useState([]); //Opciones del select de categorías
  const [currentImage, setCurrentImage] = useState(null); //La imagen que ya tiene (solo cuando se modifica)
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: emptyProduct,
    resolver: yupResolver(productSchema),
  });

  //Traer las categorías de la BD y, si es modificar, también el producto para llenar el form
  useEffect(() => {
    const requests = [CategoryService.getCategories()];
    if (isEdit) requests.push(ProductService.getProductById(id));
    Promise.all(requests)
      .then(([categoriesResponse, productResponse]) => {
        setCategories(categoriesResponse.data.map((c) => ({ value: c.id, label: c.name })));
        if (productResponse) {
          const p = productResponse.data;
          reset({
            name: p.name,
            description: p.description ?? '',
            price: p.price,
            category_id: p.category_id,
            delivery_format: p.delivery_format_code,
            delivery_days: p.delivery_days,
            image: null,
          });
          setCurrentImage(p.image_path ? `${IMG_URL}/${p.image_path}` : null);
        }
        setLoaded(true);
      })
      .catch((error) => {
        console.log(error);
        setLoadError(isEdit ? 'No se encontró el producto' : 'No se pudieron cargar las categorías');
        setLoaded(true);
      });
  }, [id, isEdit, reset, IMG_URL]);

  //Guardar: 1) los datos en JSON (POST o PUT)  2) la imagen aparte, si escogieron una
  const onSubmit = async (values) => {
    const { image, ...product } = values;
    let saved;
    try {
      const response = isEdit
        ? await ProductService.updateProduct({ ...product, id: Number(id) })
        : await ProductService.createProduct(product);
      saved = response.data;
    } catch (error) {
      handleApiError(error, setError); //Los errores de la API salen debajo de cada campo
      return;
    }
    if (image instanceof File) {
      try {
        await ProductService.uploadImage(saved.id, image);
      } catch (error) {
        //Los datos sí se guardaron, solo falló la imagen: se manda a modificar para volver a intentar
        handleApiError(error, setError);
        toast.error('El producto se guardó, pero la imagen no. Intente subirla de nuevo.');
        navigate(`/product/update/${saved.id}`, { replace: true });
        return;
      }
    }
    toast.success(isEdit ? 'Producto modificado correctamente' : 'Producto creado correctamente');
    navigate(`/product/${saved.id}`, { replace: true }); //replace: para que 'Regresar' no vuelva al form
  };

  if (!loaded) return <p>Cargando...</p>;
  if (loadError) return <p>Error: {loadError}</p>;

  return (
    <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {isEdit ? 'Modificar producto' : 'Crear producto'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Los campos con * son obligatorios.
      </Typography>
      {/* noValidate: para que valide Yup y no el navegador */}
      <form noValidate onSubmit={handleSubmit(onSubmit, () => toast.error('Revise los campos marcados'))}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <FormTextField name="name" control={control} label="Nombre" required />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField name="price" control={control} label="Precio (₡)" type="number" required htmlInput={{ min: 1, step: 500 }} />
          </Grid>
          <Grid size={12}>
            <FormTextField name="description" control={control} label="Descripción" required multiline rows={3} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelect name="category_id" control={control} label="Categoría" options={categories} required />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelect name="delivery_format" control={control} label="Formato de entrega" options={DELIVERY_FORMAT_OPTIONS} required />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="delivery_days"
              control={control}
              label="Tiempo de entrega (días hábiles)"
              type="number"
              required
              htmlInput={{ min: 0, max: MAX_DELIVERY_DAYS, step: 1 }}
            />
          </Grid>
          <Grid size={12}>
            <FormImageInput name="image" control={control} currentImageUrl={currentImage} />
          </Grid>
          <Grid size={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/product-table')}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
