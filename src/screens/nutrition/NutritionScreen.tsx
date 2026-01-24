import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Droplet, Apple, Utensils, PlusCircle, Trash2, ChevronRight } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useUser } from '../../context/UserContext';
import { MealLogRepository, MealEntry, DailyStatsRepository } from '../../services/DailyStatsRepository';
import { FoodItem } from '../../data/foodDatabase';
import { FoodSearchModal } from '../../components/nutrition/FoodSearchModal'; // Import new modal

const SECTIONS = [
    { id: 'Café da Manhã', icon: Apple, color: colors.orange400, goal: 450 },
    { id: 'Almoço', icon: Utensils, color: colors.lime400, goal: 600 },
    { id: 'Lanche', icon: Apple, color: colors.lime400, goal: 200 },
    { id: 'Jantar', icon: Utensils, color: colors.blue400, goal: 450 },
];

export const NutritionScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { currentUser, userPreferences } = useUser();

    const [meals, setMeals] = useState<MealEntry[]>([]);
    const [waterConsumed, setWaterConsumed] = useState(0);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [activeSection, setActiveSection] = useState('');

    const today = new Date().toISOString().split('T')[0];

    // Load data on mount
    useEffect(() => {
        loadData();
    }, [currentUser]);

    const loadData = async () => {
        if (!currentUser) return;

        // Load meals for today
        const todayMeals = await MealLogRepository.getMealsForDate(currentUser.id, today);
        setMeals(todayMeals);

        // Load water consumption
        const stats = await DailyStatsRepository.getStatsForDate(currentUser.id, today);
        setWaterConsumed(stats?.water_consumed || 0);
    };

    const addWater = async (amount: number) => {
        if (!currentUser) return;
        await DailyStatsRepository.addWater(currentUser.id, amount);
        setWaterConsumed(prev => prev + amount);
    };

    const handleOpenSearch = (section: string) => {
        setActiveSection(section);
        setSearchModalVisible(true);
    };

    // Modified to accept an array of items (Bulk Add)
    const handleAddMeals = async (items: Array<{ food: FoodItem, quantity: number }>) => {
        if (!currentUser) return;

        for (const item of items) {
            const { food, quantity } = item;
            const multiplier = food.unit === 'g' || food.unit === 'ml'
                ? quantity / food.portion
                : quantity;

            const meal: Omit<MealEntry, 'id'> = {
                user_id: currentUser.id,
                date: today,
                section: activeSection,
                name: food.name,
                calories: Math.round(food.calories * multiplier),
                protein: Math.round(food.protein * multiplier),
                carbs: Math.round(food.carbs * multiplier),
                fats: Math.round(food.fats * multiplier),
                quantity,
                unit: food.unit
            };

            await MealLogRepository.addMeal(meal);
        }

        await loadData(); // Refresh
        setSearchModalVisible(false);
    };

    const handleDeleteMeal = async (mealId: number) => {
        if (!currentUser) return;
        await MealLogRepository.deleteMeal(mealId, currentUser.id, today);
        await loadData();
    };

    const waterGoal = userPreferences.goals.water;
    const waterProgress = Math.min((waterConsumed / waterGoal) * 100, 100);

    const getMealsForSection = (section: string) => meals.filter(m => m.section === section);
    const getSectionCalories = (section: string) => getMealsForSection(section).reduce((sum, m) => sum + m.calories, 0);

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.title}>Dieta & Hidratação</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Water Tracker Card */}
                <View style={styles.waterCard}>
                    <View style={styles.waterHeader}>
                        <View style={styles.waterTitle}>
                            <Droplet size={24} color={colors.blue400} fill={colors.blue400} />
                            <Text style={styles.waterTitleText}>Hidratação</Text>
                        </View>
                        <Text style={styles.waterValue}>
                            {waterConsumed}{' '}
                            <Text style={styles.waterGoal}>/ {waterGoal} ml</Text>
                        </Text>
                    </View>

                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${waterProgress}%` }]} />
                    </View>

                    <View style={styles.waterActions}>
                        <TouchableOpacity onPress={() => addWater(250)} style={styles.waterButton}>
                            <Plus size={16} color={colors.blue400} />
                            <Text style={styles.waterButtonText}>250ml</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => addWater(500)} style={styles.waterButton}>
                            <Plus size={16} color={colors.blue400} />
                            <Text style={styles.waterButtonText}>500ml</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Food Sections */}
                {SECTIONS.map(section => {
                    const sectionMeals = getMealsForSection(section.id);
                    const sectionCals = getSectionCalories(section.id);
                    const IconComponent = section.icon;

                    return (
                        <View key={section.id} style={styles.foodSection}>
                            <View style={styles.foodHeader}>
                                <View style={styles.foodTitle}>
                                    <IconComponent size={18} color={section.color} />
                                    <Text style={styles.foodTitleText}>{section.id}</Text>
                                </View>
                                {sectionMeals.length > 0 && (
                                    <Text style={styles.sectionSummary}>{sectionCals} kcal</Text>
                                )}
                            </View>

                            <View style={styles.foodCard}>
                                {sectionMeals.length === 0 ? (
                                    <TouchableOpacity onPress={() => handleOpenSearch(section.id)} style={styles.emptyState}>
                                        <Text style={styles.foodPlaceholder}>Adicionar alimento...</Text>
                                        <PlusCircle size={20} color={colors.lime400} />
                                    </TouchableOpacity>
                                ) : (
                                    <View>
                                        {sectionMeals.map(meal => (
                                            <View key={meal.id} style={styles.mealRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.mealName}>{meal.name}</Text>
                                                    <Text style={styles.mealDetails}>
                                                        {meal.quantity}{meal.unit} • P: {meal.protein}g • C: {meal.carbs}g
                                                    </Text>
                                                </View>
                                                <View style={styles.mealRight}>
                                                    <Text style={styles.mealCalories}>{meal.calories}</Text>
                                                    <TouchableOpacity
                                                        onPress={() => handleDeleteMeal(meal.id!)}
                                                        style={styles.deleteBtn}
                                                    >
                                                        <Trash2 size={16} color={colors.red500} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))}
                                        <TouchableOpacity
                                            style={styles.addMoreBtn}
                                            onPress={() => handleOpenSearch(section.id)}
                                        >
                                            <Plus size={16} color={colors.lime400} />
                                            <Text style={styles.addMoreText}>Adicionar mais</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* New Food Search Modal */}
            <FoodSearchModal
                visible={searchModalVisible}
                section={activeSection}
                onClose={() => setSearchModalVisible(false)}
                onAddMeals={handleAddMeals} // Now accepts array
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 24, backgroundColor: colors.slate950 }, // Added bg color
    title: { fontSize: 28, fontWeight: 'bold', color: colors.white, marginBottom: 20 },
    scrollContent: { paddingBottom: 100 },

    // Water Card
    waterCard: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', borderRadius: 24, padding: 20, marginBottom: 32 },
    waterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    waterTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    waterTitleText: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
    waterValue: { color: colors.blue400, fontWeight: 'bold', fontSize: 18 },
    waterGoal: { color: colors.slate400, fontSize: 14 },
    progressBar: { height: 12, backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 6, marginBottom: 20, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.blue400, borderRadius: 6 },
    waterActions: { flexDirection: 'row', gap: 12 },
    waterButton: { flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingVertical: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
    waterButtonText: { color: colors.blue400, fontWeight: 'bold' },

    // Food Sections
    foodSection: { marginBottom: 24 },
    foodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    foodTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    foodTitleText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
    sectionSummary: { color: colors.slate400, fontSize: 12 },

    foodCard: { backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: colors.slate700 }, // Reduced padding

    emptyState: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    foodPlaceholder: { color: colors.slate400, fontSize: 14 },

    // Meal rows
    mealRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    mealName: { color: colors.white, fontWeight: '600', fontSize: 14 },
    mealDetails: { color: colors.slate400, fontSize: 12 },
    mealRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    mealCalories: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
    deleteBtn: { padding: 4 },

    addMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 },
    addMoreText: { color: colors.lime400, fontSize: 12, fontWeight: 'bold' },
});
