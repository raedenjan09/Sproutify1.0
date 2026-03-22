import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';

const THEME = {
  colors: {
    surface: '#FFFFFF',
    border: '#E6E0D9',
    text: '#1F2A1F',
    muted: '#6B7C6A',
    accent: '#2E7D32',
    accentSoft: '#E6F2E6',
  },
};

const getInitials = (name) => {
  if (!name) return 'S';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Header = ({
  variant = 'default',
  user,
  onPressProfile,
  onPressNotifications,
  notificationCount = 0,
}) => {
  const greeting = useMemo(() => getGreeting(), []);

  if (variant !== 'home') {
    return null;
  }

  const firstName = user?.name?.trim()?.split(' ')[0] || 'Grower';
  const avatarUrl = user?.avatar || user?.avatar?.url || null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileSection}
          onPress={onPressProfile}
          activeOpacity={0.85}
        >
          <View style={styles.avatarButton}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{getInitials(user?.name)}</Text>
              </View>
            )}
          </View>

          <View style={styles.greetingWrap}>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.nameText}>{firstName}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressNotifications}
          activeOpacity={0.85}
        >
          <Icon name="notifications-none" size={22} color={THEME.colors.text} />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: THEME.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.accentSoft,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.accentSoft,
  },
  avatarFallbackText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.accent,
  },
  greetingWrap: {
    marginLeft: 10,
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: THEME.colors.muted,
    fontWeight: '600',
  },
  nameText: {
    marginTop: 1,
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#F7F4EE',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginLeft: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9485F',
    borderWidth: 1.5,
    borderColor: THEME.colors.surface,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default Header;
