import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import { ChevronLeft } from 'lucide-react-native';

interface GlassHeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightElement?: React.ReactNode;
    style?: any;
    titleStyle?: TextStyle;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({
    title,
    subtitle,
    showBack,
    onBack,
    rightElement,
    style,
    titleStyle
}) => {
    const insets = useSafeAreaInsets();
    // Platform optimized intensity
    const intensity = Platform.OS === 'android' ? 80 : 60;

    return (
        <View style={[styles.wrapper, { height: 60 + insets.top }, style]}>
            <BlurView
                intensity={intensity}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
            />
            {/* Overlay for tint adjustment */}
            <View style={styles.overlay} />

            {/* Bottom Border */}
            <View style={styles.borderBottom} />

            <View style={[styles.content, { paddingTop: insets.top }]}>
                <View style={styles.leftContainer}>
                    {showBack && (
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <ChevronLeft color={COLORS.white} size={24} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.centerContainer}>
                    {title && <Text style={[styles.title, titleStyle]} numberOfLines={1}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
                </View>

                <View style={styles.rightContainer}>
                    {rightElement}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
    },
    borderBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
    },
    leftContainer: {
        width: 40,
        alignItems: 'flex-start',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightContainer: {
        width: 40,
        alignItems: 'flex-end',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    title: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        textAlign: 'center',
    }
});
