import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import { AnimatedButton, Card, Modal } from '../components/ui';
import {
  clearGameState,
  loadGameState,
  loadPlayers,
} from '../lib/storage';
import {
  hasModeAccess,
  grantModeAccess,
  hasModePurchased,
} from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, textStyles, shadows } from '../theme';
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
    color: '#34C759',
    bgColor: '#0D1A10',
    requirement: 'free',
  },
  {
    id: 'caliente',
    icon: 'fire',
    color: '#FF6B35',
    bgColor: '#1A1008',
    requirement: 'account',
  },
  {
    id: 'couples',
    icon: 'heart',
    color: '#FF2D55',
    bgColor: '#1A0D14',
    requirement: 'purchase',
  },
];

export default function MenuScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, session } = useAuth();
  const [playerList, setPlayerList] = useState<string[]>([]);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [lastMode, setLastMode] = useState<string>('friends');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [modeAccess, setModeAccess] = useState<Record<string, boolean>>({});
  const [purchasedModes, setPurchasedModes] = useState<Record<string, boolean>>({});

  const isLoggedIn = !!user;

  useEffect(() => {
    const init = async () => {
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
      const purchaseStatus: Record<string, boolean> = {};

      for (const mode of GAME_MODES) {
        if (mode.requirement === 'free') {
          accessStatus[mode.id] = true;
        } else if (mode.requirement === 'account') {
          // If logged in, grant access
          if (isLoggedIn) {
            await grantModeAccess(mode.id);
            accessStatus[mode.id] = true;
          } else {
            accessStatus[mode.id] = await hasModeAccess(mode.id);
          }
        } else if (mode.requirement === 'purchase') {
          const purchased = await hasModePurchased(mode.id);
          purchaseStatus[mode.id] = purchased;
          if (purchased && isLoggedIn) {
            await grantModeAccess(mode.id);
            accessStatus[mode.id] = true;
          } else {
            accessStatus[mode.id] = purchased && await hasModeAccess(mode.id);
          }
        }
      }

      setModeAccess(accessStatus);
      setPurchasedModes(purchaseStatus);
    };

    init();
  }, [user]);

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
        if (purchasedModes[mode.id]) {
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
        setSelectedMode(mode.id);
        setShowLoginModal(true);
      }
      return;
    }

    // Purchase required mode
    if (mode.requirement === 'purchase') {
      if (modeAccess[mode.id]) {
        await startGame(mode.id);
      } else if (!isLoggedIn) {
        setSelectedMode(mode.id);
        setShowLoginModal(true);
      } else {
        setSelectedMode(mode.id);
        setShowPurchaseModal(true);
      }
    }
  };

  const startGame = async (modeId: string) => {
    await clearGameState();
    setHasSavedGame(false);
    router.push(`/game/${modeId}`);
  };

  const handlePurchase = async () => {
    // TODO: Integrate with RevenueCat for real purchases
    // For now, simulate purchase
    haptics.success();
    Alert.alert(
      t('menu.purchaseTitle'),
      t('menu.purchaseComingSoon'),
      [{ text: 'OK', onPress: () => setShowPurchaseModal(false) }]
    );
  };

  const renderModeCard = (mode: GameMode, index: number) => {
    const hasAccess = modeAccess[mode.id];
    // Check if user is logged in for account-required modes
    const hasDirectAccess = mode.requirement === 'free' ||
      (mode.requirement === 'account' && isLoggedIn) ||
      (mode.requirement === 'purchase' && purchasedModes[mode.id]);
    const isLocked = !hasAccess && !hasDirectAccess;

    return (
      <Animated.View
        key={mode.id}
        entering={FadeInDown.delay(index * 100).duration(400).springify()}
      >
        <TouchableOpacity
          style={[
            styles.modeCard,
            { backgroundColor: mode.bgColor, borderColor: mode.color },
            isLocked && styles.modeCardLocked,
          ]}
          activeOpacity={0.8}
          onPress={() => handleModePress(mode)}
        >
          <View style={[styles.modeIconContainer, { backgroundColor: `${mode.color}20` }]}>
            <Icon name={mode.icon} size={28} color={mode.color} />
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

        <View style={styles.playersChip}>
          <View style={styles.playersContent}>
            <Icon name="users" size={14} color={colors.text.primary} />
            <Text style={styles.playersText}>{playerList.length}</Text>
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

      {/* Purchase Required Modal */}
      <Modal
        visible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title={t('menu.purchaseTitle')}
      >
        <Text style={styles.modalText}>{t('menu.purchaseDesc')}</Text>
        <View style={styles.modalButtons}>
          <AnimatedButton
            label={t('common.cancel')}
            variant="ghost"
            onPress={() => setShowPurchaseModal(false)}
            size="md"
            style={{ flex: 1 }}
          />
          <AnimatedButton
            label={t('menu.purchase')}
            onPress={handlePurchase}
            size="md"
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  backText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  playersChip: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.ui.border,
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
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
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
    ...shadows.lg,
  },
  modeCardLocked: {
    opacity: 0.7,
    borderStyle: 'dashed',
  },
  modeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.xl,
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
