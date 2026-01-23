import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView, BlurViewProps } from 'expo-blur';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    tint?: BlurViewProps['tint'];
    variant?: 'default' | 'highlight' | 'dark';
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    style,
    intensity = 50,
    tint = 'dark',
    variant = 'default'
}) => {
    // Platform optimized intensity
    const finalIntensity = Platform.OS === 'android' ? Math.min(intensity, 40) : intensity;

    // Variant styles
    const getBorderColor = () => {
        switch (variant) {
            case 'highlight': return COLORS.success; // Lime
            case 'dark': return 'rgba(15, 23, 42, 0.4)'; // Darker
            default: return 'rgba(255, 255, 255, 0.1)';
        }
    };

    const getBackgroundColor = () => {
        switch (variant) {
            case 'highlight': return 'rgba(163, 230, 53, 0.1)';
            case 'dark': return 'rgba(2, 6, 23, 0.6)';
            default: return 'rgba(30, 41, 59, 0.4)'; // Slate glass
        }
    };

    return (
        <View style={[styles.container, { borderColor: getBorderColor(), backgroundColor: getBackgroundColor() }, style]}>
            <BlurView
                intensity={finalIntensity}
                tint={tint}
                style={StyleSheet.absoluteFillObject}
            />
            {/* Inner Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: RADIUS.m,
        overflow: 'hidden',
        borderWidth: 1,
    },
    content: {
        padding: SPACING.m,
        zIndex: 1,
    }
});
