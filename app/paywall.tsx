import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import BackButton from '../components/BackButton';
import { Paywall } from '../components/paywall/Paywall';

export default function PaywallScreen() {
  const router = useRouter();

  const handlePurchaseSuccess = () => {
    router.back();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <Paywall
        onPurchaseSuccess={handlePurchaseSuccess}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0000',
  },
});
