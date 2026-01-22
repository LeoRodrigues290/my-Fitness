import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, ChevronLeft, MoreHorizontal, Calendar } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { ExerciseCard } from '../../components/ui/ExerciseCard';
import { VideoInstructionModal } from '../../components/ui/VideoInstructionModal';
import { Workout } from '../../types';

interface DetailsScreenProps {
    workout: Workout;
    onBack: () => void;
    onStartWorkout?: (workout: Workout) => void;
}

export const DetailsScreen: React.FC<DetailsScreenProps> = ({ workout, onBack, onStartWorkout }) => {
    const insets = useSafeAreaInsets();

    // Video modal state
    const [videoModalVisible, setVideoModalVisible] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<any>(null);

    const handleShowVideo = (exercise: any) => {
        setSelectedExercise(exercise);
        setVideoModalVisible(true);
    };

    const handleStartWorkout = () => {
        if (onStartWorkout) {
            onStartWorkout(workout);
        }
    };

    return (
        <View style={styles.container}>
            {/* Hero Section */}
            <View style={styles.hero}>
                <Image source={{ uri: workout.image }} style={styles.heroImage} />
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'transparent', colors.slate950]}
                    style={StyleSheet.absoluteFill}
                />

                {/* Navigation */}
                <View style={[styles.nav, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={onBack} style={styles.navButton}>
                        <ChevronLeft size={24} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Floating Stats */}
                <View style={styles.floatingStats}>
                    <BlurView intensity={30} tint="dark" style={styles.floatingStat}>
                        <Text style={styles.statValueLime}>{workout.duration}</Text>
                        <Text style={styles.statLabel}>DURAÇÃO</Text>
                    </BlurView>
                    <BlurView intensity={30} tint="dark" style={styles.floatingStat}>
                        <Text style={styles.statValueOrange}>{workout.calories}</Text>
                        <Text style={styles.statLabel}>QUEIMA</Text>
                    </BlurView>
                    <BlurView intensity={30} tint="dark" style={styles.floatingStat}>
                        <Text style={styles.statValueBlue}>{workout.exercises.length}</Text>
                        <Text style={styles.statLabel}>SÉRIES</Text>
                    </BlurView>
                </View>
            </View>

            {/* Content Sheet */}
            <View style={styles.contentSheet}>
                <View style={styles.pullIndicator} />

                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>{workout.title}</Text>
                    <View style={styles.metaRow}>
                        <Calendar size={14} color={colors.slate400} />
                        <Text style={styles.metaText}>Hoje</Text>
                        <View style={styles.dot} />
                        <Text style={styles.metaLevel}>{workout.level}</Text>
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.exercisesTitle}>
                        EXERCÍCIOS ({workout.exercises.length})
                    </Text>

                    {workout.exercises.map((exercise, index) => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            index={index}
                            onPress={() => handleShowVideo(exercise)}
                        />
                    ))}
                </ScrollView>

                <View style={[styles.stickyCTA, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                    <TouchableOpacity style={styles.mainButton} onPress={handleStartWorkout}>
                        <Play size={20} color={colors.slate900} fill={colors.slate900} />
                        <Text style={styles.mainButtonText}>INICIAR TREINO</Text>
                    </TouchableOpacity>
                </View>

                {/* Video Instruction Modal */}
                <VideoInstructionModal
                    visible={videoModalVisible}
                    videoId={selectedExercise?.video_url || null}
                    exerciseName={selectedExercise?.name || ''}
                    instructions={selectedExercise?.instructions || null}
                    muscleGroup={selectedExercise?.muscle_group}
                    onClose={() => setVideoModalVisible(false)}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.slate950,
    },
    hero: {
        height: '45%',
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    nav: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    floatingStats: {
        position: 'absolute',
        bottom: 48,
        left: 24,
        right: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    floatingStat: {
        padding: 12,
        borderRadius: 16,
        overflow: 'hidden',
        minWidth: 80,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
    },
    statValueLime: {
        color: colors.lime400,
        fontWeight: 'bold',
        fontSize: 18,
    },
    statValueOrange: {
        color: colors.orange400,
        fontWeight: 'bold',
        fontSize: 18,
    },
    statValueBlue: {
        color: colors.blue400,
        fontWeight: 'bold',
        fontSize: 18,
    },
    statLabel: {
        color: colors.slate300,
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
    },
    contentSheet: {
        flex: 1,
        marginTop: -32,
        backgroundColor: colors.slate900,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 24,
        paddingTop: 40,
        borderTopWidth: 1,
        borderTopColor: colors.slate800,
    },
    pullIndicator: {
        position: 'absolute',
        top: 16,
        left: '50%',
        marginLeft: -24,
        width: 48,
        height: 6,
        backgroundColor: colors.slate700,
        borderRadius: 3,
    },
    sheetHeader: {
        marginBottom: 24,
    },
    sheetTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        color: colors.slate400,
        fontSize: 14,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.slate600,
    },
    metaLevel: {
        color: colors.lime400,
        fontSize: 14,
        fontWeight: '500',
    },
    exercisesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.slate500,
        marginBottom: 16,
        letterSpacing: 1,
    },
    stickyCTA: {
        position: 'absolute',
        bottom: 0,
        left: 24,
        right: 24,
        paddingTop: 16,
        backgroundColor: colors.slate900,
    },
    mainButton: {
        backgroundColor: colors.lime400,
        height: 56,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: colors.lime400,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    mainButtonText: {
        color: colors.slate900,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
