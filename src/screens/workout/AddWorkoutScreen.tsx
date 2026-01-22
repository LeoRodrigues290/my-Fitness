import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { GradientButton } from '../../components/ui/GradientButton';
import { GlassView } from '../../components/ui/GlassView';
import { X, Plus, Trash2 } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { WorkoutRepository } from '../../services/WorkoutRepository';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export const AddWorkoutScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [muscleGroup, setMuscleGroup] = useState('');
    const [exercises, setExercises] = useState([
        { name: '', sets: '', reps: '', weight: '' }
    ]);
    const [showSuccess, setShowSuccess] = useState(false);

    const addExercise = () => {
        setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }]);
    };

    const removeExercise = (index: number) => {
        const newExercises = [...exercises];
        newExercises.splice(index, 1);
        setExercises(newExercises);
    };

    const updateExercise = (index: number, field: string, value: string) => {
        const newExercises = [...exercises];
        // @ts-ignore
        newExercises[index][field] = value;
        setExercises(newExercises);
    };

    const handleSave = async () => {
        if (!currentUser) return;

        if (!muscleGroup || exercises.some(e => !e.name)) {
            alert('Por favor, preencha o grupo muscular e os nomes dos exercícios');
            return;
        }

        const formattedExercises = exercises.map(e => ({
            name: e.name,
            sets: parseInt(e.sets) || 0,
            reps: parseInt(e.reps) || 0,
            weight: parseFloat(e.weight) || 0
        }));

        await WorkoutRepository.addWorkout(
            currentUser.id,
            date,
            muscleGroup,
            '',
            formattedExercises
        );

        setShowSuccess(true);
    };

    return (
        <Screen style={{ paddingTop: 0 }}>
            <SuccessModal
                visible={showSuccess}
                message="Treino Registrado!"
                onClose={() => navigation.goBack()}
            />

            <View style={styles.header}>
                <Text style={styles.title}>Novo Treino</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X color={COLORS.textSecondary} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Data</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <Text style={[styles.input, { paddingTop: SPACING.m }]}>
                            {format(new Date(date), 'dd/MM/yyyy')}
                        </Text>
                    </TouchableOpacity>
                </GlassView>

                {showDatePicker && (
                    <DateTimePicker
                        value={new Date(date)}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                setDate(selectedDate.toISOString().split('T')[0]);
                            }
                        }}
                    />
                )}

                <Text style={styles.label}>Grupo Muscular</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={muscleGroup}
                        onChangeText={setMuscleGroup}
                        placeholder="ex: Peito, Pernas"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>

                <Text style={[styles.label, { marginTop: SPACING.l }]}>Exercícios</Text>

                {exercises.map((exercise, index) => (
                    <GlassView key={index} style={styles.exerciseCard} intensity={15}>
                        <View style={styles.exerciseHeader}>
                            <Text style={styles.exerciseIndex}>#{index + 1}</Text>
                            <TouchableOpacity onPress={() => removeExercise(index)}>
                                <Trash2 color={COLORS.danger} size={20} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.input, styles.exerciseName]}
                            value={exercise.name}
                            onChangeText={(v) => updateExercise(index, 'name', v)}
                            placeholder="Nome do Exercício"
                            placeholderTextColor={COLORS.textSecondary}
                        />

                        <View style={styles.row}>
                            <View style={styles.statInput}>
                                <Text style={styles.statLabel}>Séries</Text>
                                <TextInput
                                    style={styles.input}
                                    value={exercise.sets}
                                    onChangeText={(v) => updateExercise(index, 'sets', v)}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </View>
                            <View style={styles.statInput}>
                                <Text style={styles.statLabel}>Reps</Text>
                                <TextInput
                                    style={styles.input}
                                    value={exercise.reps}
                                    onChangeText={(v) => updateExercise(index, 'reps', v)}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </View>
                            <View style={styles.statInput}>
                                <Text style={styles.statLabel}>kg</Text>
                                <TextInput
                                    style={styles.input}
                                    value={exercise.weight}
                                    onChangeText={(v) => updateExercise(index, 'weight', v)}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </View>
                        </View>
                    </GlassView>
                ))}

                <TouchableOpacity style={styles.addBtn} onPress={addExercise}>
                    <Plus color={COLORS.primary} size={20} />
                    <Text style={styles.addBtnText}>Adicionar Exercício</Text>
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.footer}>
                <GradientButton title="Salvar Treino" onPress={handleSave} />
            </View>
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
    exerciseCard: {
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderRadius: RADIUS.m,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.s,
    },
    exerciseIndex: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    exerciseName: {
        fontSize: SIZES.h3,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        marginBottom: SPACING.m,
        padding: SPACING.s,
        paddingLeft: 0,
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    statInput: {
        flex: 1,
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
        marginBottom: 2,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        gap: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: RADIUS.m,
        borderStyle: 'dashed',
    },
    addBtnText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    footer: {
        padding: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    }
});
