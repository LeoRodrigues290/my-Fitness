import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { AppHeader } from '../../components/ui/AppHeader';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { Plus, ChevronRight, Droplet, Flame, Utensils, Trash2 } from 'lucide-react-native';
import { NutritionRepository } from '../../services/NutritionRepository';
import { useUser } from '../../context/UserContext';
import { FoodSearchModal } from '../../components/nutrition/FoodSearchModal';
import { FoodItem } from '../../data/foodDatabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealSectionProps {
    title: string;
    calories: number;
    items: any[];
    onAdd: () => void;
    onDelete: (item: any) => void;
}

const MealSection = ({ title, calories, items, onAdd, onDelete }: MealSectionProps) => (
    <View style={styles.mealSection}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionCalories}>{calories} kcal</Text>
        </View>

        {items.map((item, index) => (
            <GlassView key={index} style={styles.foodItem} intensity={10}>
                <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodServing}>{item.quantity}{item.unit || 'g'}</Text>
                </View>
                <View style={styles.foodStats}>
                    <Text style={styles.foodCal}>{item.calories} kcal</Text>
                    <TouchableOpacity onPress={() => onDelete(item)} style={{ padding: 4 }}>
                        <Trash2 size={16} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
            </GlassView>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
            <Plus size={20} color={COLORS.primary} />
            <Text style={styles.addText}>Adicionar Alimento</Text>
        </TouchableOpacity>
    </View>
);

export const NutritionScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [today] = useState(new Date().toISOString().split('T')[0]);
    const [meals, setMeals] = useState<any[]>([]);
    const [waterIntake, setWaterIntake] = useState(0);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    const loadData = async () => {
        if (!currentUser) return;
        const todayMeals = await NutritionRepository.getMealsByDate(currentUser.id, today);
        setMeals(todayMeals);
        // Water would be loaded here if we had a water table, for now mock or local state
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [currentUser, today])
    );

    const openSearch = (section: string) => {
        setActiveSection(section);
        setSearchModalVisible(true);
    };

    const handleAddMeals = async (items: Array<{ food: FoodItem, quantity: number }>) => {
        if (!currentUser) return;

        for (const item of items) {
            // Multiplier logic depends on unit. If 'g' or 'ml', quantity is absolute value (e.g. 150g)
            // Database food.portion is usually 100g.
            // If unit is 'unidade', quantity is count (e.g. 2 bananas)

            let protein = 0;
            let carbs = 0;
            let fats = 0;
            let calories = 0;

            if (item.food.unit === 'g' || item.food.unit === 'ml') {
                const ratio = item.quantity / item.food.portion;
                calories = Math.round(item.food.calories * ratio);
                protein = Math.round(item.food.protein * ratio);
                carbs = Math.round(item.food.carbs * ratio);
                fats = Math.round(item.food.fats * ratio);
            } else {
                calories = Math.round(item.food.calories * item.quantity);
                protein = Math.round(item.food.protein * item.quantity);
                carbs = Math.round(item.food.carbs * item.quantity);
                fats = Math.round(item.food.fats * item.quantity);
            }

            await NutritionRepository.addMeal(
                currentUser.id,
                today,
                activeSection,
                item.food.name,
                calories,
                protein,
                carbs,
                fats,
                item.quantity,
                item.food.unit
            );
        }

        await loadData();
        setSearchModalVisible(false);
    };

    const handleDeleteMeal = async (item: any) => {
        if (!currentUser) return;
        Alert.alert(
            "Remover Item",
            `Deseja remover ${item.name}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Remover",
                    style: "destructive",
                    onPress: async () => {
                        await NutritionRepository.deleteMeal(item.id);
                        loadData();
                    }
                }
            ]
        );
    };

    // Calculate Totals
    const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
    const totalProtein = meals.reduce((acc, m) => acc + m.protein, 0);
    const totalCarbs = meals.reduce((acc, m) => acc + m.carbs, 0);
    const totalFats = meals.reduce((acc, m) => acc + m.fats, 0);

    // Section Filters
    const breakfast = meals.filter(m => m.section === 'Café da Manhã');
    const lunch = meals.filter(m => m.section === 'Almoço');
    const dinner = meals.filter(m => m.section === 'Jantar');
    const snacks = meals.filter(m => m.section === 'Snack');

    return (
        <Screen>
            <AppHeader title="Nutrição Diária" showNotification={false} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Macro Summary */}
                <GlassView style={styles.macroCard} intensity={20}>
                    <View style={styles.macroRow}>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroValue}>{totalCalories}</Text>
                            <Text style={styles.macroLabel}>Kcal</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.macroItem}>
                            <Text style={[styles.macroValue, { color: COLORS.blue }]}>{totalProtein}g</Text>
                            <Text style={styles.macroLabel}>Prot</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={[styles.macroValue, { color: COLORS.lime }]}>{totalCarbs}g</Text>
                            <Text style={styles.macroLabel}>Carb</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={[styles.macroValue, { color: COLORS.warning }]}>{totalFats}g</Text>
                            <Text style={styles.macroLabel}>Gord</Text>
                        </View>
                    </View>
                </GlassView>

                {/* Meals */}
                <MealSection
                    title="Café da Manhã"
                    calories={breakfast.reduce((a, b) => a + b.calories, 0)}
                    items={breakfast}
                    onAdd={() => openSearch('Café da Manhã')}
                    onDelete={handleDeleteMeal}
                />
                <MealSection
                    title="Almoço"
                    calories={lunch.reduce((a, b) => a + b.calories, 0)}
                    items={lunch}
                    onAdd={() => openSearch('Almoço')}
                    onDelete={handleDeleteMeal}
                />
                <MealSection
                    title="Snack"
                    calories={snacks.reduce((a, b) => a + b.calories, 0)}
                    items={snacks}
                    onAdd={() => openSearch('Snack')}
                    onDelete={handleDeleteMeal}
                />
                <MealSection
                    title="Jantar"
                    calories={dinner.reduce((a, b) => a + b.calories, 0)}
                    items={dinner}
                    onAdd={() => openSearch('Jantar')}
                    onDelete={handleDeleteMeal}
                />

            </ScrollView>

            <FoodSearchModal
                visible={searchModalVisible}
                section={activeSection}
                onClose={() => setSearchModalVisible(false)}
                onAddMeals={handleAddMeals}
            />
        </Screen>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: SPACING.m,
        paddingBottom: 100,
    },
    macroCard: {
        padding: SPACING.l,
        borderRadius: RADIUS.l,
        marginBottom: SPACING.l,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    macroItem: {
        alignItems: 'center',
        flex: 1,
    },
    macroValue: {
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    macroLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginTop: 4,
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
    },
    mealSection: {
        marginBottom: SPACING.l,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
        paddingHorizontal: SPACING.xs,
    },
    sectionTitle: {
        color: COLORS.lime,
        fontSize: SIZES.body,
        fontWeight: 'bold',
    },
    sectionCalories: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    foodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.s,
        backgroundColor: COLORS.surface,
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '500',
    },
    foodServing: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    foodStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    foodCal: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.m,
        borderStyle: 'dashed',
        gap: SPACING.s,
        marginTop: SPACING.xs,
    },
    addText: {
        color: COLORS.primary,
        fontWeight: '600',
    }
});
