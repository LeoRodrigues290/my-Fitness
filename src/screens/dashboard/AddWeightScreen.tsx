import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { GradientButton } from '../../components/ui/GradientButton';
import { GlassView } from '../../components/ui/GlassView';
import { X } from 'lucide-react-native';

export const AddWeightScreen = ({ navigation }: any) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [weight, setWeight] = useState('');

    const handleSave = async () => {
        // Save to DB
        console.log('Saving weight', { date, weight });
        navigation.goBack();
    };

    return (
        <Screen style={{ paddingTop: 0 }}>
            <View style={styles.header}>
                <Text style={styles.title}>Log Weight</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X color={COLORS.textSecondary} size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.label}>Date</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={date}
                        onChangeText={setDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>

                <Text style={styles.label}>Weight (kg)</Text>
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

                <GradientButton title="Save Entry" onPress={handleSave} style={{ marginTop: SPACING.l }} />
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
