import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FooterBar({
  onSelectPress,
  onReportPress,
}: {
  onSelectPress: () => void;
  onReportPress: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      <TouchableOpacity style={[styles.button, styles.select]} onPress={onSelectPress}>
        <Text style={styles.selectText}>🧪 SELECT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.report]} onPress={onReportPress}>
        <Text style={styles.reportText}>🚨 REPORT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  select: {
    backgroundColor: '#2b1b54', // violet foncé élégant
  },
  report: {
    backgroundColor: '#702222', // rouge foncé
  },
  selectText: {
    color: '#b4aaff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportText: {
    color: '#ffb5a7',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
