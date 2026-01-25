import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { useUser } from '../../context/UserContext';
import { Flame, Clock, TrendingUp, Play, Calendar, CheckCircle2, ArrowRight, Utensils, Activity } from 'lucide-react-native';
import { WorkoutRepository } from '../../services/WorkoutRepository';
import { GoalRepository } from '../../services/GoalRepository';

// ...

const { currentUser } = useUser();
const [stats, setStats] = useState({
    caloriesConsumed: 0,
    calorieGoal: 2000, // Default
    protein: 0,
    carbs: 0,
    minutes: 45,
    weeklyProgress: 0,
    completedWorkouts: 0,
    totalWorkouts: 5,
    lastWorkout: null as any
});
// ...

const loadData = async () => {
    if (!currentUser) return;

    try {
        // 0. Load Goals First
        const userGoals = await GoalRepository.getGoals(currentUser.id);
        const calorieGoal = userGoals?.calorie_goal || 2000;

        // 1. Today's Nutrition
        const today = new Date().toISOString().split('T')[0];
        const meals = await NutritionRepository.getMealsByDate(currentUser.id, today);

        const consumed = meals.reduce((acc: number, m: any) => acc + m.calories, 0);
        const prot = meals.reduce((acc: number, m: any) => acc + m.protein, 0);
        const carb = meals.reduce((acc: number, m: any) => acc + m.carbs, 0);

        // ... (rest of loadData)

        setStats(prev => ({
            ...prev,
            caloriesConsumed: consumed,
            calorieGoal: calorieGoal, // Update goal
            protein: prot,
            carbs: carb,
            lastWorkout: lastWorkout,
            completedWorkouts: streak > 5 ? 5 : streak
        }));
    } catch (e) {
        console.error(e);
    }
};

useFocusEffect(
    useCallback(() => {
        loadData();
    }, [currentUser])
);

// Hardcoded images for routine slide to match theme
const mockImages = [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80',
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80',
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80',
];

// Helper to get image based on workout name
const getWorkoutImage = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('costa') || lower.includes('back')) return 'https://images.unsplash.com/photo-1603287681836-e6c33e21e7d2?q=80';
    if (lower.includes('peito') || lower.includes('chest')) return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80';
    if (lower.includes('perna') || lower.includes('leg')) return 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80';
    if (lower.includes('ombro') || lower.includes('shoulder')) return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80';
    if (lower.includes('braço') || lower.includes('arm')) return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80'; // Reusing for now
    if (lower.includes('cardio') || lower.includes('run')) return 'https://images.unsplash.com/photo-1538805060512-e219615df350?q=80';
    return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80'; // Generic Gym
};

const heroImage = todayTemplate ? getWorkoutImage(todayTemplate.name) : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80'; // Yoga/Chill for rest

return (
    <Screen>
        <AppHeader showNotification={true} />

        <ScrollView contentContainerStyle={styles.scrollContent}>

            {/* Greeting Section */}
            <View style={styles.greetingContainer}>
                <Text style={styles.welcomeText}>Bem-vindo de volta,</Text>
                <View style={styles.nameRow}>
                    <Text style={styles.userName}>{currentUser?.name || 'Atleta'}</Text>
                    <Text style={{ fontSize: 24 }}>👋</Text>
                </View>
            </View>

            {/* Main Stats Grid (Burned & Time) */}
            <View style={styles.grid}>
                <GlowCard
                    title="CALORIAS"
                    value="450" // Placeholder for Burned
                    subtitle="kcal queimadas"
                    icon={Flame}
                    color={COLORS.lime}
                    glowColor="rgba(163, 230, 53, 0.15)"
                    style={{ flex: 1 }}
                />
                <GlowCard
                    title="TEMPO"
                    value={stats.minutes}
                    subtitle="minutos hoje"
                    icon={Clock}
                    color={COLORS.blue}
                    glowColor="rgba(96, 165, 250, 0.15)"
                    style={{ flex: 1 }}
                />
            </View>

            {/* Nutrition Stats Row */}
            <View style={styles.nutritionRow}>
                <MiniStatCard
                    label="Consumidas"
                    value={Math.round(stats.caloriesConsumed)}
                    unit="kcal"
                    color={COLORS.warning}
                    icon={Utensils}
                />
                <MiniStatCard
                    label="Proteínas"
                    value={Math.round(stats.protein)}
                    unit="g"
                    color={COLORS.blue}
                    icon={Activity}
                />
                <MiniStatCard
                    label="Carboidratos"
                    value={Math.round(stats.carbs)}
                    unit="g"
                    color={COLORS.lime}
                    icon={Flame}
                />
            </View>

            {/* Daily Progress Widget */}
            <GlassView style={styles.progressCard} intensity={20}>
                <View style={{ flex: 1 }}>
                    <View style={styles.progressHeader}>
                        <TrendingUp color={COLORS.purple} size={16} />
                        <Text style={styles.progressTitle}>Meta Semanal</Text>
                    </View>
                    <Text style={styles.progressSubtitle}>Você completou {stats.completedWorkouts} de {stats.totalWorkouts} treinos</Text>

                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(stats.completedWorkouts / stats.totalWorkouts) * 100}%` }]} />
                    </View>
                </View>

                <View style={styles.progressCircle}>
                    <Text style={styles.progressPercent}>{Math.round((stats.completedWorkouts / stats.totalWorkouts) * 100)}%</Text>
                </View>
            </GlassView>

            {/* Today's Workout Hero */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Treino de Hoje</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
                    <Text style={styles.seeAll}>Ver calendário</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.heroCard}
                activeOpacity={0.9}
                onPress={() => {
                    if (todayTemplate) {
                        navigation.navigate('WorkoutRunner', {
                            templateId: todayTemplate.id,
                            templateName: todayTemplate.name
                        });
                    } else {
                        navigation.navigate('WorkoutRunner', {}); // Free workout
                    }
                }}
            >
                <ImageBackground
                    source={{ uri: heroImage }}
                    style={styles.heroImage}
                    imageStyle={{ borderRadius: 32 }}
                >
                    <View style={styles.heroOverlay} />

                    <View style={styles.heroContent}>
                        <View style={styles.tagsRow}>
                            {todayTemplate ? (
                                <>
                                    <View style={[styles.tag, { backgroundColor: 'rgba(163, 230, 53, 0.2)', borderColor: 'rgba(163, 230, 53, 0.3)' }]}>
                                        <Text style={[styles.tagText, { color: COLORS.lime }]}>
                                            Agendado para hoje
                                        </Text>
                                    </View>
                                    <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                                        <Text style={[styles.tagText, { color: COLORS.white }]}>
                                            {todayTemplate.exercises?.length || 0} exercícios
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                                    <Text style={[styles.tagText, { color: COLORS.white }]}>Dia Livre ou Descanso</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.heroTitle}>
                            {todayTemplate ? todayTemplate.name : 'Nenhum treino agendado'}
                        </Text>
                        <Text style={styles.heroSubtitle}>
                            {todayTemplate
                                ? (todayTemplate.exercises && todayTemplate.exercises.length > 0
                                    ? todayTemplate.exercises.slice(0, 3).map(e => e.exercise_name).join(', ') + '...'
                                    : 'Toque para começar')
                                : 'Aproveite para descansar ou inicie um treino avulso.'}
                        </Text>

                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => {
                                if (todayTemplate) {
                                    navigation.navigate('WorkoutRunner', {
                                        templateId: todayTemplate.id,
                                        templateName: todayTemplate.name
                                    });
                                } else {
                                    navigation.navigate('WorkoutRunner', {});
                                }
                            }}
                        >
                            <Play fill={COLORS.background} color={COLORS.background} size={18} />
                            <Text style={styles.startButtonText}>{todayTemplate ? 'Iniciar Treino Agora' : 'Treino Livre'}</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </TouchableOpacity>

            {/* Your Routine Slide */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sua Rotina</Text>
                <ArrowRight size={18} color={COLORS.textSecondary} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: SPACING.l, gap: SPACING.m }}>
                {routine.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.routineCard}
                        onPress={() => navigation.navigate('Calendar')} // Or edit routine
                    >
                        <ImageBackground
                            source={{ uri: mockImages[index % mockImages.length] }}
                            style={styles.routineImage}
                            imageStyle={{ borderRadius: RADIUS.m }}
                        >
                            <View style={styles.routineOverlay} />
                        </ImageBackground>

                        <Text style={styles.routineTitle} numberOfLines={1}>{item.workout_focus}</Text>
                        <Text style={styles.routineSubtitle}>
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][item.day_index]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

        </ScrollView>
    </Screen >
);
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: SPACING.m, // Reduced from l
        paddingBottom: 100,
    },
    greetingContainer: {
        marginBottom: SPACING.m, // Reduced
        paddingHorizontal: SPACING.s,
    },
    welcomeText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        fontWeight: '500',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    userName: {
        fontSize: 24, // Reduced from 32
        fontWeight: 'bold',
        color: COLORS.white,
    },
    grid: {
        flexDirection: 'row',
        gap: SPACING.s, // Reduced gap
        marginBottom: SPACING.m,
    },
    glowCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 20, // Slightly reduced
        padding: SPACING.m,
        height: 110, // Reduced from 140
        justifyContent: 'space-between',
        borderWidth: 1,
        overflow: 'hidden',
    },
    glowBlob: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        opacity: 0.6,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    cardValue: {
        fontSize: 24, // Reduced from 28
        fontWeight: 'bold',
        color: COLORS.white,
    },
    cardSubtitle: {
        fontSize: 10,
        color: COLORS.textSecondary,
    },
    // Nutrition Row
    nutritionRow: {
        flexDirection: 'row',
        gap: SPACING.s,
        marginBottom: SPACING.m,
    },
    miniCard: {
        flex: 1,
        padding: 10, // Manual reduction
        borderRadius: RADIUS.m,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    miniIcon: {
        width: 28, // Reduced
        height: 28, // Reduced
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniValue: {
        color: COLORS.white,
        fontSize: 16, // Reduced
        fontWeight: 'bold',
    },
    miniUnit: {
        fontSize: 9,
        color: COLORS.textSecondary,
        marginLeft: 2,
    },
    miniLabel: {
        color: COLORS.textSecondary,
        fontSize: 9,
    },
    // Routine Slide
    routineCard: {
        width: 120, // Reduced
        marginRight: SPACING.s,
    },
    routineImage: {
        width: '100%',
        height: 80, // Reduced
        borderRadius: RADIUS.m,
        marginBottom: SPACING.xs,
        justifyContent: 'flex-end',
        padding: SPACING.s,
    },
    routineOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: RADIUS.m,
    },
    routineTitle: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    routineSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 10,
    },
    // Progress Widget
    progressCard: {
        flexDirection: 'row',
        padding: SPACING.m,
        borderRadius: 20,
        alignItems: 'center',
        gap: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#1e293b',
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    progressTitle: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 14,
    },
    progressSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 10,
        marginBottom: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(51, 65, 85, 1)',
        borderRadius: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.purple,
        borderRadius: 3,
    },
    progressCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 3,
        borderColor: COLORS.cardBorder,
        borderTopColor: COLORS.purple,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressPercent: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 11,
    },
    // Hero Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: SPACING.s,
        paddingHorizontal: SPACING.s,
    },
    sectionTitle: {
        fontSize: 18, // Reduced
        color: COLORS.white,
        fontWeight: 'bold',
    },
    seeAll: {
        color: COLORS.lime,
        fontWeight: '500',
        fontSize: SIZES.small,
    },
    heroCard: {
        height: 220, // Reduced from 280
        borderRadius: 24,
        marginBottom: SPACING.l,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        borderRadius: 24,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 24,
    },
    heroContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        marginBottom: 16,
    },
    startButton: {
        backgroundColor: COLORS.lime,
        paddingVertical: 12,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    startButtonText: {
        color: '#0f172a',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
