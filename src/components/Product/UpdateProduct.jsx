import { useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { FormHelperText } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import ImageService from '../../services/ImageService';
import { SelectCategory } from './Form/SelectCategory';
import { SelectDeliveryFormat } from './Form/SelectDeliveryFormat';

export function UpdateProduct() {
  const navigate = useNavigate();
  const routeParams = useParams();
  //Id del producto a actualizar
  const id = routeParams.id || null;
  //Url de las imágenes guardadas en el API
  const BASE_URL = import.meta.env.VITE_BASE_URL + 'uploads';
  //Valores a precargar en el formulario, vienen del API
  const [values, setValores] = useState(null);
  //Obtener el producto del API
  useEffect(() => {
    if (id != undefined && !isNaN(Number(id))) {
      ProductService.getProductById(id)
        .then((response) => {
          console.log(response.data);
          //Dar formato: el formulario ocupa el código del formato de entrega, no el texto
          setValores({
            id: response.data.id,
            name: response.data.name,
            description: response.data.description,
            price: response.data.price,
            category_id: response.data.category_id,
            delivery_format: response.data.delivery_format_code,
            delivery_days: response.data.delivery_days,
          });
          //Si ya tiene imagen se muestra
          if (response.data.image_path) {
            setFileURL(`${BASE_URL}/${response.data.image_path}`);
          }
        })
        .catch((error) => {
          console.log(error);
          setError(error);
        });
    }
  }, [id, BASE_URL]);
  // Esquema de validación
  const productSchema = yup.object({
    name: yup
      .string()
      .required('El nombre es requerido')
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(120, 'El nombre puede tener máximo 120 caracteres'),
    description: yup
      .string()
      .required('La descripción es requerida')
      .min(10, 'La descripción debe tener al menos 10 caracteres'),
    price: yup
      .number()
      .typeError('Solo acepta números')
      .required('El precio es requerido')
      .positive('El precio debe ser mayor a 0'),
    category_id: yup
      .number()
      .typeError('Seleccione una categoría')
      .required('La categoría es requerida'),
    delivery_format: yup.string().required('El formato de entrega es requerido'),
    delivery_days: yup
      .number()
      .typeError('Solo acepta números')
      .required('El tiempo de entrega es requerido')
      .integer('Solo acepta números enteros')
      .min(0, 'No puede ser negativo')
      .max(30, 'Máximo 30 días hábiles'),
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category_id: '',
      delivery_format: '',
      delivery_days: '',
    },
    //Valores a precargar en el formulario
    values,
    // Asignación de validaciones
    resolver: yupResolver(productSchema),
  });

  //Gestión de errores
  const [error, setError] = useState('');
  // Si ocurre error al realizar el submit
  const onError = (errors, e) => console.log(errors, e);

  //Imagen escogida y su vista previa (igual que en MovieUploadImage)
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  function handleChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFileURL(URL.createObjectURL(e.target.files[0]));
      setFile(e.target.files[0]);
    }
  }
  //Si escogió otra imagen se sube después de guardar los datos
  const saveImage = (idProduct) => {
    if (!file) {
      return navigate('/product-table');
    }
    let formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'product');
    formData.append('id', idProduct);
    ImageService.createImage(formData)
      .then(() => navigate('/product-table'))
      .catch((error) => {
        console.log(error);
        //Los datos sí se guardaron, solo falló la imagen: se queda en el formulario para intentar de nuevo
        toast.error(typeof error.response?.data === 'string' ? error.response.data : 'No se pudo subir la imagen');
      });
  };

  // Accion submit
  const onSubmit = (DataForm) => {
    console.log('Formulario:');
    console.log(DataForm);
    try {
      //Actualizar producto (DataForm trae el id porque viene en values)
      ProductService.updateProduct(DataForm)
        .then((response) => {
          //Respuesta al usuario
          if (response.data != null) {
            toast.success(`Producto actualizado #${response.data.id} - ${response.data.name}`, {
              duration: 4000,
              position: 'top-center',
            });
            saveImage(response.data.id);
          }
        })
        .catch((error) => {
          console.log(error);
          //Si el API manda un mensaje (por ejemplo, nombre repetido) se le muestra al usuario
          toast.error(
            typeof error.response?.data === 'string' && error.response.data
              ? error.response.data
              : 'No se pudo actualizar el producto',
          );
        });
    } catch (error) {
      console.error(error);
    }
  };

  //Lista de categorías
  const [dataCategory, setDataCategory] = useState({});
  const [loadedCategory, setLoadedCategory] = useState(false);
  useEffect(() => {
    CategoryService.getCategories()
      .then((response) => {
        console.log(response);
        setDataCategory(response.data);
        setLoadedCategory(true);
      })
      .catch((error) => {
        console.log(error);
        setError(error);
        setLoadedCategory(false);
      });
  }, []);

  if (error) return <p>Error: {error.message}</p>;
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <Grid container spacing={1}>
          <Grid size={12}>
            <Typography variant="h5" gutterBottom>
              Actualizar Producto
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              {/* Controlador y entrada de formulario name */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="name"
                    label="Nombre"
                    error={Boolean(errors.name)}
                    helperText={errors.name ? errors.name.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="price"
                    label="Precio (₡)"
                    error={Boolean(errors.price)}
                    helperText={errors.price ? errors.price.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={12}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="description"
                    label="Descripción"
                    multiline
                    rows={3}
                    error={Boolean(errors.description)}
                    helperText={errors.description ? errors.description.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              {/* Lista de categorías */}
              {loadedCategory && (
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => <SelectCategory field={field} data={dataCategory} />}
                />
              )}
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.category_id ? errors.category_id.message : ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="delivery_format"
                control={control}
                render={({ field }) => <SelectDeliveryFormat field={field} />}
              />
              <FormHelperText sx={{ color: '#d32f2f' }}>
                {errors.delivery_format ? errors.delivery_format.message : ' '}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="delivery_days"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="delivery_days"
                    label="Tiempo de entrega (días hábiles)"
                    error={Boolean(errors.delivery_days)}
                    helperText={errors.delivery_days ? errors.delivery_days.message : ' '}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid size={12}>
            {/* Imagen (opcional): si escoge otra, reemplaza la que tiene */}
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Typography variant="subtitle1">Imagen (JPG, PNG o GIF, máximo 2 MB)</Typography>
              <input type="file" accept="image/*" onChange={handleChange} />
            </FormControl>
            {fileURL && <img src={fileURL} width={300} alt="Imagen del producto" />}
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="contained" color="secondary" sx={{ m: 1 }}>
              Guardar
            </Button>
            <Button variant="outlined" sx={{ m: 1 }} onClick={() => navigate('/product-table')}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
