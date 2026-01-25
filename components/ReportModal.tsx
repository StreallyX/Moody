import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  cardId: string;
}

export default function ReportModal({ visible, onClose, cardId }: ReportModalProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');

  const sendReport = async () => {
    if (!message.trim()) return;
    try {
      const { error } = await supabase.from('reports').insert({
        card_id: cardId,
        message: message.trim(),
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setMessage('');
      onClose();
      alert(t('report.sent'));
    } catch (error) {
      console.error('Erreur lors de l\'envoi du signalement :', error);
      alert(t('report.error'));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.crossButton} onPress={onClose}>
            <Text style={styles.crossText}>✖</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('report.title')}</Text>
          <Text style={styles.subtitle}>
            {t('report.card', { id: cardId })}
          </Text>

          <TextInput
            placeholder={t('report.placeholder')}
            placeholderTextColor="#555"
            multiline
            value={message}
            onChangeText={setMessage}
            style={styles.input}
          />

          <TouchableOpacity onPress={sendReport} style={styles.sendButton}>
            <Text style={styles.sendText}>{t('report.send')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  crossButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  crossText: {
    color: '#fff',
    fontSize: 18,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#2a2a4e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
