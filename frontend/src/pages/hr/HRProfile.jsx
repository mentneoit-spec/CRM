import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Grid,
  Divider,
  Button,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Badge,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  BusinessCenter as DepartmentIcon,
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Add ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}

const HRProfile = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state?.auth?.user);
  const fileInputRef = React.useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileData, setProfileData] = useState({
    name: authUser?.name || 'HR Manager',
    email: authUser?.email || 'hr@college.com',
    phone: authUser?.phone || '+91 9999999999',
    designation: 'HR Manager',
    department: 'Human Resources',
    joinDate: '2024-01-15',
  });
  const [editData, setEditData] = useState(profileData);

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setUploadingPhoto(true);
      try {
        // Create a preview first
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to backend
        const formData = new FormData();
        formData.append('files', file);

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/upload/profile', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const result = await response.json();
        if (result.success && result.data?.url) {
          setProfilePhoto(result.data.url);
          console.log('✅ Photo uploaded successfully:', result.data.url);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('❌ Error uploading photo:', error);
        alert('Failed to upload photo: ' + error.message);
        setPhotoPreview(null);
        setProfilePhoto(null);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  const handleSaveClick = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProfileData(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoButtonClick = () => {
    if (fileInputRef.current && !uploadingPhoto) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f6fa', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <IconButton
            onClick={() => navigate('/hr/dashboard')}
            sx={{
              bgcolor: '#E8F5E9',
              color: '#2E7D32',
              '&:hover': { bgcolor: '#C8E6C9' },
            }}
          >
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2E7D32' }}>
              My Profile
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              HR Management System
            </Typography>
          </Box>
        </Box>

        {/* Profile Card */}
        <Card sx={{ mb: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardHeader
            avatar={
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: uploadingPhoto ? '#FF9800' : '#4CAF50',
                      color: uploadingPhoto ? '#FF9800' : '#4CAF50',
                      boxShadow: `0 0 0 2px white`,
                      '&::after': {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        animation: uploadingPhoto ? 'ripple 1.2s infinite ease-in-out' : 'none',
                        border: `1px solid currentColor`,
                        content: '""',
                      },
                    },
                  }}
                >
                  <Avatar
                    src={photoPreview || profilePhoto}
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: photoPreview ? 'transparent' : '#2E7D32',
                      fontSize: '32px',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '3px solid white',
                    }}
                  >
                    {!photoPreview && !profilePhoto && profileData.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
                <input
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  type="file"
                  onChange={handlePhotoChange}
                  disabled={uploadingPhoto}
                />
                <IconButton
                  onClick={handlePhotoButtonClick}
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    bgcolor: '#2E7D32',
                    color: 'white',
                    width: 36,
                    height: 36,
                    '&:hover': {
                      bgcolor: '#1B5E20',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    border: '2px solid white',
                    cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                    opacity: uploadingPhoto ? 0.7 : 1,
                  }}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    <PhotoCameraIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Box>
            }
            title={
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {profileData.name}
                </Typography>
                <Chip
                  label={profileData.designation}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: '#E8F5E9',
                    color: '#2E7D32',
                    fontWeight: 600,
                  }}
                />
              </Box>
            }
            action={
              !isEditing && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{
                    color: '#2E7D32',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Edit
                </Button>
              )
            }
            sx={{ pb: 0 }}
          />

          <Divider />

          <CardContent>
            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  label="Phone"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  label="Designation"
                  name="designation"
                  value={editData.designation}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  disabled
                />
                <TextField
                  label="Department"
                  name="department"
                  value={editData.department}
                  onChange={handleInputChange}
                  fullWidth
                  variant="outlined"
                  disabled
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelClick}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveClick}
                    loading={loading}
                    sx={{ bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1B5E20' } }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EmailIcon sx={{ color: '#2E7D32', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {profileData.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PhoneIcon sx={{ color: '#2E7D32', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Phone
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {profileData.phone}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <BadgeIcon sx={{ color: '#2E7D32', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Designation
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {profileData.designation}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <DepartmentIcon sx={{ color: '#2E7D32', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Department
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {profileData.department}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ bgcolor: '#E8F5E9', p: 2, borderRadius: 1 }}>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Member Since
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                      {new Date(profileData.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Alert severity="info" icon={false}>
              <Typography variant="body2">
                ✅ <strong>Profile Information:</strong> You can view and edit your profile information here. Your changes will be saved automatically.
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Photo Upload Info Card */}
        <Card sx={{ mt: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', bgcolor: '#FFF9C4' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <CloudUploadIcon sx={{ color: '#F57C00', fontSize: 24, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E65100', mb: 0.5 }}>
                  📸 Photo Upload
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Click the camera icon on your avatar to upload a profile picture. Supported formats: JPG, PNG, GIF (Max 5MB)
                </Typography>
                {photoPreview && (
                  <Typography variant="caption" sx={{ color: '#2E7D32', mt: 1, display: 'block', fontWeight: 600 }}>
                    ✅ Photo successfully uploaded!
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default HRProfile;
