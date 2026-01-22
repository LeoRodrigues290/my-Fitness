import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { useUser } from '../../context/UserContext';
import { Flame, Clock, TrendingUp, Play, Calendar, CheckCircle2, ArrowRight, Utensils, Activity } from 'lucide-react-native';
import { WorkoutRepository } from '../../services/WorkoutRepository';
import { NutritionRepository } from '../../services/NutritionRepository';
import { UserRepository } from '../../services/UserRepository';
import { RoutineRepository } from '../../services/RoutineRepository';
import { WorkoutTemplateRepository, TemplateWithExercises } from '../../services/WorkoutTemplateRepository';
import { format } from 'date-fns';
import { AppHeader } from '../../components/ui/AppHeader';

const { width } = Dimensions.get('window');

// Reusable Glow Card Component
const GlowCard = ({ title, value, subtitle, icon: Icon, color, glowColor, style }: any) => (
    <View style={[styles.glowCard, style, { borderColor: 'rgba(255,255,255,0.05)' }]}>
        {/* Glow Effect */}
        <View style={[styles.glowBlob, { backgroundColor: glowColor }]} />

        <View style={styles.cardHeader}>
            <Icon color={color} size={18} />
            <Text style={[styles.cardLabel, { color: color }]}>{title}</Text>
        </View>

        <View>
            <Text style={styles.cardValue}>{value}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
    </View>
);

const MiniStatCard = ({ label, value, unit, color, icon: Icon }: any) => (
    <GlassView style={styles.miniCard} intensity={10}>
        <View style={[styles.miniIcon, { backgroundColor: `${color}20` }]}>
            <Icon size={14} color={color} />
        </View>
        <View>
            <Text style={styles.miniValue}>{value}<Text style={styles.miniUnit}>{unit}</Text></Text>
            <Text style={styles.miniLabel}>{label}</Text>
        </View>
    </GlassView>
);

export const DashboardScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [stats, setStats] = useState({
        caloriesConsumed: 0,
        protein: 0,
        carbs: 0,
        minutes: 45, // Mocked
        weeklyProgress: 0, // Calculated
        completedWorkouts: 0,
        totalWorkouts: 5,
        lastWorkout: null as any
    });
    const [routine, setRoutine] = useState<any[]>([]);
    const [todayTemplate, setTodayTemplate] = useState<TemplateWithExercises | null>(null);

    const loadData = async () => {
        if (!currentUser) return;

        try {
            // 1. Today's Nutrition
            const today = new Date().toISOString().split('T')[0];
            const meals = await NutritionRepository.getMealsByDate(currentUser.id, today);

            const consumed = meals.reduce((acc: number, m: any) => acc + m.calories, 0);
            const prot = meals.reduce((acc: number, m: any) => acc + m.protein, 0);
            const carb = meals.reduce((acc: number, m: any) => acc + m.carbs, 0);

            // 2. Last Workout
            const lastWorkout = await WorkoutRepository.getLastWorkout(currentUser.id);

            // 3. Routine (legacy support)
            await RoutineRepository.initDefaultRoutine(currentUser.id);
            const weeklyRoutine = await RoutineRepository.getWeeklyRoutine(currentUser.id);
            setRoutine(weeklyRoutine);

            // 4. Today's Template (new 2.0 system)
            const todayDayIndex = new Date().getDay();
            const template = await WorkoutTemplateRepository.getTemplateByDay(currentUser.id, todayDayIndex);
            setTodayTemplate(template);

            // 5. Streak/Workouts (Simplified logic for now)
            const streak = await UserRepository.getUserStreak(currentUser.id);

            setStats(prev => ({
                ...prev,
                caloriesConsumed: consumed,
                protein: prot,
                carbs: carb,
                lastWorkout: lastWorkout,
                completedWorkouts: streak > 5 ? 5 : streak // approximation
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
                            navigation.navigate('WorkoutRunner', {});
                        }
                    }}
                >
                    <ImageBackground
                        source={{ uri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop' }}
                        style={styles.heroImage}
                        imageStyle={{ borderRadius: 32 }}
                    >
                        <View style={styles.heroOverlay} />

                        <View style={styles.heroContent}>
                            <View style={styles.tagsRow}>
                                <View style={[styles.tag, { backgroundColor: 'rgba(163, 230, 53, 0.2)', borderColor: 'rgba(163, 230, 53, 0.3)' }]}>
                                    <Text style={[styles.tagText, { color: COLORS.lime }]}>
                                        {todayTemplate ? `${todayTemplate.exercises.length} exercícios` : 'Treino Livre'}
                                    </Text>
                                </View>
                                {todayTemplate && (
                                    <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                                        <Text style={[styles.tagText, { color: COLORS.white }]}>Template</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.heroTitle}>
                                {todayTemplate ? todayTemplate.name : 'Treino Livre'}
                            </Text>
                            <Text style={styles.heroSubtitle}>
                                {todayTemplate
                                    ? todayTemplate.exercises.slice(0, 3).map(e => e.exercise_name).join(', ')
                                    : 'Comece um treino personalizado'}
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
                                <Text style={styles.startButtonText}>Começar Treino</Text>
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
        padding: SPACING.l,
        paddingBottom: 120, // Space for bottom nav
    },
    greetingContainer: {
        marginBottom: SPACING.l,
    },
    welcomeText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        fontWeight: '500',
        marginBottom: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    userName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: -1,
    },
    grid: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.l,
    },
    glowCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
        borderRadius: 24,
        padding: SPACING.m,
        height: 140,
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
        gap: 8,
    },
    cardLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    cardValue: {
        fontSize: 28,
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
        gap: SPACING.m,
        marginBottom: SPACING.l,
    },
    miniCard: {
        flex: 1,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    miniIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniValue: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    miniUnit: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginLeft: 2,
    },
    miniLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
    },
    // Routine Slide
    routineCard: {
        width: 140,
        marginRight: SPACING.s,
    },
    routineImage: {
        width: '100%',
        height: 100,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.s,
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
        fontSize: SIZES.body,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    routineSubtitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    // Progress Widget
    progressCard: {
        flexDirection: 'row',
        padding: SPACING.l,
        borderRadius: 24,
        alignItems: 'center',
        gap: SPACING.m,
        marginBottom: SPACING.l,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)', // Approximate with solid color if gradient not supported on View
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    progressTitle: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: SIZES.body,
    },
    progressSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 10,
        marginBottom: SPACING.m,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(51, 65, 85, 1)', // slate-700
        borderRadius: 3,
        width: 120,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.purple,
        borderRadius: 3,
        shadowColor: COLORS.purple,
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    progressCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: COLORS.cardBorder,
        borderTopColor: COLORS.purple,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressPercent: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Hero Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    seeAll: {
        color: COLORS.lime,
        fontWeight: '500',
        fontSize: SIZES.small,
    },
    heroCard: {
        height: 280,
        borderRadius: 32,
        marginBottom: SPACING.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)', // gradient approximation
        borderRadius: 32,
    },
    heroContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.l,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: SPACING.m,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
        borderWidth: 1,
        backdropFilter: 'blur(10px)', // web only, implies glass effect
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: SIZES.body,
        marginBottom: SPACING.l,
    },
    startButton: {
        backgroundColor: COLORS.lime,
        paddingVertical: 14,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    startButtonText: {
        color: '#0f172a', // slate-900
        fontWeight: 'bold',
        fontSize: SIZES.body,
    }
});
