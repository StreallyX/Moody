import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AnimatedButton, Card, Modal } from '../components/ui';
import ModeUnlockModal from '../components/ModeUnlockModal';
import {
  clearGameState,
  loadGameState,
  loadPlayers,
} from '../lib/storage';
import {
  hasModeAccess,
  grantModeAccess,
} from '../lib/auth';
import { hasModeUnlocked, debugPurchaseStatus, resetAllPurchases } from '../lib/purchases';
import { clearLocalPurchases as clearIAPCache } from '../services/iapService';
import { useAuth } from '../context/AuthContext';
import { usePurchaseContext } from '../context/PurchaseContext';
import { colors, spacing, borderRadius, textStyles } from '../theme';
import { haptics } from '../utils/haptics';

interface GameMode {
  id: string;
  icon: string;
  color: string;
  bgColor: string;
  requirement: 'free' | 'account' | 'purchase';
}

const GAME_MODES: GameMode[] = [
  {
    id: 'friends',
    icon: 'beer',
    color: colors.semantic.gold,
    bgColor: '#1A1406',
    requirement: 'free',
  },
  {
    id: 'caliente',
    icon: 'flame',
    color: '#FF6B35',  // Orange
    bgColor: '#1A0A06',
    requirement: 'account',
  },
  {
    id: 'couples',
    icon: 'heart',
    color: '#FF4D6A',  // Rose
    bgColor: '#1A0810',
    requirement: 'purchase',
  },
];

export default function MenuScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { hasCouplesMode, hasCalienteMode, isInitialized: purchaseInitialized } = usePurchaseContext();
  const [playerList, setPlayerList] = useState<string[]>([]);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [lastMode, setLastMode] = useState<string>('friends');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedModeToUnlock, setSelectedModeToUnlock] = useState<string>('');
  const [modeAccess, setModeAccess] = useState<Record<string, boolean>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isLoggedIn = !!user;

  // Debug: Reset purchases (dev only)
  const handleDebugReset = async () => {
    if (__DEV__) {
      console.log('=== DEBUG RESET ===');
      await debugPurchaseStatus();
      // Clear ALL purchase caches
      await resetAllPurchases();  // Old purchases cache + DB
      await clearIAPCache();       // New IAP cache
      // Refresh mode access
      setModeAccess({ friends: true });
      setRefreshTrigger(prev => prev + 1);
      haptics.warning();
      console.log('=== ALL CACHES CLEARED ===');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Load players
        const loadedPlayers = await loadPlayers();
        if (!loadedPlayers || loadedPlayers.length === 0) {
          router.replace('/');
          return;
        }
        setPlayerList(loadedPlayers);

        // Check saved game
        const game = await loadGameState();
        if (
          game &&
          game.players.length > 0 &&
          arraysEqual(game.players, loadedPlayers)
        ) {
          setHasSavedGame(true);
          setLastMode(game.mode ?? 'friends');
        } else {
          await clearGameState();
          setHasSavedGame(false);
        }

        // Check mode access
        const accessStatus: Record<string, boolean> = {};

        for (const mode of GAME_MODES) {
          if (mode.requirement === 'free') {
            accessStatus[mode.id] = true;
          } else if (mode.requirement === 'account') {
            // Caliente mode: check if logged in
            if (isLoggedIn) {
              await grantModeAccess(mode.id);
              accessStatus[mode.id] = true;
            } else {
              accessStatus[mode.id] = await hasModeAccess(mode.id);
            }
          } else if (mode.requirement === 'purchase') {
            // Purchase required: check ONLY database/purchase cache (not old access keys)
            const isUnlocked = await hasModeUnlocked(mode.id);

            if (isUnlocked || hasCouplesMode) {
              await grantModeAccess(mode.id);
              accessStatus[mode.id] = true;
            } else {
              accessStatus[mode.id] = false;
            }
          }
        }

        setModeAccess(accessStatus);
      } catch (error) {
        // Error loading - continue with default access (free mode only)
        console.log('Menu init error:', error);
        setModeAccess({ friends: true });
      }
    };

    init();
  }, [user, hasCouplesMode, hasCalienteMode, purchaseInitialized, refreshTrigger]);

  const getModeTitle = (id: string): string => {
    switch (id) {
      case 'friends': return t('menu.friends');
      case 'caliente': return t('menu.caliente');
      case 'couples': return t('menu.couple');
      default: return id;
    }
  };

  const getModeDescription = (mode: GameMode): string => {
    switch (mode.requirement) {
      case 'free':
        return t('menu.freeMode');
      case 'account':
        return modeAccess[mode.id] ? t('menu.unlocked') : t('menu.accountRequired');
      case 'purchase':
        if (hasCouplesMode || modeAccess[mode.id]) {
          return t('menu.purchased');
        }
        return t('menu.purchaseRequired');
      default:
        return '';
    }
  };

  const handleModePress = async (mode: GameMode) => {
    haptics.lightTap();

    // Free mode - always accessible
    if (mode.requirement === 'free') {
      await startGame(mode.id);
      return;
    }

    // Account required mode
    if (mode.requirement === 'account') {
      if (modeAccess[mode.id]) {
        await startGame(mode.id);
      } else {
        setShowLoginModal(true);
      }
      return;
    }

    // Purchase required mode
    if (mode.requirement === 'purchase') {
      if (modeAccess[mode.id] || hasCouplesMode) {
        await startGame(mode.id);
      } else if (!isLoggedIn) {
        setShowLoginModal(true);
      } else {
        // Show unlock modal
        setSelectedModeToUnlock(mode.id);
        setShowUnlockModal(true);
      }
    }
  };

  // Refresh mode access after successful purchase
  const handleUnlockSuccess = useCallback(() => {
    // Immediately update mode access for the purchased mode
    setModeAccess(prev => ({
      ...prev,
      [selectedModeToUnlock]: true,
    }));
    // Also trigger a full refresh to sync with DB
    setRefreshTrigger(prev => prev + 1);
  }, [selectedModeToUnlock]);

  const startGame = async (modeId: string) => {
    await clearGameState();
    setHasSavedGame(false);
    router.push(`/game/${modeId}`);
  };

  const renderModeCard = (mode: GameMode, index: number) => {
    const hasAccess = modeAccess[mode.id];

    // Mode is NOT locked if any of these are true:
    // - It's a free mode
    // - User is logged in and it's an account-required mode
    // - User has premium
    // - User has purchased/unlocked this specific mode (hasAccess from modeAccess)
    const isLocked = !(
      mode.requirement === 'free' ||
      (mode.requirement === 'account' && isLoggedIn) ||
      hasCouplesMode ||
      hasAccess
    );

    return (
      <Animated.View
        key={mode.id}
        entering={FadeInDown.delay(index * 100).duration(400).springify()}
      >
        <TouchableOpacity
          style={[
            styles.modeCard,
            { backgroundColor: mode.bgColor, borderColor: mode.color, shadowColor: mode.color },
            isLocked && styles.modeCardLocked,
          ]}
          activeOpacity={0.8}
          onPress={() => handleModePress(mode)}
        >
          <View style={[styles.modeIconContainer, { backgroundColor: `${mode.color}20` }]}>
            {mode.icon === 'flame' ? (
              <MaterialCommunityIcons name="fire" size={32} color={mode.color} />
            ) : (
              <Icon
                name={mode.icon}
                size={28}
                color={mode.color}
                style={mode.icon === 'beer' ? { marginLeft: -5, marginTop: 2 } : undefined}
              />
            )}
          </View>

          <View style={styles.modeContent}>
            <Text style={[styles.modeTitle, { color: mode.color }]}>
              {getModeTitle(mode.id)}
            </Text>
            <Text style={styles.modeDescription}>
              {getModeDescription(mode)}
            </Text>
          </View>

          <View style={styles.modeArrow}>
            {isLocked ? (
              <Icon name="lock" size={20} color={colors.text.tertiary} />
            ) : (
              <Icon name="chevron-right" size={20} color={mode.color} />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            haptics.lightTap();
            router.back();
          }}
        >
          <Icon name="arrow-left" size={18} color={colors.text.primary} />
          <Text style={styles.backText}>{t('menu.back')}</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {__DEV__ && (
            <TouchableOpacity
              style={styles.debugButton}
              onPress={handleDebugReset}
              onLongPress={async () => {
                await debugPurchaseStatus();
              }}
            >
              <Icon name="bug" size={14} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
          <View style={styles.playersChip}>
            <View style={styles.playersContent}>
              <Icon name="users" size={14} color={colors.text.primary} />
              <Text style={styles.playersText}>{playerList.length}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.titleContainer}>
        <Text style={styles.title}>{t('menu.chooseMode')}</Text>
      </Animated.View>

      {/* Resume Game Section */}
      {hasSavedGame && (
        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          style={styles.resumeContainer}
        >
          <Card variant="glow" padding="md">
            <Text style={styles.resumeText}>{t('menu.resumeQuestion')}</Text>
            <View style={styles.resumeButtons}>
              <TouchableOpacity
                style={[styles.resumeButton, { backgroundColor: colors.semantic.success }]}
                onPress={() => {
                  haptics.success();
                  router.push(`/game/${lastMode}`);
                }}
              >
                <Icon name="play" size={20} color={colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resumeButton, { backgroundColor: colors.semantic.error }]}
                onPress={async () => {
                  haptics.warning();
                  await clearGameState();
                  setHasSavedGame(false);
                }}
              >
                <Icon name="times" size={22} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Mode Cards */}
      <ScrollView
        contentContainerStyle={styles.modesContainer}
        showsVerticalScrollIndicator={false}
      >
        {GAME_MODES.map((mode, index) => renderModeCard(mode, index))}
      </ScrollView>

      {/* Login Required Modal */}
      <Modal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title={t('menu.loginRequired')}
      >
        <Text style={styles.modalText}>{t('menu.loginRequiredDesc')}</Text>
        <View style={styles.modalButtons}>
          <AnimatedButton
            label={t('menu.goToLogin')}
            onPress={() => {
              setShowLoginModal(false);
              router.push('/auth/login');
            }}
            size="md"
            style={{ flex: 1 }}
          />
        </View>
      </Modal>

      {/* Mode Unlock Modal */}
      <ModeUnlockModal
        visible={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        modeId={selectedModeToUnlock}
        onSuccess={handleUnlockSuccess}
      />

    </View>
  );
}

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  debugButton: {
    padding: spacing[2],
    opacity: 0.5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  backText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  playersChip: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary.main,
    // Glow
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playersContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  playersText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  titleContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  title: {
    ...textStyles.h1,
    color: colors.text.primary,
    // Red glow
    textShadowColor: 'rgba(224, 32, 32, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  resumeContainer: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[4],
  },
  resumeText: {
    color: colors.text.primary,
    ...textStyles.h3,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  resumeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[6],
  },
  resumeButton: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.3)',
    // Glow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  modesContainer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[10],
    gap: spacing[4],
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius['2xl'],
    borderWidth: 2,
    borderStyle: 'solid',
    // Glow effect based on card color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modeCardLocked: {
    opacity: 0.7,
    borderStyle: 'dashed',
  },
  modeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[4],
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing[1],
  },
  modeDescription: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  modeArrow: {
    marginLeft: spacing[2],
  },
  modalText: {
    color: colors.text.secondary,
    textAlign: 'center',
    ...textStyles.bodyMedium,
    marginBottom: spacing[2],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
});
