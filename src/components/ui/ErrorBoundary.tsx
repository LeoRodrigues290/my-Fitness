import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import { OctagonAlert, RotateCw } from 'lucide-react-native'; // Assuming lucide is installed, using placeholder
import { Screen } from './Screen';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        // Here you would log to a service like Sentry
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Screen style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            {/* Simple text icon if lucide fails in class component context */}
                            <Text style={{ fontSize: 48 }}>⚠️</Text>
                        </View>
                        <Text style={styles.title}>Ops! Algo deu errado.</Text>
                        <Text style={styles.message}>
                            {this.state.error?.message || "Um erro inesperado ocorreu."}
                        </Text>

                        <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
                            <Text style={styles.buttonText}>Tentar Novamente</Text>
                        </TouchableOpacity>
                    </View>
                </Screen>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        padding: SPACING.xl,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: SPACING.l,
    },
    title: {
        color: COLORS.white,
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    message: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.background, // Contrast color
        fontSize: SIZES.body,
        fontWeight: 'bold',
    },
});
