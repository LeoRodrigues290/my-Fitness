import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { Workout } from '../../types';

interface WorkoutCardProps {
    workout: Workout;
    onPress: (workout: Workout) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPress }) => {
    return (
        <TouchableOpacity
            onPress={() => onPress(workout)}
            style={styles.container}
            activeOpacity={0.8}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: workout.image }} style={styles.image} />
                <View style={styles.imageOverlay} />
            </View>
            <Text style={styles.title} numberOfLines={1}>{workout.title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{workout.subtitle}</Text>
            <View style={styles.meta}>
                <Clock size={10} color={colors.lime400} />
                <Text style={styles.duration}>{workout.duration}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 160,
        padding: 12,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderWidth: 1,
        borderColor: colors.slate700,
        borderRadius: 16,
        marginRight: 16,
    },
    imageContainer: {
        height: 112,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
        backgroundColor: colors.slate800,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    title: {
        color: colors.white,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: colors.slate400,
        fontSize: 12,
        marginBottom: 8,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    duration: {
        color: colors.lime400,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});
