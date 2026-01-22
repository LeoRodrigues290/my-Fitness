import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { GradientButton } from '../../components/ui/GradientButton';
import { VideoInstructionModal } from '../../components/ui/VideoInstructionModal';
import { EditableExerciseCard, ExerciseCardData, LastPerformance } from '../../components/workout/EditableExerciseCard';
import { RestTimerOverlay } from '../../components/workout/RestTimerOverlay';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { ChevronLeft, Plus, Clock, Dumbbell, Check, X, Search } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { WorkoutSessionRepository } from '../../services/WorkoutSessionRepository';
import { ExerciseLibraryRepository, Exercise } from '../../services/ExerciseLibraryRepository';
import { CustomAlert } from '../../components/ui/CustomAlert';

interface WorkoutRunnerScreenProps {
    navigation: any;
    route: {
        params: {
            templateId?: number;
            templateName?: string;
            exercises?: ExerciseCardData[];
        };
    };
}

export const WorkoutRunnerScreen: React.FC<WorkoutRunnerScreenProps> = ({ navigation, route }) => {
    const { currentUser } = useUser();
    const { templateId, templateName, exercises: initialExercises } = route.params || {};

    // Session state
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [exercises, setExercises] = useState<ExerciseCardData[]>(initialExercises || []);
    const [startTime] = useState(new Date());
    const [elapsedTime, setElapsedTime] = useState(0);

    // Ghost Set cache
    const [lastPerformances, setLastPerformances] = useState<{ [exerciseId: number]: LastPerformance | null }>({});

    // Rest Timer state
    const [restTimerVisible, setRestTimerVisible] = useState(false);
    const [restTimerDuration, setRestTimerDuration] = useState(60);
    const [restTimerExercise, setRestTimerExercise] = useState('');

    // Modal states
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<ExerciseCardData | null>(null);
    const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false);
    const [swapModalVisible, setSwapModalVisible] = useState(false);
    const [swapExerciseIndex, setSwapExerciseIndex] = useState<number | null>(null);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [alertConfig, setAlertConfig] = useState<any>({ visible: false });

    // Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    // Initialize session
    useEffect(() => {
        const initSession = async () => {
            if (!currentUser) return;

            if (templateId) {
                // Start session from template
                const id = await WorkoutSessionRepository.startSessionFromTemplate(currentUser.id, templateId);
                setSessionId(id);

                // Fetch the session with exercises
                const session = await WorkoutSessionRepository.getSessionById(id);
                if (session) {
                    const exercisesList = session.exercises.map((e) => ({
                        id: e.id,
                        exercise_id: e.exercise_id,
                        exercise_name: e.exercise_name || '',
                        actual_sets: e.actual_sets,
                        actual_reps: e.actual_reps,
                        actual_weight: e.actual_weight,
                        completed: e.completed,
                        video_url: e.video_url,
                        muscle_group: e.muscle_group,
                        default_rest_seconds: 60, // Default, can be enhanced
                    }));
                    setExercises(exercisesList);

                    // Load ghost sets for all exercises
                    loadGhostSets(exercisesList, currentUser.id);
                }
            } else {
                // Start empty session
                const id = await WorkoutSessionRepository.startSession(currentUser.id);
                setSessionId(id);
            }
        };

        initSession();
    }, [currentUser, templateId]);

    // Load ghost sets (last performance) for exercises
    const loadGhostSets = async (exercisesList: ExerciseCardData[], userId: number) => {
        const performances: { [key: number]: LastPerformance | null } = {};

        for (const ex of exercisesList) {
            const perf = await WorkoutSessionRepository.getLastPerformance(userId, ex.exercise_id);
            performances[ex.exercise_id] = perf;
        }

        setLastPerformances(performances);
    };

    // Load available exercises for adding/swapping
    const loadAvailableExercises = async () => {
        const allExercises = await ExerciseLibraryRepository.getAllExercises();
        setAvailableExercises(allExercises);
    };

    const openAddModal = async () => {
        await loadAvailableExercises();
        setSearchQuery('');
        setAddExerciseModalVisible(true);
    };

    const openSwapModal = async (index: number) => {
        await loadAvailableExercises();
        setSearchQuery('');
        setSwapExerciseIndex(index);
        setSwapModalVisible(true);
    };

    // Format elapsed time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Update exercise and trigger rest timer
    const handleUpdateExercise = async (index: number, field: string, value: any) => {
        const updated = [...exercises];
        updated[index] = { ...updated[index], [field]: value };
        setExercises(updated);

        // Persist to database
        if (sessionId && updated[index].id) {
            await WorkoutSessionRepository.updateSessionExercise(updated[index].id, {
                [field]: value
            });
        }

        // If completing an exercise, trigger rest timer
        if (field === 'completed' && value === true) {
            const exercise = updated[index];
            setRestTimerDuration(exercise.default_rest_seconds || 60);
            setRestTimerExercise(exercise.exercise_name);
            setRestTimerVisible(true);
        }
    };

    // Remove exercise
    const handleRemoveExercise = async (index: number) => {
        const exercise = exercises[index];
        if (sessionId && exercise.id) {
            await WorkoutSessionRepository.removeExerciseFromSession(exercise.id);
        }
        setExercises(exercises.filter((_, i) => i !== index));
    };

    // Add exercise from library
    const handleAddExercise = async (exercise: Exercise) => {
        if (!sessionId || !currentUser) return;

        const newExerciseId = await WorkoutSessionRepository.addExerciseToSession(
            sessionId,
            exercise.id,
            exercises.length
        );

        const newExercise: ExerciseCardData = {
            id: newExerciseId,
            exercise_id: exercise.id,
            exercise_name: exercise.name,
            actual_sets: 3,
            actual_reps: '10-12',
            actual_weight: null,
            completed: false,
            video_url: exercise.video_url,
            muscle_group: exercise.muscle_group,
            instructions: exercise.instructions,
            default_rest_seconds: exercise.default_rest_seconds,
        };

        setExercises([...exercises, newExercise]);
        setAddExerciseModalVisible(false);

        // Load ghost set for new exercise
        const perf = await WorkoutSessionRepository.getLastPerformance(currentUser.id, exercise.id);
        setLastPerformances(prev => ({ ...prev, [exercise.id]: perf }));
    };

    // Swap exercise (Quick Swap)
    const handleSwapExercise = async (newExercise: Exercise) => {
        if (swapExerciseIndex === null || !sessionId || !currentUser) return;

        const oldExercise = exercises[swapExerciseIndex];

        // Update in database
        await WorkoutSessionRepository.swapExercise(oldExercise.id, newExercise.id);

        // Update local state
        const updated = [...exercises];
        updated[swapExerciseIndex] = {
            ...oldExercise,
            exercise_id: newExercise.id,
            exercise_name: newExercise.name,
            video_url: newExercise.video_url,
            muscle_group: newExercise.muscle_group,
            instructions: newExercise.instructions,
            default_rest_seconds: newExercise.default_rest_seconds,
            actual_sets: null,
            actual_reps: null,
            actual_weight: null,
            completed: false,
        };
        setExercises(updated);
        setSwapModalVisible(false);
        setSwapExerciseIndex(null);

        // Load ghost set for swapped exercise
        const perf = await WorkoutSessionRepository.getLastPerformance(currentUser.id, newExercise.id);
        setLastPerformances(prev => ({ ...prev, [newExercise.id]: perf }));
    };

    // Show video modal
    const handleShowVideo = (exercise: ExerciseCardData) => {
        setSelectedExercise(exercise);
        setVideoModalVisible(true);
    };

    // Finish workout
    const handleFinishWorkout = async () => {
        const completedCount = exercises.filter(e => e.completed).length;
        const totalCount = exercises.length;

        if (completedCount < totalCount) {
            Alert.alert(
                'Treino Incompleto',
                `Você completou ${completedCount} de ${totalCount} exercícios. Deseja finalizar mesmo assim?`,
                [
                    { text: 'Continuar Treinando', style: 'cancel' },
                    {
                        text: 'Finalizar',
                        onPress: async () => {
                            await finishSession();
                        }
                    }
                ]
            );
        } else {
            await finishSession();
        }
    };

    const finishSession = async () => {
        if (sessionId) {
            await WorkoutSessionRepository.completeSession(sessionId);
        }

        setAlertConfig({
            visible: true,
            title: 'Treino Concluído! 💪',
            message: `Duração: ${formatTime(elapsedTime)}\n${exercises.filter(e => e.completed).length} exercícios completados`,
            type: 'success',
            onClose: () => {
                setAlertConfig({ visible: false });
                navigation.goBack();
            }
        });
    };

    // Cancel workout
    const handleCancelWorkout = () => {
        Alert.alert(
            'Cancelar Treino',
            'Tem certeza que deseja cancelar? O progresso será perdido.',
            [
                { text: 'Continuar', style: 'cancel' },
                {
                    text: 'Cancelar Treino',
                    style: 'destructive',
                    onPress: async () => {
                        if (sessionId) {
                            await WorkoutSessionRepository.deleteSession(sessionId);
                        }
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    // Filter exercises for search
    const filteredExercises = searchQuery
        ? availableExercises.filter(e =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.muscle_group.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : availableExercises;

    const completedCount = exercises.filter(e => e.completed).length;
    const progress = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;

    return (
        <Screen>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={alertConfig.onClose || (() => setAlertConfig({ visible: false }))}
            />

            {/* Rest Timer Overlay */}
            <RestTimerOverlay
                visible={restTimerVisible}
                duration={restTimerDuration}
                exerciseName={restTimerExercise}
                onComplete={() => setRestTimerVisible(false)}
                onSkip={() => setRestTimerVisible(false)}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancelWorkout} style={styles.backBtn}>
                    <X color={COLORS.white} size={24} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.title}>{templateName || 'Treino Livre'}</Text>
                    <View style={styles.timerRow}>
                        <Clock color={COLORS.lime} size={16} />
                        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={handleFinishWorkout} style={styles.finishBtn}>
                    <Check color={COLORS.lime} size={24} />
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{completedCount}/{exercises.length} exercícios</Text>
            </View>

            {/* Exercise List */}
            <FlatList
                data={exercises}
                keyExtractor={(item, index) => `exercise-${item.id || index}`}
                renderItem={({ item, index }) => (
                    <EditableExerciseCard
                        exercise={item}
                        index={index}
                        onUpdate={(field, value) => handleUpdateExercise(index, field, value)}
                        onRemove={() => handleRemoveExercise(index)}
                        onInfoPress={() => handleShowVideo(item)}
                        onSwap={() => openSwapModal(index)}
                        lastPerformance={lastPerformances[item.exercise_id]}
                        isEditable={true}
                    />
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Dumbbell color={COLORS.textSecondary} size={48} />
                        <Text style={styles.emptyText}>Nenhum exercício adicionado</Text>
                        <Text style={styles.emptySubtext}>Toque no + para adicionar exercícios</Text>
                    </View>
                }
            />

            {/* Add Exercise FAB */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={openAddModal}
            >
                <Plus color={COLORS.white} size={24} />
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
                <GradientButton
                    title={completedCount === exercises.length && exercises.length > 0 ? "Finalizar Treino 🎉" : "Marcar Concluído"}
                    onPress={handleFinishWorkout}
                />
            </View>

            {/* Video Modal */}
            <VideoInstructionModal
                visible={videoModalVisible}
                videoId={selectedExercise?.video_url || null}
                exerciseName={selectedExercise?.exercise_name || ''}
                instructions={selectedExercise?.instructions || null}
                muscleGroup={selectedExercise?.muscle_group}
                onClose={() => setVideoModalVisible(false)}
            />

            {/* Add Exercise Modal */}
            <Modal
                visible={addExerciseModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setAddExerciseModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Adicionar Exercício</Text>
                            <TouchableOpacity onPress={() => setAddExerciseModalVisible(false)}>
                                <X color={COLORS.white} size={24} />
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <GlassView style={styles.searchBar} intensity={10}>
                                <Search color={COLORS.textSecondary} size={18} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar exercício..."
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </GlassView>
                        </View>

                        <FlatList
                            data={filteredExercises}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.exerciseItem}
                                    onPress={() => handleAddExercise(item)}
                                >
                                    <View>
                                        <Text style={styles.exerciseItemName}>{item.name}</Text>
                                        <Text style={styles.exerciseItemMuscle}>{item.muscle_group}</Text>
                                    </View>
                                    <Plus color={COLORS.lime} size={20} />
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.exerciseList}
                        />
                    </View>
                </View>
            </Modal>

            {/* Swap Exercise Modal */}
            <Modal
                visible={swapModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setSwapModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Trocar Exercício</Text>
                            <TouchableOpacity onPress={() => setSwapModalVisible(false)}>
                                <X color={COLORS.white} size={24} />
                            </TouchableOpacity>
                        </View>

                        {swapExerciseIndex !== null && exercises[swapExerciseIndex] && (
                            <View style={styles.swapInfo}>
                                <Text style={styles.swapInfoText}>
                                    Trocando: <Text style={styles.swapInfoBold}>{exercises[swapExerciseIndex].exercise_name}</Text>
                                </Text>
                            </View>
                        )}

                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <GlassView style={styles.searchBar} intensity={10}>
                                <Search color={COLORS.textSecondary} size={18} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar exercício..."
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </GlassView>
                        </View>

                        <FlatList
                            data={filteredExercises}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.exerciseItem}
                                    onPress={() => handleSwapExercise(item)}
                                >
                                    <View>
                                        <Text style={styles.exerciseItemName}>{item.name}</Text>
                                        <Text style={styles.exerciseItemMuscle}>{item.muscle_group}</Text>
                                    </View>
                                    <Text style={styles.swapLabel}>Trocar</Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.exerciseList}
                        />
                    </View>
                </View>
            </Modal>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        paddingTop: SPACING.xl,
    },
    backBtn: {
        padding: SPACING.s,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: RADIUS.m,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginTop: 4,
    },
    timerText: {
        color: COLORS.lime,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    finishBtn: {
        padding: SPACING.s,
        backgroundColor: `${COLORS.lime}20`,
        borderRadius: RADIUS.m,
    },
    progressContainer: {
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: SPACING.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.lime,
        borderRadius: 3,
    },
    progressText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        textAlign: 'right',
    },
    list: {
        padding: SPACING.l,
        paddingBottom: 180,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyText: {
        color: COLORS.white,
        fontSize: SIZES.body,
        marginTop: SPACING.m,
    },
    emptySubtext: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginTop: SPACING.xs,
    },
    fab: {
        position: 'absolute',
        bottom: 120,
        right: SPACING.l,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.l,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    searchContainer: {
        padding: SPACING.l,
        paddingTop: SPACING.m,
        paddingBottom: 0,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        gap: SPACING.s,
    },
    searchInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: SIZES.body,
    },
    exerciseList: {
        padding: SPACING.l,
    },
    exerciseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    exerciseItemName: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '500',
    },
    exerciseItemMuscle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginTop: 2,
    },
    swapInfo: {
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
    },
    swapInfoText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    swapInfoBold: {
        color: COLORS.lime,
        fontWeight: '600',
    },
    swapLabel: {
        color: COLORS.blue,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
});
