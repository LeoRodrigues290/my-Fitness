import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    StyleSheet
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Check } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { workoutsData } from '../../constants/workouts';
import { Workout, Exercise } from '../../types';

interface LogExercise extends Exercise {
    weight: number;
    actualSets: number;
    actualReps: string;
}

interface WorkoutLogModalProps {
    visible: boolean;
    onClose: () => void;
    onFinish: (workoutId: string, exercises: LogExercise[]) => Promise<void>;
}

export const WorkoutLogModal: React.FC<WorkoutLogModalProps> = ({
    visible,
    onClose,
    onFinish
}) => {
    const [logWorkoutId, setLogWorkoutId] = useState('chest-triceps');
    const [logExercises, setLogExercises] = useState<LogExercise[]>([]);

    // Initialize exercises when workout type changes
    useEffect(() => {
        const template = workoutsData.find(w => w.id === logWorkoutId);
        if (template) {
            setLogExercises(template.exercises.map(e => ({
                ...e,
                weight: 0,
                actualSets: 0,
                actualReps: ''
            })));
        }
    }, [logWorkoutId]);

    const handleFinish = async () => {
        // Validate that at least one exercise has data
        const hasValidData = logExercises.some(ex =>
            ex.actualSets > 0 || ex.weight > 0 || ex.actualReps.length > 0
        );

        if (!hasValidData) {
            // Could show alert here, but for now just prevent empty saves
            return;
        }

        await onFinish(logWorkoutId, logExercises);
        onClose();
    };

    const updateExercise = (index: number, field: keyof LogExercise, value: any) => {
        const newExs = [...logExercises];
        (newExs[index] as any)[field] = value;
        setLogExercises(newExs);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Registrar Treino</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.slate400} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.dateLabel}>
                            Data: <Text style={styles.dateValue}>Hoje</Text>
                        </Text>

                        {/* Workout Selector */}
                        <Text style={styles.sectionTitle}>Treino Realizado</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workoutSelector}>
                            <View style={styles.workoutRow}>
                                {workoutsData.filter(w => w.id !== 'flow').map(opt => (
                                    <TouchableOpacity
                                        key={opt.id}
                                        onPress={() => setLogWorkoutId(opt.id)}
                                        style={[
                                            styles.workoutOption,
                                            logWorkoutId === opt.id && styles.workoutOptionActive
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.workoutOptionText,
                                                logWorkoutId === opt.id && styles.workoutOptionTextActive
                                            ]}
                                        >
                                            {opt.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        {/* Exercises */}
                        <Text style={styles.sectionTitle}>Exercícios & Cargas</Text>

                        {logExercises.map((ex, idx) => (
                            <View key={ex.id} style={styles.exerciseCard}>
                                <Text style={styles.exerciseName}>{ex.name}</Text>
                                <View style={styles.inputsRow}>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>SÉRIES</Text>
                                        <TextInput
                                            keyboardType="numeric"
                                            placeholderTextColor={colors.slate600}
                                            placeholder={ex.sets.split(' ')[0]}
                                            style={styles.input}
                                            onChangeText={t => updateExercise(idx, 'actualSets', parseInt(t) || 0)}
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>REPS</Text>
                                        <TextInput
                                            keyboardType="numeric"
                                            placeholderTextColor={colors.slate600}
                                            placeholder="12"
                                            style={styles.input}
                                            onChangeText={t => updateExercise(idx, 'actualReps', t)}
                                        />
                                    </View>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>KG</Text>
                                        <TextInput
                                            keyboardType="numeric"
                                            placeholderTextColor={colors.slate600}
                                            placeholder="0"
                                            style={styles.input}
                                            onChangeText={t => updateExercise(idx, 'weight', parseInt(t) || 0)}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
                            <Check size={20} color={colors.slate950} />
                            <Text style={styles.finishButtonText}>Finalizar Treino</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.slate950,
        marginTop: 40,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.slate900,
    },
    title: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    dateLabel: {
        color: colors.slate400,
        marginBottom: 8,
    },
    dateValue: {
        color: colors.white,
    },
    sectionTitle: {
        color: colors.lime400,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 16,
        textTransform: 'uppercase',
    },
    workoutSelector: {
        marginBottom: 24,
    },
    workoutRow: {
        flexDirection: 'row',
        gap: 8,
    },
    workoutOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.slate800,
        borderWidth: 1,
        borderColor: colors.slate700,
    },
    workoutOptionActive: {
        backgroundColor: colors.lime500,
        borderColor: colors.lime400,
    },
    workoutOptionText: {
        color: colors.slate300,
        fontWeight: 'bold',
    },
    workoutOptionTextActive: {
        color: colors.slate950,
    },
    exerciseCard: {
        marginBottom: 16,
        backgroundColor: colors.slate800,
        padding: 16,
        borderRadius: 16,
    },
    exerciseName: {
        color: colors.white,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    inputsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputContainer: {
        flex: 1,
    },
    inputLabel: {
        color: colors.slate500,
        fontSize: 10,
        marginBottom: 4,
    },
    input: {
        backgroundColor: colors.slate900,
        color: colors.white,
        padding: 12,
        borderRadius: 8,
    },
    finishButton: {
        backgroundColor: colors.lime400,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    finishButtonText: {
        color: colors.slate950,
        fontWeight: 'bold',
        fontSize: 16,
    },
});
