import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { haptics } from '../utils/haptics';

interface RulesScreenProps {
  onComplete: () => void;
}

export default function RulesScreen({ onComplete }: RulesScreenProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [step, setStep] = useState(0);
  const rules = ['📖 Lisez', '🎯 Faites', '🍺 Buvez'];

  useEffect(() => {
    // Auto-skip after 3 seconds
    const timer = setTimeout(() => {
      handleComplete();
    }, 3000);

    // Animate through steps
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 800);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => {
      clearTimeout(timer);
      clearInterval(stepInterval);
    };
  }, []);

  const handleComplete = () => {
    haptics.lightTap();
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onComplete());
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleComplete}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.rulesContainer}>
          {rules.map((rule, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.ruleText,
                {
                  opacity: step >= index ? 1 : 0.3,
                  transform: [{ scale: step >= index ? 1 : 0.9 }],
                },
              ]}
            >
              {rule}
            </Animated.Text>
          ))}
        </View>
        <Text style={styles.skipText}>Tap pour commencer 👆</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
  rulesContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  ruleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipText: {
    color: '#666',
    fontSize: 14,
  },
});
