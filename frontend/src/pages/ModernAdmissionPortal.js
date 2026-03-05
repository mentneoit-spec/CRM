import React, { useState } from 'react';
import { Box, Typography, Stepper, Step, StepLabel, Button, TextField, MenuItem, Paper, Grid, InputLabel, Select, FormControl, Snackbar, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const steps = ['Personal Info', 'Parent/Guardian', 'Documents', 'Review & Submit'];

const ModernAdmissionPortal = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    parentName: '',
    parentContact: '',
    parentEmail: '',
    relation: '',
    documents: [],
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // submit data to API
      setSnackbar({ open: true, message: 'Application submitted!', severity: 'success' });
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (e) => {
    setFormData({ ...formData, documents: [...formData.documents, e.target.files[0]] });
  };

  const showStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Date of Birth" name="dob" InputLabelProps={{ shrink: true }} value={formData.dob} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formData.gender} label="Gender" onChange={handleChange}>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Zip Code" name="zip" value={formData.zip} onChange={handleChange} />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Parent/Guardian Name" name="parentName" value={formData.parentName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Relation" name="relation" value={formData.relation} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Contact Number" name="parentContact" value={formData.parentContact} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="email" label="Email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              Upload Documents
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
            {formData.documents.length > 0 && (
              <Box mt={2}>
                {formData.documents.map((doc, idx) => (
                  <Typography key={idx}>{doc.name}</Typography>
                ))}
              </Box>
            )}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review Information</Typography>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Admission Portal</Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 4 }}>{showStepContent(activeStep)}</Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext}>
          {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ModernAdmissionPortal;
