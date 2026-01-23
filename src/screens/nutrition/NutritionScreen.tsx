import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Droplet, Apple, Utensils, PlusCircle, X, ChevronLeft, Trash2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useUser } from '../../context/UserContext';
import { MealLogRepository, MealEntry, DailyStatsRepository } from '../../services/DailyStatsRepository';
import { searchFood, FoodItem } from '../../data/foodDatabase';

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

    const handleAddMeal = async (food: FoodItem, quantity: number) => {
        if (!currentUser) return;

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
                                <TouchableOpacity onPress={() => handleOpenSearch(section.id)}>
                                    <PlusCircle size={20} color={colors.lime400} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.foodCard}>
                                {sectionMeals.length === 0 ? (
                                    <View style={styles.foodCardContent}>
                                        <Text style={styles.foodPlaceholder}>Adicionar alimento...</Text>
                                        <Text style={styles.foodCalories}>0 / {section.goal} kcal</Text>
                                    </View>
                                ) : (
                                    <View>
                                        {sectionMeals.map(meal => (
                                            <View key={meal.id} style={styles.mealRow}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.mealName}>{meal.name}</Text>
                                                    <Text style={styles.mealDetails}>
                                                        {meal.quantity}{meal.unit} • P: {meal.protein}g
                                                    </Text>
                                                </View>
                                                <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                                                <TouchableOpacity
                                                    onPress={() => handleDeleteMeal(meal.id!)}
                                                    style={styles.deleteBtn}
                                                >
                                                    <Trash2 size={16} color={colors.red500} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        <View style={styles.sectionTotal}>
                                            <Text style={styles.totalText}>Total: {sectionCals} kcal</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Food Search Modal */}
            <FoodSearchModal
                visible={searchModalVisible}
                section={activeSection}
                onClose={() => setSearchModalVisible(false)}
                onAdd={handleAddMeal}
            />
        </View>
    );
};

// Food Search Modal Component
interface FoodSearchModalProps {
    visible: boolean;
    section: string;
    onClose: () => void;
    onAdd: (food: FoodItem, quantity: number) => void;
}

const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ visible, section, onClose, onAdd }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodItem[]>([]);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [quantity, setQuantity] = useState('100');

    useEffect(() => {
        if (query.trim().length > 0) {
            setResults(searchFood(query));
        } else {
            setResults([]);
        }
    }, [query]);

    const handleAdd = () => {
        if (!selectedFood) return;
        const qty = parseFloat(quantity) || 1;
        onAdd(selectedFood, qty);
        resetState();
    };

    const resetState = () => {
        setQuery('');
        setSelectedFood(null);
        setQuantity('100');
    };

    const getCalculatedNutrients = () => {
        if (!selectedFood) return { calories: 0, protein: 0, carbs: 0 };
        const qty = parseFloat(quantity) || 0;
        const multiplier = selectedFood.unit === 'g' || selectedFood.unit === 'ml'
            ? qty / selectedFood.portion
            : qty;
        return {
            calories: Math.round(selectedFood.calories * multiplier),
            protein: Math.round(selectedFood.protein * multiplier),
            carbs: Math.round(selectedFood.carbs * multiplier),
        };
    };

    const nutrients = getCalculatedNutrients();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
            >
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => { Keyboard.dismiss(); }}
                />
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Adicionar ao {section}</Text>
                        <TouchableOpacity onPress={() => { Keyboard.dismiss(); onClose(); resetState(); }}>
                            <X size={24} color={colors.slate400} />
                        </TouchableOpacity>
                    </View>

                    {!selectedFood ? (
                        <>
                            <View style={styles.searchInput}>
                                <TextInput
                                    placeholder="Buscar alimento (ex: frango, arroz)..."
                                    placeholderTextColor={colors.slate500}
                                    style={styles.searchText}
                                    value={query}
                                    onChangeText={setQuery}
                                    autoFocus
                                    returnKeyType="search"
                                />
                            </View>

                            <ScrollView style={styles.resultsList} keyboardShouldPersistTaps="handled">
                                {results.map(food => (
                                    <TouchableOpacity
                                        key={food.id}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            setSelectedFood(food);
                                            setQuantity(food.unit === 'g' || food.unit === 'ml' ? '100' : '1');
                                        }}
                                        style={styles.resultItem}
                                    >
                                        <Text style={styles.resultName}>{food.name}</Text>
                                        <Text style={styles.resultDetails}>
                                            {food.calories}kcal / {food.portion}{food.unit} • P: {food.protein}g
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {results.length === 0 && query.length > 0 && (
                                    <Text style={styles.noResults}>Nenhum alimento encontrado.</Text>
                                )}
                            </ScrollView>
                        </>
                    ) : (
                        <ScrollView keyboardShouldPersistTaps="handled">
                            <View style={styles.selectedHeader}>
                                <TouchableOpacity onPress={() => setSelectedFood(null)}>
                                    <ChevronLeft size={24} color={colors.white} />
                                </TouchableOpacity>
                                <Text style={styles.selectedName}>{selectedFood.name}</Text>
                            </View>

                            <Text style={styles.quantityLabel}>Quantidade ({selectedFood.unit})</Text>
                            <TextInput
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                                style={styles.quantityInput}
                                onSubmitEditing={() => Keyboard.dismiss()}
                            />

                            <View style={styles.nutrientsRow}>
                                <View style={styles.nutrientItem}>
                                    <Text style={[styles.nutrientValue, { color: colors.orange400 }]}>{nutrients.calories}</Text>
                                    <Text style={styles.nutrientLabel}>Kcal</Text>
                                </View>
                                <View style={styles.nutrientItem}>
                                    <Text style={[styles.nutrientValue, { color: colors.red500 }]}>{nutrients.protein}</Text>
                                    <Text style={styles.nutrientLabel}>Prot</Text>
                                </View>
                                <View style={styles.nutrientItem}>
                                    <Text style={[styles.nutrientValue, { color: colors.lime400 }]}>{nutrients.carbs}</Text>
                                    <Text style={styles.nutrientLabel}>Carb</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => { Keyboard.dismiss(); handleAdd(); }} style={styles.addButton}>
                                <Text style={styles.addButtonText}>Adicionar Alimento</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 24 },
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
    foodCard: { backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.slate700 },
    foodCardContent: { flexDirection: 'row', justifyContent: 'space-between' },
    foodPlaceholder: { color: colors.slate300, fontSize: 14 },
    foodCalories: { color: colors.slate500, fontSize: 14 },

    // Meal rows
    mealRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    mealName: { color: colors.white, fontWeight: '600' },
    mealDetails: { color: colors.slate400, fontSize: 12 },
    mealCalories: { color: colors.slate300, marginRight: 12 },
    deleteBtn: { padding: 4 },
    sectionTotal: { marginTop: 12, alignItems: 'flex-end' },
    totalText: { color: colors.lime400, fontWeight: 'bold' },

    // Modal
    modalContainer: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: { backgroundColor: colors.slate950, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
    searchInput: { backgroundColor: colors.slate900, borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.slate800 },
    searchText: { color: colors.white, fontSize: 16 },
    resultsList: { flex: 1 },
    resultItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.slate800 },
    resultName: { color: colors.white, fontWeight: 'bold' },
    resultDetails: { color: colors.slate400, fontSize: 12 },
    noResults: { color: colors.slate500, textAlign: 'center', marginTop: 20 },

    // Selected food
    selectedHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
    selectedName: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
    quantityLabel: { color: colors.slate400, marginBottom: 8 },
    quantityInput: { backgroundColor: colors.slate800, color: colors.white, padding: 16, borderRadius: 12, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
    nutrientsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32 },
    nutrientItem: { alignItems: 'center' },
    nutrientValue: { fontSize: 20, fontWeight: 'bold' },
    nutrientLabel: { color: colors.slate500, fontSize: 10 },
    addButton: { backgroundColor: colors.lime400, padding: 16, borderRadius: 16, alignItems: 'center' },
    addButtonText: { color: colors.slate900, fontWeight: 'bold', fontSize: 16 },
});
