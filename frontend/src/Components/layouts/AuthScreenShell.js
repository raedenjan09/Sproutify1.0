import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import gardenTheme from '../../theme/gardenTheme';

const AuthScreenShell = ({
  navigation,
  showBackButton = false,
  topBarTitle,
  brandIcon = 'local-florist',
  eyebrow = 'Garden living',
  title,
  subtitle,
  highlights = [],
  children,
  footer,
}) => (
  <SafeAreaView style={styles.safeArea} edges={['top']}>
    <StatusBar backgroundColor={gardenTheme.colors.canvas} barStyle="dark-content" />
    <View style={styles.container}>
      <View pointerEvents="none" style={styles.backgroundArt}>
        <View style={[styles.orb, styles.orbTop]} />
        <View style={[styles.orb, styles.orbLeft]} />
        <View style={[styles.orb, styles.orbBottom]} />
        <View style={styles.vineCard} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {(showBackButton || topBarTitle) && (
            <View style={styles.topBar}>
              {showBackButton ? (
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                  activeOpacity={0.85}
                >
                  <Icon name="arrow-back" size={22} color={gardenTheme.colors.textStrong} />
                </TouchableOpacity>
              ) : (
                <View style={styles.backSpacer} />
              )}

              <Text style={styles.topBarTitle}>{topBarTitle || ''}</Text>
              <View style={styles.backSpacer} />
            </View>
          )}

          <View style={styles.brandHeader}>
            <View style={styles.brandMark}>
              <View style={styles.brandMarkIcon}>
                <Icon name={brandIcon} size={24} color={gardenTheme.colors.accentStrong} />
              </View>
              <View>
                <Text style={styles.brandName}>Sproutify</Text>
                <Text style={styles.brandTag}>Garden shop and care essentials</Text>
              </View>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroBadge}>
                <Icon name="eco" size={16} color={gardenTheme.colors.accentStrong} />
                <Text style={styles.heroBadgeText}>{eyebrow}</Text>
              </View>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSubtitle}>{subtitle}</Text>

              {highlights.length > 0 && (
                <View style={styles.highlightRow}>
                  {highlights.map((item) => (
                    <View key={item.label} style={styles.highlightPill}>
                      <Icon
                        name={item.icon || 'check-circle-outline'}
                        size={15}
                        color={gardenTheme.colors.accentStrong}
                      />
                      <Text style={styles.highlightText}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {children}

          {footer ? <View style={styles.footerWrap}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: gardenTheme.colors.canvas,
  },
  container: {
    flex: 1,
    backgroundColor: gardenTheme.colors.canvas,
  },
  flex: {
    flex: 1,
  },
  backgroundArt: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: gardenTheme.radii.pill,
  },
  orbTop: {
    width: 240,
    height: 240,
    top: -86,
    right: -68,
    backgroundColor: gardenTheme.colors.accentSoft,
  },
  orbLeft: {
    width: 160,
    height: 160,
    top: 140,
    left: -56,
    backgroundColor: gardenTheme.colors.claySoft,
  },
  orbBottom: {
    width: 220,
    height: 220,
    bottom: -90,
    left: 40,
    backgroundColor: gardenTheme.colors.accentGlow,
  },
  vineCard: {
    position: 'absolute',
    top: 90,
    right: 24,
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    transform: [{ rotate: '12deg' }],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
  },
  backSpacer: {
    width: 44,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: gardenTheme.colors.textStrong,
  },
  brandHeader: {
    marginBottom: 20,
  },
  brandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  brandMarkIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: gardenTheme.colors.surface,
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
    marginRight: 12,
    ...gardenTheme.shadows.soft,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: gardenTheme.colors.textStrong,
  },
  brandTag: {
    marginTop: 2,
    fontSize: 13,
    color: gardenTheme.colors.muted,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: gardenTheme.radii.xl,
    padding: 22,
    backgroundColor: 'rgba(255,253,252,0.88)',
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
    ...gardenTheme.shadows.medium,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: gardenTheme.radii.pill,
    backgroundColor: gardenTheme.colors.accentGlow,
    borderWidth: 1,
    borderColor: gardenTheme.colors.border,
    marginBottom: 16,
  },
  heroBadgeText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '800',
    color: gardenTheme.colors.accentStrong,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: gardenTheme.colors.textStrong,
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: gardenTheme.colors.muted,
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: gardenTheme.radii.pill,
    backgroundColor: gardenTheme.colors.surfaceTint,
  },
  highlightText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '800',
    color: gardenTheme.colors.textStrong,
  },
  footerWrap: {
    marginTop: 18,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
});

export default AuthScreenShell;
