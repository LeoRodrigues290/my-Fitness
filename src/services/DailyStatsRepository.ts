import { getDBConnection } from '../database/db';

export interface DailyStatsEntry {
    id?: number;
    user_id: number;
    date: string;
    calories_consumed: number;
    protein_consumed: number;
    carbs_consumed: number;
    fats_consumed: number;
    water_consumed: number;
}

export interface MealEntry {
    id?: number;
    user_id: number;
    date: string;
    section: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    quantity: number;
    unit: string;
}

export const DailyStatsRepository = {
    // Get stats for a specific date
    async getStatsForDate(userId: number, date: string): Promise<DailyStatsEntry | null> {
        const db = await getDBConnection();
        const result = await db.getFirstAsync(
            'SELECT * FROM daily_stats WHERE user_id = ? AND date = ?',
            userId, date
        ) as DailyStatsEntry | null;
        return result;
    },

    // Get stats for date range (for graphs)
    async getStatsByRange(userId: number, startDate: string, endDate: string): Promise<DailyStatsEntry[]> {
        const db = await getDBConnection();
        const results = await db.getAllAsync(
            'SELECT * FROM daily_stats WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC',
            userId, startDate, endDate
        ) as DailyStatsEntry[];
        return results;
    },

    // Update or insert daily stats
    async upsertDailyStats(stats: DailyStatsEntry): Promise<void> {
        const db = await getDBConnection();
        await db.runAsync(
            `INSERT INTO daily_stats (user_id, date, calories_consumed, protein_consumed, carbs_consumed, fats_consumed, water_consumed)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id, date) DO UPDATE SET
                calories_consumed = excluded.calories_consumed,
                protein_consumed = excluded.protein_consumed,
                carbs_consumed = excluded.carbs_consumed,
                fats_consumed = excluded.fats_consumed,
                water_consumed = excluded.water_consumed`,
            stats.user_id, stats.date, stats.calories_consumed, stats.protein_consumed,
            stats.carbs_consumed, stats.fats_consumed, stats.water_consumed
        );
    },

    // Increment water for today
    async addWater(userId: number, amount: number): Promise<void> {
        const db = await getDBConnection();
        const date = new Date().toISOString().split('T')[0];

        // First try to update existing record
        const existing = await this.getStatsForDate(userId, date);
        if (existing) {
            await db.runAsync(
                'UPDATE daily_stats SET water_consumed = water_consumed + ? WHERE user_id = ? AND date = ?',
                amount, userId, date
            );
        } else {
            await db.runAsync(
                'INSERT INTO daily_stats (user_id, date, water_consumed) VALUES (?, ?, ?)',
                userId, date, amount
            );
        }
    },

    // Get weekly summary (last 7 days)
    async getWeeklySummary(userId: number): Promise<DailyStatsEntry[]> {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return this.getStatsByRange(userId, startDate, endDate);
    },

    // Get monthly summary (last 30 days)
    async getMonthlySummary(userId: number): Promise<DailyStatsEntry[]> {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return this.getStatsByRange(userId, startDate, endDate);
    }
};

export const MealLogRepository = {
    // Add a meal
    async addMeal(meal: Omit<MealEntry, 'id'>): Promise<number> {
        const db = await getDBConnection();
        const result = await db.runAsync(
            `INSERT INTO meals (user_id, date, section, name, calories, protein, carbs, fats, quantity, unit)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            meal.user_id, meal.date, meal.section, meal.name, meal.calories,
            meal.protein, meal.carbs, meal.fats, meal.quantity, meal.unit
        );

        // Update daily stats totals
        await this.recalculateDailyStats(meal.user_id, meal.date);

        return result.lastInsertRowId;
    },

    // Get meals for a date
    async getMealsForDate(userId: number, date: string): Promise<MealEntry[]> {
        const db = await getDBConnection();
        const results = await db.getAllAsync(
            'SELECT * FROM meals WHERE user_id = ? AND date = ? ORDER BY id ASC',
            userId, date
        ) as MealEntry[];
        return results;
    },

    // Get meals by section for a date
    async getMealsBySection(userId: number, date: string, section: string): Promise<MealEntry[]> {
        const db = await getDBConnection();
        const results = await db.getAllAsync(
            'SELECT * FROM meals WHERE user_id = ? AND date = ? AND section = ? ORDER BY id ASC',
            userId, date, section
        ) as MealEntry[];
        return results;
    },

    // Delete a meal
    async deleteMeal(mealId: number, userId: number, date: string): Promise<void> {
        const db = await getDBConnection();
        await db.runAsync('DELETE FROM meals WHERE id = ?', mealId);
        await this.recalculateDailyStats(userId, date);
    },

    // Recalculate daily stats from meals
    async recalculateDailyStats(userId: number, date: string): Promise<void> {
        const db = await getDBConnection();
        const totals = await db.getFirstAsync(
            `SELECT 
                COALESCE(SUM(calories), 0) as calories,
                COALESCE(SUM(protein), 0) as protein,
                COALESCE(SUM(carbs), 0) as carbs,
                COALESCE(SUM(fats), 0) as fats
             FROM meals WHERE user_id = ? AND date = ?`,
            userId, date
        ) as { calories: number; protein: number; carbs: number; fats: number };

        // Update daily_stats with calculated totals
        const existing = await DailyStatsRepository.getStatsForDate(userId, date);
        await DailyStatsRepository.upsertDailyStats({
            user_id: userId,
            date,
            calories_consumed: totals.calories,
            protein_consumed: totals.protein,
            carbs_consumed: totals.carbs,
            fats_consumed: totals.fats,
            water_consumed: existing?.water_consumed || 0
        });
    }
};
