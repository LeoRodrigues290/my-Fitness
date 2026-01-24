import { getDBConnection } from '../database/db';

export interface UserGoalDB {
    calorie_goal: number;
    burn_goal: number;
    protein_goal: number;
    carbs_goal: number;
    fats_goal: number;
    water_goal: number;
}

export const GoalRepository = {
    getGoals: async (userId: number): Promise<UserGoalDB> => {
        const db = await getDBConnection();
        const result = await db.getAllAsync<UserGoalDB>(
            'SELECT * FROM user_goals WHERE user_id = ?',
            userId
        );
        if (result.length > 0) {
            return result[0];
        } else {
            // Return defaults if no record exists
            return {
                calorie_goal: 2000,
                burn_goal: 500,
                protein_goal: 150,
                carbs_goal: 250,
                fats_goal: 70,
                water_goal: 2500
            };
        }
    },

    saveGoals: async (userId: number, calorieGoal: number, burnGoal: number, proteinGoal: number, carbsGoal: number, fatsGoal: number, waterGoal: number) => {
        const db = await getDBConnection();
        // Upsert logic (insert or replace)
        await db.runAsync(
            `INSERT OR REPLACE INTO user_goals (user_id, calorie_goal, burn_goal, protein_goal, carbs_goal, fats_goal, water_goal) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            userId, calorieGoal, burnGoal, proteinGoal, carbsGoal, fatsGoal, waterGoal
        );
    }
};
