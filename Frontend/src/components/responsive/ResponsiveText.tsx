import React from 'react';
import { Text, TextStyle, TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';
import { 
  fontSize, 
  spacing, 
  borderRadius, 
  isDesktop, 
  isTablet, 
  isSmallMobile, 
  isMediumMobile, 
  isLargeMobile,
  getTouchTargetSize
} from '../../utils/responsive';

interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  style?: TextStyle;
  numberOfLines?: number;
  allowFontScaling?: boolean;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = 'base',
  weight = 'normal',
  color = '#000000',
  textAlign = 'left',
  style = {},
  numberOfLines,
  allowFontScaling = true,
}) => {
  const getMetrics = () => {
    let baseSize = fontSize[size];
    let scaleFactor = 1;
    let lineHeightMultiplier = 1.3;

    // Device-specific scaling
    if (isDesktop) {
      scaleFactor = 1.1; // Slightly larger on desktop
      lineHeightMultiplier = 1.5;
    } else if (isTablet) {
      scaleFactor = 1.05; // Slightly larger on tablet
      lineHeightMultiplier = 1.4;
    } else if (isLargeMobile) {
      scaleFactor = 1.02; // Slightly larger on large mobile
      lineHeightMultiplier = 1.35;
    } else if (isMediumMobile) {
      scaleFactor = 1; // Standard size
      lineHeightMultiplier = 1.3;
    } else if (isSmallMobile) {
      scaleFactor = 0.95; // Slightly smaller on small devices
      lineHeightMultiplier = 1.25;
    }

    // Apply scaling for very small devices with large text
    if (isSmallMobile && (size === 'lg' || size === 'xl' || size === '2xl')) {
      scaleFactor *= 0.9; // Reduce large text on small screens
    }

    return {
      fontSize: baseSize * scaleFactor,
      lineHeight: baseSize * scaleFactor * lineHeightMultiplier,
    };
  };

  const getWeight = () => {
    switch (weight) {
      case 'medium': return '500';
      case 'semibold': return '600';
      case 'bold': return 'bold';
      default: return 'normal';
    }
  };

  const textStyle: TextStyle = {
    ...getMetrics(),
    fontWeight: getWeight(),
    color,
    textAlign,
    ...style,
  };

  return (
    <Text style={textStyle} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
};

interface ResponsiveButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style = {},
  textStyle = {},
  icon,
  iconPosition = 'left',
  fullWidth = false,
}) => {
  const touchTargets = getTouchTargetSize();
  
  const getButtonSize = () => {
    const baseSizes = {
      sm: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.sm,
        fontSize: fontSize.sm,
        minHeight: Math.max(touchTargets.button - 4, 36), // Smaller buttons
      },
      md: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        fontSize: fontSize.base,
        minHeight: touchTargets.button, // Standard touch target
      },
      lg: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        fontSize: fontSize.lg,
        minHeight: Math.max(touchTargets.button + 4, 52), // Larger buttons
      },
    };

    const sizeConfig = baseSizes[size];
    
    // Device-specific adjustments
    if (isDesktop) {
      return {
        ...sizeConfig,
        paddingVertical: sizeConfig.paddingVertical * 1.2,
        paddingHorizontal: sizeConfig.paddingHorizontal * 1.2,
        minHeight: sizeConfig.minHeight * 1.1,
      };
    } else if (isTablet) {
      return {
        ...sizeConfig,
        paddingVertical: sizeConfig.paddingVertical * 1.1,
        paddingHorizontal: sizeConfig.paddingHorizontal * 1.1,
        minHeight: sizeConfig.minHeight * 1.05,
      };
    } else if (isSmallMobile) {
      // Ensure adequate touch targets on small devices
      return {
        ...sizeConfig,
        paddingVertical: Math.max(sizeConfig.paddingVertical, spacing.sm),
        paddingHorizontal: Math.max(sizeConfig.paddingHorizontal, spacing.md),
        minHeight: Math.max(sizeConfig.minHeight, touchTargets.minTouchTarget),
      };
    }
    
    return sizeConfig;
  };

  const getButtonVariant = () => {
    const variants = {
      primary: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
        textColor: '#FFFFFF',
      },
      secondary: {
        backgroundColor: '#6B7280',
        borderColor: '#6B7280',
        textColor: '#FFFFFF',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: '#007AFF',
        textColor: '#007AFF',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: '#007AFF',
      },
      danger: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
        textColor: '#FFFFFF',
      },
    };

    return variants[variant];
  };

  const sizeConfig = getButtonSize();
  const variantConfig = getButtonVariant();

  const buttonStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...sizeConfig,
    backgroundColor: disabled ? '#F3F4F6' : variantConfig.backgroundColor,
    borderColor: disabled ? '#D1D5DB' : variantConfig.borderColor,
    opacity: loading ? 0.7 : 1,
    ...(fullWidth && { width: '100%' }),
    ...style,
  };

  const buttonTextStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    fontWeight: '600',
    color: disabled ? '#9CA3AF' : variantConfig.textColor,
    ...textStyle,
  };

  const iconSpacing = sizeConfig.paddingHorizontal / 2;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={buttonTextStyle.color} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <ResponsiveText style={{ marginRight: iconSpacing }}>
              {icon}
            </ResponsiveText>
          )}
          <ResponsiveText style={buttonTextStyle}>
            {title}
          </ResponsiveText>
          {icon && iconPosition === 'right' && (
            <ResponsiveText style={{ marginLeft: iconSpacing }}>
              {icon}
            </ResponsiveText>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

interface ResponsiveHeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

export const ResponsiveHeading: React.FC<ResponsiveHeadingProps> = ({
  children,
  level,
  color = '#1F2937',
  textAlign = 'left',
  style = {},
}) => {
  const getHeadingSize = () => {
    const sizes = {
      1: '5xl',
      2: '4xl',
      3: '3xl',
      4: '2xl',
      5: 'xl',
      6: 'lg',
    } as const;
    
    return sizes[level];
  };

  return (
    <ResponsiveText
      size={getHeadingSize()}
      weight="bold"
      color={color}
      textAlign={textAlign}
      style={style}
    >
      {children}
    </ResponsiveText>
  );
};

interface ResponsiveLinkProps {
  children: React.ReactNode;
  onPress: () => void;
  color?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg';
  underline?: boolean;
  style?: TextStyle;
}

export const ResponsiveLink: React.FC<ResponsiveLinkProps> = ({
  children,
  onPress,
  color = '#007AFF',
  size = 'base',
  underline = true,
  style = {},
}) => {
  const linkStyle: TextStyle = {
    color,
    ...(underline && { textDecorationLine: 'underline' }),
    ...style,
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ResponsiveText size={size} style={linkStyle}>
        {children}
      </ResponsiveText>
    </TouchableOpacity>
  );
};

export default {
  ResponsiveText,
  ResponsiveButton,
  ResponsiveHeading,
  ResponsiveLink,
};
