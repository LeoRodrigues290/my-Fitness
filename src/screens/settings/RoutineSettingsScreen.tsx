import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { ChevronLeft, ChevronRight, Plus, Calendar, Dumbbell, X, Edit3 } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { WorkoutTemplateRepository, WorkoutTemplate, TemplateWithExercises } from '../../services/WorkoutTemplateRepository';
import { GradientButton } from '../../components/ui/GradientButton';
import { CustomAlert } from '../../components/ui/CustomAlert';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const RoutineSettingsScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [templates, setTemplates] = useState<TemplateWithExercises[]>([]);
    const [dayAssignments, setDayAssignments] = useState<{ [key: number]: TemplateWithExercises | null }>({});
    const [alertConfig, setAlertConfig] = useState<any>({ visible: false });

    // Template selector modal
    const [selectorVisible, setSelectorVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const loadData = async () => {
        if (!currentUser) return;

        const allTemplates = await WorkoutTemplateRepository.getWeeklyTemplates(currentUser.id);
        setTemplates(allTemplates);

        // Build day assignments map
        const assignments: { [key: number]: TemplateWithExercises | null } = {};
        for (let i = 0; i < 7; i++) {
            const template = allTemplates.find(t => t.day_assigned === i);
            assignments[i] = template || null;
        }
        setDayAssignments(assignments);
    };

    useEffect(() => {
        loadData();
    }, [currentUser]);

    const handleDayPress = (dayIndex: number) => {
        setSelectedDay(dayIndex);
        setSelectorVisible(true);
    };

    const handleSelectTemplate = async (template: TemplateWithExercises | null) => {
        if (!currentUser || selectedDay === null) return;

        if (template) {
            await WorkoutTemplateRepository.assignTemplateToDay(currentUser.id, template.id, selectedDay);
        } else {
            // Unassign current template from this day
            const current = dayAssignments[selectedDay];
            if (current) {
                await WorkoutTemplateRepository.assignTemplateToDay(currentUser.id, current.id, null);
            }
        }

        setSelectorVisible(false);
        loadData();
    };

    const handleCreateTemplate = () => {
        setSelectorVisible(false);
        navigation.navigate('CreateTemplate', { dayAssigned: selectedDay });
    };

    const handleEditTemplate = (template: TemplateWithExercises) => {
        setSelectorVisible(false);
        navigation.navigate('CreateTemplate', { templateId: template.id });
    };

    const getTemplateColor = (dayIndex: number) => {
        const template = dayAssignments[dayIndex];
        if (!template) return COLORS.textSecondary;

        // Check if it's a rest day
        const isRest = template.name.toLowerCase().includes('descanso');
        return isRest ? COLORS.textSecondary : COLORS.lime;
    };

    const renderDayCard = (dayIndex: number) => {
        const template = dayAssignments[dayIndex];
        const isToday = new Date().getDay() === dayIndex;

        return (
            <TouchableOpacity
                key={dayIndex}
                onPress={() => handleDayPress(dayIndex)}
                activeOpacity={0.8}
            >
                <GlassView
                    style={[
                        styles.dayCard,
                        isToday && styles.dayCardToday
                    ]}
                    intensity={15}
                >
                    <View style={styles.dayHeader}>
                        <View style={styles.dayInfo}>
                            <View style={[styles.dayIndicator, { backgroundColor: getTemplateColor(dayIndex) }]} />
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
                            <Text style={styles.exerciseCount}>
                                {template.exercises.length} exercício{template.exercises.length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.templateInfo}>
                            <Text style={styles.noTemplate}>Nenhum treino vinculado</Text>
                            <Text style={styles.tapToAdd}>Toque para vincular</Text>
                        </View>
                    )}
                </GlassView>
            </TouchableOpacity>
        );
    };

    // Get unassigned templates for selector
    const unassignedTemplates = templates.filter(t => t.day_assigned === null || t.day_assigned === selectedDay);

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
                <Text style={styles.title}>Configurar Rotina</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
                <Calendar color={COLORS.lime} size={20} />
                <Text style={styles.description}>
                    Vincule seus templates de treino a cada dia da semana
                </Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickAction}
                    onPress={() => navigation.navigate('ExerciseLibrary')}
                >
                    <Dumbbell color={COLORS.blue} size={18} />
                    <Text style={styles.quickActionText}>Gerenciar Exercícios</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.quickAction}
                    onPress={() => navigation.navigate('CreateTemplate')}
                >
                    <Plus color={COLORS.lime} size={18} />
                    <Text style={styles.quickActionText}>Novo Template</Text>
                </TouchableOpacity>
            </View>

            {/* Days List */}
            <ScrollView contentContainerStyle={styles.content}>
                {[1, 2, 3, 4, 5, 6, 0].map(dayIndex => renderDayCard(dayIndex))}
            </ScrollView>

            {/* Template Selector Modal */}
            <Modal
                visible={selectorVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setSelectorVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedDay !== null ? DAYS[selectedDay] : 'Selecionar'}
                            </Text>
                            <TouchableOpacity onPress={() => setSelectorVisible(false)}>
                                <X color={COLORS.white} size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {/* Current assignment */}
                            {selectedDay !== null && dayAssignments[selectedDay] && (
                                <View style={styles.currentSection}>
                                    <Text style={styles.sectionLabel}>Treino Atual</Text>
                                    <GlassView style={styles.currentTemplate} intensity={15}>
                                        <View style={styles.currentInfo}>
                                            <Text style={styles.currentName}>{dayAssignments[selectedDay]!.name}</Text>
                                            <Text style={styles.currentExercises}>
                                                {dayAssignments[selectedDay]!.exercises.length} exercícios
                                            </Text>
                                        </View>
                                        <View style={styles.currentActions}>
                                            <TouchableOpacity
                                                onPress={() => handleEditTemplate(dayAssignments[selectedDay]!)}
                                                style={styles.editBtn}
                                            >
                                                <Edit3 color={COLORS.blue} size={18} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleSelectTemplate(null)}
                                                style={styles.removeBtn}
                                            >
                                                <X color={COLORS.danger} size={18} />
                                            </TouchableOpacity>
                                        </View>
                                    </GlassView>
                                </View>
                            )}

                            {/* Available templates */}
                            <Text style={styles.sectionLabel}>Templates Disponíveis</Text>

                            {unassignedTemplates.length > 0 ? (
                                unassignedTemplates.map(template => (
                                    <TouchableOpacity
                                        key={template.id}
                                        style={styles.templateOption}
                                        onPress={() => handleSelectTemplate(template)}
                                    >
                                        <View style={styles.templateOptionInfo}>
                                            <Text style={styles.templateOptionName}>{template.name}</Text>
                                            <Text style={styles.templateOptionExercises}>
                                                {template.exercises.length} exercícios
                                            </Text>
                                        </View>
                                        <Plus color={COLORS.lime} size={20} />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.noTemplates}>
                                    <Text style={styles.noTemplatesText}>Nenhum template disponível</Text>
                                </View>
                            )}

                            {/* Create new */}
                            <GradientButton
                                title="Criar Novo Template"
                                onPress={handleCreateTemplate}
                                style={{ marginTop: SPACING.l }}
                            />
                        </ScrollView>
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
        padding: 8,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    descriptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        marginHorizontal: SPACING.l,
        marginBottom: SPACING.l,
        backgroundColor: 'rgba(163, 230, 53, 0.1)',
        borderRadius: RADIUS.m,
        borderWidth: 1,
        borderColor: 'rgba(163, 230, 53, 0.2)',
        gap: SPACING.s,
    },
    description: {
        flex: 1,
        color: COLORS.lime,
        fontSize: SIZES.small,
        fontWeight: '500',
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.l,
        gap: SPACING.m,
        marginBottom: SPACING.l,
    },
    quickAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: RADIUS.m,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        gap: SPACING.s,
    },
    quickActionText: {
        color: COLORS.white,
        fontSize: SIZES.small,
        fontWeight: '600',
    },
    content: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    dayCard: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    dayCardToday: {
        borderColor: COLORS.lime,
    },
    dayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    dayInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    dayIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dayName: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    todayBadge: {
        backgroundColor: `${COLORS.lime}20`,
        paddingHorizontal: SPACING.s,
        paddingVertical: 2,
        borderRadius: RADIUS.s,
    },
    todayText: {
        color: COLORS.lime,
        fontSize: SIZES.tiny,
        fontWeight: '600',
    },
    templateInfo: {
        marginLeft: SPACING.m + 8, // Align with text after indicator
    },
    templateName: {
        color: COLORS.white,
        fontSize: SIZES.small,
    },
    exerciseCount: {
        color: COLORS.textSecondary,
        fontSize: SIZES.tiny,
        marginTop: 2,
    },
    noTemplate: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        fontStyle: 'italic',
    },
    tapToAdd: {
        color: COLORS.lime,
        fontSize: SIZES.tiny,
        marginTop: 2,
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
    modalBody: {
        padding: SPACING.l,
    },
    currentSection: {
        marginBottom: SPACING.l,
    },
    sectionLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginBottom: SPACING.s,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    currentTemplate: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
    },
    currentInfo: {
        flex: 1,
    },
    currentName: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    currentExercises: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginTop: 2,
    },
    currentActions: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    editBtn: {
        padding: SPACING.s,
    },
    removeBtn: {
        padding: SPACING.s,
    },
    templateOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    templateOptionInfo: {
        flex: 1,
    },
    templateOptionName: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '500',
    },
    templateOptionExercises: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginTop: 2,
    },
    noTemplates: {
        paddingVertical: SPACING.l,
        alignItems: 'center',
    },
    noTemplatesText: {
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
});
