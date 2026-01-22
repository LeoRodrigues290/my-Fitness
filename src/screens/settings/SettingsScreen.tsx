import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Scale } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useUser, WeekSchedule } from '../../context/UserContext';
import { workoutOptions } from '../../constants/workouts';
import { DAYS_OF_WEEK } from '../../types';
import { WeightRepository } from '../../services/WeightRepository';

interface SettingsScreenProps {
    onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const insets = useSafeAreaInsets();
    const { currentUser, userPreferences, updatePreferences } = useUser();

    const [localGoals, setLocalGoals] = useState(userPreferences.goals);
    const [localSchedule, setLocalSchedule] = useState<WeekSchedule>(userPreferences.schedule);
    const [currentWeight, setCurrentWeight] = useState('');

    // Load current weight on mount
    useEffect(() => {
        if (currentUser) {
            WeightRepository.getLatestWeight(currentUser.id).then(w => {
                if (w) setCurrentWeight(w.toString());
            });
        }
    }, [currentUser]);

    const handleSave = async () => {
        // Save preferences
        await updatePreferences({ goals: localGoals, schedule: localSchedule });

        // Save weight if changed
        if (currentUser && currentWeight) {
            const weightNum = parseFloat(currentWeight);
            if (!isNaN(weightNum) && weightNum > 0) {
                await WeightRepository.addWeight(currentUser.id, weightNum);
            }
        }

        onBack();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <ChevronLeft size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.title}>Configurações</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Current Weight Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Seu Peso Atual</Text>
                    <View style={styles.weightCard}>
                        <Scale size={24} color={colors.blue400} />
                        <TextInput
                            keyboardType="decimal-pad"
                            value={currentWeight}
                            onChangeText={setCurrentWeight}
                            style={styles.weightInput}
                            placeholder="0.0"
                            placeholderTextColor={colors.slate600}
                        />
                        <Text style={styles.weightUnit}>kg</Text>
                    </View>
                    <Text style={styles.helperText}>
                        Atualize seu peso regularmente para acompanhar sua evolução nos gráficos
                    </Text>
                </View>

                {/* Goals Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Metas Diárias</Text>

                    <View style={styles.inputRow}>
                        <View style={styles.inputBox}>
                            <Text style={styles.inputLabel}>CALORIAS (Kcal)</Text>
                            <TextInput
                                keyboardType="numeric"
                                value={localGoals.kcal.toString()}
                                onChangeText={t => setLocalGoals({ ...localGoals, kcal: parseInt(t) || 0 })}
                                style={styles.input}
                            />
                        </View>
                        <View style={styles.inputBox}>
                            <Text style={styles.inputLabel}>PESO ALVO (Kg)</Text>
                            <TextInput
                                keyboardType="numeric"
                                value={localGoals.weight.toString()}
                                onChangeText={t => setLocalGoals({ ...localGoals, weight: parseInt(t) || 0 })}
                                style={styles.input}
                            />
                        </View>
                    </View>

                    <View style={styles.inputRowThree}>
                        <View style={styles.inputBoxSmall}>
                            <Text style={styles.inputLabel}>PROTEÍNA (g)</Text>
                            <TextInput
                                keyboardType="numeric"
                                value={localGoals.protein.toString()}
                                onChangeText={t => setLocalGoals({ ...localGoals, protein: parseInt(t) || 0 })}
                                style={styles.inputSmall}
                            />
                        </View>
                        <View style={styles.inputBoxSmall}>
                            <Text style={styles.inputLabel}>CARBO (g)</Text>
                            <TextInput
                                keyboardType="numeric"
                                value={localGoals.carbs.toString()}
                                onChangeText={t => setLocalGoals({ ...localGoals, carbs: parseInt(t) || 0 })}
                                style={styles.inputSmall}
                            />
                        </View>
                        <View style={styles.inputBoxSmall}>
                            <Text style={styles.inputLabel}>ÁGUA (ml)</Text>
                            <TextInput
                                keyboardType="numeric"
                                value={localGoals.water.toString()}
                                onChangeText={t => setLocalGoals({ ...localGoals, water: parseInt(t) || 0 })}
                                style={styles.inputSmall}
                            />
                        </View>
                    </View>
                </View>

                {/* Schedule Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cronograma Semanal</Text>

                    {DAYS_OF_WEEK.map((day) => {
                        const currentVal = localSchedule[day.id as keyof WeekSchedule];

                        return (
                            <View key={day.id} style={styles.dayRow}>
                                <Text style={styles.dayLabel}>{day.label}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.optionsRow}>
                                        {workoutOptions.map(opt => (
                                            <TouchableOpacity
                                                key={opt.value}
                                                onPress={() => setLocalSchedule({ ...localSchedule, [day.id]: opt.value })}
                                                style={[
                                                    styles.optionButton,
                                                    currentVal === opt.value && styles.optionButtonActive
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.optionText,
                                                        currentVal === opt.value && styles.optionTextActive
                                                    ]}
                                                >
                                                    {opt.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        );
                    })}
                </View>

                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Salvar Configurações</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginLeft: 16,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: colors.lime400,
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    inputRowThree: {
        flexDirection: 'row',
        gap: 16,
    },
    inputBox: {
        flex: 1,
        backgroundColor: colors.slate800,
        padding: 16,
        borderRadius: 16,
    },
    inputBoxSmall: {
        flex: 1,
        backgroundColor: colors.slate800,
        padding: 16,
        borderRadius: 16,
    },
    inputLabel: {
        color: colors.slate400,
        fontSize: 12,
        marginBottom: 8,
    },
    input: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputSmall: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    dayRow: {
        marginBottom: 12,
    },
    dayLabel: {
        color: colors.slate400,
        fontSize: 12,
        marginBottom: 4,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    optionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: colors.slate800,
        borderWidth: 1,
        borderColor: colors.slate700,
    },
    optionButtonActive: {
        backgroundColor: colors.lime500,
        borderColor: colors.lime400,
    },
    optionText: {
        color: colors.slate300,
        fontWeight: '600',
        fontSize: 12,
    },
    optionTextActive: {
        color: colors.slate950,
    },
    saveButton: {
        backgroundColor: colors.lime400,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: colors.slate900,
        fontWeight: 'bold',
        fontSize: 16,
    },
    weightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.3)',
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    weightInput: {
        flex: 1,
        color: colors.white,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    weightUnit: {
        color: colors.slate400,
        fontSize: 18,
        fontWeight: '600',
    },
    helperText: {
        color: colors.slate500,
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
    },
});
