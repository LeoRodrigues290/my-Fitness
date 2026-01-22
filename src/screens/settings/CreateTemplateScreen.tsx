import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { GradientButton } from '../../components/ui/GradientButton';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { ChevronLeft, Plus, X, Trash2, GripVertical, Dumbbell } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { WorkoutTemplateRepository, TemplateExercise } from '../../services/WorkoutTemplateRepository';
import { ExerciseLibraryRepository, Exercise } from '../../services/ExerciseLibraryRepository';

interface CreateTemplateScreenProps {
    navigation: any;
    route: {
        params?: {
            templateId?: number;
            dayAssigned?: number;
        };
    };
}

interface LocalExercise {
    tempId: string;
    exercise_id: number;
    exercise_name: string;
    target_sets: number;
    target_reps: string;
    target_weight: number | null;
    muscle_group?: string;
}

export const CreateTemplateScreen: React.FC<CreateTemplateScreenProps> = ({ navigation, route }) => {
    const { currentUser } = useUser();
    const { templateId, dayAssigned } = route.params || {};
    const isEditing = !!templateId;

    const [templateName, setTemplateName] = useState('');
    const [exercises, setExercises] = useState<LocalExercise[]>([]);
    const [alertConfig, setAlertConfig] = useState<any>({ visible: false });

    // Add Exercise Modal
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Load template if editing
    useEffect(() => {
        if (templateId) {
            loadTemplate();
        }
        loadAvailableExercises();
    }, [templateId]);

    const loadTemplate = async () => {
        const template = await WorkoutTemplateRepository.getTemplateById(templateId!);
        if (template) {
            setTemplateName(template.name);
            setExercises(template.exercises.map(e => ({
                tempId: `ex-${e.id}`,
                exercise_id: e.exercise_id,
                exercise_name: e.exercise_name || '',
                target_sets: e.target_sets,
                target_reps: e.target_reps,
                target_weight: e.target_weight,
                muscle_group: e.muscle_group,
            })));
        }
    };

    const loadAvailableExercises = async () => {
        const all = await ExerciseLibraryRepository.getAllExercises();
        setAvailableExercises(all);
    };

    const handleAddExercise = (exercise: Exercise) => {
        const newExercise: LocalExercise = {
            tempId: `new-${Date.now()}-${Math.random()}`,
            exercise_id: exercise.id,
            exercise_name: exercise.name,
            target_sets: 3,
            target_reps: '10-12',
            target_weight: null,
            muscle_group: exercise.muscle_group,
        };
        setExercises([...exercises, newExercise]);
        setAddModalVisible(false);
    };

    const handleRemoveExercise = (tempId: string) => {
        setExercises(exercises.filter(e => e.tempId !== tempId));
    };

    const handleUpdateExercise = (tempId: string, field: keyof LocalExercise, value: any) => {
        setExercises(exercises.map(e =>
            e.tempId === tempId ? { ...e, [field]: value } : e
        ));
    };

    const handleSave = async () => {
        if (!currentUser) return;

        if (!templateName.trim()) {
            setAlertConfig({
                visible: true,
                title: 'Nome Obrigatório',
                message: 'Dê um nome ao seu template de treino.',
                type: 'error'
            });
            return;
        }

        if (exercises.length === 0) {
            setAlertConfig({
                visible: true,
                title: 'Sem Exercícios',
                message: 'Adicione pelo menos um exercício ao template.',
                type: 'error'
            });
            return;
        }

        try {
            let id = templateId;

            if (isEditing) {
                // Update existing template
                await WorkoutTemplateRepository.updateTemplate(templateId!, { name: templateName });

                // Remove all existing exercises and re-add (simpler than diffing)
                const existing = await WorkoutTemplateRepository.getTemplateById(templateId!);
                if (existing) {
                    for (const ex of existing.exercises) {
                        await WorkoutTemplateRepository.removeExerciseFromTemplate(ex.id);
                    }
                }
            } else {
                // Create new template
                id = await WorkoutTemplateRepository.createTemplate(
                    currentUser.id,
                    templateName,
                    dayAssigned ?? null
                );
            }

            // Add exercises
            for (let i = 0; i < exercises.length; i++) {
                const ex = exercises[i];
                await WorkoutTemplateRepository.addExerciseToTemplate(
                    id!,
                    ex.exercise_id,
                    ex.target_sets,
                    ex.target_reps,
                    ex.target_weight
                );
            }

            setAlertConfig({
                visible: true,
                title: 'Sucesso!',
                message: isEditing ? 'Template atualizado com sucesso!' : 'Template criado com sucesso!',
                type: 'success',
                onClose: () => {
                    setAlertConfig({ visible: false });
                    navigation.goBack();
                }
            });
        } catch (error) {
            setAlertConfig({
                visible: true,
                title: 'Erro',
                message: 'Não foi possível salvar o template.',
                type: 'error'
            });
        }
    };

    const filteredExercises = searchQuery
        ? availableExercises.filter(e =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.muscle_group.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : availableExercises;

    const renderExercise = ({ item, index }: { item: LocalExercise; index: number }) => (
        <GlassView style={styles.exerciseCard} intensity={15}>
            <View style={styles.exerciseHeader}>
                <View style={styles.exerciseIndex}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{item.exercise_name}</Text>
                    {item.muscle_group && (
                        <Text style={styles.exerciseMuscle}>{item.muscle_group}</Text>
                    )}
                </View>
                <TouchableOpacity
                    onPress={() => handleRemoveExercise(item.tempId)}
                    style={styles.removeBtn}
                >
                    <Trash2 color={COLORS.danger} size={18} />
                </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Séries</Text>
                    <GlassView style={styles.inputContainer} intensity={10}>
                        <TextInput
                            style={styles.input}
                            value={item.target_sets.toString()}
                            onChangeText={(v) => handleUpdateExercise(item.tempId, 'target_sets', parseInt(v) || 0)}
                            keyboardType="numeric"
                            placeholder="3"
                            placeholderTextColor={COLORS.textSecondary}
                        />
                    </GlassView>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Repetições</Text>
                    <GlassView style={styles.inputContainer} intensity={10}>
                        <TextInput
                            style={styles.input}
                            value={item.target_reps}
                            onChangeText={(v) => handleUpdateExercise(item.tempId, 'target_reps', v)}
                            placeholder="10-12"
                            placeholderTextColor={COLORS.textSecondary}
                        />
                    </GlassView>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Peso (kg)</Text>
                    <GlassView style={styles.inputContainer} intensity={10}>
                        <TextInput
                            style={styles.input}
                            value={item.target_weight?.toString() || ''}
                            onChangeText={(v) => handleUpdateExercise(item.tempId, 'target_weight', parseFloat(v) || null)}
                            keyboardType="numeric"
                            placeholder="-"
                            placeholderTextColor={COLORS.textSecondary}
                        />
                    </GlassView>
                </View>
            </View>
        </GlassView>
    );

    return (
        <Screen>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={alertConfig.onClose || (() => setAlertConfig({ visible: false }))}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={COLORS.white} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>{isEditing ? 'Editar Template' : 'Novo Template'}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Template Name */}
            <View style={styles.nameContainer}>
                <Text style={styles.label}>Nome do Template</Text>
                <GlassView style={styles.nameInput} intensity={10}>
                    <Dumbbell color={COLORS.primary} size={20} />
                    <TextInput
                        style={styles.nameTextInput}
                        value={templateName}
                        onChangeText={setTemplateName}
                        placeholder="ex: Treino de Peito"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>
            </View>

            {/* Day assignment indicator */}
            {dayAssigned !== undefined && (
                <View style={styles.dayIndicator}>
                    <Text style={styles.dayText}>
                        Será vinculado a: {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayAssigned]}
                    </Text>
                </View>
            )}

            {/* Exercises Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Exercícios ({exercises.length})</Text>
                <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addBtn}>
                    <Plus color={COLORS.lime} size={18} />
                    <Text style={styles.addBtnText}>Adicionar</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={exercises}
                keyExtractor={(item) => item.tempId}
                renderItem={renderExercise}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Dumbbell color={COLORS.textSecondary} size={48} />
                        <Text style={styles.emptyText}>Nenhum exercício adicionado</Text>
                        <Text style={styles.emptySubtext}>Toque em "Adicionar" para incluir exercícios</Text>
                    </View>
                }
            />

            {/* Save Button */}
            <View style={styles.footer}>
                <GradientButton title="Salvar Template" onPress={handleSave} />
            </View>

            {/* Add Exercise Modal */}
            <Modal
                visible={addModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Adicionar Exercício</Text>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                                <X color={COLORS.white} size={24} />
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <GlassView style={styles.searchBar} intensity={10}>
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
    nameContainer: {
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginBottom: SPACING.xs,
        marginLeft: SPACING.xs,
    },
    nameInput: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        gap: SPACING.m,
    },
    nameTextInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: SIZES.body,
    },
    dayIndicator: {
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
    },
    dayText: {
        color: COLORS.lime,
        fontSize: SIZES.small,
        fontStyle: 'italic',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
    },
    sectionTitle: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.m,
        backgroundColor: `${COLORS.lime}20`,
        borderRadius: RADIUS.m,
    },
    addBtnText: {
        color: COLORS.lime,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    list: {
        padding: SPACING.l,
        paddingBottom: 120,
    },
    exerciseCard: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    exerciseIndex: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: `${COLORS.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    indexText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: SIZES.small,
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    exerciseMuscle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
        marginTop: 2,
    },
    removeBtn: {
        padding: SPACING.s,
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
    inputContainer: {
        borderRadius: RADIUS.s,
    },
    input: {
        color: COLORS.white,
        padding: SPACING.s,
        fontSize: SIZES.body,
        textAlign: 'center',
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
        maxHeight: '80%',
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
        paddingBottom: 0,
    },
    searchBar: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
    },
    searchInput: {
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
});
