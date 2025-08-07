import { useTranslation } from 'react-i18next';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SelectModal({ visible, onClose, items, onSelect }: any) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* CROIX FERMETURE */}
          <TouchableOpacity style={styles.crossButton} onPress={onClose}>
            <Text style={styles.crossText}>✖</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('select.title')}</Text>

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
                <Text style={styles.itemText}>{item.id} — {item.type}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>{t('select.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    position: 'relative',
  },
  crossButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 8,
  },
  crossText: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a0000',
    marginBottom: 12,
    textAlign: 'center',
  },
  item: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
    color: '#000',
  },
  close: {
    marginTop: 10,
    backgroundColor: '#ffb347',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
