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
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronRight size={24} color={colors.white} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.title}>Configurações</Text>
                <View style={{ width: 40 }} />
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
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Lighter bg
        borderRadius: 12,
    },
    title: {
        fontSize: 24, // Slightly smaller Title
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
        padding: 12, // Reduced padding (from 16)
        borderRadius: 12,
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)', // Visible border
        marginBottom: 8, // Reduced margin
        gap: 12,
    },
    menuItemText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    menuArrow: {
        marginLeft: 'auto',
        opacity: 0.5,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12, // Reduced padding
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        marginTop: 32,
        justifyContent: 'center',
        gap: 8,
    },
    logoutText: {
        color: colors.red500,
        fontSize: 15,
        fontWeight: 'bold',
    },
});
