export const COLORS = {
    primary: '#8B5CF6',    // Violet
    secondary: '#EC4899',  // Pink
    accent: '#F59E0B',     // Amber
    success: '#10B981',    // Emerald
    danger: '#EF4444',     // Red
    background: '#0F172A', // Slate 900
    surface: '#1E293B',    // Slate 800
    text: '#F8FAFC',       // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    border: '#334155',     // Slate 700
    white: '#FFFFFF',
    black: '#000000',

    gradients: {
        primary: ['#8B5CF6', '#EC4899'] as const,
        secondary: ['#3B82F6', '#8B5CF6'] as const,
        success: ['#10B981', '#34D399'] as const,
        card: ['rgba(30, 41, 59, 0.7)', 'rgba(30, 41, 59, 0.4)'] as const,
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
    regular: 'Inter-Regular', // Need to load these or use system fonts if not available
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
