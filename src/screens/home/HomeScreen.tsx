import React from 'react';
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
import {
    Play,
    Flame,
    Clock,
    User,
    ArrowRight,
    Beef,
    Wheat,
    Droplet
} from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { workoutsData } from '../../constants/workouts';
import { useUser } from '../../context/UserContext';
import { WorkoutCard } from '../../components/ui/WorkoutCard';
import { Workout } from '../../types';

interface HomeScreenProps {
    onWorkoutPress: (workout: Workout) => void;
    onProfilePress: () => void;
    onCalendarPress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    onWorkoutPress,
    onProfilePress,
    onCalendarPress
}) => {
    const insets = useSafeAreaInsets();
    const { currentUser, userPreferences, dailyStats } = useUser();
    const userName = currentUser?.name || "Visitante";
    const todayWorkout = workoutsData[0];

    return (
        <ScrollView
            contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + 20 }}
            showsVerticalScrollIndicator={false}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Bem-vindo de volta,</Text>
                    <Text style={styles.userNameText}>{userName} 👋</Text>
                </View>
                <TouchableOpacity onPress={onProfilePress}>
                    <View style={styles.avatarContainer}>
                        {currentUser?.avatar_uri ? (
                            <Image source={{ uri: currentUser.avatar_uri }} style={styles.avatar} />
                        ) : (
                            <User size={20} color={colors.white} />
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            {/* Stats Cards Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Flame size={20} color={colors.orange400} style={styles.statIcon} />
                    <Text style={styles.statValue}>{dailyStats?.caloriesConsumed || 0}</Text>
                    <Text style={styles.statGoal}>/{userPreferences.goals.kcal}</Text>
                </View>
                <View style={styles.statCard}>
                    <Beef size={20} color={colors.red500} style={styles.statIcon} />
                    <Text style={styles.statValue}>{dailyStats?.proteinConsumed || 0}g</Text>
                    <Text style={styles.statGoal}>/{userPreferences.goals.protein}</Text>
                </View>
                <View style={styles.statCard}>
                    <Wheat size={20} color={colors.lime400} style={styles.statIcon} />
                    <Text style={styles.statValue}>{dailyStats?.carbsConsumed || 0}g</Text>
                    <Text style={styles.statGoal}>/{userPreferences.goals.carbs}</Text>
                </View>
                <View style={styles.statCard}>
                    <Droplet size={20} color={colors.blue400} style={styles.statIcon} />
                    <Text style={styles.statValue}>{(dailyStats?.waterConsumed || 0) / 1000}L</Text>
                    <Text style={styles.statGoal}>/{userPreferences.goals.water / 1000}L</Text>
                </View>
            </View>

            {/* Today's Workout Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Treino de Hoje</Text>
                <TouchableOpacity onPress={onCalendarPress}>
                    <Text style={styles.linkText}>Ver calendário</Text>
                </TouchableOpacity>
            </View>

            {/* Hero Card */}
            <TouchableOpacity
                style={styles.heroCard}
                onPress={() => onWorkoutPress(todayWorkout)}
                activeOpacity={0.9}
            >
                <Image source={{ uri: todayWorkout.image }} style={styles.heroImage} />
                <LinearGradient
                    colors={['transparent', 'rgba(2, 6, 23, 0.4)', '#020617']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.heroContent}>
                    <View style={styles.tagsRow}>
                        <BlurView intensity={20} style={styles.tagBlur}>
                            <Text style={styles.tagTextLime}>{todayWorkout.level}</Text>
                        </BlurView>
                        <BlurView intensity={20} style={styles.tagBlur}>
                            <Text style={styles.tagTextWhite}>{todayWorkout.duration}</Text>
                        </BlurView>
                    </View>
                    <Text style={styles.heroTitle}>{todayWorkout.title}</Text>
                    <Text style={styles.heroSubtitle}>{todayWorkout.subtitle}</Text>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => onWorkoutPress(todayWorkout)}
                    >
                        <Play size={18} color={colors.slate950} fill={colors.slate900} />
                        <Text style={styles.startButtonText}>Começar Agora</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {/* Routine Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sua Rotina</Text>
                <ArrowRight size={18} color={colors.slate500} />
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
            >
                {workoutsData.slice(1).map((workout) => (
                    <WorkoutCard
                        key={workout.id}
                        workout={workout}
                        onPress={onWorkoutPress}
                    />
                ))}
                <View style={{ width: 24 }} />
            </ScrollView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    welcomeText: {
        color: colors.slate400,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    userNameText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: colors.white,
        letterSpacing: -0.5,
    },
    avatarContainer: {
        padding: 2,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: colors.slate700,
        backgroundColor: colors.slate800,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.slate700,
        alignItems: 'center',
    },
    statIcon: {
        marginBottom: 8,
    },
    statValue: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    statGoal: {
        color: colors.slate400,
        fontSize: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
    },
    linkText: {
        color: colors.lime400,
        fontSize: 14,
        fontWeight: '500',
    },
    heroCard: {
        height: 256,
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: 32,
        backgroundColor: colors.slate800,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    heroContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    tagBlur: {
        overflow: 'hidden',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tagTextLime: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        color: colors.lime400,
        fontSize: 12,
        fontWeight: '500',
        backgroundColor: 'rgba(163, 230, 53, 0.2)',
    },
    tagTextWhite: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        color: colors.white,
        fontSize: 12,
        fontWeight: '500',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 14,
        color: colors.slate300,
        marginBottom: 16,
    },
    startButton: {
        backgroundColor: colors.lime400,
        paddingVertical: 14,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    startButtonText: {
        color: colors.slate950,
        fontWeight: 'bold',
        fontSize: 16,
    },
    horizontalScroll: {
        paddingRight: 24,
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
});
