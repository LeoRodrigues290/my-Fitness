import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { GradientButton } from '../../components/ui/GradientButton';
import { useUser } from '../../context/UserContext';
import { GoalRepository } from '../../services/GoalRepository';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { ChevronLeft } from 'lucide-react-native';

export const GoalsScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [calorieGoal, setCalorieGoal] = useState('');
    const [burnGoal, setBurnGoal] = useState('');
    const [proteinGoal, setProteinGoal] = useState('');
    const [carbsGoal, setCarbsGoal] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (currentUser) {
            loadGoals();
        }
    }, [currentUser]);

    const loadGoals = async () => {
        if (!currentUser) return;
        const goals = await GoalRepository.getGoals(currentUser.id);
        if (goals) {
            setCalorieGoal(goals.calorie_goal?.toString() || '2000');
            setBurnGoal(goals.burn_goal?.toString() || '500');
            setProteinGoal(goals.protein_goal?.toString() || '150');
            setCarbsGoal(goals.carbs_goal?.toString() || '250');
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;
        await GoalRepository.saveGoals(
            currentUser.id,
            parseInt(calorieGoal) || 0,
            parseInt(burnGoal) || 0,
            parseInt(proteinGoal) || 0,
            parseInt(carbsGoal) || 0
        );
        setShowAlert(true);
    };

    return (
        <Screen>
            <CustomAlert
                visible={showAlert}
                title="Sucesso"
                message="Metas atualizadas com sucesso!"
                onClose={() => {
                    setShowAlert(false);
                    navigation.goBack();
                }}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={COLORS.white} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Metas Diárias</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.description}>Defina seus objetivos diários para acompanhar seu progresso no Dashboard.</Text>

                <Text style={styles.label}>Meta de Consumo (kcal)</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={calorieGoal}
                        onChangeText={setCalorieGoal}
                        keyboardType="numeric"
                        placeholder="2000"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>

                <Text style={styles.label}>Meta de Gasto (kcal)</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={burnGoal}
                        onChangeText={setBurnGoal}
                        keyboardType="numeric"
                        placeholder="500"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Proteínas (g)</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={proteinGoal}
                                onChangeText={setProteinGoal}
                                keyboardType="numeric"
                                placeholder="150"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Carboidratos (g)</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={carbsGoal}
                                onChangeText={setCarbsGoal}
                                keyboardType="numeric"
                                placeholder="250"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                </View>

                <GradientButton title="Salvar Metas" onPress={handleSave} style={{ marginTop: SPACING.l }} />

            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        paddingTop: SPACING.l,
    },
    backBtn: {
        padding: SPACING.s,
    },
    title: {
        color: COLORS.white,
        fontSize: SIZES.h2,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.m,
    },
    description: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.l,
        textAlign: 'center',
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
        marginLeft: SPACING.xs,
    },
    inputContainer: {
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
    },
    input: {
        color: COLORS.white,
        padding: SPACING.m,
        fontSize: SIZES.body,
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    halfInput: {
        flex: 1,
    }
});
