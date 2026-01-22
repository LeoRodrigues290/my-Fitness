import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { GlassView } from './GlassView';
import { Bell, User, Settings, LogOut, Flame } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { UserRepository } from '../../services/UserRepository';

interface AppHeaderProps {
    title?: string;
    showNotification?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showNotification = true }) => {
    const { currentUser, setUser } = useUser();
    const navigation = useNavigation<any>();
    const [menuVisible, setMenuVisible] = useState(false);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (currentUser) {
            UserRepository.getUserStreak(currentUser.id).then(setStreak);
        }
    }, [currentUser]);

    const handleLogout = () => {
        setMenuVisible(false);
        setUser(null);
        // Navigation stack change handled by AppNavigator based on user state
    };

    const menuItems = [
        {
            icon: Settings,
            label: 'Configurações',
            action: () => {
                setMenuVisible(false);
                navigation.navigate('Settings');
            }
        },
        {
            icon: LogOut,
            label: 'Sair',
            action: handleLogout,
            color: COLORS.error
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.leftContainer}>
                {title && <Text style={styles.title}>{title}</Text>}
            </View>

            <View style={styles.actions}>
                {/* Streak Badge - Icon + Number only */}
                <GlassView style={styles.streakBadge} intensity={20}>
                    <Flame size={16} color={COLORS.lime} fill={COLORS.lime} />
                    <Text style={styles.streakText}>{streak}</Text>
                </GlassView>

                {showNotification && (
                    <TouchableOpacity style={styles.iconButton}>
                        <Bell color={COLORS.white} size={24} />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => setMenuVisible(true)}
                >
                    <View style={styles.avatar}>
                        <User color={COLORS.white} size={20} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Dropdown Menu Modal */}
            <Modal transparent visible={menuVisible} animationType="fade">
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <GlassView style={styles.menu} intensity={40}>
                        <View style={styles.menuHeader}>
                            <View style={styles.avatarLarge}>
                                <User color={COLORS.white} size={30} />
                            </View>
                            <View>
                                <Text style={styles.menuName}>{currentUser?.name}</Text>
                                <Text style={styles.menuSub}>Conta Ativa</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={item.action}
                            >
                                <item.icon size={20} color={item.color || COLORS.textSecondary} />
                                <Text style={[styles.menuItemText, item.color && { color: item.color }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </GlassView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
        paddingBottom: SPACING.m,
        zIndex: 100,
    },
    leftContainer: {
        flex: 1,
    },
    title: {
        color: COLORS.white,
        fontSize: SIZES.h2,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.l,
        backgroundColor: 'rgba(163, 230, 53, 0.15)', // lime tint
        marginRight: SPACING.s,
    },
    streakText: {
        color: COLORS.lime,
        fontWeight: 'bold',
        fontSize: SIZES.body,
    },
    iconButton: {
        padding: SPACING.s,
    },
    badge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error,
        borderWidth: 1,
        borderColor: COLORS.background,
    },
    profileButton: {
        padding: 2,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 25,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Menu Styles
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    menu: {
        position: 'absolute',
        top: 60, // below header
        right: SPACING.l,
        width: 220,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        overflow: 'hidden',
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
        marginBottom: SPACING.m,
    },
    avatarLarge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuName: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: SIZES.body,
    },
    menuSub: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: SPACING.s,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
        paddingVertical: SPACING.m,
    },
    menuItemText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.body,
        fontWeight: '500',
    }
});
