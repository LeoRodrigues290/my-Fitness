import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { GradientButton } from '../../components/ui/GradientButton';
import { CustomAlert } from '../../components/ui/CustomAlert';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { ChevronLeft, Plus, Search, Edit3, Trash2, X, Dumbbell } from 'lucide-react-native';
import { ExerciseLibraryRepository, Exercise } from '../../services/ExerciseLibraryRepository';

const ITEMS_PER_PAGE = 10;

export const ExerciseLibraryScreen = ({ navigation }: any) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [displayedExercises, setDisplayedExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
    const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
    const [alertConfig, setAlertConfig] = useState<any>({ visible: false });
    const [showAll, setShowAll] = useState(false);

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
        const groups = await ExerciseLibraryRepository.getMuscleGroups();
        setMuscleGroups(groups);
    };

    useEffect(() => {
        loadExercises();
    }, []);

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
        setDisplayedExercises(showAll ? filtered : filtered.slice(0, ITEMS_PER_PAGE));
    }, [searchQuery, selectedMuscle, exercises, showAll]);

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

    const handleDelete = async (exercise: Exercise) => {
        await ExerciseLibraryRepository.deleteExercise(exercise.id);
        loadExercises();
        setAlertConfig({
            visible: true,
            title: 'Removido',
            message: `${exercise.name} foi excluído.`,
            type: 'success'
        });
    };

    const handleSave = async () => {
        Keyboard.dismiss();
        if (!formData.name.trim() || !formData.muscle_group.trim()) {
            setAlertConfig({
                visible: true,
                title: 'Erro',
                message: 'Preencha nome e grupo muscular.',
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
        } catch (error) {
            setAlertConfig({ visible: true, title: 'Erro', message: 'Falha ao salvar.', type: 'error' });
        }
    };

    const totalExercises = exercises.filter(e => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            if (!e.name.toLowerCase().includes(q) && !e.muscle_group.toLowerCase().includes(q)) return false;
        }
        if (selectedMuscle && e.muscle_group !== selectedMuscle) return false;
        return true;
    }).length;

    return (
        <Screen keyboardAvoiding dismissKeyboardOnTap>
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
                <View style={{ width: 40 }} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
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
                            <X color={COLORS.textSecondary} size={20} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                >
                    <TouchableOpacity
                        style={[styles.filterPill, !selectedMuscle && styles.filterPillActive]}
                        onPress={() => setSelectedMuscle(null)}
                    >
                        <Text style={[styles.filterText, !selectedMuscle && styles.filterTextActive]}>Todos</Text>
                    </TouchableOpacity>
                    {muscleGroups.map(g => (
                        <TouchableOpacity
                            key={g}
                            style={[styles.filterPill, selectedMuscle === g && styles.filterPillActive]}
                            onPress={() => setSelectedMuscle(g)}
                        >
                            <Text style={[styles.filterText, selectedMuscle === g && styles.filterTextActive]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Count */}
            <Text style={styles.count}>{totalExercises} exercícios</Text>

            {/* List */}
            <FlatList
                data={displayedExercises}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardIcon}>
                            <Dumbbell color={COLORS.lime} size={22} />
                        </View>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardName}>{item.name}</Text>
                            <Text style={styles.cardMuscle}>{item.muscle_group}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.cardBtn}>
                            <Edit3 color={COLORS.blue} size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.cardBtn}>
                            <Trash2 color={COLORS.danger} size={18} />
                        </TouchableOpacity>
                    </View>
                )}
                ListFooterComponent={
                    !showAll && totalExercises > ITEMS_PER_PAGE ? (
                        <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setShowAll(true)}>
                            <Text style={styles.loadMoreText}>Carregar todos ({totalExercises - ITEMS_PER_PAGE} restantes)</Text>
                        </TouchableOpacity>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Dumbbell color={COLORS.textSecondary} size={48} />
                        <Text style={styles.emptyText}>Nenhum exercício encontrado</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={handleAddNew}>
                <Plus color={COLORS.background} size={28} />
            </TouchableOpacity>

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBg} onPress={() => setModalVisible(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingExercise ? 'Editar' : 'Novo'} Exercício</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X color={COLORS.white} size={24} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.label}>Nome *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(t) => setFormData({ ...formData, name: t })}
                                placeholder="Ex: Supino Reto"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                            <Text style={styles.label}>Grupo Muscular *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.muscle_group}
                                onChangeText={(t) => setFormData({ ...formData, muscle_group: t })}
                                placeholder="Ex: Peito"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                            <Text style={styles.label}>YouTube ID</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.video_url}
                                onChangeText={(t) => setFormData({ ...formData, video_url: t })}
                                placeholder="Ex: dQw4w9WgXcQ"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                            <Text style={styles.label}>Instruções</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                value={formData.instructions}
                                onChangeText={(t) => setFormData({ ...formData, instructions: t })}
                                placeholder="Como executar..."
                                placeholderTextColor={COLORS.textSecondary}
                                multiline
                            />
                            <GradientButton title="Salvar" onPress={handleSave} style={{ marginTop: SPACING.l, marginBottom: SPACING.xl }} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.m, paddingTop: SPACING.l },
    backBtn: { padding: 8, backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    title: { color: COLORS.white, fontSize: SIZES.h3, fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: SPACING.l, marginBottom: SPACING.m },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: RADIUS.m, padding: SPACING.m, gap: SPACING.s, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    searchInput: { flex: 1, color: COLORS.white, fontSize: SIZES.body },
    filterContainer: { marginBottom: SPACING.s },
    filterContent: { paddingHorizontal: SPACING.l, gap: SPACING.s, paddingBottom: 4 },
    filterPill: {
        paddingHorizontal: SPACING.m * 1.5, // Increased padding
        paddingVertical: SPACING.s,
        borderRadius: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        minWidth: 80, // Minimum width
        alignItems: 'center',
        justifyContent: 'center'
    },
    filterPillActive: { backgroundColor: COLORS.lime, borderColor: COLORS.lime },
    filterText: { color: COLORS.textSecondary, fontSize: SIZES.small, fontWeight: '600' },
    filterTextActive: { color: COLORS.background },
    count: { color: COLORS.textSecondary, fontSize: SIZES.small, paddingHorizontal: SPACING.l, marginBottom: SPACING.s },
    list: { paddingHorizontal: SPACING.l, paddingBottom: 120 },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.s, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${COLORS.lime}20`, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.m },
    cardInfo: { flex: 1 },
    cardName: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '600' },
    cardMuscle: { color: COLORS.textSecondary, fontSize: SIZES.small, marginTop: 2 },
    cardBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(30, 41, 59, 0.8)', alignItems: 'center', justifyContent: 'center', marginLeft: SPACING.xs },
    loadMoreBtn: { alignItems: 'center', padding: SPACING.l, marginTop: SPACING.m },
    loadMoreText: { color: COLORS.lime, fontSize: SIZES.body, fontWeight: '600' },
    empty: { alignItems: 'center', paddingVertical: SPACING.xxl },
    emptyText: { color: COLORS.textSecondary, marginTop: SPACING.m },
    fab: { position: 'absolute', bottom: 100, right: SPACING.l, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.lime, alignItems: 'center', justifyContent: 'center', elevation: 8 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.l, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    modalTitle: { color: COLORS.white, fontSize: SIZES.h3, fontWeight: 'bold' },
    modalBody: { padding: SPACING.l },
    label: { color: COLORS.textSecondary, fontSize: SIZES.small, marginBottom: SPACING.xs, marginTop: SPACING.m },
    input: { backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: RADIUS.m, padding: SPACING.m, color: COLORS.white, fontSize: SIZES.body, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
});
