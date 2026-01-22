import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    goal?: string | number;
    unit?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, value, goal, unit = '' }) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>{icon}</View>
            <Text style={styles.value}>
                {value}{unit}
            </Text>
            {goal && (
                <Text style={styles.goal}>/{goal}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.slate700,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 8,
    },
    value: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    goal: {
        color: colors.slate400,
        fontSize: 10,
    },
});
