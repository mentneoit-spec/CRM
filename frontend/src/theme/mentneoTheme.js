import { createTheme } from '@mui/material/styles';

// Mentneo Brand Colors
const PRIMARY_GRADIENT = {
  start: '#667eea',
  end: '#764ba2',
};

const COLORS = {
  primary: PRIMARY_GRADIENT.start,
  secondary: PRIMARY_GRADIENT.end,
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  light: '#f5f7fa',
  dark: '#1a1a1a',
};

// Create MUI Theme
const theme = createTheme({
  palette: {
    primary: {
      main: COLORS.primary,
      light: '#7b8fee',
      dark: '#5568d3',
    },
    secondary: {
      main: COLORS.secondary,
      light: '#8b5db5',
      dark: '#5a3a7a',
    },
    success: {
      main: COLORS.success,
    },
    error: {
      main: COLORS.error,
    },
    warning: {
      main: COLORS.warning,
    },
    info: {
      main: COLORS.info,
    },
    background: {
      default: COLORS.light,
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.25px',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: '1.5',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: '1.43',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 600,
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: COLORS.primary,
          color: COLORS.primary,
          '&:hover': {
            background: 'rgba(102, 126, 234, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&:hover fieldset': {
              borderColor: COLORS.primary,
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.primary,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& thead th': {
            background: COLORS.light,
            fontWeight: 600,
            color: '#333',
          },
          '& tbody tr:hover': {
            background: 'rgba(102, 126, 234, 0.05)',
          },
        },
      },
    },
  },
});

export default theme;
export { COLORS, PRIMARY_GRADIENT };
