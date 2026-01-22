import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassView } from './GlassView';
import { COLORS, RADIUS, SPACING, SIZES } from '../../constants/theme';
import { Check, X, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning';
    onClose: () => void;
    onConfirm?: () => void;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    type = 'success',
    onClose,
    onConfirm,
    showCancel = false,
    confirmText = 'OK',
    cancelText = 'Cancelar'
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <Check color={COLORS.success} size={40} />;
            case 'error':
                return <X color={COLORS.error} size={40} />;
            case 'warning':
                return <AlertTriangle color={COLORS.warning} size={40} />;
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return 'rgba(16, 185, 129, 0.2)'; // success
            case 'error': return 'rgba(239, 68, 68, 0.2)';   // error
            case 'warning': return 'rgba(245, 158, 11, 0.2)'; // warning
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
                <Animated.View entering={ZoomIn.duration(300)}>
                    <GlassView style={styles.modal} intensity={30}>
                        <View style={[styles.iconContainer, { backgroundColor: getColor() }]}>
                            {getIcon()}
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <View style={styles.buttonRow}>
                            {showCancel && (
                                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                    <Text style={styles.cancelText}>{cancelText}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.confirmButton, { backgroundColor: type === 'error' ? COLORS.error : type === 'warning' ? COLORS.warning : COLORS.primary }]}
                                onPress={() => {
                                    if (onConfirm) onConfirm();
                                    else onClose();
                                }}
                            >
                                <Text style={styles.confirmText}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modal: {
        width: 300,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    title: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: 'bold',
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    message: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.l,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.m,
        width: '100%',
        justifyContent: 'center',
    },
    confirmButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: RADIUS.m,
        minWidth: 100,
        alignItems: 'center',
    },
    confirmText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: SIZES.body,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: RADIUS.m,
        borderColor: COLORS.textSecondary,
        borderWidth: 1,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: SIZES.body,
    }
});
