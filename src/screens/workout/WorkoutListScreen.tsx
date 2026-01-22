import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { Plus, ChevronRight, Trash2 } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { WorkoutRepository } from '../../services/WorkoutRepository';
import { format } from 'date-fns';

export const WorkoutListScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [workouts, setWorkouts] = useState<any[]>([]);

    const loadWorkouts = async () => {
        if (!currentUser) return;
        try {
            const data = await WorkoutRepository.getWorkouts(currentUser.id);
            setWorkouts(data);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadWorkouts();
        }, [currentUser])
    );

    const handleDelete = (id: number) => {
        Alert.alert(
            "Excluir Treino",
            "Tem certeza que deseja excluir este treino?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        await WorkoutRepository.deleteWorkout(id);
                        loadWorkouts();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: any) => {
        const dateObj = new Date(item.date);
        const day = format(dateObj, 'dd');
        const month = format(dateObj, 'MMM');

        return (
            <TouchableOpacity onLongPress={() => handleDelete(item.id)} activeOpacity={0.8}>
                <GlassView style={styles.card} intensity={15}>
                    <View style={styles.row}>
                        <View style={styles.dateBox}>
                            <Text style={styles.day}>{day}</Text>
                            <Text style={styles.month}>{month}</Text>
                        </View>
                        <View style={styles.contentBox}>
                            <Text style={styles.title}>{item.muscle_group}</Text>
                            <Text style={styles.subtitle}>{item.exercises?.length || 0} Exercícios</Text>
                        </View>
                        <ChevronRight color={COLORS.textSecondary} size={20} />
                    </View>
                </GlassView>
            </TouchableOpacity>
        );
    };

    return (
        <Screen>
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Meus Treinos</Text>
            </View>

            <FlatList
                data={workouts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ color: COLORS.textSecondary }}>Nenhum treino registrado.</Text>
                        <Text style={{ color: COLORS.textSecondary, fontSize: SIZES.small, marginTop: SPACING.s }}>Toque em + para adicionar seu primeiro treino</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AddWorkout')}
            >
                <Plus color={COLORS.white} size={24} />
            </TouchableOpacity>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: SPACING.l,
        paddingBottom: SPACING.s,
    },
    screenTitle: {
        fontSize: SIZES.h1,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    list: {
        padding: SPACING.l,
        gap: SPACING.m,
    },
    card: {
        padding: SPACING.m,
        borderRadius: RADIUS.m,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    dateBox: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: RADIUS.s,
        padding: SPACING.s,
        width: 50,
        height: 50,
    },
    day: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    month: {
        fontSize: 10,
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
    },
    contentBox: {
        flex: 1,
    },
    title: {
        fontSize: SIZES.body,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    subtitle: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.xl,
        width: 56,
        height: 56,
        borderRadius: RADIUS.circle,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    empty: {
        padding: SPACING.xl,
        alignItems: 'center',
    }
});
