import { useTranslation } from 'react-i18next';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type HistoryEntry = { id: string; type: string; targets?: string[] };

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
  heat: number;
  rounds: number;
  stats: Record<string, number>;
  history: HistoryEntry[];
}

export default function StatsModal({
  visible,
  onClose,
  heat,
  rounds,
  stats,
  history,
}: StatsModalProps) {
  const { t } = useTranslation();

  const typeBreakdown: Record<string, number> = {};
  history.forEach((item) => {
    typeBreakdown[item.type] = (typeBreakdown[item.type] || 0) + 1;
  });

  const playerStats = { ...stats };
  delete playerStats.history;

  const last5 = history.slice(-5).reverse();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <ScrollView style={{ maxHeight: 500 }} contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.modalTitle}>{t('stats.title')}</Text>

            <View style={styles.section}>
              <Text style={styles.label}>{t('stats.heat')}</Text>
              <Text style={styles.value}>{heat}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>{t('stats.rounds')}</Text>
              <Text style={styles.value}>{rounds}</Text>
            </View>

            <Text style={[styles.label, { marginTop: 20 }]}>{t('stats.typeBreakdown')}</Text>
            {Object.entries(typeBreakdown).map(([type, count]) => (
              <View key={type} style={styles.statRow}>
                <Text style={styles.playerName}>{type}</Text>
                <Text style={styles.statValue}>{count}</Text>
              </View>
            ))}

            <Text style={[styles.label, { marginTop: 20 }]}>{t('stats.perPlayer')}</Text>
            {Object.entries(playerStats).map(([name, count]) => (
              <View key={name} style={styles.statRow}>
                <Text style={styles.playerName}>{name}</Text>
                <Text style={styles.statValue}>{count}</Text>
              </View>
            ))}

            <Text style={[styles.label, { marginTop: 20 }]}>{t('stats.lastRounds')}</Text>
            {last5.map((item, index) => (
              <View key={index} style={styles.statRow}>
                <Text style={styles.playerName}>
                  {item.type} – {item.id}
                </Text>
                <Text style={styles.statValue}>
                  {item.targets?.join(', ') || '—'}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>{t('stats.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a0000',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
  },
  scrollArea: {
    marginTop: 8,
    maxHeight: 180,
    paddingHorizontal: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  playerName: {
    fontSize: 15,
    color: '#222',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: '#ffb347',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 999,
    elevation: 4,
  },
  closeButtonText: {
    color: '#1a0000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
