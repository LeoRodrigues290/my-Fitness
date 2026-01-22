import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flame, Dumbbell, ArrowRight } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { getRandomQuote } from '../../constants/quotes';
import { useUser } from '../../context/UserContext';
import { UserRepository } from '../../services/UserRepository';

interface LoginScreenProps {
    onEnter: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onEnter }) => {
    const { users } = useUser();
    const [quote, setQuote] = useState('');
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        setQuote(getRandomQuote());

        const loadStreak = async () => {
            if (users && users.length > 0) {
                try {
                    const streakVal = await UserRepository.getUserStreak(users[0].id);
                    setStreak(streakVal);
                } catch (e) {
                    console.log("Error loading streak", e);
                }
            }
        };
        loadStreak();
    }, [users]);

    return (
        <View style={styles.container}>
            {/* Background Image */}
            <View style={StyleSheet.absoluteFill}>
                <Image
                    source={{ uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" }}
                    style={styles.backgroundImage}
                />
                <LinearGradient
                    colors={['#020617', 'rgba(2, 6, 23, 0.8)', '#020617']}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                {/* App Logo/Icon */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <Dumbbell size={40} color={colors.slate900} fill={colors.slate900} />
                    </View>
                </View>

                {/* Glass Card */}
                <BlurView intensity={30} tint="light" style={styles.glassCard}>
                    <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>

                    {/* Streak Counter */}
                    <View style={styles.streakContainer}>
                        <Flame size={24} color={colors.orange400} fill={colors.orange400} />
                        <Text style={styles.streakText}>{streak} dias seguidos</Text>
                    </View>

                    {/* Quote */}
                    <View style={styles.quoteContainer}>
                        <Text style={styles.quoteText}>"{quote}"</Text>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity onPress={onEnter} style={styles.enterButton}>
                        <Text style={styles.enterButtonText}>BORA TREINAR</Text>
                        <ArrowRight size={20} color={colors.slate950} />
                    </TouchableOpacity>
                </BlurView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: colors.slate950,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    safeArea: {
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    logoContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    logoBox: {
        width: 80,
        height: 80,
        backgroundColor: colors.lime400,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: colors.lime400,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
    },
    glassCard: {
        width: '100%',
        padding: 32,
        borderRadius: 32,
        backgroundColor: 'rgba(30, 41, 59, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        overflow: 'hidden',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 24,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 100,
    },
    streakText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    quoteContainer: {
        marginBottom: 40,
    },
    quoteText: {
        color: colors.slate300,
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 24,
    },
    enterButton: {
        width: '100%',
        backgroundColor: colors.lime400,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        shadowColor: colors.lime400,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    enterButtonText: {
        color: colors.slate950,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
});
