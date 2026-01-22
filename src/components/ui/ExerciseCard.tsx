import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, CheckCircle2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { Exercise } from '../../types';

interface ExerciseCardProps {
    exercise: Exercise;
    index: number;
    onPress?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, index, onPress }) => {
    // Alternate images for visual variety
    const imageUri = index % 2 === 0
        ? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=100&h=100'
        : 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=100&h=100';

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <View style={styles.imageOverlay} />
                {exercise.completed && (
                    <View style={styles.completedOverlay}>
                        <CheckCircle2 size={24} color={colors.white} />
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <Text style={[styles.name, exercise.completed && styles.completedText]}>
                    {exercise.name}
                </Text>
                <View style={styles.stats}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{exercise.sets}</Text>
                    </View>
                    <Text style={styles.reps}>{exercise.reps}</Text>
                </View>
            </View>

            <View style={styles.playButton}>
                <Play size={14} color={colors.slate400} fill={colors.slate400} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.slate800,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        gap: 16,
    },
    imageContainer: {
        width: 64,
        height: 64,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.slate700,
    },
    image: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    completedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(132, 204, 22, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    name: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 4,
    },
    completedText: {
        color: colors.slate500,
        textDecorationLine: 'line-through',
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    tag: {
        backgroundColor: colors.slate700,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagText: {
        color: colors.slate300,
        fontSize: 12,
    },
    reps: {
        color: colors.slate400,
        fontSize: 12,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.slate600,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
