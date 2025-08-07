import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../lib/i18n'; // adapte le chemin selon ton projet

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageModal({ visible, onClose }: Props) {
  const { t } = useTranslation();

  const changeLang = async (lang: string) => {
    await i18n.changeLanguage(lang);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('home.selectLanguage')}</Text>

          <TouchableOpacity onPress={() => changeLang('fr')}>
            <Text style={styles.langText}>🇫🇷 Français</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => changeLang('en')}>
            <Text style={styles.langText}>🇬🇧 English</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeText: {
    fontSize: 20,
    color: '#000',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a0000',
  },
  langText: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 10,
    color: '#1a0000',
  },
});
