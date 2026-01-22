import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet
} from 'react-native';
import { BlurView } from 'expo-blur';
import { User, Edit2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    initialName?: string;
    initialAvatar?: string;
    onSave: (name: string, avatar: string | null) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    visible,
    onClose,
    initialName = '',
    initialAvatar = null,
    onSave
}) => {
    const [name, setName] = useState(initialName);
    const [avatar, setAvatar] = useState<string | null>(initialAvatar);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setName(initialName || '');
            setAvatar(initialAvatar || null);
        }
    }, [visible, initialName, initialAvatar]);

    const pickImage = async () => {
        try {
            const ImagePicker = await import('expo-image-picker');
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setAvatar(result.assets[0].uri);
            }
        } catch (e) {
            console.log("Error picking image", e);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        await onSave(name, avatar);
        setLoading(false);
        onClose();
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <BlurView
                intensity={50}
                tint="dark"
                style={styles.blurContainer}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Editar Perfil</Text>

                    <TouchableOpacity onPress={pickImage} style={styles.avatarButton}>
                        <View style={styles.avatarContainer}>
                            {avatar ? (
                                <Image source={{ uri: avatar }} style={styles.avatar} />
                            ) : (
                                <User size={40} color={colors.slate400} />
                            )}
                        </View>
                        <View style={styles.editBadge}>
                            <Edit2 size={16} color={colors.slate900} />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.label}>Seu Nome</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        placeholder="Digite seu nome"
                        placeholderTextColor={colors.slate600}
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            style={styles.saveButton}
                            disabled={loading}
                        >
                            <Text style={styles.saveButtonText}>
                                {loading ? 'Salvando...' : 'Salvar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    blurContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: colors.slate800,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.slate700,
    },
    title: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    avatarButton: {
        alignSelf: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: colors.lime400,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.slate700,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.lime400,
        padding: 6,
        borderRadius: 20,
    },
    label: {
        color: colors.slate400,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.slate900,
        color: colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.slate600,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.lime400,
        alignItems: 'center',
    },
    saveButtonText: {
        color: colors.slate900,
        fontWeight: 'bold',
    },
});
