import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated } from 'react-native';
import { GlassView } from '../ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { HelpCircle, Check, Trash2, RefreshCw, History } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';

export interface ExerciseCardData {
    id: number;
    exercise_id: number;
    exercise_name: string;
    target_sets?: number;
    target_reps?: string;
    target_weight?: number | null;
    actual_sets?: number | null;
    actual_reps?: string | null;
    actual_weight?: number | null;
    completed?: boolean;
    video_url?: string | null;
    muscle_group?: string;
    instructions?: string | null;
    default_rest_seconds?: number;
}

export interface LastPerformance {
    weight: number | null;
    reps: string | null;
    sets: number | null;
}

interface EditableExerciseCardProps {
    exercise: ExerciseCardData;
    index: number;
    onUpdate: (field: 'actual_sets' | 'actual_reps' | 'actual_weight' | 'completed', value: any) => void;
    onRemove: () => void;
    onInfoPress: () => void;
    onSwap?: () => void;
    lastPerformance?: LastPerformance | null;
    isEditable?: boolean;
}

export const EditableExerciseCard: React.FC<EditableExerciseCardProps> = ({
    exercise,
    index,
    onUpdate,
    onRemove,
    onInfoPress,
    onSwap,
    lastPerformance,
    isEditable = true
}) => {
    const [localSets, setLocalSets] = useState(
        exercise.actual_sets?.toString() || exercise.target_sets?.toString() || ''
    );
    const [localReps, setLocalReps] = useState(
        exercise.actual_reps || exercise.target_reps || ''
    );
    const [localWeight, setLocalWeight] = useState(
        exercise.actual_weight?.toString() || exercise.target_weight?.toString() || ''
    );

    const handleSetsChange = (value: string) => {
        setLocalSets(value);
        onUpdate('actual_sets', parseInt(value) || 0);
    };

    const handleRepsChange = (value: string) => {
        setLocalReps(value);
        onUpdate('actual_reps', value);
    };

    const handleWeightChange = (value: string) => {
        setLocalWeight(value);
        onUpdate('actual_weight', parseFloat(value) || 0);
    };

    const toggleComplete = () => {
        onUpdate('completed', !exercise.completed);
    };

    const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
        const trans = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [0, 100],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View style={[styles.deleteAction, { transform: [{ translateX: trans }] }]}>
                <TouchableOpacity onPress={onRemove} style={styles.deleteButton}>
                    <Trash2 color={COLORS.white} size={24} />
                    <Text style={styles.deleteText}>Remover</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    const cardContent = (
        <GlassView
            style={[
                styles.card,
                exercise.completed && styles.cardCompleted
            ]}
            intensity={15}
        >
            {/* Header Row */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.indexBadge}>
                        <Text style={styles.indexText}>{index + 1}</Text>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.exerciseName} numberOfLines={1}>
                            {exercise.exercise_name}
                        </Text>
                        {exercise.muscle_group && (
                            <Text style={styles.muscleGroup}>{exercise.muscle_group}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.headerRight}>
                    {/* Swap Button */}
                    {onSwap && isEditable && (
                        <TouchableOpacity onPress={onSwap} style={styles.swapButton}>
                            <RefreshCw color={COLORS.blue} size={18} />
                        </TouchableOpacity>
                    )}
                    {/* Info/Video Button */}
                    {exercise.video_url && (
                        <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
                            <HelpCircle color={COLORS.purple} size={22} />
                        </TouchableOpacity>
                    )}
                    {/* Complete Button */}
                    <TouchableOpacity onPress={toggleComplete} style={styles.checkButton}>
                        <View style={[styles.checkCircle, exercise.completed && styles.checkCircleActive]}>
                            {exercise.completed && <Check color={COLORS.background} size={16} />}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Ghost Set - Last Performance */}
            {lastPerformance && lastPerformance.weight && (
                <View style={styles.ghostSetRow}>
                    <History color={COLORS.textSecondary} size={12} />
                    <Text style={styles.ghostSetText}>
                        Último: {lastPerformance.weight}kg x {lastPerformance.reps}
                    </Text>
                </View>
            )}

            {/* Target vs Actual (if showing target) */}
            {exercise.target_sets && !isEditable && (
                <View style={styles.targetRow}>
                    <Text style={styles.targetText}>
                        Meta: {exercise.target_sets} x {exercise.target_reps}
                        {exercise.target_weight ? ` @ ${exercise.target_weight}kg` : ''}
                    </Text>
                </View>
            )}

            {/* Input Row */}
            {isEditable && (
                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Séries</Text>
                        <TextInput
                            style={styles.input}
                            value={localSets}
                            onChangeText={handleSetsChange}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={COLORS.textSecondary}
                            selectTextOnFocus
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Reps</Text>
                        <TextInput
                            style={styles.input}
                            value={localReps}
                            onChangeText={handleRepsChange}
                            placeholder="10-12"
                            placeholderTextColor={COLORS.textSecondary}
                            selectTextOnFocus
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Peso (kg)</Text>
                        <TextInput
                            style={styles.input}
                            value={localWeight}
                            onChangeText={handleWeightChange}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={COLORS.textSecondary}
                            selectTextOnFocus
                        />
                    </View>
                </View>
            )}

            {/* Non-editable display */}
            {!isEditable && (
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{exercise.actual_sets || exercise.target_sets || '-'}</Text>
                        <Text style={styles.statLabel}>Séries</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>{exercise.actual_reps || exercise.target_reps || '-'}</Text>
                        <Text style={styles.statLabel}>Reps</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>
                            {exercise.actual_weight || exercise.target_weight || '-'}
                            <Text style={styles.statUnit}>kg</Text>
                        </Text>
                        <Text style={styles.statLabel}>Peso</Text>
                    </View>
                </View>
            )}
        </GlassView>
    );

    if (isEditable) {
        return (
            <Swipeable
                renderRightActions={renderRightActions}
                rightThreshold={40}
                overshootRight={false}
            >
                {cardContent}
            </Swipeable>
        );
    }

    return cardContent;
};

const styles = StyleSheet.create({
    card: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardCompleted: {
        borderColor: COLORS.lime,
        backgroundColor: `${COLORS.lime}10`,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    indexBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: `${COLORS.primary}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    indexText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: SIZES.small,
    },
    titleContainer: {
        flex: 1,
    },
    exerciseName: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    muscleGroup: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
        marginTop: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    infoButton: {
        padding: SPACING.xs,
    },
    checkButton: {
        padding: SPACING.xs,
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: COLORS.textSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkCircleActive: {
        backgroundColor: COLORS.lime,
        borderColor: COLORS.lime,
    },
    targetRow: {
        marginBottom: SPACING.s,
    },
    targetText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    inputRow: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    inputGroup: {
        flex: 1,
    },
    inputLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
        marginBottom: 4,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: RADIUS.s,
        padding: SPACING.s,
        color: COLORS.white,
        fontSize: SIZES.body,
        textAlign: 'center',
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    statUnit: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
        marginTop: 2,
    },
    deleteAction: {
        width: 100,
        marginBottom: SPACING.m,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: COLORS.danger,
        borderRadius: RADIUS.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: SPACING.s,
    },
    deleteText: {
        color: COLORS.white,
        fontSize: SIZES.tiny,
        marginTop: 4,
    },
    swapButton: {
        padding: SPACING.xs,
    },
    ghostSetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: SPACING.s,
        marginLeft: SPACING.m + 28, // Align with title after index badge
    },
    ghostSetText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
        fontStyle: 'italic',
    },
});
