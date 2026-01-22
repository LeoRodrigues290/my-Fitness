import { getDBConnection } from '../database/db';

export const RoutineRepository = {
    getWeeklyRoutine: async (userId: number) => {
        const db = await getDBConnection();
        return await db.getAllAsync(
            'SELECT * FROM weekly_routine WHERE user_id = ? ORDER BY day_index ASC',
            userId
        );
    },

    setDayRoutine: async (userId: number, dayIndex: number, focus: string) => {
        const db = await getDBConnection();
        await db.runAsync(
            `INSERT OR REPLACE INTO weekly_routine (user_id, day_index, workout_focus) 
             VALUES (?, ?, ?)`,
            userId, dayIndex, focus
        );
    },

    initDefaultRoutine: async (userId: number) => {
        const db = await getDBConnection();
        const existing = await db.getAllAsync('SELECT * FROM weekly_routine WHERE user_id = ?', userId);

        if (existing.length === 0) {
            const defaults = [
                { idx: 0, focus: 'Peito & Tríceps' }, // Mon
                { idx: 1, focus: 'Costas & Bíceps' }, // Tue
                { idx: 2, focus: 'Pernas (Leg Day)' }, // Wed
                { idx: 3, focus: 'Ombros & Abdômen' }, // Thu
                { idx: 4, focus: 'Full Body' }, // Fri
                { idx: 5, focus: 'Descanso Ativo' }, // Sat
                { idx: 6, focus: 'Descanso' }, // Sun (0 is often Sun in JS Date, lets clarify: 0=Sun, 1=Mon... wait, date-fns uses 0=Sun. But user context usually implies Mon start. Let's align with JS Date getDay(): 0=Sun, 1=Mon...)
            ];
            // Wait, common gym week starts Monday. 
            // 0=Sunday, 1=Monday... 
            // So default layout:
            // 1(Mon): Chest
            // 2(Tue): Back
            // 3(Wed): Legs
            // 4(Thu): Shoulders
            // 5(Fri): Full Body
            // 6(Sat): Cardio
            // 0(Sun): Rest

            for (const day of defaults) {
                // Adjusting to JS standard:
                // Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
                let jsIndex;
                if (day.idx === 6) jsIndex = 0; // Sun
                else jsIndex = day.idx + 1; // Mon(0->1)

                // Actually let's just stick to 0-6 where 0=Sunday to avoid confusion with JS Date.getDay()
            }
            // Re-defining for 0=Sunday standard
            const jsDefaults = [
                { idx: 1, focus: 'Peito & Tríceps' }, // Mon
                { idx: 2, focus: 'Costas & Bíceps' }, // Tue
                { idx: 3, focus: 'Pernas (Leg Day)' }, // Wed
                { idx: 4, focus: 'Ombros & Abdômen' }, // Thu
                { idx: 5, focus: 'Full Body' }, // Fri
                { idx: 6, focus: 'Descanso Ativo' }, // Sat
                { idx: 0, focus: 'Descanso' }, // Sun
            ];

            for (const d of jsDefaults) {
                await db.runAsync(
                    'INSERT INTO weekly_routine (user_id, day_index, workout_focus) VALUES (?, ?, ?)',
                    userId, d.idx, d.focus
                );
            }
        }
    }
};
