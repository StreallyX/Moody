// components/StatsModal.tsx
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
          <Text style={styles.modalTitle}>📊 Statistiques</Text>
          <Text style={styles.modalText}>🔥 Niveau de chaleur : {heat}</Text>
          <Text style={styles.modalText}>🔄 Tours joués : {rounds}</Text>
          <Text style={styles.modalSubtitle}>👤 Défis par joueur :</Text>
          <ScrollView style={{ maxHeight: 200 }}>
            {Object.entries(stats).map(([name, count]) => (
              <Text key={name} style={styles.modalText}>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 6,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#300000',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
