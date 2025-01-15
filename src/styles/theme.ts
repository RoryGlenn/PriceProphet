/*********************************************************************
 * theme.ts
 *
 * Material-UI theme configuration and global style definitions.
 * Provides a consistent design system across the application with
 * custom color schemes, typography, and component styles.
 *
 * Features:
 * - Custom color palette with primary/secondary colors
 * - Dark mode optimization
 * - Glass morphism effects
 * - Gradient backgrounds
 * - Custom button variants
 * - Responsive layout utilities
 *
 * @module theme
 * @requires @mui/material
 *********************************************************************/

import { createTheme, SxProps, Theme } from '@mui/material';

/**
 * Button style configuration interface.
 * Defines custom button variants with consistent styling.
 *
 * @interface ButtonStylesType
 * @property {SxProps<Theme>} primary - Gradient-based primary button style
 * @property {SxProps<Theme>} outline - Bordered secondary button style
 */
export interface ButtonStylesType {
  primary: SxProps<Theme>;
  outline: SxProps<Theme>;
}

/**
 * Layout style configuration interface.
 * Common layout patterns and containers for consistent spacing
 * and component arrangement.
 *
 * @interface LayoutStylesType
 * @property {SxProps<Theme>} flexCenter - Center-aligned flex container
 * @property {SxProps<Theme>} flexBetween - Space-between flex container
 * @property {SxProps<Theme>} mainContainer - Full-viewport container with background
 * @property {SxProps<Theme>} glassPanel - Frosted glass effect container
 */
export interface LayoutStylesType {
  flexCenter: SxProps<Theme>;
  flexBetween: SxProps<Theme>;
  mainContainer: SxProps<Theme>;
  glassPanel: SxProps<Theme>;
}

/**
 * Theme color configuration interface.
 * Defines the complete color system including primary/secondary colors,
 * backgrounds, text, and borders.
 *
 * @interface ThemeColors
 * @property {string} primary - Primary brand color (#00F5A0)
 * @property {string} secondary - Secondary brand color (#00D9F5)
 * @property {Object} background - Background color configurations
 * @property {Object} text - Text color configurations
 * @property {Object} border - Border color configurations
 */
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

/**
 * Theme color palette definition.
 * Implements a dark mode optimized color scheme with:
 * - Vibrant primary/secondary colors for emphasis
 * - Dark, semi-transparent backgrounds for depth
 * - High-contrast text for readability
 * - Subtle borders for structure
 *
 * @constant {ThemeColors} colors
 */
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

/**
 * Common button style configurations.
 * Provides two main button variants:
 * 1. Primary: Gradient background with shadow
 * 2. Outline: Bordered with hover effects
 *
 * Features:
 * - Smooth hover transitions
 * - Custom disabled states
 * - Consistent typography
 *
 * @constant {ButtonStylesType} buttonStyles
 */
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

/**
 * Common layout style configurations.
 * Provides reusable layout patterns and containers:
 * - Flex containers for alignment
 * - Main container with gradient background
 * - Glass panel with frosted effect
 *
 * The glass panel effect is achieved using:
 * - Semi-transparent background
 * - Backdrop filter for blur
 * - Gradient border
 * - Custom shadow
 *
 * @constant {LayoutStylesType} layoutStyles
 */
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

/**
 * Material-UI theme configuration.
 * Customizes the default Material-UI theme with:
 * - Custom color palette
 * - Typography system
 * - Component style overrides
 *
 * Features:
 * - Dark mode optimization
 * - Custom font stack
 * - Modified typography variants
 * - Button style customization
 *
 * @constant {Theme} theme
 */
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
