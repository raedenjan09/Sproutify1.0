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
import gardenTheme from '../../theme/gardenTheme';

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
      <View style={styles.headerFrame}>
        <View style={styles.headerCard}>
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
              <View style={styles.avatarLeaf}>
                <Icon name="eco" size={11} color={gardenTheme.colors.white} />
              </View>
            </View>

            <View style={styles.greetingWrap}>
              <Text style={styles.brandText}>Sproutify garden</Text>
              <Text style={styles.nameText}>{firstName}</Text>
              <Text style={styles.greetingText}>{greeting}. Find something green for today.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onPressNotifications}
            activeOpacity={0.85}
          >
            <Icon name="notifications-none" size={22} color={gardenTheme.colors.textStrong} />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: gardenTheme.colors.canvas,
  },
  headerFrame: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: gardenTheme.colors.canvas,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: gardenTheme.radii.lg,
    backgroundColor: gardenTheme.colors.surface,
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
    ...gardenTheme.shadows.soft,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'visible',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: gardenTheme.colors.accentSoft,
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
  },
  avatarFallbackText: {
    fontSize: 17,
    fontWeight: '900',
    color: gardenTheme.colors.accentStrong,
  },
  avatarLeaf: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: gardenTheme.colors.accentStrong,
    borderWidth: 1,
    borderColor: gardenTheme.colors.surface,
  },
  greetingWrap: {
    marginLeft: 12,
    flex: 1,
  },
  brandText: {
    fontSize: 11,
    color: gardenTheme.colors.accentStrong,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  nameText: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '900',
    color: gardenTheme.colors.textStrong,
  },
  greetingText: {
    marginTop: 2,
    fontSize: 13,
    color: gardenTheme.colors.muted,
    fontWeight: '700',
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: gardenTheme.colors.accentGlow,
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
    marginLeft: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: gardenTheme.colors.rose,
    borderWidth: 1.5,
    borderColor: gardenTheme.colors.surface,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: gardenTheme.colors.white,
  },
});

export default Header;
