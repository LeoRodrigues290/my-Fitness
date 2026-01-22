import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { ChevronLeft, Save } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { RoutineRepository } from '../../services/RoutineRepository';
import { GradientButton } from '../../components/ui/GradientButton';
import { CustomAlert } from '../../components/ui/CustomAlert';

export const RoutineSettingsScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [routine, setRoutine] = useState<any[]>([]);
    const [alertConfig, setAlertConfig] = useState<any>({ visible: false, title: '', message: '', type: 'success' });

    useEffect(() => {
        if (currentUser) {
            RoutineRepository.getWeeklyRoutine(currentUser.id).then(setRoutine);
        }
    }, [currentUser]);

    const handleUpdate = (index: number, text: string) => {
        const newRoutine = [...routine];
        newRoutine[index] = { ...newRoutine[index], workout_focus: text };
        setRoutine(newRoutine);
    };

    const handleSave = async () => {
        if (!currentUser) return;
        for (const day of routine) {
            await RoutineRepository.setDayRoutine(currentUser.id, day.day_index, day.workout_focus);
        }
        setAlertConfig({
            visible: true,
            title: 'Sucesso',
            message: 'Rotina atualizada com sucesso!',
            type: 'success',
            onClose: () => {
                setAlertConfig({ ...alertConfig, visible: false });
                navigation.goBack();
            }
        });
    };

    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return (
        <Screen>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => alertConfig.onClose ? alertConfig.onClose() : setAlertConfig({ ...alertConfig, visible: false })}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={COLORS.white} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Configurar Rotina</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.description}>Defina o foco do treino para cada dia da semana. Use "Descanso" para dias livres.</Text>

                {routine.map((item, index) => (
                    <View key={item.day_index} style={styles.dayRow}>
                        <Text style={styles.dayLabel}>{days[item.day_index]}</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={item.workout_focus}
                                onChangeText={(text) => handleUpdate(index, text)}
                                placeholder="ex: Peito, Costas, Descanso"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                ))}

                <GradientButton title="Salvar Alterações" onPress={handleSave} style={{ marginTop: SPACING.l }} />
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
        paddingBottom: 100,
    },
    description: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.l,
        textAlign: 'center',
    },
    dayRow: {
        marginBottom: SPACING.s,
    },
    dayLabel: {
        color: COLORS.lime,
        fontWeight: 'bold',
        marginBottom: 4,
        marginLeft: SPACING.xs,
    },
    inputContainer: {
        borderRadius: RADIUS.m,
    },
    input: {
        color: COLORS.white,
        padding: SPACING.m,
        fontSize: SIZES.body,
    }
});
