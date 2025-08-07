import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  cardId: string;
}

export default function ReportModal({ visible, onClose, cardId }: ReportModalProps) {
  const [message, setMessage] = useState('');

  const sendReport = async () => {
    if (!message.trim()) return;
    try {
      const db = getFirestore();
      await addDoc(collection(db, 'gamerep'), {
        gameId: cardId,
        message: message.trim(),
        timestamp: Date.now(),
      });
      setMessage('');
      onClose();
      alert('Signalement envoyé ✅');
    } catch (error) {
      console.error('Erreur lors de l’envoi du signalement :', error);
      alert('Erreur lors de l’envoi.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* CROIX FERMETURE */}
          <TouchableOpacity style={styles.crossButton} onPress={onClose}>
            <Text style={styles.crossText}>✖</Text>
          </TouchableOpacity>

          <Text style={styles.title}>🚨 Signaler une carte</Text>
          <Text style={styles.subtitle}>Carte : {cardId}</Text>

          <TextInput
            placeholder="Pourquoi signaler cette carte ?"
            placeholderTextColor="#555"
            multiline
            value={message}
            onChangeText={setMessage}
            style={styles.input}
          />

          <TouchableOpacity onPress={sendReport} style={styles.sendButton}>
            <Text style={styles.sendText}>Envoyer</Text>
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
    backgroundColor: '#fff', // FOND BLANC
    padding: 20,
    borderRadius: 10,
    width: '90%',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f0f0f0',
    color: '#000',
    height: 100,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#ffb347',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
