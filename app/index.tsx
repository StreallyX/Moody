import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
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
  const [inputFocused, setInputFocused] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const inputShake = useSharedValue(0);

  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const logoGlow = useSharedValue(0.3);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Entry animations
    logoOpacity.value = withDelay(100, withSpring(1, springs.gentle));
    logoScale.value = withDelay(100, withSpring(1, springs.bouncy));
    contentOpacity.value = withDelay(300, withSpring(1, springs.gentle));

    // Subtle breathing glow animation
    logoGlow.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        false
      )
    );

    const init = async () => {
      try {
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
      } catch (error) {
        // Network error - continue in offline mode
        console.log('Init error (offline mode):', error);
      }
    };

    init();
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const logoGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: logoGlow.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const inputShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: inputShake.value }],
  }));

  const removePlayer = (name: string) => {
    const updated = players.filter((p) => p !== name);
    setPlayers(updated);
    savePlayers(updated);
  };

  const addPlayer = () => {
    const trimmed = newPlayerName.trim().toUpperCase();

    // Clear previous error
    setInputError(null);

    if (!trimmed) return;

    if (players.includes(trimmed)) {
      // Player already exists - shake + error message
      haptics.warning();
      setInputError(t('home.playerExists'));
      inputShake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      // Clear error after 2.5s
      setTimeout(() => setInputError(null), 2500);
      return;
    }

    haptics.success();
    const updated = [...players, trimmed];
    setPlayers(updated);
    savePlayers(updated);
    setNewPlayerName('');
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
        <Animated.View style={[styles.logoContainer, logoGlowStyle]}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
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
          <Animated.View style={inputShakeStyle}>
            <Pressable
              style={[
                styles.inputWrapper,
                inputFocused && styles.inputWrapperFocused,
                inputError && styles.inputWrapperError,
              ]}
              onPress={() => inputRef.current?.focus()}
            >
              <Icon
                name="user-plus"
                size={16}
                color={inputError ? colors.semantic.error : inputFocused ? colors.primary.main : colors.text.tertiary}
                style={styles.inputIcon}
              />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={t('home.playerPlaceholder')}
                placeholderTextColor={colors.text.secondary}
                value={newPlayerName}
                onChangeText={(text) => {
                  setNewPlayerName(text);
                  if (inputError) setInputError(null);
                }}
                onSubmitEditing={addPlayer}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                returnKeyType="done"
              />
            </Pressable>
          </Animated.View>
          <TouchableOpacity style={styles.plusButton} onPress={addPlayer}>
            <Text style={styles.plusText}>+</Text>
          </TouchableOpacity>
        </View>
        {inputError && (
          <Text style={styles.inputErrorText}>{inputError}</Text>
        )}
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
          <Pressable
            style={({ pressed }) => [styles.sideButton, pressed && styles.sideButtonPressed]}
            onPress={() => setLanguageModalVisible(true)}
          >
            {({ pressed }) => (
              <>
                <Icon name="globe" size={22} color={pressed ? colors.text.primary : colors.text.secondary} />
                <Text style={styles.sideText}>{t('home.language')}</Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.sideButton, pressed && styles.sideButtonPressed]}
            onPress={() => router.push('/auth/profile')}
          >
            {({ pressed }) => (
              <>
                <Icon name="user" size={22} color={pressed ? colors.text.primary : colors.text.secondary} />
                <Text style={styles.sideText}>{t('home.account')}</Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.sideButton, pressed && styles.sideButtonPressed]}
            onPress={() => router.push('/contact')}
          >
            {({ pressed }) => (
              <>
                <Icon name="envelope" size={22} color={pressed ? colors.text.primary : colors.text.secondary} />
                <Text style={styles.sideText}>{t('home.contact')}</Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.sideButton, pressed && styles.sideButtonPressed]}
            onPress={() => {}}
          >
            {({ pressed }) => (
              <>
                <Icon name="star" size={22} color={pressed ? colors.text.primary : colors.text.secondary} />
                <Text style={styles.sideText}>{t('home.rate')}</Text>
              </>
            )}
          </Pressable>
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
  logoContainer: {
    // Breathing red glow
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 10,
  },
  logo: {
    width: 300,
    height: 140,
  },
  slogan: {
    marginTop: spacing[3],
    color: '#F5F5F5',
    ...textStyles.bodyMedium,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    // Red glow plus visible
    textShadowColor: 'rgba(224, 32, 32, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  playerList: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  addPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    width: 225,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    marginRight: spacing[3],
    borderWidth: 2,
    borderColor: colors.ui.border,
  },
  inputWrapperFocused: {
    borderColor: colors.primary.main,
    // Red glow on focus
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  inputWrapperError: {
    borderColor: colors.semantic.error,
    shadowColor: colors.semantic.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
  },
  inputIcon: {
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  plusButton: {
    backgroundColor: colors.primary.main,
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.primary.dark,
    // Hot glow
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  plusText: {
    fontSize: 30,
    color: colors.text.primary,
    fontWeight: '700',
    marginTop: -2,
  },
  startButton: {
    width: 280,
    // Strong red glow - glossy on mat
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    gap: spacing[3],
  },
  sideButton: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ui.border,
    // Subtle depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sideButtonPressed: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.primary.dark,
    transform: [{ scale: 0.95 }],
  },
  sideText: {
    color: colors.text.tertiary,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 5,
    letterSpacing: 0.3,
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
  inputErrorText: {
    marginTop: spacing[2],
    textAlign: 'center',
    color: colors.semantic.error,
    fontSize: 13,
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
