import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Settings, Dumbbell } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { RoutineRepository } from '../../services/RoutineRepository';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GradientButton } from '../../components/ui/GradientButton';

const { width } = Dimensions.get('window');

export const CalendarScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [routine, setRoutine] = useState<any[]>([]);

    useEffect(() => {
        if (currentUser) {
            RoutineRepository.getWeeklyRoutine(currentUser.id).then(setRoutine);
        }
    }, [currentUser]);

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    const startDay = getDay(startOfMonth(currentDate)); // 0=Sun
    const emptyDays = Array(startDay).fill(null);

    const getWorkoutForDate = (date: Date) => {
        const dayIndex = getDay(date); // 0=Sun
        return routine.find(r => r.day_index === dayIndex);
    };

    const selectedWorkout = getWorkoutForDate(selectedDate);

    return (
        <Screen>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={COLORS.white} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Calendário</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Settings', { screen: 'Routine' })} style={styles.backBtn}>
                    <Settings color={COLORS.lime} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Calendar Header */}
                <View style={styles.monthHeader}>
                    <TouchableOpacity onPress={() => setCurrentDate(subMonths(currentDate, 1))}>
                        <ChevronLeft color={COLORS.textSecondary} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.monthTitle}>
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </Text>
                    <TouchableOpacity onPress={() => setCurrentDate(addMonths(currentDate, 1))}>
                        <ChevronRight color={COLORS.textSecondary} size={24} />
                    </TouchableOpacity>
                </View>

                {/* Week Days */}
                <View style={styles.weekRow}>
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                        <Text key={i} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                    {emptyDays.map((_, i) => (
                        <View key={`empty-${i}`} style={styles.dayCell} />
                    ))}
                    {daysInMonth.map((date, i) => {
                        const isSelected = isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, new Date());
                        const workout = getWorkoutForDate(date);
                        const hasWorkout = workout && workout.workout_focus !== 'Descanso';

                        return (
                            <TouchableOpacity
                                key={i}
                                style={[
                                    styles.dayCell,
                                    isSelected && styles.selectedDay,
                                    isToday && !isSelected && styles.todayCell
                                ]}
                                onPress={() => setSelectedDate(date)}
                            >
                                <Text style={[
                                    styles.dayText,
                                    isSelected && { color: COLORS.background },
                                    isToday && !isSelected && { color: COLORS.lime }
                                ]}>
                                    {format(date, 'd')}
                                </Text>
                                {hasWorkout && (
                                    <View style={[styles.dot, isSelected && { backgroundColor: COLORS.background }]} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Selected Day Details */}
                <View style={styles.detailsSection}>
                    <Text style={styles.dateLabel}>
                        {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </Text>

                    <GlassView style={styles.workoutCard} intensity={20}>
                        <View style={styles.cardIcon}>
                            <Dumbbell color={COLORS.lime} size={24} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.workoutTitle}>
                                {selectedWorkout?.workout_focus || 'Descanso'}
                            </Text>
                            <Text style={styles.workoutSubtitle}>
                                {selectedWorkout?.workout_focus === 'Descanso' ? 'Dia de recuperação' : 'Foco do treino'}
                            </Text>
                        </View>
                        {selectedWorkout?.workout_focus !== 'Descanso' && (
                            <TouchableOpacity
                                style={styles.playButton}
                                onPress={() => navigation.navigate('Workouts')} // Or specific workout
                            >
                                <ChevronRight color={COLORS.background} size={20} />
                            </TouchableOpacity>
                        )}
                    </GlassView>

                    <GradientButton
                        title="Configurar Rotina"
                        onPress={() => navigation.navigate('Settings')}
                        style={{ marginTop: SPACING.l, opacity: 0.8 }}
                    />
                </View>

            </ScrollView>
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
        fontSize: SIZES.h2,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.m,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
        paddingHorizontal: SPACING.s,
    },
    monthTitle: { // Capitalize first letter
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING.s,
    },
    weekDayText: {
        color: COLORS.textSecondary,
        width: 40,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: SPACING.xl,
    },
    dayCell: {
        width: (width - SPACING.m * 2) / 7,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 24,
    },
    selectedDay: {
        backgroundColor: COLORS.lime,
    },
    todayCell: {
        borderWidth: 1,
        borderColor: COLORS.lime,
    },
    dayText: {
        color: COLORS.white,
        fontWeight: '500',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.lime,
        marginTop: 4,
    },
    detailsSection: {
        marginTop: SPACING.m,
    },
    dateLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        textTransform: 'capitalize',
        marginBottom: SPACING.m,
    },
    workoutCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: RADIUS.l,
        gap: SPACING.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(163, 230, 53, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    workoutTitle: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    workoutSubtitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.lime,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
