import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS } from '../../constants/theme';

interface GlassViewProps {
    children: React.ReactNode;
    style?: ViewStyle;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    gradientBorder?: boolean;
}

export const GlassView: React.FC<GlassViewProps> = ({
    children,
    style,
    intensity = 20,
    tint = 'dark',
    gradientBorder = false
}) => {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
            <View style={[styles.content, { backgroundColor: COLORS.gradients.card[0] }]}>
                {children}
            </View>
        </View>
    );
};

// Simplified version since Android Blur support varies or can be heavy
// Using a semi-transparent background for "Glass" effect
const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: RADIUS.m,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
    },
    content: {
        padding: 0,
    }
});
