import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import { loadPlayers } from '../../../lib/storage';
import { colors, spacing, borderRadius, textStyles } from '../../../theme';
import { haptics } from '../../../utils/haptics';

// Mode configurations
const MODE_CONFIG: Record<string, { icon: string; color: string; bgColor: string }> = {
  friends: {
    icon: 'beer',
    color: '#34C759',
    bgColor: '#0D1A10',
  },
  caliente: {
    icon: 'fire',
    color: '#FF6B35',
    bgColor: '#1A1008',
  },
  couples: {
    icon: 'heart',
    color: '#FF2D55',
    bgColor: '#1A0D14',
  },
};

export default function GameStartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [playerList, setPlayerList] = useState<string[]>([]);
  const config = MODE_CONFIG[id || 'friends'] || MODE_CONFIG.friends;

  useEffect(() => {
    loadPlayers().then((loadedPlayers) => {
      if (!loadedPlayers || loadedPlayers.length === 0) {
        router.replace('/');
      } else {
        setPlayerList(loadedPlayers);
      }
    });
  }, []);

  const handleStart = () => {
    haptics.heavy();
    router.push(`/game/${id}/play`);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: config.bgColor }]}
      onPress={handleStart}
      activeOpacity={1}
    >
      {/* Mode Icon */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}
      >
        <Icon name={config.icon} size={52} color={config.color} />
      </Animated.View>

      {/* Title */}
      <Animated.Text
        entering={FadeInDown.delay(150).duration(400)}
        style={[styles.title, { color: config.color }]}
      >
        {t('gamestart.ready')}
      </Animated.Text>

      {/* Players */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={styles.playersContainer}
      >
        {playerList.map((name, index) => (
          <View key={index} style={[styles.playerChip, { borderColor: config.color }]}>
            <Text style={[styles.playerName, { color: config.color }]}>{name}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Tap to start */}
      <Animated.Text
        entering={FadeIn.delay(500).duration(400)}
        style={styles.tapText}
      >
        {t('gamestart.tapToStart')}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    ...textStyles.h1,
    fontSize: 28,
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  playersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
    marginBottom: spacing[10],
    paddingHorizontal: spacing[4],
  },
  playerChip: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  tapText: {
    position: 'absolute',
    bottom: 60,
    color: colors.text.tertiary,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
