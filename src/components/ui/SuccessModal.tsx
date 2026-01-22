import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassView } from './GlassView'; // Adjust import if needed
import { COLORS, SIZES, SPACING, RADIUS } from '../../constants/theme';
import { Check } from 'lucide-react-native';
import { AnimatedState } from './AnimatedState';

interface SuccessModalProps {
    visible: boolean;
    message: string;
    onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ visible, message, onClose }) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000); // Auto close after 2s
            return () => clearTimeout(timer);
        }
    }, [visible]);

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <GlassView style={styles.card} intensity={40} gradientBorder>
                    <AnimatedState icon={Check} color={COLORS.success} size={48} />
                    <Text style={styles.message}>{message}</Text>
                </GlassView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.l,
        width: 250,
        aspectRatio: 1,
    },
    message: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
        marginTop: SPACING.m,
        textAlign: 'center',
    }
});
