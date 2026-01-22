import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { GradientButton } from '../../components/ui/GradientButton';
import { GlassView } from '../../components/ui/GlassView';
import { X } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { NutritionRepository } from '../../services/NutritionRepository';
import { SuccessModal } from '../../components/ui/SuccessModal';

export const AddMealScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [type, setType] = useState('Café da Manhã');
    const [showSuccess, setShowSuccess] = useState(false);

    const mealTypes = ['Café da Manhã', 'Almoço', 'Jantar', 'Lanche'];

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

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Nome da Refeição</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex: Salada de Frango"
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
});
