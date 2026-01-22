import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Flame, Play, ChevronRight } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { workoutsData, Workout } from '../../constants/workouts';

const { width } = Dimensions.get('window');

interface WorkoutsScreenProps {
    onWorkoutPress: (workout: Workout) => void;
}

export const WorkoutsScreen: React.FC<WorkoutsScreenProps> = ({ onWorkoutPress }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.screenTitle}>Treinos</Text>
            <Text style={styles.subtitle}>Escolha seu treino e vamos lá! 💪</Text>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Featured Workout (First one) */}
                <TouchableOpacity
                    style={styles.featuredCard}
                    onPress={() => onWorkoutPress(workoutsData[0])}
                    activeOpacity={0.9}
                >
                    <Image
                        source={{ uri: workoutsData[0].image }}
                        style={styles.featuredImage}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(2, 6, 23, 0.7)', '#020617']}
                        style={styles.featuredGradient}
                    />
                    <View style={styles.featuredContent}>
                        <View style={styles.tagsRow}>
                            <BlurView intensity={20} tint="dark" style={styles.tag}>
                                <Clock size={12} color={colors.white} />
                                <Text style={styles.tagText}>{workoutsData[0].duration}</Text>
                            </BlurView>
                            <BlurView intensity={20} tint="dark" style={styles.tag}>
                                <Flame size={12} color={colors.orange400} />
                                <Text style={styles.tagText}>{workoutsData[0].calories}</Text>
                            </BlurView>
                        </View>
                        <Text style={styles.featuredTitle}>{workoutsData[0].title}</Text>
                        <Text style={styles.featuredSubtitle}>{workoutsData[0].subtitle}</Text>

                        <View style={styles.featuredButton}>
                            <Play size={16} color={colors.slate950} fill={colors.slate950} />
                            <Text style={styles.featuredButtonText}>Começar</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Other Workouts Grid */}
                <Text style={styles.sectionTitle}>Todos os Treinos</Text>

                {workoutsData.slice(1).map((workout) => (
                    <TouchableOpacity
                        key={workout.id}
                        style={styles.workoutCard}
                        onPress={() => onWorkoutPress(workout)}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={{ uri: workout.image }}
                            style={styles.cardImage}
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(2, 6, 23, 0.9)']}
                            style={styles.cardGradient}
                        />
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.levelBadge}>
                                    <Text style={styles.levelText}>{workout.level}</Text>
                                </View>
                            </View>
                            <Text style={styles.cardTitle}>{workout.title}</Text>
                            <Text style={styles.cardSubtitle}>{workout.subtitle}</Text>
                            <View style={styles.cardMeta}>
                                <View style={styles.metaItem}>
                                    <Clock size={14} color={colors.lime400} />
                                    <Text style={styles.metaText}>{workout.duration}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Flame size={14} color={colors.orange400} />
                                    <Text style={styles.metaText}>{workout.calories}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.arrowContainer}>
                            <ChevronRight size={20} color={colors.slate400} />
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.slate400,
        marginBottom: 24,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    featuredCard: {
        height: 220,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
    },
    featuredImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    featuredGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
    },
    featuredContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        overflow: 'hidden',
    },
    tagText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
    featuredTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    featuredSubtitle: {
        fontSize: 14,
        color: colors.slate300,
        marginBottom: 16,
    },
    featuredButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.lime400,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    featuredButtonText: {
        color: colors.slate950,
        fontWeight: 'bold',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 16,
    },
    workoutCard: {
        flexDirection: 'row',
        backgroundColor: colors.slate900,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        height: 120,
        borderWidth: 1,
        borderColor: colors.slate800,
    },
    cardImage: {
        width: 120,
        height: '100%',
    },
    cardGradient: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 120,
    },
    cardContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    levelBadge: {
        backgroundColor: 'rgba(163, 230, 53, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    levelText: {
        color: colors.lime400,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        color: colors.slate400,
        marginBottom: 8,
    },
    cardMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: colors.slate300,
        fontSize: 12,
    },
    arrowContainer: {
        justifyContent: 'center',
        paddingRight: 16,
    },
});
