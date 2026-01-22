import { getDBConnection } from '../database/db';

export interface WorkoutSession {
    id: number;
    user_id: number;
    template_id: number | null;
    started_at: string;
    completed_at: string | null;
    notes: string | null;
}

export interface SessionExercise {
    id: number;
    session_id: number;
    exercise_id: number;
    actual_sets: number | null;
    actual_reps: string | null;
    actual_weight: number | null;
    order_index: number;
    completed: boolean;
    // Joined fields
    exercise_name?: string;
    video_url?: string | null;
    muscle_group?: string;
}

export interface SessionWithExercises extends WorkoutSession {
    exercises: SessionExercise[];
    template_name?: string;
}

export const WorkoutSessionRepository = {
    /**
     * Start a new workout session
     */
    startSession: async (
        userId: number,
        templateId: number | null = null
    ): Promise<number> => {
        const db = await getDBConnection();
        const startedAt = new Date().toISOString();

        const result = await db.runAsync(
            'INSERT INTO workout_sessions (user_id, template_id, started_at) VALUES (?, ?, ?)',
            userId, templateId, startedAt
        );

        return result.lastInsertRowId;
    },

    /**
     * Add an exercise to an active session
     */
    addExerciseToSession: async (
        sessionId: number,
        exerciseId: number,
        orderIndex: number = 0
    ): Promise<number> => {
        const db = await getDBConnection();

        const result = await db.runAsync(
            'INSERT INTO session_exercises (session_id, exercise_id, order_index) VALUES (?, ?, ?)',
            sessionId, exerciseId, orderIndex
        );

        return result.lastInsertRowId;
    },

    /**
     * Update exercise data during workout
     */
    updateSessionExercise: async (
        sessionExerciseId: number,
        data: Partial<Pick<SessionExercise, 'actual_sets' | 'actual_reps' | 'actual_weight' | 'completed'>>
    ): Promise<void> => {
        const db = await getDBConnection();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.actual_sets !== undefined) {
            fields.push('actual_sets = ?');
            values.push(data.actual_sets);
        }
        if (data.actual_reps !== undefined) {
            fields.push('actual_reps = ?');
            values.push(data.actual_reps);
        }
        if (data.actual_weight !== undefined) {
            fields.push('actual_weight = ?');
            values.push(data.actual_weight);
        }
        if (data.completed !== undefined) {
            fields.push('completed = ?');
            values.push(data.completed ? 1 : 0);
        }

        if (fields.length > 0) {
            values.push(sessionExerciseId);
            await db.runAsync(
                `UPDATE session_exercises SET ${fields.join(', ')} WHERE id = ?`,
                ...values
            );
        }
    },

    /**
     * Remove an exercise from an active session
     */
    removeExerciseFromSession: async (sessionExerciseId: number): Promise<void> => {
        const db = await getDBConnection();
        await db.runAsync('DELETE FROM session_exercises WHERE id = ?', sessionExerciseId);
    },

    /**
     * Complete a workout session
     */
    completeSession: async (sessionId: number, notes: string | null = null): Promise<void> => {
        const db = await getDBConnection();
        const completedAt = new Date().toISOString();

        await db.runAsync(
            'UPDATE workout_sessions SET completed_at = ?, notes = ? WHERE id = ?',
            completedAt, notes, sessionId
        );
    },

    /**
     * Get a session by ID with all exercises
     */
    getSessionById: async (sessionId: number): Promise<SessionWithExercises | null> => {
        const db = await getDBConnection();

        const sessions = await db.getAllAsync<WorkoutSession & { template_name: string | null }>(
            `SELECT ws.*, wt.name as template_name
       FROM workout_sessions ws
       LEFT JOIN workout_templates wt ON ws.template_id = wt.id
       WHERE ws.id = ?`,
            sessionId
        );

        if (sessions.length === 0) return null;

        const session = sessions[0];
        const exercises = await db.getAllAsync<SessionExercise>(
            `SELECT se.*, el.name as exercise_name, el.video_url, el.muscle_group
       FROM session_exercises se
       JOIN exercise_library el ON se.exercise_id = el.id
       WHERE se.session_id = ?
       ORDER BY se.order_index`,
            sessionId
        );

        return {
            ...session,
            template_name: session.template_name || undefined,
            exercises: exercises.map(e => ({ ...e, completed: Boolean(e.completed) }))
        };
    },

    /**
     * Get all sessions for a user
     */
    getUserSessions: async (userId: number, limit: number = 50): Promise<SessionWithExercises[]> => {
        const db = await getDBConnection();

        const sessions = await db.getAllAsync<WorkoutSession & { template_name: string | null }>(
            `SELECT ws.*, wt.name as template_name
       FROM workout_sessions ws
       LEFT JOIN workout_templates wt ON ws.template_id = wt.id
       WHERE ws.user_id = ?
       ORDER BY ws.started_at DESC
       LIMIT ?`,
            userId, limit
        );

        const sessionsWithExercises: SessionWithExercises[] = [];

        for (const session of sessions) {
            const exercises = await db.getAllAsync<SessionExercise>(
                `SELECT se.*, el.name as exercise_name, el.video_url, el.muscle_group
         FROM session_exercises se
         JOIN exercise_library el ON se.exercise_id = el.id
         WHERE se.session_id = ?
         ORDER BY se.order_index`,
                session.id
            );

            sessionsWithExercises.push({
                ...session,
                template_name: session.template_name || undefined,
                exercises: exercises.map(e => ({ ...e, completed: Boolean(e.completed) }))
            });
        }

        return sessionsWithExercises;
    },

    /**
     * Get sessions by date
     */
    getSessionsByDate: async (userId: number, date: string): Promise<SessionWithExercises[]> => {
        const db = await getDBConnection();

        const sessions = await db.getAllAsync<WorkoutSession & { template_name: string | null }>(
            `SELECT ws.*, wt.name as template_name
       FROM workout_sessions ws
       LEFT JOIN workout_templates wt ON ws.template_id = wt.id
       WHERE ws.user_id = ? AND date(ws.started_at) = date(?)
       ORDER BY ws.started_at DESC`,
            userId, date
        );

        const sessionsWithExercises: SessionWithExercises[] = [];

        for (const session of sessions) {
            const exercises = await db.getAllAsync<SessionExercise>(
                `SELECT se.*, el.name as exercise_name, el.video_url, el.muscle_group
         FROM session_exercises se
         JOIN exercise_library el ON se.exercise_id = el.id
         WHERE se.session_id = ?
         ORDER BY se.order_index`,
                session.id
            );

            sessionsWithExercises.push({
                ...session,
                template_name: session.template_name || undefined,
                exercises: exercises.map(e => ({ ...e, completed: Boolean(e.completed) }))
            });
        }

        return sessionsWithExercises;
    },

    /**
     * Delete a session
     */
    deleteSession: async (sessionId: number): Promise<void> => {
        const db = await getDBConnection();
        await db.runAsync('DELETE FROM workout_sessions WHERE id = ?', sessionId);
    },

    /**
     * Get session count for date range
     */
    getSessionCount: async (userId: number, startDate: string, endDate: string): Promise<number> => {
        const db = await getDBConnection();
        const result = await db.getAllAsync<{ count: number }>(
            `SELECT COUNT(*) as count 
             FROM workout_sessions 
             WHERE user_id = ? 
             AND date(started_at) >= date(?) 
             AND date(started_at) <= date(?)`,
            userId, startDate, endDate
        );
        return result[0]?.count || 0;
    },

    /**
     * Get the most recent completed session for a user
     */
    getLastSession: async (userId: number): Promise<SessionWithExercises | null> => {
        const db = await getDBConnection();

        const sessions = await db.getAllAsync<WorkoutSession & { template_name: string | null }>(
            `SELECT ws.*, wt.name as template_name
       FROM workout_sessions ws
       LEFT JOIN workout_templates wt ON ws.template_id = wt.id
       WHERE ws.user_id = ? AND ws.completed_at IS NOT NULL
       ORDER BY ws.completed_at DESC
       LIMIT 1`,
            userId
        );

        if (sessions.length === 0) return null;

        const session = sessions[0];
        const exercises = await db.getAllAsync<SessionExercise>(
            `SELECT se.*, el.name as exercise_name, el.video_url, el.muscle_group
       FROM session_exercises se
       JOIN exercise_library el ON se.exercise_id = el.id
       WHERE se.session_id = ?
       ORDER BY se.order_index`,
            session.id
        );

        return {
            ...session,
            template_name: session.template_name || undefined,
            exercises: exercises.map(e => ({ ...e, completed: Boolean(e.completed) }))
        };
    },

    /**
     * Copy exercises from a template to start a new session
     */
    startSessionFromTemplate: async (
        userId: number,
        templateId: number
    ): Promise<number> => {
        const db = await getDBConnection();

        // Create the session
        const sessionId = await WorkoutSessionRepository.startSession(userId, templateId);

        // Get template exercises
        const templateExercises = await db.getAllAsync<{
            exercise_id: number;
            target_sets: number;
            target_reps: string;
            target_weight: number | null;
            order_index: number;
        }>(
            'SELECT exercise_id, target_sets, target_reps, target_weight, order_index FROM template_exercises WHERE template_id = ? ORDER BY order_index',
            templateId
        );

        // Add exercises to session with target values as starting point
        for (const te of templateExercises) {
            await db.runAsync(
                `INSERT INTO session_exercises (session_id, exercise_id, actual_sets, actual_reps, actual_weight, order_index)
         VALUES (?, ?, ?, ?, ?, ?)`,
                sessionId, te.exercise_id, te.target_sets, te.target_reps, te.target_weight, te.order_index
            );
        }

        return sessionId;
    },

    /**
     * Get the last performance for a specific exercise (Ghost Set)
     */
    getLastPerformance: async (
        userId: number,
        exerciseId: number
    ): Promise<{ weight: number | null; reps: string | null; sets: number | null } | null> => {
        const db = await getDBConnection();

        const results = await db.getAllAsync<{
            actual_weight: number | null;
            actual_reps: string | null;
            actual_sets: number | null;
        }>(
            `SELECT se.actual_weight, se.actual_reps, se.actual_sets
             FROM session_exercises se
             JOIN workout_sessions ws ON se.session_id = ws.id
             WHERE ws.user_id = ? AND se.exercise_id = ? AND ws.completed_at IS NOT NULL
             ORDER BY ws.completed_at DESC
             LIMIT 1`,
            userId, exerciseId
        );

        if (results.length === 0) return null;

        return {
            weight: results[0].actual_weight,
            reps: results[0].actual_reps,
            sets: results[0].actual_sets
        };
    },

    /**
     * Get exercise history for evolution charts
     */
    getExerciseHistory: async (
        userId: number,
        exerciseId: number,
        limit: number = 20
    ): Promise<Array<{
        date: string;
        weight: number | null;
        reps: string | null;
        sets: number | null;
        volume: number;
    }>> => {
        const db = await getDBConnection();

        const results = await db.getAllAsync<{
            completed_at: string;
            actual_weight: number | null;
            actual_reps: string | null;
            actual_sets: number | null;
        }>(
            `SELECT ws.completed_at, se.actual_weight, se.actual_reps, se.actual_sets
             FROM session_exercises se
             JOIN workout_sessions ws ON se.session_id = ws.id
             WHERE ws.user_id = ? AND se.exercise_id = ? AND ws.completed_at IS NOT NULL
             ORDER BY ws.completed_at ASC
             LIMIT ?`,
            userId, exerciseId, limit
        );

        return results.map(r => {
            // Calculate volume (weight * reps * sets)
            const repsNum = parseInt(r.actual_reps?.split('-')[0] || '0') || 0;
            const volume = (r.actual_weight || 0) * repsNum * (r.actual_sets || 1);

            return {
                date: r.completed_at,
                weight: r.actual_weight,
                reps: r.actual_reps,
                sets: r.actual_sets,
                volume
            };
        });
    },

    /**
     * Swap an exercise in a session (Quick Swap)
     */
    swapExercise: async (
        sessionExerciseId: number,
        newExerciseId: number
    ): Promise<void> => {
        const db = await getDBConnection();

        await db.runAsync(
            `UPDATE session_exercises SET exercise_id = ?, actual_sets = NULL, actual_reps = NULL, actual_weight = NULL, completed = 0
             WHERE id = ?`,
            newExerciseId, sessionExerciseId
        );
    }
};
