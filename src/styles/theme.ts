import { createTheme, SxProps, Theme } from '@mui/material';

/** Button style configuration */
export interface ButtonStylesType {
  primary: SxProps<Theme>;
  outline: SxProps<Theme>;
}

/** Layout style configuration */
export interface LayoutStylesType {
  flexCenter: SxProps<Theme>;
  flexBetween: SxProps<Theme>;
  mainContainer: SxProps<Theme>;
  glassPanel: SxProps<Theme>;
}

/** Theme color configuration */
interface ThemeColors {
  primary: string;
  secondary: string;
  background: {
    main: string;
    gradient: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
  border: {
    primary: string;
    secondary: string;
  };
}

/** Theme colors */
const colors: ThemeColors = {
  primary: '#00F5A0',
  secondary: '#00D9F5',
  background: {
    main: 'rgba(16, 20, 24, 0.8)',
    gradient: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(0, 245, 160, 0.5)',
  },
} as const;

/** Common button styles */
export const buttonStyles: ButtonStylesType = {
  primary: {
    background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
    boxShadow: `0 3px 16px ${colors.primary}4D`,
    fontSize: '1rem',
    fontWeight: 600,
    letterSpacing: 1,
    border: 0,
    '&:hover': {
      background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.secondary} 90%)`,
      boxShadow: `0 6px 20px ${colors.primary}66`,
    },
    '&.Mui-disabled': {
      background: 'rgba(255, 255, 255, 0.1)',
      boxShadow: 'none',
    },
  },
  outline: {
    borderColor: colors.border.secondary,
    color: colors.primary,
    '&:hover': {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}1A`,
    },
  },
};

/** Common layout styles */
export const layoutStyles: LayoutStylesType = {
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainContainer: {
    minHeight: '100vh',
    background: colors.background.gradient,
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  glassPanel: {
    background: colors.background.main,
    backdropFilter: 'blur(20px)',
    color: colors.text.primary,
    borderRadius: 4,
    border: `1px solid ${colors.border.primary}`,
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 4,
      padding: '2px',
      background: `linear-gradient(60deg, ${colors.primary}, ${colors.secondary})`,
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
    },
  },
};

/** Theme configuration */
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    background: {
      default: colors.background.main,
      paper: colors.background.main,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: 2,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
