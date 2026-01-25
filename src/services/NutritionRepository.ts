import { getDBConnection } from '../database/db';

export interface FoodComboItem {
    id?: number;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    portion: number;
    unit: string;
    quantity: number;
}

export interface FoodCombo {
    id: number;
    name: string;
    total_calories: number;
    items?: FoodComboItem[];
}

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
    },

    // --- COMBO METHODS (Meus Pratos) ---

    createCombo: async (userId: number, name: string, items: FoodComboItem[]) => {
        const db = await getDBConnection();
        const totalCalories = items.reduce((sum, item) => sum + (item.calories * item.quantity), 0);

        const result = await db.runAsync(
            'INSERT INTO food_combos (user_id, name, total_calories) VALUES (?, ?, ?)',
            userId, name, totalCalories
        );
        const comboId = result.lastInsertRowId;

        for (const item of items) {
            await db.runAsync(
                `INSERT INTO food_combo_items (combo_id, name, calories, protein, carbs, fats, portion, unit, quantity) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                comboId, item.name, item.calories, item.protein, item.carbs, item.fats, item.portion, item.unit, item.quantity
            );
        }
        return comboId;
    },

    getCombos: async (userId: number): Promise<FoodCombo[]> => {
        const db = await getDBConnection();
        const combos = await db.getAllAsync<FoodCombo>(
            'SELECT * FROM food_combos WHERE user_id = ? ORDER BY created_at DESC',
            userId
        );

        // Fetch items for each combo (could be optimized with join but this is simple)
        for (const combo of combos) {
            const items = await db.getAllAsync<FoodComboItem>(
                'SELECT * FROM food_combo_items WHERE combo_id = ?',
                combo.id
            );
            combo.items = items;
        }

        return combos;
    },

    deleteCombo: async (comboId: number) => {
        const db = await getDBConnection();
        await db.runAsync('DELETE FROM food_combos WHERE id = ?', comboId);
    },

    deleteMeal: async (id: number) => {
        const db = await getDBConnection();
        await db.runAsync('DELETE FROM meals WHERE id = ?', id);
    }
};
