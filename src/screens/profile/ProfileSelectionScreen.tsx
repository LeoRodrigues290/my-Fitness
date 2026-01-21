import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { COLORS, SPACING, FONTS, SIZES, RADIUS } from '../../constants/theme';
import { useUser } from '../../context/UserContext';
import { User as UserIcon, Plus } from 'lucide-react-native';

export const ProfileSelectionScreen = () => {
    const { selectUser, users } = useUser();

    const handleSelect = async (userId: number) => {
        await selectUser(userId);
    };

    return (
        <Screen style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Who's sweating today?</Text>

                <View style={styles.profilesContainer}>
                    {users.map((user) => (
                        <TouchableOpacity
                            key={user.id}
                            activeOpacity={0.8}
                            onPress={() => handleSelect(user.id)}
                        >
                            <GlassView style={styles.card} intensity={30} gradientBorder>
                                <View style={styles.avatarContainer}>
                                    {user.avatar_uri ? (
                                        <Image source={{ uri: user.avatar_uri }} style={styles.avatar} />
                                    ) : (
                                        <UserIcon size={48} color={COLORS.primary} />
                                    )}
                                </View>
                                <Text style={styles.userName}>{user.name}</Text>
                            </GlassView>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
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
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: RADIUS.circle,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.m,
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
    }
});
