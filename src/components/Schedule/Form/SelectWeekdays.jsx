import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import PropTypes from 'prop-types';

SelectWeekdays.propTypes = {
  field: PropTypes.object,
};
//días de la semana del 1 al 7
const days = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
];
//checkboxes de los días de la semana
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
