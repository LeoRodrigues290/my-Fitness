/**
 * Tipos centralizados do aplicativo
 */

// Exercício individual
export interface Exercise {
    id: number;
    name: string;
    sets: string;
    reps: string;
    completed: boolean;
    weight?: number;
    actualSets?: number;
    actualReps?: string;
}

// Treino completo
export interface Workout {
    id: string;
    title: string;
    subtitle: string;
    duration: string;
    calories: string;
    level: string;
    image: string;
    exercises: Exercise[];
}

// Sessão de treino registrada
export interface WorkoutSession {
    id: string;
    date: string;
    workoutId: string;
    workoutTitle: string;
    duration: number;
    calories: number;
    exercises: {
        id: number;
        name: string;
        sets: number;
        reps: string;
        weight: number;
        completed: boolean;
    }[];
}

// Estatísticas diárias
export interface DailyStats {
    date: string;
    caloriesConsumed: number;
    proteinConsumed: number;
    carbsConsumed: number;
    waterConsumed: number;
}

// Metas do usuário
export interface UserGoals {
    kcal: number;
    protein: number;
    carbs: number;
    weight: number;
    water: number;
}

// Cronograma semanal
export interface WeekSchedule {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
}

// Preferências do usuário
export interface UserPreferences {
    goals: UserGoals;
    schedule: WeekSchedule;
}

// Usuário
export interface User {
    id: number;
    name: string;
    avatar_uri?: string;
}

// Dias da semana (para iteração)
export const DAYS_OF_WEEK = [
    { id: 'monday', label: 'Segunda-feira' },
    { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' },
    { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
] as const;

// Nome dos dias em inglês para lookup
export type DayName = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export const DAY_NAMES: DayName[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
