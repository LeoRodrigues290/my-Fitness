import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { GradientButton } from '../../components/ui/GradientButton';
import { GlassView } from '../../components/ui/GlassView';
import { X, Scale } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { UserRepository } from '../../services/UserRepository';
import { CustomAlert } from '../../components/ui/CustomAlert';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export const AddWeightScreen = ({ navigation }: any) => {
    const { currentUser } = useUser();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [weight, setWeight] = useState('');
    const [alertConfig, setAlertConfig] = useState<any>({ visible: false, title: '', message: '', type: 'success' });

    const handleSave = async () => {
        if (!currentUser || !weight) return;

        await UserRepository.addWeightLog(
            currentUser.id,
            parseFloat(weight),
            date
        );

        setAlertConfig({
            visible: true,
            title: 'Sucesso',
            message: 'Peso registrado com sucesso!',
            type: 'success',
            onClose: () => {
                setAlertConfig({ ...alertConfig, visible: false });
                navigation.goBack();
            }
        });
    };

    return (
        <Screen style={{ paddingTop: 0 }}>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => alertConfig.onClose ? alertConfig.onClose() : setAlertConfig({ ...alertConfig, visible: false })}
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
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <Text style={[styles.input, { paddingTop: SPACING.m }]}>
                            {format(new Date(date), 'dd/MM/yyyy')}
                        </Text>
                    </TouchableOpacity>
                </GlassView>

                {showDatePicker && (
                    <DateTimePicker
                        value={new Date(date)}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                setDate(selectedDate.toISOString().split('T')[0]);
                            }
                        }}
                    />
                )}

                <Text style={styles.label}>Peso (kg)</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Scale color={COLORS.primary} size={20} style={{ marginLeft: SPACING.m }} />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={weight}
                            onChangeText={setWeight}
                            keyboardType="numeric"
                            placeholder="0.0"
                            placeholderTextColor={COLORS.textSecondary}
                        />
                    </View>
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
