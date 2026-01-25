import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { ChevronLeft, ChevronRight, Settings, Dumbbell, Moon, ArrowLeft } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { colors } from '../../constants/colors';
import { WorkoutTemplateRepository } from '../../services/WorkoutTemplateRepository';

const { width } = Dimensions.get('window');

interface CalendarScreenProps {
    onBack: () => void;
    onOpenSettings?: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onBack, onOpenSettings }) => {
    const insets = useSafeAreaInsets();
    const { currentUser } = useUser();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [scheduleMap, setScheduleMap] = useState<{ [key: number]: string }>({});

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    const startDay = getDay(startOfMonth(currentDate));
    const emptyDays = Array(startDay).fill(null);

    // Load schedule from DB
    useFocusEffect(
        useCallback(() => {
            const loadSchedule = async () => {
                if (!currentUser) return;
                const templates = await WorkoutTemplateRepository.getWeeklyTemplates(currentUser.id);

                const newMap: { [key: number]: string } = {};
                templates.forEach(t => {
                    if (t.day_assigned !== null) {
                        newMap[t.day_assigned] = t.name;
                    }
                });
                setScheduleMap(newMap);
            };
            loadSchedule();
        }, [currentUser])
    );

    const getWorkoutForDate = (date: Date): { label: string; isRest: boolean } => {
        const dayIndex = getDay(date); // 0=Sun, 1=Mon...
        const workoutName = scheduleMap[dayIndex];
        const isRest = !workoutName; // If no workout assigned, assume rest

        return {
            label: workoutName || 'Descanso',
            isRest
        };
    };

    const selectedWorkout = getWorkoutForDate(selectedDate);

    return (
        <View style={styles.container}>
            {/* Background Gradient Glows */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                        <RadialGradient id="grad1" cx="0%" cy="0%" rx="60%" ry="60%">
                            <Stop offset="0%" stopColor={colors.lime400} stopOpacity="0.12" />
                            <Stop offset="100%" stopColor={colors.slate950} stopOpacity="0" />
                        </RadialGradient>
                        <RadialGradient id="grad2" cx="100%" cy="100%" rx="50%" ry="50%">
                            <Stop offset="0%" stopColor={colors.blue400} stopOpacity="0.1" />
                            <Stop offset="100%" stopColor={colors.slate950} stopOpacity="0" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
                </Svg>
            </View>

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                    <ArrowLeft color={colors.white} size={22} />
                </TouchableOpacity>
                <Text style={styles.title}>Calendário</Text>
                {onOpenSettings ? (
                    <TouchableOpacity onPress={onOpenSettings} style={styles.iconButton}>
                        <Settings color={colors.lime400} size={22} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Month Navigation */}
                <BlurView intensity={40} tint="dark" style={styles.monthCard}>
                    <TouchableOpacity onPress={() => setCurrentDate(subMonths(currentDate, 1))} style={styles.navButton}>
                        <ChevronLeft color={colors.slate400} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.monthTitle}>
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </Text>
                    <TouchableOpacity onPress={() => setCurrentDate(addMonths(currentDate, 1))} style={styles.navButton}>
                        <ChevronRight color={colors.slate400} size={24} />
                    </TouchableOpacity>
                </BlurView>

                {/* Calendar Grid */}
                <BlurView intensity={30} tint="dark" style={styles.calendarCard}>
                    {/* Week Days Header */}
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
                            const hasWorkout = !workout.isRest;

                            return (
                                <TouchableOpacity
                                    key={i}
                                    style={[
                                        styles.dayCell,
                                        isSelected && styles.selectedDay,
                                        isToday && !isSelected && styles.todayCell
                                    ]}
                                    onPress={() => setSelectedDate(date)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        isSelected && { color: colors.slate950, fontWeight: 'bold' },
                                        isToday && !isSelected && { color: colors.lime400 }
                                    ]}>
                                        {format(date, 'd')}
                                    </Text>
                                    {hasWorkout && (
                                        <View style={[styles.dot, isSelected && { backgroundColor: colors.slate950 }]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </BlurView>

                {/* Selected Day Details */}
                <View style={styles.detailsSection}>
                    <Text style={styles.dateLabel}>
                        {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </Text>

                    <BlurView intensity={50} tint="dark" style={[styles.workoutCard, selectedWorkout.isRest && styles.restCard]}>
                        <View style={[styles.cardIcon, selectedWorkout.isRest && styles.restIcon]}>
                            {selectedWorkout.isRest ? (
                                <Moon color={colors.blue400} size={24} />
                            ) : (
                                <Dumbbell color={colors.lime400} size={24} />
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.workoutTitle}>
                                {selectedWorkout.label}
                            </Text>
                            <Text style={styles.workoutSubtitle}>
                                {selectedWorkout.isRest ? 'Dia de recuperação 😴' : 'Foco do treino'}
                            </Text>
                        </View>
                        {!selectedWorkout.isRest && (
                            <View style={styles.playButton}>
                                <ChevronRight color={colors.slate950} size={20} />
                            </View>
                        )}
                    </BlurView>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.slate950,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        color: colors.white,
        fontSize: 22,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    monthCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    navButton: {
        padding: 8,
    },
    monthTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    calendarCard: {
        borderRadius: 24,
        padding: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        marginBottom: 24,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    weekDayText: {
        color: colors.slate500,
        width: (width - 72) / 7,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 12,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: (width - 72) / 7,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        marginVertical: 2,
    },
    selectedDay: {
        backgroundColor: colors.lime400,
    },
    todayCell: {
        borderWidth: 1.5,
        borderColor: colors.lime400,
    },
    dayText: {
        color: colors.white,
        fontWeight: '500',
        fontSize: 14,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.lime400,
        marginTop: 2,
    },
    detailsSection: {
        marginTop: 8,
    },
    dateLabel: {
        color: colors.slate400,
        fontSize: 14,
        textTransform: 'capitalize',
        marginBottom: 16,
        fontWeight: '500',
    },
    workoutCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(163, 230, 53, 0.2)',
        backgroundColor: 'rgba(163, 230, 53, 0.05)',
        overflow: 'hidden',
    },
    restCard: {
        borderColor: 'rgba(96, 165, 250, 0.2)',
        backgroundColor: 'rgba(96, 165, 250, 0.05)',
    },
    cardIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(163, 230, 53, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    restIcon: {
        backgroundColor: 'rgba(96, 165, 250, 0.15)',
    },
    workoutTitle: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    workoutSubtitle: {
        color: colors.slate400,
        fontSize: 13,
    },
    playButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: colors.lime400,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
