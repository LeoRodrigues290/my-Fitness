import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { GradientButton } from '../../components/ui/GradientButton';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { ChevronLeft, Plus, Search, Edit3, Trash2, X, Play, Dumbbell } from 'lucide-react-native';
import { ExerciseLibraryRepository, Exercise } from '../../services/ExerciseLibraryRepository';

export const ExerciseLibraryScreen = ({ navigation }: any) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
    const [alertConfig, setAlertConfig] = useState<any>({ visible: false });

    // Add/Edit Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        muscle_group: '',
        video_url: '',
        instructions: ''
    });

    const loadExercises = async () => {
        const data = await ExerciseLibraryRepository.getAllExercises();
        setExercises(data);
        setFilteredExercises(data);

        const groups = await ExerciseLibraryRepository.getMuscleGroups();
        setMuscleGroups(groups);
    };

    useFocusEffect(
        useCallback(() => {
            loadExercises();
        }, [])
    );

    // Filter exercises
    useEffect(() => {
        let filtered = exercises;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(e =>
                e.name.toLowerCase().includes(query) ||
                e.muscle_group.toLowerCase().includes(query)
            );
        }

        if (selectedMuscle) {
            filtered = filtered.filter(e => e.muscle_group === selectedMuscle);
        }

        setFilteredExercises(filtered);
    }, [searchQuery, selectedMuscle, exercises]);

    const handleAddNew = () => {
        setEditingExercise(null);
        setFormData({ name: '', muscle_group: '', video_url: '', instructions: '' });
        setModalVisible(true);
    };

    const handleEdit = (exercise: Exercise) => {
        setEditingExercise(exercise);
        setFormData({
            name: exercise.name,
            muscle_group: exercise.muscle_group,
            video_url: exercise.video_url || '',
            instructions: exercise.instructions || ''
        });
        setModalVisible(true);
    };

    const handleDelete = (exercise: Exercise) => {
        Alert.alert(
            'Excluir Exercício',
            `Deseja excluir "${exercise.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        await ExerciseLibraryRepository.deleteExercise(exercise.id);
                        loadExercises();
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.muscle_group.trim()) {
            setAlertConfig({
                visible: true,
                title: 'Campos Obrigatórios',
                message: 'Preencha o nome e o grupo muscular.',
                type: 'error'
            });
            return;
        }

        try {
            if (editingExercise) {
                await ExerciseLibraryRepository.updateExercise(editingExercise.id, {
                    name: formData.name,
                    muscle_group: formData.muscle_group,
                    video_url: formData.video_url || null,
                    instructions: formData.instructions || null
                });
            } else {
                await ExerciseLibraryRepository.addExercise(
                    formData.name,
                    formData.muscle_group,
                    formData.video_url || null,
                    formData.instructions || null
                );
            }

            setModalVisible(false);
            loadExercises();
            setAlertConfig({
                visible: true,
                title: 'Sucesso',
                message: editingExercise ? 'Exercício atualizado!' : 'Exercício adicionado!',
                type: 'success'
            });
        } catch (error) {
            setAlertConfig({
                visible: true,
                title: 'Erro',
                message: 'Não foi possível salvar o exercício.',
                type: 'error'
            });
        }
    };

    const renderExercise = ({ item }: { item: Exercise }) => (
        <GlassView style={styles.exerciseCard} intensity={15}>
            <View style={styles.exerciseInfo}>
                <View style={styles.exerciseIcon}>
                    <Dumbbell color={COLORS.lime} size={20} />
                </View>
                <View style={styles.exerciseText}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <View style={styles.exerciseMeta}>
                        <Text style={styles.exerciseMuscle}>{item.muscle_group}</Text>
                        {item.video_url && (
                            <View style={styles.videoIndicator}>
                                <Play color={COLORS.blue} size={12} />
                                <Text style={styles.videoText}>Vídeo</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.exerciseActions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
                    <Edit3 color={COLORS.textSecondary} size={18} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                    <Trash2 color={COLORS.danger} size={18} />
                </TouchableOpacity>
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
                onClose={() => setAlertConfig({ visible: false })}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={COLORS.white} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Biblioteca de Exercícios</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <GlassView style={styles.searchBar} intensity={10}>
                    <Search color={COLORS.textSecondary} size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar exercício..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X color={COLORS.textSecondary} size={18} />
                        </TouchableOpacity>
                    )}
                </GlassView>
            </View>

            {/* Muscle Group Filters */}
            <FlatList
                horizontal
                data={['Todos', ...muscleGroups]}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterList}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            (item === 'Todos' ? selectedMuscle === null : selectedMuscle === item) && styles.filterChipActive
                        ]}
                        onPress={() => setSelectedMuscle(item === 'Todos' ? null : item)}
                    >
                        <Text style={[
                            styles.filterChipText,
                            (item === 'Todos' ? selectedMuscle === null : selectedMuscle === item) && styles.filterChipTextActive
                        ]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Exercise Count */}
            <View style={styles.countContainer}>
                <Text style={styles.countText}>{filteredExercises.length} exercícios</Text>
            </View>

            {/* Exercise List */}
            <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderExercise}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Dumbbell color={COLORS.textSecondary} size={48} />
                        <Text style={styles.emptyText}>Nenhum exercício encontrado</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={handleAddNew} activeOpacity={0.8}>
                <Plus color={COLORS.white} size={24} />
            </TouchableOpacity>

            {/* Add/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X color={COLORS.white} size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Nome do Exercício *</Text>
                            <GlassView style={styles.inputContainer} intensity={10}>
                                <TextInput
                                    style={styles.input}
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    placeholder="ex: Supino Reto"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </GlassView>

                            <Text style={styles.label}>Grupo Muscular *</Text>
                            <GlassView style={styles.inputContainer} intensity={10}>
                                <TextInput
                                    style={styles.input}
                                    value={formData.muscle_group}
                                    onChangeText={(text) => setFormData({ ...formData, muscle_group: text })}
                                    placeholder="ex: Peito"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </GlassView>

                            <Text style={styles.label}>ID do Vídeo (YouTube)</Text>
                            <GlassView style={styles.inputContainer} intensity={10}>
                                <TextInput
                                    style={styles.input}
                                    value={formData.video_url}
                                    onChangeText={(text) => setFormData({ ...formData, video_url: text })}
                                    placeholder="ex: dQw4w9WgXcQ"
                                    placeholderTextColor={COLORS.textSecondary}
                                />
                            </GlassView>

                            <Text style={styles.label}>Instruções</Text>
                            <GlassView style={[styles.inputContainer, { height: 100 }]} intensity={10}>
                                <TextInput
                                    style={[styles.input, { textAlignVertical: 'top' }]}
                                    value={formData.instructions}
                                    onChangeText={(text) => setFormData({ ...formData, instructions: text })}
                                    placeholder="Descreva como executar o exercício..."
                                    placeholderTextColor={COLORS.textSecondary}
                                    multiline
                                    numberOfLines={4}
                                />
                            </GlassView>

                            <GradientButton
                                title={editingExercise ? 'Salvar Alterações' : 'Adicionar Exercício'}
                                onPress={handleSave}
                                style={{ marginTop: SPACING.l }}
                            />
                        </View>
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
    searchContainer: {
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
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
    filterList: {
        paddingHorizontal: SPACING.l,
        gap: SPACING.s,
        marginBottom: SPACING.m,
    },
    filterChip: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.m,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: SPACING.s,
    },
    filterChipActive: {
        backgroundColor: COLORS.lime,
    },
    filterChipText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: COLORS.background,
    },
    countContainer: {
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.s,
    },
    countText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    list: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    exerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
    },
    exerciseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    exerciseIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${COLORS.lime}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    exerciseText: {
        flex: 1,
    },
    exerciseName: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    exerciseMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
        marginTop: 2,
    },
    exerciseMuscle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    videoIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    videoText: {
        color: COLORS.blue,
        fontSize: SIZES.tiny,
    },
    exerciseActions: {
        flexDirection: 'row',
        gap: SPACING.s,
    },
    actionBtn: {
        padding: SPACING.s,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.m,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingBottom: SPACING.xl,
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
    form: {
        padding: SPACING.l,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginBottom: SPACING.xs,
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
});
