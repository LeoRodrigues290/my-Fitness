import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Alert
} from 'react-native';
import { X, Search, Plus, Trash2, Check, Save, UtensilsCrossed, ChevronRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, SPACING, SIZES } from '../../constants/theme';
import { searchFood, FoodItem } from '../../data/foodDatabase';
import { NutritionRepository, FoodCombo } from '../../services/NutritionRepository';
import { useUser } from '../../context/UserContext';

interface FoodSearchModalProps {
    visible: boolean;
    section: string;
    onClose: () => void;
    onAddMeals: (items: Array<{ food: FoodItem, quantity: number }>) => void;
}

interface CartItem {
    id: string; // unique temp id
    food: FoodItem;
    quantity: number;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ visible, section, onClose, onAddMeals }) => {
    const { currentUser } = useUser();
    const [activeTab, setActiveTab] = useState<'search' | 'combos'>('search');

    // Search State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    // Combos State
    const [combos, setCombos] = useState<FoodCombo[]>([]);
    const [isNamingCombo, setIsNamingCombo] = useState(false);
    const [comboName, setComboName] = useState('');

    // Selection State
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [tempQuantity, setTempQuantity] = useState('');

    useEffect(() => {
        if (query.trim().length > 0) {
            setResults(searchFood(query));
        } else {
            setResults([]);
        }
    }, [query]);

    useEffect(() => {
        if (visible) {
            resetState();
            if (currentUser) loadCombos();
        }
    }, [visible, currentUser]);

    const resetState = () => {
        setQuery('');
        setCart([]);
        setResults([]);
        setSelectedFood(null);
        setActiveTab('search');
        setIsNamingCombo(false);
        setComboName('');
    };

    const loadCombos = async () => {
        if (!currentUser) return;
        const userCombos = await NutritionRepository.getCombos(currentUser.id);
        setCombos(userCombos);
    };

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFood(food);
        setTempQuantity(food.unit === 'g' || food.unit === 'ml' ? '100' : '1');
    };

    const handleAddToCart = () => {
        if (!selectedFood) return;
        const qty = parseFloat(tempQuantity) || 0;

        if (qty > 0) {
            const newItem: CartItem = {
                id: Math.random().toString(36).substr(2, 9),
                food: selectedFood,
                quantity: qty
            };
            setCart([...cart, newItem]);
            setSelectedFood(null);
            setQuery('');
            Keyboard.dismiss();
        }
    };

    const handleRemoveFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const handleConfirmAll = () => {
        if (cart.length === 0) return;
        onAddMeals(cart.map(item => ({ food: item.food, quantity: item.quantity })));
        onClose();
    };

    // --- COMBO LOGIC ---

    const handleSaveCombo = async () => {
        if (!comboName.trim() || !currentUser) return;

        await NutritionRepository.createCombo(
            currentUser.id,
            comboName,
            cart.map(i => ({
                name: i.food.name,
                calories: i.food.calories,
                protein: i.food.protein,
                carbs: i.food.carbs,
                fats: i.food.fats,
                unit: i.food.unit,
                portion: i.food.portion,
                quantity: i.quantity
            }))
        );

        setIsNamingCombo(false);
        setComboName('');
        Alert.alert('Sucesso', 'Prato salvo com sucesso!');
        loadCombos();
        setActiveTab('combos');
        setCart([]); // Clear cart after saving? Maybe keep it. Let's clear to avoid confusion.
    };

    const handleUseCombo = (combo: FoodCombo) => {
        if (!combo.items) return;

        // Convert combo items back to CartItems
        // We need to reconstruct "FoodItem" from the stored data as best as we can
        // Note: ID will be lost, but that's fine for simple display
        const newCartItems: CartItem[] = combo.items.map(item => ({
            id: Math.random().toString(36).substr(2, 9),
            quantity: item.quantity,
            food: {
                id: 'combo-' + Math.random(),
                name: item.name,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fats: item.fats,
                unit: item.unit as any,
                portion: item.portion
            }
        }));

        setCart([...cart, ...newCartItems]);
        setActiveTab('search'); // Go back to cart view
    };

    const handleDeleteCombo = async (id: number) => {
        await NutritionRepository.deleteCombo(id);
        loadCombos();
    }


    // --- RENDERS ---

    const totalCalories = cart.reduce((sum, item) => {
        const multiplier = item.food.unit === 'g' || item.food.unit === 'ml'
            ? item.quantity / item.food.portion
            : item.quantity;
        return sum + Math.round(item.food.calories * multiplier);
    }, 0);

    const renderQuantitySelector = () => {
        if (!selectedFood) return null;

        const multiplier = selectedFood.unit === 'g' || selectedFood.unit === 'ml'
            ? (parseFloat(tempQuantity) || 0) / selectedFood.portion
            : (parseFloat(tempQuantity) || 0);

        const previewCals = Math.round(selectedFood.calories * multiplier);
        const previewProt = Math.round(selectedFood.protein * multiplier);

        return (
            <View style={styles.qtyOverlay}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.qtyContainer}>
                    <View style={styles.qtyCard}>
                        <View style={styles.qtyHeader}>
                            <Text style={styles.qtyTitle}>{selectedFood.name}</Text>
                            <TouchableOpacity onPress={() => setSelectedFood(null)}>
                                <X size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.qtyInput}
                                value={tempQuantity}
                                onChangeText={setTempQuantity}
                                keyboardType="numeric"
                                autoFocus
                                selectTextOnFocus
                            />
                            <Text style={styles.qtyUnit}>{selectedFood.unit}</Text>
                        </View>

                        <View style={styles.previewStats}>
                            <Text style={styles.previewText}>{previewCals} kcal</Text>
                            <Text style={styles.previewText}>•</Text>
                            <Text style={styles.previewText}>{previewProt}g prot</Text>
                        </View>

                        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                            <Text style={styles.addToCartText}>Adicionar à Lista</Text>
                            <Plus size={20} color={COLORS.black} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Adicionar ao {section}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
                            onPress={() => setActiveTab('search')}
                        >
                            <Search size={16} color={activeTab === 'search' ? COLORS.black : COLORS.textSecondary} />
                            <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>Busca</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'combos' && activeTab === 'combos' && styles.activeTab]}
                            onPress={() => setActiveTab('combos')}
                        >
                            <UtensilsCrossed size={16} color={activeTab === 'combos' ? COLORS.black : COLORS.textSecondary} />
                            <Text style={[styles.tabText, activeTab === 'combos' && styles.activeTabText]}>Meus Pratos</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'search' && (
                        <View style={styles.searchBar}>
                            <Search size={20} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Buscar alimento..."
                                placeholderTextColor={COLORS.textSecondary}
                                value={query}
                                onChangeText={setQuery}
                            />
                            {query.length > 0 && (
                                <TouchableOpacity onPress={() => setQuery('')}>
                                    <X size={16} color={COLORS.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.content}>

                    {activeTab === 'search' ? (
                        <>
                            {/* Cart Preview */}
                            {cart.length > 0 && !query && (
                                <View style={styles.cartSection}>
                                    <View style={styles.cartHeader}>
                                        <Text style={styles.cartTitle}>Selecionados ({cart.length})</Text>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            {/* Save Combo Button */}
                                            <TouchableOpacity onPress={() => setIsNamingCombo(true)}>
                                                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Salvar Prato</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.cartTotal}>{totalCalories} kcal</Text>
                                        </View>
                                    </View>

                                    {isNamingCombo && (
                                        <View style={styles.namingContainer}>
                                            <TextInput
                                                style={styles.namingInput}
                                                placeholder="Nome do Prato (ex: Almoço Top)"
                                                placeholderTextColor={COLORS.textSecondary}
                                                value={comboName}
                                                onChangeText={setComboName}
                                                autoFocus
                                            />
                                            <TouchableOpacity onPress={handleSaveCombo} style={styles.saveBtn}>
                                                <Save size={18} color={COLORS.black} />
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
                                        {cart.map(item => (
                                            <View key={item.id} style={styles.cartItem}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.itemTitle}>{item.food.name}</Text>
                                                    <Text style={styles.itemSub}>{item.quantity}{item.food.unit}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => handleRemoveFromCart(item.id)} style={styles.trashBtn}>
                                                    <Trash2 size={18} color={COLORS.error} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* Search Results */}
                            {query.length > 0 ? (
                                <ScrollView style={styles.resultsList} keyboardShouldPersistTaps="handled">
                                    {results.map(food => (
                                        <TouchableOpacity key={food.id} style={styles.resultItem} onPress={() => handleSelectFood(food)}>
                                            <View>
                                                <Text style={styles.resultName}>{food.name}</Text>
                                                <Text style={styles.resultDetails}>{food.portion}{food.unit} • {food.calories} kcal</Text>
                                            </View>
                                            <Plus size={20} color={COLORS.primary} />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            ) : (
                                cart.length === 0 && (
                                    <View style={styles.emptyContainer}>
                                        <Search size={48} color={COLORS.border} />
                                        <Text style={styles.emptyText}>Busque alimentos ou vá em "Meus Pratos"</Text>
                                    </View>
                                )
                            )}
                        </>
                    ) : (
                        // COMBOS TABS
                        <ScrollView style={styles.combosList}>
                            {combos.map(combo => (
                                <View key={combo.id} style={styles.comboCard}>
                                    <View style={styles.comboHeader}>
                                        <View>
                                            <Text style={styles.comboName}>{combo.name}</Text>
                                            <Text style={styles.comboCals}>{combo.total_calories} kcal • {combo.items?.length} itens</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteCombo(combo.id)} style={{ padding: 5 }}>
                                            <Trash2 size={16} color={COLORS.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.comboItemsList} numberOfLines={2}>
                                        {combo.items?.map(i => i.name).join(', ')}
                                    </Text>

                                    <TouchableOpacity style={styles.useComboBtn} onPress={() => handleUseCombo(combo)}>
                                        <Text style={styles.useComboText}>Usar Prato (+)</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {combos.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <UtensilsCrossed size={48} color={COLORS.border} />
                                    <Text style={styles.emptyText}>Monte uma refeição na busca e clique em "Salvar Prato" para criar atalhos.</Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>

                {/* Footer Actions */}
                {cart.length > 0 && activeTab === 'search' && (
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmAll}>
                            <Check size={20} color={COLORS.black} />
                            <Text style={styles.confirmText}>Confirmar {cart.length} item(s)</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {renderQuantitySelector()}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: SPACING.l, paddingBottom: SPACING.s, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.m },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: SPACING.xs },
    closeText: { color: COLORS.primary, fontSize: 16 },

    tabContainer: { flexDirection: 'row', marginBottom: SPACING.m, backgroundColor: COLORS.surface, borderRadius: RADIUS.m, padding: 4 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 6, borderRadius: RADIUS.s },
    activeTab: { backgroundColor: COLORS.primary },
    tabText: { color: COLORS.textSecondary, fontWeight: '600' },
    activeTabText: { color: COLORS.black },

    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.s, paddingHorizontal: SPACING.m, height: 44, borderWidth: 1, borderColor: COLORS.border },
    searchInput: { flex: 1, color: COLORS.white, marginLeft: SPACING.s, fontSize: 16 },

    content: { flex: 1 },

    // Cart Styles
    cartSection: { padding: SPACING.l, maxHeight: '60%', borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: 'rgba(0,0,0,0.2)' },
    cartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.s, alignItems: 'center' },
    cartTitle: { color: COLORS.lime, fontWeight: 'bold', fontSize: 14 },
    cartTotal: { color: COLORS.white, fontWeight: 'bold' },
    namingContainer: { flexDirection: 'row', gap: SPACING.s, marginBottom: SPACING.m },
    namingInput: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.s, paddingHorizontal: SPACING.m, height: 40, color: COLORS.white, borderWidth: 1, borderColor: COLORS.primary },
    saveBtn: { width: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.s },
    cartList: {},
    cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.s, backgroundColor: COLORS.surface, padding: SPACING.s, borderRadius: RADIUS.s },
    itemTitle: { color: COLORS.white, fontWeight: '600' },
    itemSub: { color: COLORS.textSecondary, fontSize: 12 },
    trashBtn: { padding: SPACING.s },

    // Results
    resultsList: { flex: 1, paddingHorizontal: SPACING.l },
    resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.m, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    resultName: { color: COLORS.white, fontSize: 16, fontWeight: '500', marginBottom: 4 },
    resultDetails: { color: COLORS.textSecondary, fontSize: 14 },

    // Combos
    combosList: { padding: SPACING.l },
    comboCard: { backgroundColor: COLORS.surface, padding: SPACING.m, borderRadius: RADIUS.m, marginBottom: SPACING.m, borderWidth: 1, borderColor: COLORS.border },
    comboHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.s },
    comboName: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    comboCals: { color: COLORS.lime, fontSize: 12 },
    comboItemsList: { color: COLORS.textSecondary, fontSize: 12, marginBottom: SPACING.m },
    useComboBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 8, borderRadius: RADIUS.s, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    useComboText: { color: COLORS.white, fontWeight: '600', fontSize: 12 },

    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.m, opacity: 0.5, marginTop: SPACING.xl * 2 },
    emptyText: { color: COLORS.textSecondary, fontSize: 16, textAlign: 'center', maxWidth: 220 },

    // Footer
    footer: { padding: SPACING.l, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
    confirmBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, height: 50, borderRadius: RADIUS.l, alignItems: 'center', justifyContent: 'center', gap: SPACING.s },
    confirmText: { color: COLORS.black, fontWeight: 'bold', fontSize: 16 },

    // Quantity Overlay
    qtyOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', padding: SPACING.l },
    qtyContainer: { width: '100%', alignItems: 'center' },
    qtyCard: { backgroundColor: COLORS.card, width: '100%', borderRadius: RADIUS.l, padding: SPACING.l, borderWidth: 1, borderColor: COLORS.primary }, // Using COLORS.card
    qtyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l },
    qtyTitle: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: SPACING.m },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: SPACING.l, gap: SPACING.s },
    qtyInput: { fontSize: 40, fontWeight: 'bold', color: COLORS.white, borderBottomWidth: 2, borderBottomColor: COLORS.primary, minWidth: 80, textAlign: 'center', paddingBottom: SPACING.xs },
    qtyUnit: { fontSize: 20, color: COLORS.textSecondary, marginBottom: 12 },
    previewStats: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.m, marginBottom: SPACING.l },
    previewText: { color: COLORS.textSecondary, fontSize: 14 },
    addToCartBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, height: 48, borderRadius: RADIUS.m, alignItems: 'center', justifyContent: 'center', gap: SPACING.s },
    addToCartText: { color: COLORS.black, fontWeight: 'bold', fontSize: 16 }
});
