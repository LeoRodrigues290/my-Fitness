/**
 * Paleta de cores do aplicativo
 * Baseada no Tailwind CSS
 */
export const colors = {
    // Slate
    slate950: '#020617',
    slate900: '#0f172a',
    slate800: '#1e293b',
    slate750: '#2d384d',
    slate700: '#334155',
    slate600: '#475569',
    slate500: '#64748b',
    slate400: '#94a3b8',
    slate300: '#cbd5e1',

    // Accent colors
    lime500: '#84cc16',
    lime400: '#a3e635',
    lime300: '#bef264',
    blue500: '#3b82f6',
    blue400: '#60a5fa',
    orange400: '#fb923c',
    red500: '#ef4444',

    // Base
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
