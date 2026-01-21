import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import LanguageModal from '../components/LanguageModal';
import { AnimatedButton, PlayerChip, Modal } from '../components/ui';
import { getCurrentUserEmail, isAccountStillValidOnline, isUserLoggedIn } from '../lib/auth';
import { loadPlayers, savePlayers } from '../lib/storage';
import { colors, spacing, borderRadius, textStyles, springs, shadows } from '../theme';
import { haptics } from '../utils/haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState<string | null>(null);
  const [showNoPlayersModal, setShowNoPlayersModal] = useState(false);
  const [showSoloConfirmModal, setShowSoloConfirmModal] = useState(false);
  const [scrollPosition, setScrollPosition] = useState<'start' | 'middle' | 'end'>('start');

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Entry animations
    logoOpacity.value = withDelay(100, withSpring(1, springs.gentle));
    logoScale.value = withDelay(100, withSpring(1, springs.bouncy));
    contentOpacity.value = withDelay(300, withSpring(1, springs.gentle));

    const init = async () => {
      const storedPlayers = await loadPlayers();
      setPlayers(storedPlayers);

      const loggedIn = await isUserLoggedIn();
      if (!loggedIn) return;

      const stillValid = await isAccountStillValidOnline();
      if (!stillValid) {
        await AsyncStorage.clear();
        router.replace('/auth/login');
        return;
      }

      const email = await getCurrentUserEmail();
      const shouldShow = await AsyncStorage.getItem('showLoginModal');

      if (shouldShow === 'true') {
        setLoginEmail(email);
        setShowLoginModal(true);
        await AsyncStorage.removeItem('showLoginModal');
      }
    };

    init();
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const removePlayer = (name: string) => {
    const updated = players.filter((p) => p !== name);
    setPlayers(updated);
    savePlayers(updated);
  };

  const addPlayer = () => {
    const trimmed = newPlayerName.trim().toUpperCase();
    if (trimmed && !players.includes(trimmed)) {
      haptics.success();
      const updated = [...players, trimmed];
      setPlayers(updated);
      savePlayers(updated);
      setNewPlayerName('');
    }
  };

  const startGame = () => {
    haptics.heavy();
    router.push({
      pathname: '/menu',
      params: { players: JSON.stringify(players) },
    });
  };

  const onPressStart = () => {
    if (players.length === 0) {
      setShowNoPlayersModal(true);
      return;
    }
    if (players.length === 1) {
      setShowSoloConfirmModal(true);
      return;
    }
    startGame();
  };

  return (
    <View style={styles.container}>
      {/* Login Success Modal */}
      <Modal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title={t('home.connectedWith')}
      >
        <Text style={styles.modalEmail}>{loginEmail}</Text>
      </Modal>

      {/* No Players Modal */}
      <Modal
        visible={showNoPlayersModal}
        onClose={() => setShowNoPlayersModal(false)}
        title={t('home.noPlayersTitle')}
      >
        <Text style={styles.modalText}>{t('home.noPlayersDesc')}</Text>
        <AnimatedButton
          label={t('common.ok')}
          onPress={() => setShowNoPlayersModal(false)}
          size="md"
          style={{ marginTop: spacing[4] }}
        />
      </Modal>

      {/* Solo Confirm Modal */}
      <Modal
        visible={showSoloConfirmModal}
        onClose={() => setShowSoloConfirmModal(false)}
        title={t('home.soloTitle')}
      >
        <Text style={styles.modalText}>{t('home.soloDesc')}</Text>
        <View style={styles.modalButtons}>
          <AnimatedButton
            label={t('common.cancel')}
            variant="ghost"
            onPress={() => setShowSoloConfirmModal(false)}
            size="md"
            style={{ flex: 1 }}
          />
          <AnimatedButton
            label={t('common.continue')}
            onPress={() => {
              setShowSoloConfirmModal(false);
              startGame();
            }}
            size="md"
            style={{ flex: 1 }}
          />
        </View>
      </Modal>

      {/* Logo Section */}
      <Animated.View style={[styles.block1, logoAnimatedStyle]}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.slogan}>{t('home.slogan')}</Text>
      </Animated.View>

      {/* Players List */}
      <Animated.View style={[styles.playersSection, contentAnimatedStyle]}>
        <View style={{ position: 'relative', width: '100%' }}>
          <FlatList
            data={players}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.playerList,
              { flexGrow: 1, justifyContent: 'center' }
            ]}
            renderItem={({ item }) => (
              <PlayerChip
                name={item}
                onRemove={() => removePlayer(item)}
              />
            )}
            style={{ width: '100%' }}
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              const maxScroll = contentSize.width - layoutMeasurement.width;
              if (maxScroll <= 0) {
                setScrollPosition('start');
              } else if (contentOffset.x <= 5) {
                setScrollPosition('start');
              } else if (contentOffset.x >= maxScroll - 5) {
                setScrollPosition('end');
              } else {
                setScrollPosition('middle');
              }
            }}
            scrollEventThrottle={16}
          />
          {players.length > 3 && scrollPosition !== 'middle' && (
            <View
              style={[
                styles.scrollHintContainer,
                scrollPosition === 'end' && styles.scrollHintLeft
              ]}
              pointerEvents="none"
            >
              <Text style={styles.scrollHintText}>
                {scrollPosition === 'end' ? '← Swipe' : 'Swipe →'}
              </Text>
            </View>
          )}
        </View>

        {players.length === 0 && (
          <Text style={styles.emptyHint}>{t('home.emptyHint')}</Text>
        )}
      </Animated.View>

      {/* Add Player Input */}
      <Animated.View style={[styles.block3, contentAnimatedStyle]}>
        <View style={styles.addPlayerContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('home.playerPlaceholder')}
            placeholderTextColor={colors.text.tertiary}
            value={newPlayerName}
            onChangeText={setNewPlayerName}
            onSubmitEditing={addPlayer}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.plusButton} onPress={addPlayer}>
            <Text style={styles.plusText}>+</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Section */}
      <View style={styles.block4}>
        <AnimatedButton
          label={t('home.start')}
          onPress={onPressStart}
          size="xl"
          disabled={players.length === 0}
          style={styles.startButton}
        />

        <View style={styles.optionsRow}>
          <TouchableOpacity style={styles.sideButton} onPress={() => setLanguageModalVisible(true)}>
            <Icon name="globe" size={22} color={colors.text.secondary} />
            <Text style={styles.sideText}>{t('home.language')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => router.push('/auth/profile')}
          >
            <Icon name="user" size={22} color={colors.text.secondary} />
            <Text style={styles.sideText}>{t('home.account')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sideButton}
            onPress={() => router.push('/contact')}
          >
            <Icon name="envelope" size={22} color={colors.text.secondary} />
            <Text style={styles.sideText}>{t('home.contact')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <Icon name="star" size={22} color={colors.text.secondary} />
            <Text style={styles.sideText}>{t('home.rate')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 40,
  },
  block1: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playersSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  block3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  block4: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: spacing[5],
  },
  logo: {
    width: 300,
    height: 140,
  },
  slogan: {
    marginTop: spacing[3],
    color: colors.text.secondary,
    ...textStyles.bodyMedium,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  playerList: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  addPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 48,
    width: 200,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    color: colors.text.primary,
    marginRight: spacing[3],
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  plusButton: {
    backgroundColor: colors.primary.main,
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.primary.dark,
    ...shadows.md,
  },
  plusText: {
    fontSize: 28,
    color: colors.text.primary,
    fontWeight: '600',
    marginTop: -2,
  },
  startButton: {
    width: 260,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    gap: spacing[3],
  },
  sideButton: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideText: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  scrollHintContainer: {
    position: 'absolute',
    right: 10,
    top: '42%',
    backgroundColor: colors.background.overlay,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.lg,
    zIndex: 10,
  },
  scrollHintLeft: {
    right: undefined,
    left: 10,
  },
  scrollHintText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  emptyHint: {
    marginTop: spacing[2],
    textAlign: 'center',
    color: colors.text.tertiary,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  modalEmail: {
    color: colors.primary.main,
    textAlign: 'center',
    ...textStyles.h3,
  },
  modalText: {
    color: colors.text.secondary,
    textAlign: 'center',
    ...textStyles.bodyMedium,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
});
