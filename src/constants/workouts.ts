import { Workout } from '../types';
export { Workout };

/**
 * Base de dados de treinos padrão
 */
export const workoutsData: Workout[] = [
    {
        id: 'chest-triceps',
        title: "Peito & Tríceps",
        subtitle: "Foco em Força",
        duration: "55 min",
        calories: "420 kcal",
        level: "Intermediário",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
        exercises: [
            { id: 1, name: "Supino Inclinado", sets: "4 séries", reps: "10-12 reps", completed: false },
            { id: 2, name: "Crucifixo no Cabo", sets: "3 séries", reps: "12-15 reps", completed: false },
            { id: 3, name: "Tríceps Testa", sets: "4 séries", reps: "10 reps", completed: false },
            { id: 4, name: "Mergulho (Dips)", sets: "3 séries", reps: "Falha", completed: false },
        ]
    },
    {
        id: 'back-biceps',
        title: "Costas & Bíceps",
        subtitle: "Largura e Densidade",
        duration: "60 min",
        calories: "450 kcal",
        level: "Avançado",
        image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=2070&auto=format&fit=crop",
        exercises: [
            { id: 1, name: "Barra Fixa (Pull-up)", sets: "4 séries", reps: "8-10 reps", completed: false },
            { id: 2, name: "Remada Curvada", sets: "4 séries", reps: "10-12 reps", completed: false },
            { id: 3, name: "Puxada Alta", sets: "3 séries", reps: "12 reps", completed: false },
            { id: 4, name: "Rosca Direta", sets: "3 séries", reps: "12-15 reps", completed: false },
        ]
    },
    {
        id: 'legs',
        title: "Leg Day (Pernas)",
        subtitle: "Inferiores Completo",
        duration: "65 min",
        calories: "500 kcal",
        level: "Difícil",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
        exercises: [
            { id: 1, name: "Agachamento Livre", sets: "4 séries", reps: "8-10 reps", completed: false },
            { id: 2, name: "Leg Press 45", sets: "4 séries", reps: "12-15 reps", completed: false },
            { id: 3, name: "Cadeira Extensora", sets: "3 séries", reps: "15-20 reps", completed: false },
            { id: 4, name: "Stiff", sets: "3 séries", reps: "12 reps", completed: false },
        ]
    },
    {
        id: 'shoulders-abs',
        title: "Ombros & Abdômen",
        subtitle: "Definição 3D",
        duration: "50 min",
        calories: "380 kcal",
        level: "Intermediário",
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=2070&auto=format&fit=crop",
        exercises: [
            { id: 1, name: "Desenvolvimento Militar", sets: "4 séries", reps: "10-12 reps", completed: false },
            { id: 2, name: "Elevação Lateral", sets: "3 séries", reps: "15 reps", completed: false },
            { id: 3, name: "Face Pull", sets: "3 séries", reps: "15 reps", completed: false },
            { id: 4, name: "Prancha Abdominal", sets: "3 séries", reps: "1 min", completed: false },
        ]
    },
    {
        id: 'flow',
        title: "Flow (Full Body)",
        subtitle: "Mobilidade e Suor",
        duration: "45 min",
        calories: "600 kcal",
        level: "Intenso",
        image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop",
        exercises: [
            { id: 1, name: "Burpees", sets: "4 séries", reps: "15 reps", completed: false },
            { id: 2, name: "Kettlebell Swing", sets: "4 séries", reps: "20 reps", completed: false },
            { id: 3, name: "Box Jump", sets: "3 séries", reps: "12 reps", completed: false },
            { id: 4, name: "Man Maker", sets: "3 séries", reps: "10 reps", completed: false },
        ]
    }
];

/**
 * Treino de descanso (para dias de folga)
 */
export const restWorkout: Workout = {
    id: 'rest',
    title: "Dia de Descanso",
    subtitle: "Recuperação Ativa",
    duration: "0 min",
    calories: "0 kcal",
    level: "Relax",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
    exercises: []
};

/**
 * Opções de treino para seleção
 */
export const workoutOptions = [
    { label: 'Descanso', value: 'rest' },
    { label: 'Peito & Tríceps', value: 'chest-triceps' },
    { label: 'Costas & Bíceps', value: 'back-biceps' },
    { label: 'Pernas', value: 'legs' },
    { label: 'Ombros & Abdômen', value: 'shoulders-abs' },
    { label: 'Flow (Full Body)', value: 'flow' },
] as const;

/**
 * Busca um treino pelo ID
 */
export const getWorkoutById = (id: string): Workout | undefined => {
    if (id === 'rest') return restWorkout;
    return workoutsData.find(w => w.id === id);
};
