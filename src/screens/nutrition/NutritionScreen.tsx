import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { Plus } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { NutritionRepository } from '../../services/NutritionRepository';

export const NutritionScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [stats, setStats] = useState({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
    });
    const [meals, setMeals] = useState<any[]>([]);

    // Targets (Hardcoded for now, could be in User profile)
    const targets = {
        calories: 2500,
        protein: 180,
        carbs: 300,
        fats: 80
    };

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            const dailyMeals = await NutritionRepository.getMealsByDate(currentUser.id, today);
            setMeals(dailyMeals);

            const newStats = dailyMeals.reduce((acc: any, meal: any) => ({
                calories: acc.calories + meal.calories,
                protein: acc.protein + meal.protein,
                carbs: acc.carbs + meal.carbs,
                fats: acc.fats + meal.fats
            }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

            setStats(newStats);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [currentUser])
    );

    const renderMeal = ({ item }: any) => (
        <GlassView style={styles.mealCard} intensity={10}>
            <View style={styles.mealHeader}>
                <Text style={styles.mealType}>{item.type}</Text>
                <Text style={styles.mealCalories}>{item.calories} kcal</Text>
            </View>
            <Text style={styles.mealName}>{item.name}</Text>
            <Text style={styles.mealMacros}>P: {item.protein}g • C: {item.carbs}g • F: {item.fats}g</Text>
        </GlassView>
    );

    const ProgressBar = ({ label, current, target, color }: any) => {
        const progress = Math.min(current / target, 1) * 100;
        return (
            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>{label}</Text>
                    <Text style={styles.progressValue}>{Math.round(current)} / {target}g</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
                </View>
            </View>
        )
    };

    return (
        <Screen>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>Nutrição</Text>
                    <Text style={styles.date}>Hoje</Text>
                </View>

                {/* Summary Card */}
                <GlassView style={styles.summaryCard} intensity={20} gradientBorder>
                    <View style={styles.caloriesContainer}>
                        <Text style={styles.caloriesLabel}>Consumo Nutricional</Text>
                        <View style={styles.mainCals}>
                            <Text style={styles.bigNumber}>{Math.round(stats.calories)}</Text>
                            <Text style={styles.targetLabel}> / {targets.calories} kcal</Text>
                        </View>
                    </View>

                    <View style={styles.macrosContainer}>
                        <ProgressBar label="Proteína" current={stats.protein} target={targets.protein} color={COLORS.success} />
                        <ProgressBar label="Carboidratos" current={stats.carbs} target={targets.carbs} color={COLORS.accent} />
                        <ProgressBar label="Gorduras" current={stats.fats} target={targets.fats} color={COLORS.secondary} />
                    </View>
                </GlassView>

                <Text style={styles.sectionTitle}>Refeições</Text>

                <View style={styles.mealsList}>
                    {meals.length > 0 ? meals.map(item => (
                        <View key={item.id} style={{ marginBottom: SPACING.m }}>
                            {renderMeal({ item })}
                        </View>
                    )) : (
                        <Text style={{ color: COLORS.textSecondary, textAlign: 'center' }}>Nenhuma refeição registrada hoje</Text>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddMeal')}
            >
                <Plus color={COLORS.white} size={24} />
            </TouchableOpacity>
        </Screen>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        padding: SPACING.l,
        paddingBottom: SPACING.s,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    screenTitle: {
        fontSize: SIZES.h1,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    date: {
        color: COLORS.textSecondary,
        fontSize: SIZES.h3,
    },
    summaryCard: {
        margin: SPACING.l,
        marginTop: SPACING.s,
        padding: SPACING.l,
        borderRadius: RADIUS.l,
    },
    caloriesContainer: {
        marginBottom: SPACING.l,
        alignItems: 'center',
    },
    caloriesLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    mainCals: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    bigNumber: {
        fontSize: 48,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    targetLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
    },
    macrosContainer: {
        gap: SPACING.m,
    },
    progressContainer: {},
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressLabel: {
        color: COLORS.white,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    progressValue: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.circle,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: RADIUS.circle,
    },
    sectionTitle: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
        marginLeft: SPACING.l,
        marginBottom: SPACING.m,
    },
    mealsList: {
        paddingHorizontal: SPACING.l,
    },
    mealCard: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
    },
    mealHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    mealType: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: SIZES.small,
    },
    mealCalories: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    mealName: {
        color: COLORS.white,
        fontSize: SIZES.body,
        marginBottom: SPACING.xs,
    },
    mealMacros: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: RADIUS.circle,
        backgroundColor: COLORS.success,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
