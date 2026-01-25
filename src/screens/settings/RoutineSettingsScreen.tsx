import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { ChevronLeft, ChevronRight, Calendar, X, Check, Dumbbell, Plus } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { WorkoutTemplateRepository, TemplateWithExercises } from '../../services/WorkoutTemplateRepository';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const SHORT_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const RoutineSettingsScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [templates, setTemplates] = useState<TemplateWithExercises[]>([]);
    const [dayAssignments, setDayAssignments] = useState<{ [key: number]: TemplateWithExercises | null }>({});
    const [selectorVisible, setSelectorVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, [currentUser]);

    const loadData = async () => {
        if (!currentUser) return;
        const allTemplates = await WorkoutTemplateRepository.getWeeklyTemplates(currentUser.id);
        setTemplates(allTemplates);
        const assignments: { [key: number]: TemplateWithExercises | null } = {};
        for (let i = 0; i < 7; i++) {
            const template = allTemplates.find(t => t.day_assigned === i);
            assignments[i] = template || null;
        }
        setDayAssignments(assignments);
    };

    const handleDayPress = (dayIndex: number) => {
        setSelectedDay(dayIndex);
        setSelectorVisible(true);
    };

    const handleSelectTemplate = async (template: TemplateWithExercises | null) => {
        if (!currentUser || selectedDay === null) return;
        if (template) {
            await WorkoutTemplateRepository.assignTemplateToDay(currentUser.id, template.id, selectedDay);
        } else {
            const current = dayAssignments[selectedDay];
            if (current) {
                await WorkoutTemplateRepository.assignTemplateToDay(currentUser.id, current.id, null);
            }
        }
        setSelectorVisible(false);
        loadData();
    };

    const today = new Date().getDay();
    const unassignedTemplates = templates.filter(t => t.day_assigned === null || t.day_assigned === selectedDay);

    return (
        <Screen>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={COLORS.white} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Configurar Rotina</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Description */}
            <View style={styles.descCard}>
                <Calendar color={COLORS.lime} size={20} />
                <Text style={styles.descText}>Vincule seus templates de treino a cada dia da semana</Text>
            </View>

            {/* Days Grid */}
            <ScrollView contentContainerStyle={styles.content}>
                {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => {
                    const template = dayAssignments[dayIndex];
                    const isToday = today === dayIndex;
                    const isRest = template?.name.toLowerCase().includes('descanso');

                    return (
                        <TouchableOpacity
                            key={dayIndex}
                            onPress={() => handleDayPress(dayIndex)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.dayCard, isToday && styles.dayCardToday]}>
                                <View style={styles.dayHeader}>
                                    <View style={styles.dayLeft}>
                                        <View style={[styles.dayIndicator, { backgroundColor: template ? (isRest ? COLORS.textSecondary : COLORS.lime) : 'transparent' }]} />
                                        <Text style={styles.dayName}>{DAYS[dayIndex]}</Text>
                                        {isToday && (
                                            <View style={styles.todayBadge}>
                                                <Text style={styles.todayText}>Hoje</Text>
                                            </View>
                                        )}
                                    </View>
                                    <ChevronRight color={COLORS.textSecondary} size={20} />
                                </View>
                                {template ? (
                                    <View style={styles.templateInfo}>
                                        <Text style={styles.templateName}>{template.name}</Text>
                                        <Text style={styles.templateCount}>{template.exercises.length} exercícios</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.noTemplate}>Nenhum treino vinculado</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Modal */}
            <Modal visible={selectorVisible} transparent animationType="slide" onRequestClose={() => setSelectorVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBg} onPress={() => setSelectorVisible(false)} />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selectedDay !== null ? DAYS[selectedDay] : ''}</Text>
                            <TouchableOpacity onPress={() => setSelectorVisible(false)}>
                                <X color={COLORS.white} size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Current */}
                            {selectedDay !== null && dayAssignments[selectedDay] && (
                                <View style={styles.currentSection}>
                                    <Text style={styles.sectionLabel}>Treino Atual</Text>
                                    <View style={styles.currentCard}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.currentName}>{dayAssignments[selectedDay]!.name}</Text>
                                            <Text style={styles.currentCount}>{dayAssignments[selectedDay]!.exercises.length} exercícios</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleSelectTemplate(null)} style={styles.removeBtn}>
                                            <X color={COLORS.danger} size={20} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* Avaliable Templates */}
                            <Text style={styles.sectionLabel}>Meus Treinos Salvos</Text>

                            {/* Create Button always visible */}
                            <TouchableOpacity
                                style={styles.createBtn}
                                onPress={() => {
                                    setSelectorVisible(false);
                                    // Navigate to Create Template Screen (assuming it exists in stack)
                                    // If not, we might need to add it to the stack or route properly
                                    navigation.navigate('CreateTemplate');
                                }}
                            >
                                <View style={styles.createIcon}>
                                    <Plus color={COLORS.black} size={18} />
                                </View>
                                <Text style={styles.createText}>Criar Novo Treino</Text>
                            </TouchableOpacity>

                            {unassignedTemplates.length > 0 ? (
                                unassignedTemplates.map(t => (
                                    <TouchableOpacity key={t.id} style={styles.templateOption} onPress={() => handleSelectTemplate(t)}>
                                        <View style={styles.templateOptionIcon}>
                                            <Dumbbell color={COLORS.lime} size={18} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.templateOptionName}>{t.name}</Text>
                                            <Text style={styles.templateOptionCount}>{t.exercises.length} exercícios</Text>
                                        </View>
                                        <Check color={COLORS.lime} size={20} />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>Nenhum outro treino encontrado.</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.m, paddingTop: SPACING.l },
    backBtn: { padding: 8, backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    title: { color: COLORS.white, fontSize: SIZES.h3, fontWeight: 'bold' },
    descCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.l, marginBottom: SPACING.l, padding: SPACING.m, backgroundColor: 'rgba(163, 230, 53, 0.1)', borderRadius: RADIUS.m, borderWidth: 1, borderColor: 'rgba(163, 230, 53, 0.2)', gap: SPACING.s },
    descText: { color: COLORS.white, fontSize: SIZES.small, flex: 1 },
    content: { paddingHorizontal: SPACING.l, paddingBottom: 100 },
    dayCard: { backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.m, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    dayCardToday: { borderColor: COLORS.lime, borderWidth: 1.5 },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.s },
    dayLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s },
    dayIndicator: { width: 8, height: 8, borderRadius: 4 },
    dayName: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '600' },
    todayBadge: { backgroundColor: COLORS.lime, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    todayText: { color: COLORS.background, fontSize: 10, fontWeight: 'bold' },
    templateInfo: { marginTop: SPACING.xs },
    templateName: { color: COLORS.lime, fontSize: SIZES.body, fontWeight: '600' },
    templateCount: { color: COLORS.textSecondary, fontSize: SIZES.small, marginTop: 2 },
    noTemplate: { color: COLORS.textSecondary, fontSize: SIZES.small, fontStyle: 'italic' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.l, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    modalTitle: { color: COLORS.white, fontSize: SIZES.h3, fontWeight: 'bold' },
    modalBody: { padding: SPACING.l },
    currentSection: { marginBottom: SPACING.l },
    sectionLabel: { color: COLORS.textSecondary, fontSize: SIZES.small, fontWeight: '600', marginBottom: SPACING.s },
    currentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: SPACING.m, borderRadius: RADIUS.m },
    currentName: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '600' },
    currentCount: { color: COLORS.textSecondary, fontSize: SIZES.small, marginTop: 2 },
    removeBtn: { padding: SPACING.s },
    templateOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: SPACING.m, borderRadius: RADIUS.m, marginBottom: SPACING.s, gap: SPACING.m },
    templateOptionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(163, 230, 53, 0.15)', alignItems: 'center', justifyContent: 'center' },
    templateOptionName: { color: COLORS.white, fontSize: SIZES.body, fontWeight: '600' },
    templateOptionCount: { color: COLORS.textSecondary, fontSize: SIZES.small, marginTop: 2 },
    emptyState: { alignItems: 'center', paddingVertical: SPACING.l },
    emptyText: { color: COLORS.textSecondary, marginTop: SPACING.s, fontStyle: 'italic' },

    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lime,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        gap: SPACING.m
    },
    createIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    createText: {
        color: COLORS.black,
        fontSize: SIZES.body,
        fontWeight: 'bold'
    }
});
