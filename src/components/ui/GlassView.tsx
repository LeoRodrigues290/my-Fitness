import React from 'react';
import { StyleSheet, View, ViewStyle, Platform, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS } from '../../constants/theme';

interface GlassViewProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    gradientBorder?: boolean;
}

// Enhanced GlassView for better visibility
export const GlassView: React.FC<GlassViewProps> = ({
    children,
    style,
    intensity = 10,
    tint = 'dark',
    gradientBorder = false
}) => {
    return (
        <View style={[styles.container, style]}>
            {/* Fallback Background for when Blur fails or isn't supported */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.6)' }]} />

            <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />

            <View style={styles.content}>
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
