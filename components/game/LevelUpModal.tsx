import { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing } from '../../theme';

const LEVEL_CONFIG = [
  { name: '', icon: '', color: '' },
  { name: 'Brise-glace', icon: 'snowflake-o', color: '#4A90D9' },
  { name: 'On se réchauffe', icon: 'thermometer-2', color: '#F5A623' },
  { name: 'Ça chauffe', icon: 'fire', color: '#E85D04' },
  { name: "C'est chaud", icon: 'thermometer-full', color: '#D00000' },
  { name: 'NO LIMIT', icon: 'bolt', color: '#9D0208' },
];

interface LevelUpModalProps {
  visible: boolean;
  level: number;
  onComplete: () => void;
}

export default function LevelUpModal({ visible, level, onComplete }: LevelUpModalProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animation sequence
      opacity.value = withSpring(1, { damping: 15 });
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      emojiScale.value = withDelay(
        200,
        withSequence(
          withSpring(1.5, { damping: 6, stiffness: 180 }),
          withSpring(1, { damping: 8, stiffness: 150 })
        )
      );
      textOpacity.value = withDelay(400, withSpring(1, { damping: 15 }));

      // Auto close after 2 seconds
      const timer = setTimeout(() => {
        opacity.value = withSpring(0, { damping: 15 }, () => {
          runOnJS(onComplete)();
        });
        scale.value = withSpring(0.8, { damping: 15 });
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      scale.value = 0;
      opacity.value = 0;
      emojiScale.value = 0;
      textOpacity.value = 0;
    }
  }, [visible, level]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, containerStyle, { borderColor: config.color }]}>
          <Animated.View style={[styles.iconContainer, emojiStyle]}>
            <Icon name={config.icon} size={72} color={config.color} />
          </Animated.View>

          <Text style={[styles.levelNumber, { color: config.color }]}>
            NIVEAU {level}
          </Text>

          <Animated.Text style={[styles.levelName, textStyle, { color: config.color }]}>
            {config.name}
          </Animated.Text>

          {level === 5 && (
            <Animated.Text style={[styles.warning, textStyle]}>
              Préparez-vous...
            </Animated.Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius['2xl'],
    borderWidth: 3,
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[12],
    alignItems: 'center',
    minWidth: 280,
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 3,
    marginBottom: spacing[2],
  },
  levelName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  warning: {
    marginTop: spacing[4],
    fontSize: 16,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});
