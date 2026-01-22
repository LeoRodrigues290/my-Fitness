import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { GradientButton } from '../../components/ui/GradientButton';
import { GlassView } from '../../components/ui/GlassView';
import { X, Search } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { NutritionRepository } from '../../services/NutritionRepository';
import { SuccessModal } from '../../components/ui/SuccessModal';

export const AddMealScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [name, setName] = useState(''); // Selected food name
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [type, setType] = useState('Café da Manhã');
    const [showSuccess, setShowSuccess] = useState(false);

    const mealTypes = ['Café da Manhã', 'Almoço', 'Jantar', 'Lanche'];

    const searchFood = async (text: string) => {
        setSearchQuery(text);
        if (text.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${text}&search_simple=1&action=process&json=1`
            );
            const data = await response.json();
            if (data.products) {
                setSearchResults(data.products.slice(0, 5)); // Limit to 5 results
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectFood = (item: any) => {
        setName(item.product_name);
        setSearchQuery(item.product_name);
        setSearchResults([]); // Clear list

        // Extract nutriments (per 100g usually, but good enough for estimate)
        const nutriments = item.nutriments;
        if (nutriments) {
            setCalories(nutriments['energy-kcal_100g']?.toString() || nutriments['energy-kcal']?.toString() || '');
            setProtein(nutriments['proteins_100g']?.toString() || '');
            setCarbs(nutriments['carbohydrates_100g']?.toString() || '');
            setFats(nutriments['fat_100g']?.toString() || '');
        }
    };

    const handleSave = async () => {
        if (!currentUser || !name) return;

        await NutritionRepository.addMeal(
            currentUser.id,
            new Date().toISOString().split('T')[0],
            type,
            name,
            parseFloat(calories) || 0,
            parseFloat(protein) || 0,
            parseFloat(carbs) || 0,
            parseFloat(fats) || 0
        );

        setShowSuccess(true);
    };

    const renderSearchResult = ({ item }: any) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => selectFood(item)}>
            <Text style={styles.resultName}>{item.product_name}</Text>
            <Text style={styles.resultInfo}>
                {Math.round(item.nutriments?.['energy-kcal_100g'] || 0)} kcal •
                {item.brands || 'Genérico'}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Screen style={{ paddingTop: 0 }}>
            <SuccessModal
                visible={showSuccess}
                message="Refeição Registrada!"
                onClose={() => navigation.goBack()}
            />

            <View style={styles.header}>
                <Text style={styles.title}>Registrar {type}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X color={COLORS.textSecondary} size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
                {mealTypes.map(t => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setType(t)}
                        style={[styles.typeChip, type === t && styles.activeChip]}
                    >
                        <Text style={[styles.typeText, type === t && styles.activeTypeText]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <Text style={styles.label}>Buscar Alimento</Text>
                <GlassView style={styles.searchContainer} intensity={10}>
                    <Search color={COLORS.textSecondary} size={20} style={{ marginRight: SPACING.s }} />
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={searchFood}
                        placeholder="Ex: Arroz, Frango, Maçã..."
                        placeholderTextColor={COLORS.textSecondary}
                    />
                    {isSearching && <ActivityIndicator size="small" color={COLORS.primary} />}
                </GlassView>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <View style={styles.resultsList}>
                        {searchResults.map((item, index) => (
                            <View key={item.code || index}>
                                {renderSearchResult({ item })}
                            </View>
                        ))}
                    </View>
                )}

                <Text style={styles.label}>Nome da Refeição (Editável)</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Nome final do prato"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>

                <Text style={styles.label}>Calorias (kcal)</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={calories}
                        onChangeText={setCalories}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>

                <View style={styles.row}>
                    <View style={styles.statInput}>
                        <Text style={styles.label}>Proteínas (g)</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={protein}
                                onChangeText={setProtein}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                    <View style={styles.statInput}>
                        <Text style={styles.label}>Carboidratos (g)</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={carbs}
                                onChangeText={setCarbs}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                    <View style={styles.statInput}>
                        <Text style={styles.label}>Gorduras (g)</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={fats}
                                onChangeText={setFats}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                </View>

                <GradientButton title="Salvar Refeição" onPress={handleSave} style={{ marginTop: SPACING.l }} />
            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
        paddingTop: SPACING.xl,
    },
    title: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.m,
        paddingBottom: 100,
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
        marginLeft: SPACING.xs,
    },
    inputContainer: {
        borderRadius: RADIUS.s,
        marginBottom: SPACING.m,
    },
    input: {
        color: COLORS.white,
        padding: SPACING.m,
        fontSize: SIZES.body,
    },
    typeSelector: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.m,
        gap: SPACING.s,
        marginBottom: SPACING.m,
    },
    typeChip: {
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.m,
        borderRadius: RADIUS.l,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    activeChip: {
        backgroundColor: COLORS.primary,
    },
    typeText: {
        color: COLORS.textSecondary,
    },
    activeTypeText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    statInput: {
        flex: 1,
    },
    searchContainer: {
        borderRadius: RADIUS.s,
        marginBottom: SPACING.m,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
    },
    searchInput: {
        flex: 1,
        color: COLORS.white,
        paddingVertical: SPACING.m,
        fontSize: SIZES.body,
    },
    resultsList: {
        backgroundColor: COLORS.gradients.card[0],
        marginBottom: SPACING.m,
        borderRadius: RADIUS.s,
        overflow: 'hidden',
    },
    resultItem: {
        padding: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    resultName: {
        color: COLORS.white,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    resultInfo: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
});
