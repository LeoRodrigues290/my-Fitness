import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { COLORS } from '../../constants/theme';
import { LucideIcon } from 'lucide-react-native';

interface AnimatedStateProps {
    icon: LucideIcon;
    color?: string;
    size?: number;
    style?: ViewStyle;
}

export const AnimatedState: React.FC<AnimatedStateProps> = ({ icon: Icon, color = COLORS.primary, size = 48, style }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.5, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.container, style]}>
            <Animated.View style={[styles.circle, { borderColor: color }, animatedStyle]}>
                <View style={[styles.innerCircle, { backgroundColor: color, opacity: 0.2 }]} />
            </Animated.View>
            <View style={{ position: 'absolute' }}>
                <Icon color={color} size={size} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        height: 100,
    },
    circle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
    }
});
