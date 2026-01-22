import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { GradientButton } from '../../components/ui/GradientButton';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { Camera, User, Dumbbell, Calendar, ChevronRight, Check } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { GoalRepository } from '../../services/GoalRepository';
import { RoutineRepository } from '../../services/RoutineRepository';
import { getDBConnection } from '../../database/db';

const STEPS = ['Perfil', 'Metas', 'Rotina'];
const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const OnboardingScreen = () => {
    const { updateUser, users } = useUser();
    const [currentStep, setCurrentStep] = useState(0);

    // Estado do Passo 1: Perfil
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);

    // Estado do Passo 2: Metas (Opcionais - Valores padrão)
    const [weight, setWeight] = useState('');
    const [calories, setCalories] = useState('2000');
    const [protein, setProtein] = useState('150');

    // Estado do Passo 3: Rotina (Array de 7 dias)
    // Inicializa com vazio
    const [routine, setRoutine] = useState(Array(7).fill('Descanso'));

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleNext = async () => {
        // Validação Passo 1
        if (currentStep === 0) {
            if (!name.trim()) {
                Alert.alert("Obrigatório", "Por favor, digite seu nome para continuar.");
                return;
            }
        }

        if (currentStep < 2) {
            setCurrentStep(currentStep + 1);
        } else {
            await finishOnboarding();
        }
    };

    const finishOnboarding = async () => {
        try {
            const db = await getDBConnection();

            // 1. Criar Usuário (INSERT manual pois não temos user criado ainda)
            const result = await db.runAsync(
                'INSERT INTO users (name, avatar_uri) VALUES (?, ?)',
                name, avatar
            );
            const newUserId = result.lastInsertRowId;

            // 2. Salvar Metas (Se preenchido)
            if (newUserId) {
                await GoalRepository.saveGoals(
                    newUserId,
                    parseInt(calories) || 2000,
                    500, // Burn goal padrão
                    parseInt(protein) || 150,
                    250 // Carbs padrão
                );

                // Logar o peso inicial se informado
                if (weight) {
                    await db.runAsync(
                        'INSERT INTO weight_logs (user_id, weight, date) VALUES (?, ?, ?)',
                        newUserId, parseFloat(weight), new Date().toISOString().split('T')[0]
                    );
                }

                // 3. Salvar Rotina
                for (let i = 0; i < 7; i++) {
                    if (routine[i]) {
                        await RoutineRepository.setDayRoutine(newUserId, i, routine[i]);
                    }
                }

                // 4. Atualizar Contexto e Entrar no App
                Alert.alert("Sucesso!", "Perfil criado com sucesso!", [
                    { text: "Vamos lá!", onPress: () => updateUser(newUserId, name, avatar || undefined) }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Houve um erro ao salvar seus dados.");
        }
    };

    const updateRoutineDay = (index: number, text: string) => {
        const newRoutine = [...routine];
        newRoutine[index] = text;
        setRoutine(newRoutine);
    };

    return (
        <Screen style={styles.container}>
            <View style={styles.content}>
                {/* Header com Progresso */}
                <View style={styles.header}>
                    <Text style={styles.stepTitle}>Passo {currentStep + 1} de 3</Text>
                    <Text style={styles.stepSubtitle}>{STEPS[currentStep]}</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${((currentStep + 1) / 3) * 100}%` }]} />
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <GlassView style={styles.card} intensity={30}>

                        {/* PASSO 1: PERFIL */}
                        {currentStep === 0 && (
                            <View style={styles.stepContainer}>
                                <Text style={styles.label}>Como podemos te chamar?</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Seu Nome (Obrigatório)"
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                />

                                <Text style={styles.label}>Escolha uma foto (Opcional)</Text>
                                <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
                                    {avatar ? (
                                        <Image source={{ uri: avatar }} style={styles.avatar} />
                                    ) : (
                                        <View style={styles.placeholderAvatar}>
                                            <Camera color={COLORS.textSecondary} size={32} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* PASSO 2: METAS */}
                        {currentStep === 1 && (
                            <View style={styles.stepContainer}>
                                <Text style={styles.description}>
                                    Defina seus objetivos iniciais. Você pode alterar isso a qualquer momento nas configurações.
                                </Text>

                                <Text style={styles.label}>Peso Atual (kg)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 75.5"
                                    placeholderTextColor={COLORS.textSecondary}
                                    keyboardType="numeric"
                                    value={weight}
                                    onChangeText={setWeight}
                                />

                                <Text style={styles.label}>Meta de Calorias Diárias</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 2000"
                                    placeholderTextColor={COLORS.textSecondary}
                                    keyboardType="numeric"
                                    value={calories}
                                    onChangeText={setCalories}
                                />

                                <Text style={styles.label}>Meta de Proteína (g)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 160"
                                    placeholderTextColor={COLORS.textSecondary}
                                    keyboardType="numeric"
                                    value={protein}
                                    onChangeText={setProtein}
                                />
                            </View>
                        )}

                        {/* PASSO 3: ROTINA */}
                        {currentStep === 2 && (
                            <View style={styles.stepContainer}>
                                <Text style={styles.description}>
                                    Planeje sua semana de treinos. Deixe em branco para "Descanso".
                                </Text>

                                {DAYS.map((day, index) => (
                                    <View key={index} style={styles.dayRow}>
                                        <Text style={styles.dayLabel}>{day}</Text>
                                        <TextInput
                                            style={styles.dayInput}
                                            placeholder="Descanso"
                                            placeholderTextColor={COLORS.textSecondary}
                                            value={routine[index]}
                                            onChangeText={(text) => updateRoutineDay(index, text)}
                                        />
                                    </View>
                                ))}
                            </View>
                        )}

                    </GlassView>
                </ScrollView>

                <View style={styles.footer}>
                    <GradientButton
                        title={currentStep === 2 ? "FINALIZAR JORNADA" : "PRÓXIMO"}
                        onPress={handleNext}
                        style={styles.button}
                    />
                </View>
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: SPACING.xl,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.m,
    },
    header: {
        marginBottom: SPACING.l,
    },
    stepTitle: {
        color: COLORS.primary,
        fontSize: SIZES.body,
        fontWeight: 'bold',
    },
    stepSubtitle: {
        color: COLORS.white,
        fontSize: SIZES.h1,
        fontWeight: 'bold',
        marginBottom: SPACING.s,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        marginTop: SPACING.s,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    card: {
        padding: SPACING.l,
        borderRadius: RADIUS.m,
    },
    stepContainer: {
        gap: SPACING.m,
    },
    description: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.m,
    },
    label: {
        color: COLORS.white,
        fontWeight: '600',
        marginTop: SPACING.s,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: COLORS.white,
        padding: SPACING.m,
        borderRadius: RADIUS.s,
        fontSize: SIZES.body,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatarPicker: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    placeholderAvatar: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    dayLabel: {
        width: 80,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },
    dayInput: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: COLORS.white,
        padding: SPACING.s,
        borderRadius: RADIUS.s,
        fontSize: SIZES.small,
    },
    footer: {
        position: 'absolute',
        bottom: SPACING.xl,
        left: SPACING.m,
        right: SPACING.m,
    },
    button: {
        width: '100%',
    }
});
