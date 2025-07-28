import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function StatsModal({
  visible,
  onClose,
  heat,
  rounds,
  stats,
}: {
  visible: boolean;
  onClose: () => void;
  heat: number;
  rounds: number;
  stats: Record<string, number>;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Statistiques</Text>

          <Text style={styles.modalLabel}>Niveau de chaleur :</Text>
          <Text style={styles.modalValue}>{heat}</Text>

          <Text style={styles.modalLabel}>Tours joués :</Text>
          <Text style={styles.modalValue}>{rounds}</Text>

          <Text style={styles.modalLabel}>Défis par joueur :</Text>
          <ScrollView style={styles.scrollArea}>
            {Object.entries(stats).map(([name, count]) => (
              <Text key={name} style={styles.modalValue}>
                {name} : {count}
              </Text>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a0000',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffb347',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalLabel: {
    color: '#f2b662',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  modalValue: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
  },
  scrollArea: {
    maxHeight: 180,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: '#ffb347',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    color: '#1a0000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
