import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDBConnection } from '../database/db';

type User = {
    id: number;
    name: string;
    avatar_uri?: string;
};

interface UserContextType {
    currentUser: User | null;
    selectUser: (userId: number) => Promise<void>;
    updateUser: (userId: number, name: string, avatarUri?: string) => Promise<void>;
    users: User[];
    loading: boolean;
    setUser: (user: User | null) => void;
    userPreferences: UserPreferences;
    updatePreferences: (newPrefs: Partial<UserPreferences>) => Promise<void>;
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

const UserContext = createContext<UserContextType>({
    currentUser: null,
    selectUser: async () => { },
    updateUser: async () => { },
    users: [],
    loading: true,
    setUser: () => { },
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);

    const loadUsers = async () => {
        try {
            const db = await getDBConnection();
            const result: User[] = await db.getAllAsync('SELECT * FROM users');

            // If empty, seed mock users for the demo
            if (result.length === 0) {
                // Logic to seed if needed, but for now we rely on the implementation plan's "Manage Profiles" flow or manual insert
                // Actually, if result is empty, let's inject Léo and Oliver for the user experience
                /* 
                await db.runAsync("INSERT INTO users (name, avatar_uri) VALUES ('Léo', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&h=200')");
                await db.runAsync("INSERT INTO users (name, avatar_uri) VALUES ('Oliver', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200')");
                */
            }

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

    // Intercept selectUser/setUser to load prefs
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

            // Update local state directly to reflect changes immediately in UI
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, name, avatar_uri: avatarUri || u.avatar_uri } : u));
            if (currentUser?.id === userId) {
                setCurrentUser(prev => prev ? { ...prev, name, avatar_uri: avatarUri || prev.avatar_uri } : null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const [dailyStats, setDailyStats] = useState<DailyStats>({
        date: new Date().toISOString().split('T')[0],
        caloriesConsumed: 0,
        proteinConsumed: 0,
        carbsConsumed: 0,
        waterConsumed: 0
    });

    const updateDailyStats = (newStats: Partial<DailyStats>) => {
        setDailyStats(prev => ({ ...prev, ...newStats }));
    };

    return (
        <UserContext.Provider value={{
            currentUser, selectUser, updateUser, users, loading, setUser: handleSetUser,
            userPreferences, updatePreferences, dailyStats, updateDailyStats
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
