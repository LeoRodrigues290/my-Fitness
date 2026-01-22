import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Vibration } from 'react-native';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { X, SkipForward, Timer } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = 180;
const STROKE_WIDTH = 12;

interface RestTimerOverlayProps {
    visible: boolean;
    duration: number; // in seconds
    exerciseName?: string;
    onComplete: () => void;
    onSkip: () => void;
}

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({
    visible,
    duration,
    exerciseName,
    onComplete,
    onSkip
}) => {
    const [remainingTime, setRemainingTime] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const progressAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Reset and start timer when visible changes
    useEffect(() => {
        if (visible) {
            setRemainingTime(duration);
            setIsRunning(true);
            progressAnim.setValue(1);

            // Fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();

            // Animate progress
            Animated.timing(progressAnim, {
                toValue: 0,
                duration: duration * 1000,
                useNativeDriver: false,
            }).start();
        } else {
            setIsRunning(false);
            fadeAnim.setValue(0);
        }
    }, [visible, duration]);

    // Countdown logic
    useEffect(() => {
        if (!isRunning || remainingTime <= 0) return;

        const interval = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleTimerComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, remainingTime]);

    const handleTimerComplete = async () => {
        // Vibrate and haptic feedback
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Vibration.vibrate([0, 200, 100, 200]);
        } catch (e) {
            // Haptics not available on some devices
        }

        setTimeout(() => {
            onComplete();
        }, 500);
    };

    const handleSkip = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) { }
        onSkip();
    };

    // Add 30 seconds
    const handleAdd30 = () => {
        setRemainingTime(prev => prev + 30);
        progressAnim.setValue((remainingTime + 30) / duration);
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: (remainingTime + 30) * 1000,
            useNativeDriver: false,
        }).start();
    };

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        return `${secs}`;
    };

    // Calculate circle progress
    const progressInterpolate = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!visible) return null;

    return (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <View style={styles.container}>
                {/* Close button */}
                <TouchableOpacity onPress={handleSkip} style={styles.closeBtn}>
                    <X color={COLORS.textSecondary} size={24} />
                </TouchableOpacity>

                {/* Title */}
                <View style={styles.header}>
                    <Timer color={COLORS.lime} size={20} />
                    <Text style={styles.title}>Tempo de Descanso</Text>
                </View>

                {exerciseName && (
                    <Text style={styles.exerciseName}>{exerciseName}</Text>
                )}

                {/* Circular Timer */}
                <View style={styles.timerContainer}>
                    {/* Background circle */}
                    <View style={styles.circleBackground} />

                    {/* Progress indicator */}
                    <Animated.View
                        style={[
                            styles.progressContainer,
                            { transform: [{ rotate: progressInterpolate }] }
                        ]}
                    >
                        <View style={styles.progressIndicator} />
                    </Animated.View>

                    {/* Time display */}
                    <View style={styles.timeDisplay}>
                        <Text style={styles.timeText}>{formatTime(remainingTime)}</Text>
                        <Text style={styles.timeLabel}>segundos</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleAdd30}>
                        <Text style={styles.actionBtnText}>+30s</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                        <SkipForward color={COLORS.white} size={20} />
                        <Text style={styles.skipBtnText}>Pular</Text>
                    </TouchableOpacity>
                </View>

                {/* Tip */}
                <Text style={styles.tip}>
                    {remainingTime > 30
                        ? 'Descanse e recupere a energia 💪'
                        : remainingTime > 10
                            ? 'Prepare-se para a próxima série!'
                            : '🔥 Hora de voltar!'}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        width: SCREEN_WIDTH - SPACING.xl * 2,
        backgroundColor: COLORS.card,
        borderRadius: 32,
        padding: SPACING.xl,
        alignItems: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: SPACING.m,
        right: SPACING.m,
        padding: SPACING.s,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginBottom: SPACING.xs,
    },
    title: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    exerciseName: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginBottom: SPACING.l,
    },
    timerContainer: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: SPACING.l,
    },
    circleBackground: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        borderWidth: STROKE_WIDTH,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    progressContainer: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    progressIndicator: {
        width: STROKE_WIDTH + 4,
        height: STROKE_WIDTH + 4,
        borderRadius: (STROKE_WIDTH + 4) / 2,
        backgroundColor: COLORS.lime,
        marginTop: -2,
    },
    timeDisplay: {
        alignItems: 'center',
    },
    timeText: {
        color: COLORS.white,
        fontSize: 56,
        fontWeight: 'bold',
        letterSpacing: -2,
    },
    timeLabel: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginTop: -4,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginTop: SPACING.m,
    },
    actionBtn: {
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: RADIUS.m,
    },
    actionBtnText: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    skipBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.lime,
        borderRadius: RADIUS.m,
    },
    skipBtnText: {
        color: COLORS.background,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    tip: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        marginTop: SPACING.l,
        textAlign: 'center',
    },
});
