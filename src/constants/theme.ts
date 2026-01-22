export const COLORS = {
    // Base Colors
    primary: '#a3e635', // lime-400
    secondary: '#8b5cf6', // violet-500
    lime: '#a3e635',
    blue: '#60a5fa', // blue-400
    purple: '#c084fc', // purple-400

    // Backgrounds (Slate)
    background: '#020617', // slate-950
    card: '#1e293b', // slate-800
    cardBorder: '#334155', // slate-700
    surface: '#0f172a', // slate-900
    border: '#334155', // slate-700

    // Text
    white: '#ffffff',
    black: '#000000',
    textSecondary: '#94a3b8', // slate-400

    // Status
    success: '#a3e635', // lime-400
    error: '#ef4444',
    danger: '#ef4444', // alias for error
    warning: '#f59e0b',
    accent: '#f97316', // orange

    // Gradients
    gradients: {
        primary: ['#a3e635', '#bef264'] as const,
        secondary: ['#60a5fa', '#93c5fd'] as const,
        card: ['rgba(30, 41, 59, 0.7)', 'rgba(30, 41, 59, 0.4)'] as const,
        dark: ['#0f172a', '#020617'] as const,
    },

    overlay: {
        dark: 'rgba(0,0,0,0.7)',
        medium: 'rgba(0,0,0,0.5)',
        light: 'rgba(0,0,0,0.2)',
    }
};

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    circle: 9999,
};

export const FONTS = {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
};

export const SIZES = {
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    small: 14,
    tiny: 12,
    icon: 24,
};

export default {
    COLORS,
    SPACING,
    RADIUS,
    FONTS,
    SIZES,
};
