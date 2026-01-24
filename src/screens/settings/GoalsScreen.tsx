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
    const [fatsGoal, setFatsGoal] = useState('');
    const [waterGoal, setWaterGoal] = useState('');

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
            setFatsGoal(goals.fats_goal?.toString() || '70');
            setWaterGoal(goals.water_goal?.toString() || '2500');
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;
        await GoalRepository.saveGoals(
            currentUser.id,
            parseInt(calorieGoal) || 0,
            parseInt(burnGoal) || 0,
            parseInt(proteinGoal) || 0,
            parseInt(carbsGoal) || 0,
            parseInt(fatsGoal) || 0,
            parseInt(waterGoal) || 0
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
                <Text style={styles.sectionTitle}>CALORIAS & HIDRATAÇÃO</Text>

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Calorias (kcal)</Text>
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
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Água (ml)</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={waterGoal}
                                onChangeText={setWaterGoal}
                                keyboardType="numeric"
                                placeholder="2500"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                </View>

                <View style={styles.oneThirdInput}>
                    <Text style={styles.label}>Meta de Queima (kcal)</Text>
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
                </View>

                <Text style={styles.sectionTitle}>MACRONUTRIENTES</Text>
                <View style={styles.row}>
                    <View style={styles.thirdInput}>
                        <Text style={[styles.label, { color: COLORS.danger }]}>Prot (g)</Text>
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
                    <View style={styles.thirdInput}>
                        <Text style={[styles.label, { color: COLORS.primary }]}>Carb (g)</Text>
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
                    <View style={styles.thirdInput}>
                        <Text style={[styles.label, { color: COLORS.accent }]}>Gord (g)</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={fatsGoal}
                                onChangeText={setFatsGoal}
                                keyboardType="numeric"
                                placeholder="70"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                </View>

                <View style={styles.footer}>
                    <GradientButton
                        title="Salvar Metas"
                        onPress={handleSave}
                    />
                </View>

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
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.l,
    },
    sectionTitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: SPACING.m,
        marginTop: SPACING.m,
        letterSpacing: 1,
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    inputContainer: {
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(30,30,40,0.5)',
    },
    input: {
        color: COLORS.white,
        padding: SPACING.m,
        fontSize: 16,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    halfInput: {
        flex: 1,
    },
    thirdInput: {
        flex: 1,
    },
    oneThirdInput: {
        width: '50%'
    },
    footer: {
        marginTop: SPACING.xl,
    }
});
