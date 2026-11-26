import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import PropTypes from 'prop-types';

SelectWeekdays.propTypes = {
  field: PropTypes.object,
};
//días con la numeración ISO que usa el API: 1 lunes ... 7 domingo
const days = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
];
//checkboxes de los días, se usa en horarios y bloqueos por rango
//field.value es un arreglo con los días marcados, ej [1, 2, 3, 4, 5]
export function SelectWeekdays({ field }) {
  const toggle = (day) => {
    if (field.value.includes(day)) {
      return field.value.filter((item) => item !== day);
    }
    return [...field.value, day].sort();
  };
  return (
    <>
      <FormLabel>Días de la semana</FormLabel>
      <FormGroup row>
        {days.map((day) => (
          <FormControlLabel
            key={day.value}
            label={day.label}
            control={<Checkbox checked={field.value.includes(day.value)} onChange={() => field.onChange(toggle(day.value))} />}
          />
        ))}
      </FormGroup>
    </>
  );
}
