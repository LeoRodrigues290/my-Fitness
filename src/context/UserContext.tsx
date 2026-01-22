import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDBConnection } from '../database/db';

type User = {
    id: number;
    name: string;
    avatar_uri?: string;
};

// Exported interfaces at top level
export interface Meal {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    section: string;
}

export interface DailyStats {
    date: string;
    caloriesConsumed: number;
    proteinConsumed: number;
    carbsConsumed: number;
    waterConsumed: number;
    meals: Meal[];
}

export interface WeekSchedule {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
}

export interface UserPreferences {
    goals: { kcal: number; protein: number; carbs: number; weight: number; water: number };
    schedule: WeekSchedule;
}

interface UserContextType {
    currentUser: User | null;
    selectUser: (userId: number) => Promise<void>;
    updateUser: (userId: number, name: string, avatarUri?: string) => Promise<void>;
    users: User[];
    loading: boolean;
    setUser: (user: User | null) => void;
    userPreferences: UserPreferences;
    updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
    dailyStats: DailyStats;
    updateDailyStats: (newStats: Partial<DailyStats>) => void;
    addMeal: (meal: Meal) => void;
}

const defaultPreferences: UserPreferences = {
    goals: { kcal: 2000, protein: 150, carbs: 200, weight: 70, water: 2500 },
    schedule: {
        monday: 'chest-triceps',
        tuesday: 'back-biceps',
        wednesday: 'legs',
        thursday: 'shoulders-abs',
        friday: 'flow',
        saturday: 'rest',
        sunday: 'rest'
    }
};

const defaultDailyStats: DailyStats = {
    date: new Date().toISOString().split('T')[0],
    caloriesConsumed: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    waterConsumed: 0,
    meals: []
};

const UserContext = createContext<UserContextType>({
    currentUser: null,
    selectUser: async () => { },
    updateUser: async () => { },
    users: [],
    loading: true,
    setUser: () => { },
    userPreferences: defaultPreferences,
    updatePreferences: async () => { },
    dailyStats: defaultDailyStats,
    updateDailyStats: () => { },
    addMeal: () => { },
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);
    const [dailyStats, setDailyStats] = useState<DailyStats>(defaultDailyStats);

    const loadUsers = async () => {
        try {
            const db = await getDBConnection();
            const result: User[] = await db.getAllAsync('SELECT * FROM users');
            setUsers(result);

            const savedUserId = await AsyncStorage.getItem('current_user_id');
            if (savedUserId) {
                const user = result.find(u => u.id === parseInt(savedUserId));
                if (user) {
                    setCurrentUser(user);
                    await loadPreferences(user.id);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadPreferences = async (userId: number) => {
        try {
            const jsonValue = await AsyncStorage.getItem(`prefs_${userId}`);
            if (jsonValue != null) {
                setUserPreferences(JSON.parse(jsonValue));
            } else {
                setUserPreferences(defaultPreferences);
            }
        } catch (e) {
            console.error("Failed to load prefs", e);
        }
    };

    const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
        if (!currentUser) return;

        try {
            const updated = { ...userPreferences, ...newPrefs };
            setUserPreferences(updated);
            await AsyncStorage.setItem(`prefs_${currentUser.id}`, JSON.stringify(updated));
        } catch (e) {
            console.error("Failed to save prefs", e);
        }
    };

    const handleSetUser = async (user: User | null) => {
        setCurrentUser(user);
        if (user) {
            await AsyncStorage.setItem('current_user_id', user.id.toString());
            await loadPreferences(user.id);
        } else {
            await AsyncStorage.removeItem('current_user_id');
            setUserPreferences(defaultPreferences);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const selectUser = async (userId: number) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            await handleSetUser(user);
        }
    };

    const updateUser = async (userId: number, name: string, avatarUri?: string) => {
        try {
            const db = await getDBConnection();
            await db.runAsync(
                'UPDATE users SET name = ?, avatar_uri = ? WHERE id = ?',
                name,
                avatarUri || null,
                userId
            );

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, name, avatar_uri: avatarUri || u.avatar_uri } : u));
            if (currentUser?.id === userId) {
                setCurrentUser(prev => prev ? { ...prev, name, avatar_uri: avatarUri || prev.avatar_uri } : null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updateDailyStats = (newStats: Partial<DailyStats>) => {
        setDailyStats(prev => ({ ...prev, ...newStats }));
    };

    const addMeal = (meal: Meal) => {
        setDailyStats(prev => ({
            ...prev,
            caloriesConsumed: prev.caloriesConsumed + meal.calories,
            proteinConsumed: prev.proteinConsumed + meal.protein,
            carbsConsumed: prev.carbsConsumed + meal.carbs,
            meals: [...prev.meals, meal]
        }));
    };

    return (
        <UserContext.Provider value={{
            currentUser, selectUser, updateUser, users, loading, setUser: handleSetUser,
            userPreferences, updatePreferences, dailyStats, updateDailyStats, addMeal
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
