import { getDBConnection } from '../database/db';

export interface WeightEntry {
    id: number;
    user_id: number;
    date: string;
    weight: number;
}

export const WeightRepository = {
    // Add a new weight entry
    async addWeight(userId: number, weight: number): Promise<void> {
        const db = await getDBConnection();
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        await db.runAsync(
            'INSERT INTO weight_logs (user_id, date, weight) VALUES (?, ?, ?)',
            userId, date, weight
        );
    },

    // Get weight history for a user (last N entries or all)
    async getWeightHistory(userId: number, limit?: number): Promise<WeightEntry[]> {
        const db = await getDBConnection();
        const query = limit
            ? 'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY date DESC LIMIT ?'
            : 'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY date DESC';

        const params = limit ? [userId, limit] : [userId];
        const results = await db.getAllAsync(query, ...params) as WeightEntry[];
        return results.reverse(); // Oldest first for graphs
    },

    // Get weight history for a date range
    async getWeightHistoryByRange(userId: number, startDate: string, endDate: string): Promise<WeightEntry[]> {
        const db = await getDBConnection();
        const results = await db.getAllAsync(
            'SELECT * FROM weight_logs WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC',
            userId, startDate, endDate
        ) as WeightEntry[];
        return results;
    },

    // Get latest weight
    async getLatestWeight(userId: number): Promise<number | null> {
        const db = await getDBConnection();
        const result = await db.getFirstAsync(
            'SELECT weight FROM weight_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1',
            userId
        ) as { weight: number } | null;
        return result?.weight || null;
    },

    // Update weight for a specific date (or insert if not exists)
    async upsertWeight(userId: number, date: string, weight: number): Promise<void> {
        const db = await getDBConnection();
        await db.runAsync(
            `INSERT INTO weight_logs (user_id, date, weight) VALUES (?, ?, ?)
             ON CONFLICT(user_id, date) DO UPDATE SET weight = excluded.weight`,
            userId, date, weight
        );
    }
};
