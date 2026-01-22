import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { WorkoutListScreen } from '../screens/workout/WorkoutListScreen';
import { WeightScreen } from '../screens/dashboard/WeightScreen';
import { NutritionScreen } from '../screens/nutrition/NutritionScreen';
import { COLORS } from '../constants/theme';
import { Dumbbell, Home, Utensils, TrendingUp } from 'lucide-react-native';
import { View, Platform } from 'react-native';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.surface,
                    borderTopColor: COLORS.border,
                    height: Platform.OS === 'android' ? 60 : 80,
                    paddingBottom: Platform.OS === 'android' ? 10 : 20,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarShowLabel: true,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                    title: 'Início'
                }}
            />
            <Tab.Screen
                name="Workouts"
                component={WorkoutListScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
                    title: 'Treinos'
                }}
            />
            <Tab.Screen
                name="Weight"
                component={WeightScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
                    title: 'Peso'
                }}
            />
            <Tab.Screen
                name="Nutrition"
                component={NutritionScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Utensils color={color} size={size} />,
                    title: 'Nutrição'
                }}
            />
        </Tab.Navigator>
    );
};
