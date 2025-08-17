// src/config/theme.ts
export interface Theme {
  colors: {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    
    // Background colors
    background: string;
    surface: string;
    surfaceElevated: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textInverse: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Accent colors
    accent: string;
    accentLight: string;
    
    // Border and shadow
    border: string;
    shadow: string;
    
    // Glassmorphism
    glassBackground: string;
    glassBackgroundLight: string;
  };
  
  gradients: {
    primary: string[];
    secondary: string[];
    success: string[];
    card: string[];
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  
  shadows: {
    sm: object;
    md: object;
    lg: object;
    xl: object;
  };
}

export const lightTheme: Theme = {
  colors: {
    // Primary colors - Futuristic blue/cyan palette
    primary: '#00D4FF',
    primaryLight: '#66E3FF',
    primaryDark: '#0099CC',
    
    // Background colors - Clean whites and light grays
    background: '#FAFBFC',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    // Text colors
    text: '#1A1D1F',
    textSecondary: '#6B7280',
    textInverse: '#FFFFFF',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Accent colors
    accent: '#8B5CF6',
    accentLight: '#A78BFA',
    
    // Border and shadow
    border: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Glassmorphism
    glassBackground: 'rgba(255, 255, 255, 0.7)',
    glassBackgroundLight: 'rgba(255, 255, 255, 0.5)',
  },
  
  gradients: {
    primary: ['#00D4FF', '#0099CC'],
    secondary: ['#8B5CF6', '#A78BFA'],
    success: ['#10B981', '#059669'],
    card: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'],
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 50,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 8,
    },
  },
};

export const useTheme = () => lightTheme;
