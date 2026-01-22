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
        // Fetch everything in a single query using JOIN
        const rows = await db.getAllAsync(`
            SELECT w.*, we.id as ex_id, we.exercise_name, we.sets, we.reps, we.weight
            FROM workouts w
            LEFT JOIN workout_exercises we ON w.id = we.workout_id
            WHERE w.user_id = ?
            ORDER BY w.date DESC
        `, userId);

        // Group data in JavaScript (faster than N+1 queries)
        const workoutsMap = new Map();
        rows.forEach((row: any) => {
            if (!workoutsMap.has(row.id)) {
                workoutsMap.set(row.id, {
                    id: row.id,
                    user_id: row.user_id,
                    date: row.date,
                    muscle_group: row.muscle_group,
                    notes: row.notes,
                    exercises: []
                });
            }
            if (row.ex_id) { // If there is an exercise
                workoutsMap.get(row.id).exercises.push({
                    name: row.exercise_name,
                    sets: row.sets,
                    reps: row.reps,
                    weight: row.weight
                });
            }
        });

        return Array.from(workoutsMap.values());
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
