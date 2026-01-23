import React from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    ViewStyle,
    Platform,
    KeyboardAvoidingView,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

interface ScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
    preset?: 'fixed' | 'scroll' | 'auto'; // Future use
    keyboardAvoiding?: boolean;
    safeAreaBottom?: boolean;
    safeAreaTop?: boolean;
    dismissKeyboardOnTap?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
    children,
    style,
    keyboardAvoiding = false,
    safeAreaBottom = true,
    safeAreaTop = true,
    dismissKeyboardOnTap = true
}) => {
    const insets = useSafeAreaInsets();

    // Wrapper for keyboard dismiss
    const Wrapper = dismissKeyboardOnTap ? TouchableWithoutFeedback : View;
    // TouchableWithoutFeedback needs explicit onPress to work as a wrapper without visual feedback
    const wrapperProps = dismissKeyboardOnTap ? { onPress: Keyboard.dismiss, accessible: false } : {};

    // Use SafeAreaView or View with padding based on props
    const Container = safeAreaTop ? SafeAreaView : View;

    // Container Logic
    const containerStyle = [
        styles.container,
        !safeAreaTop && { paddingTop: insets.top }, // Manual padding if not SafeAreaView
        style
    ] as ViewStyle;

    const content = (
        <Wrapper {...wrapperProps}>
            <View style={[styles.content]}>
                <StatusBar
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent
                />
                {children}
            </View>
        </Wrapper>
    );

    if (keyboardAvoiding) {
        return (
            <Container style={[containerStyle, { flex: 1 }]}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {content}
                </KeyboardAvoidingView>
            </Container>
        );
    }

    return (
        <Container style={containerStyle}>
            {content}
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        backgroundColor: 'transparent',
    }
});
