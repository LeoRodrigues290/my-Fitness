import { getDBConnection } from '../database/db';

export interface ExerciseData {
    name: string;
    sets: number;
    reps: number;
    weight: number;
}

export const WorkoutRepository = {
    addWorkout: async (userId: number, date: string, muscleGroup: string, notes: string, exercises: ExerciseData[]) => {
        const db = await getDBConnection();

        const result = await db.runAsync(
            'INSERT INTO workouts (user_id, date, muscle_group, notes) VALUES (?, ?, ?, ?)',
            userId, date, muscleGroup, notes
        );

        const workoutId = result.lastInsertRowId;

        for (const ex of exercises) {
            await db.runAsync(
                'INSERT INTO workout_exercises (workout_id, exercise_name, sets, reps, weight) VALUES (?, ?, ?, ?, ?)',
                workoutId, ex.name, ex.sets, ex.reps, ex.weight
            );
        }

        return workoutId;
    },

    getWorkouts: async (userId: number) => {
        const db = await getDBConnection();
        const workouts: any[] = await db.getAllAsync(
            'SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC',
            userId
        );

        for (let w of workouts) {
            const exercises = await db.getAllAsync(
                'SELECT * FROM workout_exercises WHERE workout_id = ?',
                w.id
            );
            w.exercises = exercises;
        }

        return workouts;
    },

    getLastWorkout: async (userId: number) => {
        const db = await getDBConnection();
        const workouts: any[] = await db.getAllAsync(
            'SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 1',
            userId
        );
        // Note: getAllAsync returns array
        return workouts[0] || null;
    },

    deleteWorkout: async (workoutId: number) => {
        const db = await getDBConnection();
        await db.runAsync('DELETE FROM workouts WHERE id = ?', workoutId);
    }
};
