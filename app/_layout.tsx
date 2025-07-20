import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';

export default function Layout() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Simule un petit chargement puis accès libre à l’app
    const simulateLoading = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s
      setChecking(false);
    };

    simulateLoading();
  }, []);

  if (checking) {
    return <LoadingScreen />;
  }

  return <Slot />;
}
