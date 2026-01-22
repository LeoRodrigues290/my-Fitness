import { getDBConnection } from '../database/db';
import { Exercise } from './ExerciseLibraryRepository';

export interface WorkoutTemplate {
    id: number;
    user_id: number;
    name: string;
    day_assigned: number | null;
    color: string;
    created_at: string;
}

export interface TemplateExercise {
    id: number;
    template_id: number;
    exercise_id: number;
    target_sets: number;
    target_reps: string;
    target_weight: number | null;
    order_index: number;
    // Joined fields from exercise_library
    exercise_name?: string;
    video_url?: string | null;
    muscle_group?: string;
    instructions?: string | null;
}

export interface TemplateWithExercises extends WorkoutTemplate {
    exercises: TemplateExercise[];
}

export const WorkoutTemplateRepository = {
    /**
     * Get all templates for a user
     */
    getTemplates: async (userId: number): Promise<WorkoutTemplate[]> => {
        const db = await getDBConnection();
        return await db.getAllAsync<WorkoutTemplate>(
            'SELECT * FROM workout_templates WHERE user_id = ? ORDER BY name',
            userId
        );
    },

    /**
     * Get template by ID with exercises
     */
    getTemplateById: async (templateId: number): Promise<TemplateWithExercises | null> => {
        const db = await getDBConnection();

        const templates = await db.getAllAsync<WorkoutTemplate>(
            'SELECT * FROM workout_templates WHERE id = ?',
            templateId
        );

        if (templates.length === 0) return null;

        const template = templates[0];
        const exercises = await db.getAllAsync<TemplateExercise>(
            `SELECT te.*, el.name as exercise_name, el.video_url, el.muscle_group, el.instructions
       FROM template_exercises te
       JOIN exercise_library el ON te.exercise_id = el.id
       WHERE te.template_id = ?
       ORDER BY te.order_index`,
            templateId
        );

        return { ...template, exercises };
    },

    /**
     * Get template assigned to a specific day for a user
     */
    getTemplateByDay: async (userId: number, dayIndex: number): Promise<TemplateWithExercises | null> => {
        const db = await getDBConnection();

        const templates = await db.getAllAsync<WorkoutTemplate>(
            'SELECT * FROM workout_templates WHERE user_id = ? AND day_assigned = ?',
            userId, dayIndex
        );

        if (templates.length === 0) return null;

        const template = templates[0];
        const exercises = await db.getAllAsync<TemplateExercise>(
            `SELECT te.*, el.name as exercise_name, el.video_url, el.muscle_group, el.instructions
       FROM template_exercises te
       JOIN exercise_library el ON te.exercise_id = el.id
       WHERE te.template_id = ?
       ORDER BY te.order_index`,
            template.id
        );

        return { ...template, exercises };
    },

    /**
     * Get all templates with their day assignments for a user
     */
    getWeeklyTemplates: async (userId: number): Promise<TemplateWithExercises[]> => {
        const db = await getDBConnection();

        const templates = await db.getAllAsync<WorkoutTemplate>(
            'SELECT * FROM workout_templates WHERE user_id = ? ORDER BY day_assigned, name',
            userId
        );

        const templatesWithExercises: TemplateWithExercises[] = [];

        for (const template of templates) {
            const exercises = await db.getAllAsync<TemplateExercise>(
                `SELECT te.*, el.name as exercise_name, el.video_url, el.muscle_group, el.instructions
         FROM template_exercises te
         JOIN exercise_library el ON te.exercise_id = el.id
         WHERE te.template_id = ?
         ORDER BY te.order_index`,
                template.id
            );
            templatesWithExercises.push({ ...template, exercises });
        }

        return templatesWithExercises;
    },

    /**
     * Create a new workout template
     */
    createTemplate: async (
        userId: number,
        name: string,
        dayAssigned: number | null = null,
        color: string = '#a3e635'
    ): Promise<number> => {
        const db = await getDBConnection();

        // If assigning to a day, unassign any existing template from that day
        if (dayAssigned !== null) {
            await db.runAsync(
                'UPDATE workout_templates SET day_assigned = NULL WHERE user_id = ? AND day_assigned = ?',
                userId, dayAssigned
            );
        }

        const result = await db.runAsync(
            'INSERT INTO workout_templates (user_id, name, day_assigned, color) VALUES (?, ?, ?, ?)',
            userId, name, dayAssigned, color
        );

        return result.lastInsertRowId;
    },

    /**
     * Update a template
     */
    updateTemplate: async (
        templateId: number,
        data: Partial<Omit<WorkoutTemplate, 'id' | 'user_id' | 'created_at'>>
    ): Promise<void> => {
        const db = await getDBConnection();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.day_assigned !== undefined) {
            fields.push('day_assigned = ?');
            values.push(data.day_assigned);
        }
        if (data.color !== undefined) {
            fields.push('color = ?');
            values.push(data.color);
        }

        if (fields.length > 0) {
            values.push(templateId);
            await db.runAsync(
                `UPDATE workout_templates SET ${fields.join(', ')} WHERE id = ?`,
                ...values
            );
        }
    },

    /**
     * Assign a template to a day of the week
     */
    assignTemplateToDay: async (userId: number, templateId: number, dayIndex: number | null): Promise<void> => {
        const db = await getDBConnection();

        // If assigning to a day, unassign any existing template from that day
        if (dayIndex !== null) {
            await db.runAsync(
                'UPDATE workout_templates SET day_assigned = NULL WHERE user_id = ? AND day_assigned = ?',
                userId, dayIndex
            );
        }

        await db.runAsync(
            'UPDATE workout_templates SET day_assigned = ? WHERE id = ?',
            dayIndex, templateId
        );
    },

    /**
     * Delete a template
     */
    deleteTemplate: async (templateId: number): Promise<void> => {
        const db = await getDBConnection();
        await db.runAsync('DELETE FROM workout_templates WHERE id = ?', templateId);
    },

    /**
     * Add an exercise to a template
     */
    addExerciseToTemplate: async (
        templateId: number,
        exerciseId: number,
        targetSets: number = 3,
        targetReps: string = '10-12',
        targetWeight: number | null = null
    ): Promise<number> => {
        const db = await getDBConnection();

        // Get the next order index
        const result = await db.getAllAsync<{ max_order: number | null }>(
            'SELECT MAX(order_index) as max_order FROM template_exercises WHERE template_id = ?',
            templateId
        );
        const nextOrder = (result[0]?.max_order ?? -1) + 1;

        const insertResult = await db.runAsync(
            `INSERT INTO template_exercises (template_id, exercise_id, target_sets, target_reps, target_weight, order_index)
       VALUES (?, ?, ?, ?, ?, ?)`,
            templateId, exerciseId, targetSets, targetReps, targetWeight, nextOrder
        );

        return insertResult.lastInsertRowId;
    },

    /**
     * Update an exercise in a template
     */
    updateTemplateExercise: async (
        templateExerciseId: number,
        data: Partial<Pick<TemplateExercise, 'target_sets' | 'target_reps' | 'target_weight' | 'order_index'>>
    ): Promise<void> => {
        const db = await getDBConnection();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.target_sets !== undefined) {
            fields.push('target_sets = ?');
            values.push(data.target_sets);
        }
        if (data.target_reps !== undefined) {
            fields.push('target_reps = ?');
            values.push(data.target_reps);
        }
        if (data.target_weight !== undefined) {
            fields.push('target_weight = ?');
            values.push(data.target_weight);
        }
        if (data.order_index !== undefined) {
            fields.push('order_index = ?');
            values.push(data.order_index);
        }

        if (fields.length > 0) {
            values.push(templateExerciseId);
            await db.runAsync(
                `UPDATE template_exercises SET ${fields.join(', ')} WHERE id = ?`,
                ...values
            );
        }
    },

    /**
     * Remove an exercise from a template
     */
    removeExerciseFromTemplate: async (templateExerciseId: number): Promise<void> => {
        const db = await getDBConnection();
        await db.runAsync('DELETE FROM template_exercises WHERE id = ?', templateExerciseId);
    },

    /**
     * Reorder exercises in a template
     */
    reorderExercises: async (templateId: number, exerciseIds: number[]): Promise<void> => {
        const db = await getDBConnection();

        for (let i = 0; i < exerciseIds.length; i++) {
            await db.runAsync(
                'UPDATE template_exercises SET order_index = ? WHERE id = ? AND template_id = ?',
                i, exerciseIds[i], templateId
            );
        }
    }
};
