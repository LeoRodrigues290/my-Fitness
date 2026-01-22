import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { AppHeader } from '../../components/ui/AppHeader';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, SIZES, RADIUS } from '../../constants/theme';
import { Target, User, Bell, ChevronRight, LogOut, Calendar } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';

export const SettingsScreen = ({ navigation }: any) => {
    const { setUser } = useUser();

    const handleLogout = () => {
        setUser(null);
    };

    const MenuItem = ({ icon: Icon, label, onPress, color = COLORS.white }: any) => (
        <TouchableOpacity onPress={onPress}>
            <GlassView style={styles.menuItem} intensity={10}>
                <View style={styles.menuLeft}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                        <Icon color={color} size={20} />
                    </View>
                    <Text style={[styles.menuText, { color }]}>{label}</Text>
                </View>
                <ChevronRight color={COLORS.textSecondary} size={20} />
            </GlassView>
        </TouchableOpacity>
    );

    return (
        <Screen>
            <AppHeader title="Configurações" showNotification={false} />
            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.sectionTitle}>Metas & Objetivos</Text>
                <MenuItem
                    icon={Target}
                    label="Metas Diárias"
                    onPress={() => navigation.navigate('Goals')}
                />
                <MenuItem
                    icon={Calendar}
                    label="Rotina de Treinos"
                    onPress={() => navigation.navigate('RoutineSettings')}
                />

                <Text style={styles.sectionTitle}>Conta</Text>
                <MenuItem
                    icon={User}
                    label="Editar Perfil"
                    onPress={() => navigation.navigate('ProfileSelection')}
                />
                <MenuItem
                    icon={Bell}
                    label="Notificações"
                    onPress={() => { }}
                />

                <View style={{ marginTop: SPACING.xl }}>
                    <MenuItem
                        icon={LogOut}
                        label="Sair"
                        color={COLORS.error}
                        onPress={handleLogout}
                    />
                </View>

            </ScrollView>
        </Screen>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: SPACING.m,
    },
    sectionTitle: {
        color: COLORS.textSecondary,
        fontSize: SIZES.small,
        fontWeight: 'bold',
        marginTop: SPACING.l,
        marginBottom: SPACING.s,
        marginLeft: SPACING.xs,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.s,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        fontSize: SIZES.body,
        fontWeight: '500',
    }
});
