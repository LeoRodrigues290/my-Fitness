import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Edit2, Settings, Activity, ArrowRight, LogOut } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { useUser } from '../../context/UserContext';
import { EditProfileModal } from '../../components/modals/EditProfileModal';

interface ProfileScreenProps {
    onSettingsPress: () => void;
    onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
    onSettingsPress,
    onLogout
}) => {
    const insets = useSafeAreaInsets();
    const { currentUser, updateUser, userPreferences } = useUser();
    const [isEditModalVisible, setEditModalVisible] = useState(false);

    const handleUpdateProfile = async (newName: string, newAvatar: string | null) => {
        if (currentUser) {
            await updateUser(currentUser.id, newName, newAvatar || undefined);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Perfil</Text>
                <TouchableOpacity
                    onPress={() => setEditModalVisible(true)}
                    style={styles.editButton}
                >
                    <Edit2 size={20} color={colors.lime400} />
                </TouchableOpacity>
            </View>

            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    {currentUser?.avatar_uri ? (
                        <Image source={{ uri: currentUser.avatar_uri }} style={styles.avatar} />
                    ) : (
                        <User size={40} color={colors.lime400} />
                    )}
                </View>
                <Text style={styles.userName}>{currentUser?.name || "Visitante"}</Text>
                <Text style={styles.memberType}>Membro Pro</Text>

                <View style={styles.goalsRow}>
                    <View style={styles.goalItem}>
                        <Text style={styles.goalValue}>{userPreferences.goals.weight}kg</Text>
                        <Text style={styles.goalLabel}>Meta</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.goalItem}>
                        <Text style={styles.goalValue}>{userPreferences.goals.kcal}</Text>
                        <Text style={styles.goalLabel}>Kcal</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={onSettingsPress}>
                <Settings size={20} color={colors.white} />
                <Text style={styles.menuItemText}>Configurações</Text>
                <ArrowRight size={16} color={colors.slate600} style={styles.menuArrow} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
                <Activity size={20} color={colors.white} />
                <Text style={styles.menuItemText}>Histórico</Text>
                <ArrowRight size={16} color={colors.slate600} style={styles.menuArrow} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                <LogOut size={20} color={colors.red500} />
                <Text style={styles.logoutText}>Sair da Conta</Text>
            </TouchableOpacity>

            <EditProfileModal
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                initialName={currentUser?.name}
                initialAvatar={currentUser?.avatar_uri}
                onSave={handleUpdateProfile}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
    },
    editButton: {
        padding: 8,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.slate800,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.lime400,
        marginBottom: 16,
        overflow: 'hidden',
    },
    avatar: {
        width: 100,
        height: 100,
    },
    userName: {
        fontSize: 30,
        fontWeight: 'bold',
        color: colors.white,
        letterSpacing: -0.5,
    },
    memberType: {
        color: colors.slate400,
    },
    goalsRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 16,
    },
    goalItem: {
        alignItems: 'center',
    },
    goalValue: {
        color: colors.white,
        fontWeight: 'bold',
    },
    goalLabel: {
        color: colors.slate500,
        fontSize: 10,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: colors.slate700,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderWidth: 1,
        borderColor: colors.slate700,
        marginBottom: 12,
        gap: 16,
    },
    menuItemText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '500',
    },
    menuArrow: {
        marginLeft: 'auto',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        marginTop: 40,
        gap: 16,
    },
    logoutText: {
        color: colors.red500,
        fontSize: 16,
        fontWeight: '500',
    },
});
