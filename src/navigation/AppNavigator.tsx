import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUser } from '../context/UserContext';
import { ProfileSelectionScreen } from '../screens/profile/ProfileSelectionScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { AddWorkoutScreen } from '../screens/workout/AddWorkoutScreen';
import { AddWeightScreen } from '../screens/dashboard/AddWeightScreen';
import { AddMealScreen } from '../screens/nutrition/AddMealScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { GoalsScreen } from '../screens/settings/GoalsScreen';
import { RoutineSettingsScreen } from '../screens/settings/RoutineSettingsScreen';
import { CalendarScreen } from '../screens/dashboard/CalendarScreen';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    const { currentUser, loading } = useUser();

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
                {!currentUser ? (
                    <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
                ) : (
                    <>
                        <Stack.Screen name="MainApp" component={MainTabNavigator} />
                        <Stack.Screen
                            name="AddWorkout"
                            component={AddWorkoutScreen}
                            options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                                headerShown: false
                            }}
                        />
                        <Stack.Screen
                            name="AddWeight"
                            component={AddWeightScreen}
                            options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                                headerShown: false
                            }}
                        />
                        <Stack.Screen
                            name="AddMeal"
                            component={AddMealScreen}
                            options={{
                                presentation: 'modal',
                                animation: 'slide_from_bottom',
                                headerShown: false
                            }}
                        />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{
                                presentation: 'modal',
                                animation: 'slide_from_right',
                                headerShown: false
                            }}
                        />
                        <Stack.Screen
                            name="Goals"
                            component={GoalsScreen}
                            options={{
                                presentation: 'card',
                                animation: 'slide_from_right',
                                headerShown: false
                            }}
                        />
                        <Stack.Screen
                            name="RoutineSettings"
                            component={RoutineSettingsScreen}
                            options={{
                                presentation: 'card',
                                animation: 'slide_from_right',
                                headerShown: false
                            }}
                        />
                        <Stack.Screen
                            name="Calendar"
                            component={CalendarScreen}
                            options={{
                                presentation: 'fullScreenModal',
                                animation: 'slide_from_bottom',
                                headerShown: false
                            }}
                        />
                        <Stack.Screen
                            name="ProfileSelection"
                            component={ProfileSelectionScreen}
                            options={{
                                presentation: 'modal',
                                animation: 'fade',
                                headerShown: false
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
