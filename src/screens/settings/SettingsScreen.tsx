import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, ChevronRight, LogOut, Calendar, TrendingUp, Dumbbell } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { colors } from '../../constants/colors';

interface SettingsScreenProps {
    onBack: () => void;
    onRoutinePress: () => void;
    onExerciseLibraryPress: () => void;
    onProgressPress: () => void;
    onProfilePress: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
    onBack,
    onRoutinePress,
    onExerciseLibraryPress,
    onProgressPress,
    onProfilePress
}) => {
    const insets = useSafeAreaInsets();
    const { setUser } = useUser();

    const handleLogout = () => {
        setUser(null);
        onBack(); // Volta para tela anterior após logout
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Configurações</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>TREINOS</Text>

                <TouchableOpacity style={styles.menuItem} onPress={onRoutinePress}>
                    <Calendar size={20} color={colors.white} />
                    <Text style={styles.menuItemText}>Configurar Rotina</Text>
                    <ChevronRight size={16} color={colors.slate600} style={styles.menuArrow} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={onExerciseLibraryPress}>
                    <Dumbbell size={20} color={colors.white} />
                    <Text style={styles.menuItemText}>Gerenciar Exercícios</Text>
                    <ChevronRight size={16} color={colors.slate600} style={styles.menuArrow} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={onProgressPress}>
                    <TrendingUp size={20} color={colors.white} />
                    <Text style={styles.menuItemText}>Evolução de Carga</Text>
                    <ChevronRight size={16} color={colors.slate600} style={styles.menuArrow} />
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>CONTA</Text>

                <TouchableOpacity style={styles.menuItem} onPress={onProfilePress}>
                    <User size={20} color={colors.white} />
                    <Text style={styles.menuItemText}>Editar Perfil</Text>
                    <ChevronRight size={16} color={colors.slate600} style={styles.menuArrow} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color={colors.red500} />
                    <Text style={styles.logoutText}>Sair da Conta</Text>
                </TouchableOpacity>
            </ScrollView>
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
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
    },
    content: {
        paddingBottom: 100,
    },
    sectionTitle: {
        color: colors.slate400,
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
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
        flex: 1,
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
