import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { GlassView } from './GlassView';
import { X, Play, Info } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoInstructionModalProps {
    visible: boolean;
    videoId: string | null;
    exerciseName: string;
    instructions: string | null;
    muscleGroup?: string;
    onClose: () => void;
}

export const VideoInstructionModal: React.FC<VideoInstructionModalProps> = ({
    visible,
    videoId,
    exerciseName,
    instructions,
    muscleGroup,
    onClose
}) => {
    const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: string) => {
        if (state === 'ended') {
            setPlaying(false);
        }
    }, []);

    // Reset playing state when modal opens
    React.useEffect(() => {
        if (visible) {
            setPlaying(true);
        } else {
            setPlaying(false);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            {muscleGroup && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{muscleGroup}</Text>
                                </View>
                            )}
                            <Text style={styles.title} numberOfLines={2}>{exerciseName}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X color={COLORS.white} size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Video Player */}
                    {videoId ? (
                        <View style={styles.videoContainer}>
                            <YoutubePlayer
                                height={220}
                                width={SCREEN_WIDTH - SPACING.l * 2}
                                play={playing}
                                videoId={videoId}
                                onChangeState={onStateChange}
                                webViewStyle={styles.video}
                            />
                        </View>
                    ) : (
                        <GlassView style={styles.noVideoContainer} intensity={20}>
                            <Play color={COLORS.textSecondary} size={48} />
                            <Text style={styles.noVideoText}>Vídeo não disponível</Text>
                        </GlassView>
                    )}

                    {/* Instructions */}
                    {instructions && (
                        <ScrollView style={styles.instructionsContainer} showsVerticalScrollIndicator={false}>
                            <View style={styles.instructionsHeader}>
                                <Info color={COLORS.lime} size={18} />
                                <Text style={styles.instructionsTitle}>Instruções</Text>
                            </View>
                            <Text style={styles.instructionsText}>{instructions}</Text>
                        </ScrollView>
                    )}

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
                        <Text style={styles.closeBtnText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: SPACING.l,
        paddingHorizontal: SPACING.l,
        paddingBottom: SPACING.xl,
        maxHeight: SCREEN_HEIGHT * 0.85,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.l,
    },
    headerContent: {
        flex: 1,
        marginRight: SPACING.m,
    },
    badge: {
        backgroundColor: `${COLORS.lime}20`,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
        alignSelf: 'flex-start',
        marginBottom: SPACING.s,
    },
    badgeText: {
        color: COLORS.lime,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: SIZES.h2,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    closeButton: {
        padding: SPACING.xs,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: RADIUS.m,
    },
    videoContainer: {
        borderRadius: RADIUS.m,
        overflow: 'hidden',
        marginBottom: SPACING.l,
        backgroundColor: '#000',
    },
    video: {
        borderRadius: RADIUS.m,
    },
    noVideoContainer: {
        height: 180,
        borderRadius: RADIUS.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    noVideoText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.m,
        fontSize: SIZES.body,
    },
    instructionsContainer: {
        maxHeight: 150,
        marginBottom: SPACING.l,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        marginBottom: SPACING.s,
    },
    instructionsTitle: {
        color: COLORS.white,
        fontSize: SIZES.body,
        fontWeight: '600',
    },
    instructionsText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        lineHeight: 24,
    },
    closeBtn: {
        backgroundColor: COLORS.lime,
        paddingVertical: 16,
        borderRadius: RADIUS.m,
        alignItems: 'center',
    },
    closeBtnText: {
        color: COLORS.background,
        fontSize: SIZES.body,
        fontWeight: 'bold',
    },
});
