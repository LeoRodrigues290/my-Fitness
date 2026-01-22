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

// Calendar Locale Config (PT-BR)
LocaleConfig.locales['pt-br'] = {
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

type ScreenName = 'home' | 'workouts' | 'stats' | 'nutrition' | 'profile' | 'details' | 'settings' | 'calendar' | 'login';

const GlassFitnessApp: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
    const [activeTab, setActiveTab] = useState('home');
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [activeWorkout, setActiveWorkout] = useState<Workout>(workoutsData[0]);

    const { currentUser, setUser, users, userPreferences, loading } = useUser();

    // Update active workout based on day of week and user schedule
    useEffect(() => {
        const todayIndex = new Date().getDay();
        const dayName = DAY_NAMES[todayIndex] as keyof WeekSchedule;
        const scheduledWorkoutId = userPreferences.schedule[dayName];
        const workout = getWorkoutById(scheduledWorkoutId);

        if (workout) {
            setActiveWorkout(workout);
        } else if (scheduledWorkoutId === 'rest') {
            setActiveWorkout(restWorkout);
        }
    }, [userPreferences.schedule]);

    const handleWorkoutClick = (workout: Workout) => {
        if (workout.id === 'rest') return;
        setActiveWorkout(workout);
        setCurrentScreen('details');
    };

    const handleTabPress = (tab: string) => {
        setActiveTab(tab);
        setCurrentScreen(tab as ScreenName);
    };

    const handleLogout = () => {
        if (setUser) {
            setUser(null);
            setCurrentScreen('login');
        }
    };

    const handleEnterApp = () => {
        if (users && users.length > 0 && setUser) {
            setUser(users[0]);
            setCurrentScreen('home');
        }
    };

    const handleFinishWorkout = async (workoutId: string, exercises: any[]) => {
        const template = getWorkoutById(workoutId);
        if (!template) return;

        const session = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            workoutId,
            workoutTitle: template.title,
            duration: parseInt(template.duration) || 60,
            calories: parseInt(template.calories) || 400,
            exercises: exercises.map(e => ({
                id: e.id,
                name: e.name,
                sets: e.actualSets || 3,
                reps: e.actualReps || '12',
                weight: e.weight || 0,
                completed: true
            }))
        };

        // TODO: Implement workout session storage
        setCurrentScreen('home');
    };

    // Render current screen based on navigation state
    const renderScreen = () => {
        // Loading state
        if (loading) {
            return <View style={{ flex: 1, backgroundColor: colors.slate950 }} />;
        }

        // Onboarding for new users
        if (!users || users.length === 0) {
            return <OnboardingScreen />;
        }

        // Login/Welcome screen
        if (!currentUser || currentScreen === 'login') {
            return <LoginScreen onEnter={handleEnterApp} />;
        }

        // Workout details screen (no bottom nav)
        if (currentScreen === 'details') {
            return (
                <DetailsScreen
                    workout={activeWorkout}
                    onBack={() => setCurrentScreen('home')}
                />
            );
        }

        // Settings screen (no bottom nav)
        if (currentScreen === 'settings') {
            return <SettingsScreen onBack={() => handleTabPress('profile')} />;
        }

        // Calendar screen (no bottom nav)
        if (currentScreen === 'calendar') {
            return (
                <CalendarScreen
                    onBack={() => setCurrentScreen('home')}
                    onOpenSettings={() => setCurrentScreen('settings')}
                />
            );
        }

        // Main screens with bottom navigation
        return (
            <>
                {currentScreen === 'home' && (
                    <HomeScreen
                        onWorkoutPress={handleWorkoutClick}
                        onProfilePress={() => handleTabPress('profile')}
                        onCalendarPress={() => setCurrentScreen('calendar')}
                    />
                )}
                {currentScreen === 'workouts' && (
                    <WorkoutsScreen onWorkoutPress={handleWorkoutClick} />
                )}
                {currentScreen === 'stats' && <StatsScreen />}
                {currentScreen === 'nutrition' && <NutritionScreen />}
                {currentScreen === 'profile' && (
                    <ProfileScreen
                        onSettingsPress={() => setCurrentScreen('settings')}
                        onLogout={handleLogout}
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
            <RNStatusBar barStyle="light-content" backgroundColor={colors.slate950} />

            {/* Background Ambient Glows */}
            <View style={styles.glowContainer} pointerEvents="none">
                <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                        <RadialGradient
                            id="grad1"
                            cx="0%"
                            cy="0%"
                            rx="50%"
                            ry="50%"
                            fx="0%"
                            fy="0%"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0%" stopColor="#84cc16" stopOpacity="0.15" />
                            <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
                        </RadialGradient>
                        <RadialGradient
                            id="grad2"
                            cx="100%"
                            cy="100%"
                            rx="50%"
                            ry="50%"
                            fx="100%"
                            fy="100%"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                            <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
                </Svg>
            </View>

            {/* Main Content */}
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
