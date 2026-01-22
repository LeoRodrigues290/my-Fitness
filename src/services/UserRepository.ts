import { getDBConnection } from '../database/db';

export const UserRepository = {
    getUsers: async () => {
        const db = await getDBConnection();
        return await db.getAllAsync('SELECT * FROM users');
    },

    getUserById: async (id: number) => {
        const db = await getDBConnection();
        return await db.getAllAsync('SELECT * FROM users WHERE id = ?', id);
    },

    addWeightLog: async (userId: number, weight: number, date: string) => {
        const db = await getDBConnection();
        await db.runAsync(
            'INSERT INTO weight_logs (user_id, weight, date) VALUES (?, ?, ?)',
            userId, weight, date
        );
    },

    getWeightLogs: async (userId: number) => {
        const db = await getDBConnection();
        return await db.getAllAsync(
            'SELECT * FROM weight_logs WHERE user_id = ? ORDER BY date DESC',
            userId
        );
    },

    getUserStreak: async (userId: number) => {
        const db = await getDBConnection();

        // Fetch dates from workouts and meals
        const workouts = await db.getAllAsync('SELECT DISTINCT date FROM workouts WHERE user_id = ?', userId);
        const meals = await db.getAllAsync('SELECT DISTINCT date FROM meals WHERE user_id = ?', userId);

        // Combine unique dates
        const dateSet = new Set([
            ...workouts.map((w: any) => w.date),
            ...meals.map((m: any) => m.date)
        ]);

        const sortedDates = Array.from(dateSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (sortedDates.length === 0) return 0;

        // Check if streak is active (activity today or yesterday)
        const today = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
            return 0;
        }

        let streak = 1;

        for (let i = 0; i < sortedDates.length - 1; i++) {
            const current = new Date(sortedDates[i]);
            const next = new Date(sortedDates[i + 1]);

            // Calculate difference in days (ignoring time)
            const diffTime = Math.abs(current.getTime() - next.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }
};
