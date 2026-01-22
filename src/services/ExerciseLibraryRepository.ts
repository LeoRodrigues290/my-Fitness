import { getDBConnection } from '../database/db';

export interface Exercise {
    id: number;
    name: string;
    video_url: string | null;
    muscle_group: string;
    instructions: string | null;
    default_rest_seconds: number;
    created_at: string;
}

export const ExerciseLibraryRepository = {
    /**
     * Get all exercises from the library
     */
    getAllExercises: async (): Promise<Exercise[]> => {
        const db = await getDBConnection();
        return await db.getAllAsync<Exercise>(
            'SELECT * FROM exercise_library ORDER BY muscle_group, name'
        );
    },

    /**
     * Get exercise by ID
     */
    getExerciseById: async (id: number): Promise<Exercise | null> => {
        const db = await getDBConnection();
        const results = await db.getAllAsync<Exercise>(
            'SELECT * FROM exercise_library WHERE id = ?',
            id
        );
        return results[0] || null;
    },

    /**
     * Get exercises by muscle group
     */
    getExercisesByMuscleGroup: async (muscleGroup: string): Promise<Exercise[]> => {
        const db = await getDBConnection();
        return await db.getAllAsync<Exercise>(
            'SELECT * FROM exercise_library WHERE muscle_group = ? ORDER BY name',
            muscleGroup
        );
    },

    /**
     * Search exercises by name or muscle group
     */
    searchExercises: async (query: string): Promise<Exercise[]> => {
        const db = await getDBConnection();
        const searchTerm = `%${query}%`;
        return await db.getAllAsync<Exercise>(
            'SELECT * FROM exercise_library WHERE name LIKE ? OR muscle_group LIKE ? ORDER BY muscle_group, name',
            searchTerm, searchTerm
        );
    },

    /**
     * Add a new exercise to the library
     */
    addExercise: async (
        name: string,
        muscleGroup: string,
        videoUrl: string | null = null,
        instructions: string | null = null,
        defaultRestSeconds: number = 60
    ): Promise<number> => {
        const db = await getDBConnection();
        const result = await db.runAsync(
            `INSERT INTO exercise_library (name, muscle_group, video_url, instructions, default_rest_seconds) 
       VALUES (?, ?, ?, ?, ?)`,
            name, muscleGroup, videoUrl, instructions, defaultRestSeconds
        );
        return result.lastInsertRowId;
    },

    /**
     * Update an existing exercise
     */
    updateExercise: async (
        id: number,
        data: Partial<Omit<Exercise, 'id' | 'created_at'>>
    ): Promise<void> => {
        const db = await getDBConnection();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.muscle_group !== undefined) {
            fields.push('muscle_group = ?');
            values.push(data.muscle_group);
        }
        if (data.video_url !== undefined) {
            fields.push('video_url = ?');
            values.push(data.video_url);
        }
        if (data.instructions !== undefined) {
            fields.push('instructions = ?');
            values.push(data.instructions);
        }
        if (data.default_rest_seconds !== undefined) {
            fields.push('default_rest_seconds = ?');
            values.push(data.default_rest_seconds);
        }

        if (fields.length > 0) {
            values.push(id);
            await db.runAsync(
                `UPDATE exercise_library SET ${fields.join(', ')} WHERE id = ?`,
                ...values
            );
        }
    },

    /**
     * Delete an exercise from the library
     */
    deleteExercise: async (id: number): Promise<void> => {
        const db = await getDBConnection();
        await db.runAsync('DELETE FROM exercise_library WHERE id = ?', id);
    },

    /**
     * Get all unique muscle groups
     */
    getMuscleGroups: async (): Promise<string[]> => {
        const db = await getDBConnection();
        const results = await db.getAllAsync<{ muscle_group: string }>(
            'SELECT DISTINCT muscle_group FROM exercise_library ORDER BY muscle_group'
        );
        return results.map(r => r.muscle_group);
    },

    /**
     * Check if library is empty (for seeding)
     */
    isEmpty: async (): Promise<boolean> => {
        const db = await getDBConnection();
        const results = await db.getAllAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM exercise_library'
        );
        return results[0].count === 0;
    },

    /**
     * Seed the library with initial exercises
     */
    seedExercises: async (exercises: Array<{
        name: string;
        muscle_group: string;
        video_url: string | null;
        instructions: string;
        default_rest_seconds: number;
    }>): Promise<void> => {
        const db = await getDBConnection();

        for (const exercise of exercises) {
            try {
                await db.runAsync(
                    `INSERT OR IGNORE INTO exercise_library (name, muscle_group, video_url, instructions, default_rest_seconds) 
           VALUES (?, ?, ?, ?, ?)`,
                    exercise.name,
                    exercise.muscle_group,
                    exercise.video_url,
                    exercise.instructions,
                    exercise.default_rest_seconds
                );
            } catch (error) {
                // Skip duplicates silently
                console.log(`Skipping duplicate exercise: ${exercise.name}`);
            }
        }
    }
};
