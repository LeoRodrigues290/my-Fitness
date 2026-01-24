import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, FONTS, SIZES } from '../../constants/theme';

interface GradientButtonProps {
    title: string;
    onPress: () => void;
    colors?: readonly [string, string, ...string[]];
    style?: ViewStyle;
    textStyle?: TextStyle;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
    title,
    onPress,
    colors = COLORS.gradients.primary,
    style,
    textStyle,
    loading = false,
    disabled = false,
    icon
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled || loading}
            style={[styles.container, style]}
        >
            <LinearGradient
                colors={colors as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <>
                        {icon && icon}
                        <Text style={[styles.text, textStyle, icon ? { marginLeft: SPACING.s } : {}]}>
                            {title}
                        </Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: RADIUS.l,
        overflow: 'hidden',
        height: 48,
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.l,
    },
    text: {
        color: COLORS.white,
        // fontFamily: FONTS.bold, // Enable when fonts are loaded
        fontWeight: 'bold',
        fontSize: SIZES.body,
    },
});
