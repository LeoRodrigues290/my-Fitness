import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
    const [displayedQuote, setDisplayedQuote] = useState('');
    const [streak, setStreak] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fullQuote = getRandomQuote();
        setQuote(fullQuote);

        // Typing animation effect
        let index = 0;
        setDisplayedQuote('');
        const timer = setInterval(() => {
            if (index < fullQuote.length) {
                setDisplayedQuote(fullQuote.substring(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
            }
        }, 40); // 40ms per character for smooth effect

        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

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

        return () => clearInterval(timer);
    }, [users]);

    return (
        <View style={styles.container}>
            {/* Background Image - Improved visibility */}
            <View style={StyleSheet.absoluteFill}>
                <Image
                    source={{ uri: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" }}
                    style={styles.backgroundImage}
                />
                {/* Lighter gradient for better image visibility */}
                <LinearGradient
                    colors={['rgba(2, 6, 23, 0.4)', 'rgba(2, 6, 23, 0.6)', 'rgba(2, 6, 23, 0.9)']}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                {/* App Logo/Icon */}
                <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
                    <View style={styles.logoBox}>
                        <Dumbbell size={40} color={colors.slate900} fill={colors.slate900} />
                    </View>
                </Animated.View>

                {/* Glass Card with enhanced blur */}
                <BlurView intensity={60} tint="dark" style={styles.glassCard}>
                    <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>

                    {/* Streak Counter */}
                    <View style={styles.streakContainer}>
                        <Flame size={24} color={colors.orange400} fill={colors.orange400} />
                        <Text style={styles.streakText}>{streak} dias seguidos</Text>
                    </View>

                    {/* Quote - Enhanced prominence with typing effect */}
                    <View style={styles.quoteContainer}>
                        <Text style={styles.quoteLabel}>💪 MOTIVAÇÃO DO DIA</Text>
                        <View style={styles.quoteBox}>
                            <Text style={styles.quoteText}>"{displayedQuote}"</Text>
                            <View style={styles.cursor} />
                        </View>
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
        opacity: 0.85, // Increased from 0.6 for better visibility
    },
    safeArea: {
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    logoContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    logoBox: {
        width: 80,
        height: 80,
        backgroundColor: colors.lime400,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.lime400,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
        elevation: 10,
    },
    glassCard: {
        width: '100%',
        padding: 28,
        borderRadius: 28,
        backgroundColor: 'rgba(15, 23, 42, 0.5)', // Darker glass for better contrast
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        overflow: 'hidden',
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 20,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
        backgroundColor: 'rgba(251, 146, 60, 0.15)', // Orange tint
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.3)',
    },
    streakText: {
        color: colors.orange400,
        fontSize: 16,
        fontWeight: 'bold',
    },
    quoteContainer: {
        marginBottom: 28,
        width: '100%',
        alignItems: 'center',
    },
    quoteLabel: {
        color: colors.lime400,
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 12,
    },
    quoteBox: {
        backgroundColor: 'rgba(163, 230, 53, 0.08)', // Subtle lime tint
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(163, 230, 53, 0.2)',
        width: '100%',
        minHeight: 80,
        flexDirection: 'row',
        alignItems: 'center',
    },
    quoteText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 28,
        flex: 1,
    },
    cursor: {
        width: 2,
        height: 20,
        backgroundColor: colors.lime400,
        marginLeft: 2,
        opacity: 0.8,
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
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
    enterButtonText: {
        color: colors.slate950,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
});
