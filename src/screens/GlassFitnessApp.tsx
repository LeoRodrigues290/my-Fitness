import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar as RNStatusBar } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { colors } from '../constants/colors';
import { workoutsData, restWorkout, getWorkoutById } from '../constants/workouts';
import { useUser, WeekSchedule } from '../context/UserContext';
import { Workout, DayName, DAY_NAMES } from '../types';

// Components
import { BottomNav } from '../components/navigation/BottomNav';
import { WorkoutLogModal } from '../components/modals/WorkoutLogModal';

// Screens
// Screens
import { LoginScreen } from './auth/LoginScreen';
import { HomeScreen } from './home/HomeScreen';
import { StatsScreen } from './stats/StatsScreen';
import { DetailsScreen } from './workout/DetailsScreen';
import { ProfileScreen } from './profile/ProfileScreen';
import { NutritionScreen } from './nutrition/NutritionScreen';
import { SettingsScreen } from './settings/SettingsScreen';
import { OnboardingScreen } from './onboarding/OnboardingScreen';
import { CalendarScreen } from './dashboard/CalendarScreen';
import { WorkoutsScreen } from './workout/WorkoutsScreen';
import { RoutineSettingsScreen } from './settings/RoutineSettingsScreen';
import { ExerciseLibraryScreen } from './settings/ExerciseLibraryScreen';
import { ExerciseProgressScreen } from './profile/ExerciseProgressScreen';
import { GoalsScreen } from './settings/GoalsScreen';
import { CreateTemplateScreen } from './settings/CreateTemplateScreen';
import { WeightScreen } from './dashboard/WeightScreen';
import { AddWeightScreen } from './dashboard/AddWeightScreen';

// ... Localization Config ...

type ScreenName = 'home' | 'workouts' | 'stats' | 'nutrition' | 'profile' | 'details' | 'settings' | 'calendar' | 'login' | 'routine-settings' | 'exercise-library' | 'exercise-progress' | 'goals' | 'create-template' | 'weight' | 'add-weight';

const GlassFitnessApp: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
    const [activeTab, setActiveTab] = useState('home');
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [activeWorkout, setActiveWorkout] = useState<Workout>(workoutsData[0]);

    const { currentUser, setUser, users, userPreferences, loading } = useUser();

    // ... Effects ...

    // Navigation Helper
    const navigation = {
        navigate: (route: string, params?: any) => {
            console.log('Navigating to:', route, params);
            switch (route) {
                case 'Home': setCurrentScreen('home'); break;
                case 'Workouts': setCurrentScreen('workouts'); break;
                case 'Stats': setCurrentScreen('stats'); break;
                case 'Profile': setCurrentScreen('profile'); break;
                case 'Settings': setCurrentScreen('settings'); break;
                case 'Calendar': setCurrentScreen('calendar'); break;
                case 'RoutineSettings': setCurrentScreen('routine-settings'); break;
                case 'ExerciseLibrary': setCurrentScreen('exercise-library'); break;
                case 'ExerciseProgress': setCurrentScreen('exercise-progress'); break;
                case 'Goals': setCurrentScreen('goals'); break;
                case 'CreateTemplate': setCurrentScreen('create-template'); break;
                case 'Weight': setCurrentScreen('weight'); break;
                case 'AddWeight': setCurrentScreen('add-weight'); break;
                // Add fallback or other routes
                default: console.warn('Route not found:', route);
            }
        },
        goBack: () => {
            // Simple back logic: if in a sub-screen, go back to parent context
            // This is naive but works for 1-level depth
            if (['routine-settings', 'exercise-library', 'exercise-progress', 'goals', 'weight', 'add-weight'].includes(currentScreen)) {
                setCurrentScreen('settings');
            } else if (currentScreen === 'create-template') {
                setCurrentScreen('routine-settings');
            } else if (currentScreen === 'calendar' || currentScreen === 'details') {
                setCurrentScreen('home');
            } else {
                setCurrentScreen('home');
            }
        }
    };

    // ... Handlers ...

    // Render current screen based on navigation state
    const renderScreen = () => {
        if (loading) return <View style={{ flex: 1, backgroundColor: colors.slate950 }} />;
        if (!users || users.length === 0) return <OnboardingScreen />;
        if (!currentUser || currentScreen === 'login') return <LoginScreen onEnter={handleEnterApp} />;

        if (currentScreen === 'details') {
            return (
                <DetailsScreen
                    workout={activeWorkout}
                    onBack={() => setCurrentScreen('home')}
                    onStartWorkout={(workout) => {
                        setActiveWorkout(workout);
                        setCurrentScreen('home');
                        setTimeout(() => setShowWorkoutModal(true), 300);
                    }}
                />
            );
        }

        if (currentScreen === 'calendar') {
            return <CalendarScreen onBack={() => setCurrentScreen('home')} onOpenSettings={() => setCurrentScreen('settings')} />;
        }

        // Sub-screens (Full Screen Mode)
        if (currentScreen === 'routine-settings') return <RoutineSettingsScreen navigation={navigation} />;
        if (currentScreen === 'exercise-library') return <ExerciseLibraryScreen navigation={navigation} />;
        if (currentScreen === 'exercise-progress') return <ExerciseProgressScreen navigation={navigation} />;
        if (currentScreen === 'goals') return <GoalsScreen navigation={navigation} />;
        if (currentScreen === 'create-template') return <CreateTemplateScreen navigation={navigation} />;
        if (currentScreen === 'weight') return <WeightScreen navigation={navigation} />;
        if (currentScreen === 'add-weight') return <AddWeightScreen navigation={navigation} />;

        // Tab Screens
        return (
            <>
                {currentScreen === 'home' && (
                    <HomeScreen
                        onWorkoutPress={handleWorkoutClick}
                        onProfilePress={() => handleTabPress('profile')}
                        onCalendarPress={() => setCurrentScreen('calendar')}
                    />
                )}
                {currentScreen === 'workouts' && <WorkoutsScreen onWorkoutPress={handleWorkoutClick} />}
                {currentScreen === 'stats' && <StatsScreen />}
                {currentScreen === 'nutrition' && <NutritionScreen navigation={navigation} />}
                {currentScreen === 'profile' && (
                    <ProfileScreen
                        onSettingsPress={() => setCurrentScreen('settings')}
                        onLogout={handleLogout}
                    />
                )}
                {currentScreen === 'settings' && (
                    <SettingsScreen
                        onBack={() => handleTabPress('profile')}
                        onRoutinePress={() => setCurrentScreen('routine-settings')}
                        onExerciseLibraryPress={() => setCurrentScreen('exercise-library')}
                        onProgressPress={() => setCurrentScreen('exercise-progress')}
                        onProfilePress={() => setCurrentScreen('login')}
                        navigation={navigation} // Pass navigation to Settings too
                    />
                )}

                <BottomNav
                    activeTab={activeTab}
                    onTabPress={handleTabPress}
                    onFabPress={() => setShowWorkoutModal(true)}
                />

                <WorkoutLogModal
                    visible={showWorkoutModal}
                    onClose={() => setShowWorkoutModal(false)}
                    onFinish={handleFinishWorkout}
                />
            </>
        );
    };

    return (
        <View style={styles.mainContainer}>
            {/* Keep existing Return JSX */}
            <RNStatusBar barStyle="light-content" backgroundColor={colors.slate950} />
            <View style={styles.glowContainer} pointerEvents="none">
                {/* Keep Background SVG */}
                <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                        <RadialGradient id="grad1" cx="0%" cy="0%" rx="50%" ry="50%" fx="0%" fy="0%" gradientUnits="userSpaceOnUse">
                            <Stop offset="0%" stopColor="#84cc16" stopOpacity="0.15" />
                            <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
                        </RadialGradient>
                        <RadialGradient id="grad2" cx="100%" cy="100%" rx="50%" ry="50%" fx="100%" fy="100%" gradientUnits="userSpaceOnUse">
                            <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                            <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
                </Svg>
            </View>
            <View style={styles.contentLayer}>
                {renderScreen()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.slate950,
    },
    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: 0,
    },
    contentLayer: {
        flex: 1,
        zIndex: 10,
    },
});

export default GlassFitnessApp;
