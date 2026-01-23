import { colors } from './colors';

export const COLORS = {
    // Brand
    primary: colors.lime400,
    secondary: colors.blue400,
    accent: colors.orange400,

    // Backgrounds
    background: colors.slate950,
    surface: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity for glass
    card: 'rgba(30, 41, 59, 0.5)',
    modal: colors.slate900,

    // Text
    textPrimary: colors.white,
    textSecondary: colors.slate400,
    textTertiary: colors.slate500,

    // UI Elements
    border: 'rgba(255, 255, 255, 0.1)',
    borderStrong: 'rgba(255, 255, 255, 0.2)',
    icon: colors.slate400,
    iconActive: colors.lime400,

    // Semantic
    success: colors.lime400,
    error: colors.red500,
    warning: colors.orange400,
    info: colors.blue400,

    // Raw alias
    white: colors.white,
    black: colors.black,
    transparent: colors.transparent,
    ...colors // Expose raw palette if needed
} as const;

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
} as const;

export const RADIUS = {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    circle: 9999,
} as const;

export const SIZES = {
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    small: 14,
    tiny: 12,
    icon: 24,
    iconSmall: 18,
    iconLarge: 32,
} as const;

export const LAYOUT = {
    glass: {
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
    }
} as const;

export default {
    COLORS,
    SPACING,
    RADIUS,
    SIZES,
    LAYOUT
};
