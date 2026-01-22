import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { GradientButton } from '../../components/ui/GradientButton';
import { GlassView } from '../../components/ui/GlassView';
import { X } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { UserRepository } from '../../services/UserRepository';
import { SuccessModal } from '../../components/ui/SuccessModal';

export const AddWeightScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [weight, setWeight] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = async () => {
        if (!currentUser || !weight) return;

        await UserRepository.addWeightLog(
            currentUser.id,
            parseFloat(weight),
            date
        );

        setShowSuccess(true);
    };

    return (
        <Screen style={{ paddingTop: 0 }}>
            <SuccessModal
                visible={showSuccess}
                message="Peso Registrado!"
                onClose={() => navigation.goBack()}
            />

            <View style={styles.header}>
                <Text style={styles.title}>Registrar Peso</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X color={COLORS.textSecondary} size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.label}>Data</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>

                <Text style={styles.label}>Peso (kg)</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                        placeholder="0.0"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>

                <GradientButton title="Salvar" onPress={handleSave} style={{ marginTop: SPACING.l }} />
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
        paddingTop: SPACING.xl,
    },
    title: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.m,
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
        marginLeft: SPACING.xs,
    },
    inputContainer: {
        borderRadius: RADIUS.s,
        marginBottom: SPACING.m,
    },
    input: {
        color: COLORS.white,
        padding: SPACING.m,
        fontSize: SIZES.body,
    }
});
