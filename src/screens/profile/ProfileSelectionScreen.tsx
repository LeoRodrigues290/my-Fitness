import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { useUser } from '../../context/UserContext';
import { User as UserIcon, Edit2, Check, X } from 'lucide-react-native';
import { GradientButton } from '../../components/ui/GradientButton';

export const ProfileSelectionScreen = () => {
    const { selectUser, updateUser, users } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
    const [newName, setNewName] = useState('');

    const handleSelect = async (userId: number) => {
        if (isEditing) {
            const user = users.find(u => u.id === userId);
            if (user) {
                setSelectedUserForEdit(user);
                setNewName(user.name);
            }
        } else {
            await selectUser(userId);
        }
    };

    const saveEdit = async () => {
        if (selectedUserForEdit && newName.trim()) {
            await updateUser(selectedUserForEdit.id, newName.trim());
            setSelectedUserForEdit(null);
            setIsEditing(false);
        }
    };

    return (
        <Screen style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Quem vai treinar hoje?</Text>

                <View style={styles.profilesContainer}>
                    {users.map((user) => (
                        <TouchableOpacity
                            key={user.id}
                            activeOpacity={0.8}
                            onPress={() => handleSelect(user.id)}
                        >
                            <GlassView style={[styles.card, isEditing && styles.cardEditing]} intensity={30} gradientBorder>
                                <View style={styles.avatarContainer}>
                                    {user.avatar_uri ? (
                                        <Image source={{ uri: user.avatar_uri }} style={styles.avatar} />
                                    ) : (
                                        <UserIcon size={48} color={COLORS.primary} />
                                    )}
                                    {isEditing && (
                                        <View style={styles.editBadge}>
                                            <Edit2 size={12} color={COLORS.white} />
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.userName}>{user.name}</Text>
                            </GlassView>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.editToggle}
                    onPress={() => setIsEditing(!isEditing)}
                >
                    <Text style={styles.editToggleText}>
                        {isEditing ? "Cancelar Edição" : "Editar Perfis"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Edit Modal */}
            <Modal
                visible={!!selectedUserForEdit}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedUserForEdit(null)}
            >
                <View style={styles.modalOverlay}>
                    <GlassView style={styles.modalContent} intensity={40}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Perfil</Text>
                            <TouchableOpacity onPress={() => setSelectedUserForEdit(null)}>
                                <X color={COLORS.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Nome</Text>
                        <TextInput
                            style={styles.input}
                            value={newName}
                            onChangeText={setNewName}
                            autoFocus
                        />

                        <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                            <Text style={styles.saveBtnText}>Salvar</Text>
                        </TouchableOpacity>
                    </GlassView>
                </View>
            </Modal>
        </Screen>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        paddingHorizontal: SPACING.l,
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: SIZES.h1,
        color: COLORS.white,
        fontWeight: 'bold',
        marginBottom: SPACING.xxl,
        textAlign: 'center',
    },
    profilesContainer: {
        flexDirection: 'row',
        gap: SPACING.l,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    card: {
        width: 150,
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.m,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cardEditing: {
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.circle,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.m,
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.circle,
    },
    userName: {
        fontSize: SIZES.h3,
        color: COLORS.white,
        fontWeight: '600',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.black,
    },
    editToggle: {
        marginTop: SPACING.xl,
        padding: SPACING.m,
    },
    editToggleText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        textDecorationLine: 'underline',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: SPACING.l,
    },
    modalContent: {
        padding: SPACING.l,
        borderRadius: RADIUS.m,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        color: COLORS.white,
        fontSize: SIZES.h3,
        fontWeight: 'bold',
    },
    label: {
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: SPACING.m,
        borderRadius: RADIUS.s,
        color: COLORS.white,
        fontSize: SIZES.body,
        marginBottom: SPACING.l,
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: RADIUS.s,
        alignItems: 'center',
    },
    saveBtnText: {
        color: COLORS.white,
        fontWeight: 'bold',
    }
});
