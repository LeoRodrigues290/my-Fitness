import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, ViewStyle, Platform } from 'react-native';
import { COLORS } from '../../constants/theme';

interface ScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({ children, style }) => {
    return (
        <SafeAreaView style={[styles.container, style]}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            <View style={[styles.content, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        backgroundColor: COLORS.background,
    }
});
