import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Select, MenuItem, FormControl, InputLabel, Box,
  CircularProgress, Alert, Stack
} from '@mui/material';

const FormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  fields,
  initialData = {},
  loading = false,
  submitButtonText = 'Save',
  submitButtonColor = 'primary',
  maxWidth = 'sm'
}) => {
  const [formData, setFormData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {loading && <CircularProgress />}
        {!loading && (
          <Stack spacing={2}>
            {fields.map(field => {
              const value = formData[field.name] || '';
              const error = errors[field.name];

              if (field.type === 'select') {
                return (
                  <FormControl key={field.name} fullWidth error={!!error}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      name={field.name}
                      value={value}
                      onChange={handleChange}
                      label={field.label}
                    >
                      {field.options?.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <TextField
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    value={value}
                    onChange={handleChange}
                    multiline
                    rows={field.rows || 4}
                    fullWidth
                    error={!!error}
                    helperText={error}
                    required={field.required}
                  />
                );
              }

              return (
                <TextField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  value={value}
                  onChange={handleChange}
                  type={field.type || 'text'}
                  fullWidth
                  error={!!error}
                  helperText={error}
                  required={field.required}
                />
              );
            })}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={submitButtonColor}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : submitButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormModal;
