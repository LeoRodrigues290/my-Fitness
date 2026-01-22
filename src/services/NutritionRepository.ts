import { getDBConnection } from '../database/db';

export const NutritionRepository = {
    addMeal: async (userId: number, date: string, type: string, name: string, calories: number, protein: number, carbs: number, fats: number) => {
        const db = await getDBConnection();
        await db.runAsync(
            'INSERT INTO meals (user_id, date, type, name, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            userId, date, type, name, calories, protein, carbs, fats
        );
    },

    getMealsByDate: async (userId: number, date: string) => {
        const db = await getDBConnection();
        return await db.getAllAsync(
            'SELECT * FROM meals WHERE user_id = ? AND date = ?',
            userId, date
        );
    },

    getWeeklyCalories: async (userId: number, startDate: string, endDate: string) => {
        const db = await getDBConnection();
        // Aggregate calories by date
        return await db.getAllAsync(`
      SELECT date, SUM(calories) as totalCalories, SUM(protein) as totalProtein 
      FROM meals 
      WHERE user_id = ? AND date BETWEEN ? AND ? 
      GROUP BY date
      ORDER BY date ASC
    `, userId, startDate, endDate);
    }
};
