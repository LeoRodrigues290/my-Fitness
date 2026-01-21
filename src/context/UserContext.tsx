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
}

const UserContext = createContext<UserContextType>({
    currentUser: null,
    selectUser: async () => { },
    updateUser: async () => { },
    users: [],
    loading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            const db = await getDBConnection();
            const result: User[] = await db.getAllAsync('SELECT * FROM users');
            setUsers(result);

            const savedUserId = await AsyncStorage.getItem('current_user_id');
            if (savedUserId) {
                const user = result.find(u => u.id === parseInt(savedUserId));
                if (user) setCurrentUser(user);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const selectUser = async (userId: number) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setCurrentUser(user);
            await AsyncStorage.setItem('current_user_id', userId.toString());
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
            await loadUsers(); // Reload to update state
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <UserContext.Provider value={{ currentUser, selectUser, updateUser, users, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
