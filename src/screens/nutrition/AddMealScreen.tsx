import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { GradientButton } from '../../components/ui/GradientButton';
import { GlassView } from '../../components/ui/GlassView';
import { X } from 'lucide-react-native';

export const AddMealScreen = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [calories, setCalories] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fats, setFats] = useState('');
    const [type, setType] = useState('Breakfast');

    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

    const handleSave = async () => {
        // Save to DB
        console.log('Saving meal', { name, calories, protein, carbs, fats, type });
        navigation.goBack();
    };

    return (
        <Screen style={{ paddingTop: 0 }}>
            <View style={styles.header}>
                <Text style={styles.title}>Log {type}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X color={COLORS.textSecondary} size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
                {mealTypes.map(t => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setType(t)}
                        style={[styles.typeChip, type === t && styles.activeChip]}
                    >
                        <Text style={[styles.typeText, type === t && styles.activeTypeText]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Food Name</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Grilled Chicken Salad"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>

                <Text style={styles.label}>Calories (kcal)</Text>
                <GlassView style={styles.inputContainer} intensity={10}>
                    <TextInput
                        style={styles.input}
                        value={calories}
                        onChangeText={setCalories}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={COLORS.textSecondary}
                    />
                </GlassView>

                <View style={styles.row}>
                    <View style={styles.statInput}>
                        <Text style={styles.label}>Protein (g)</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={protein}
                                onChangeText={setProtein}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                    <View style={styles.statInput}>
                        <Text style={styles.label}>Carbs (g)</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={carbs}
                                onChangeText={setCarbs}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                    <View style={styles.statInput}>
                        <Text style={styles.label}>Fats (g)</Text>
                        <GlassView style={styles.inputContainer} intensity={10}>
                            <TextInput
                                style={styles.input}
                                value={fats}
                                onChangeText={setFats}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </GlassView>
                    </View>
                </View>

                <GradientButton title="Save Meal" onPress={handleSave} style={{ marginTop: SPACING.l }} />
            </ScrollView>
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
        paddingBottom: 100,
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
    },
    typeSelector: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.m,
        gap: SPACING.s,
        marginBottom: SPACING.m,
    },
    typeChip: {
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.m,
        borderRadius: RADIUS.l,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    activeChip: {
        backgroundColor: COLORS.primary,
    },
    typeText: {
        color: COLORS.textSecondary,
    },
    activeTypeText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    statInput: {
        flex: 1,
    },
});
