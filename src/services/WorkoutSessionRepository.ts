import { getDBConnection } from '../database/db';

export interface WorkoutSession {
    id?: number;
    user_id: number;
    date: string;
    workout_id: string;
    workout_title: string;
    duration: number;
    calories_burned: number;
}

export const WorkoutSessionRepository = {
    // Log a completed workout session
    async addSession(session: Omit<WorkoutSession, 'id'>): Promise<number> {
        const db = await getDBConnection();
        const result = await db.runAsync(
            `INSERT INTO workout_sessions (user_id, date, workout_id, workout_title, duration, calories_burned)
             VALUES (?, ?, ?, ?, ?, ?)`,
            session.user_id, session.date, session.workout_id, session.workout_title,
            session.duration, session.calories_burned
        );
        return result.lastInsertRowId;
    },

    // Get sessions for date range
    async getSessionsByRange(userId: number, startDate: string, endDate: string): Promise<WorkoutSession[]> {
        const db = await getDBConnection();
        const results = await db.getAllAsync(
            'SELECT * FROM workout_sessions WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date DESC',
            userId, startDate, endDate
        ) as WorkoutSession[];
        return results;
    },

    // Get session count for date range
    async getSessionCount(userId: number, startDate: string, endDate: string): Promise<number> {
        const db = await getDBConnection();
        const result = await db.getFirstAsync(
            'SELECT COUNT(*) as count FROM workout_sessions WHERE user_id = ? AND date >= ? AND date <= ?',
            userId, startDate, endDate
        ) as { count: number };
        return result.count;
    },

    // Get weekly session count
    async getWeeklySessionCount(userId: number): Promise<number> {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return this.getSessionCount(userId, startDate, endDate);
    },

    // Get all sessions for a user
    async getAllSessions(userId: number): Promise<WorkoutSession[]> {
        const db = await getDBConnection();
        const results = await db.getAllAsync(
            'SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY date DESC',
            userId
        ) as WorkoutSession[];
        return results;
    },

    // Get total calories burned in date range
    async getTotalCaloriesBurned(userId: number, startDate: string, endDate: string): Promise<number> {
        const db = await getDBConnection();
        const result = await db.getFirstAsync(
            'SELECT COALESCE(SUM(calories_burned), 0) as total FROM workout_sessions WHERE user_id = ? AND date >= ? AND date <= ?',
            userId, startDate, endDate
        ) as { total: number };
        return result.total;
    }
};
