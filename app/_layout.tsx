import { Audio } from 'expo-av';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';

export default function Layout() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    Audio.setAudioModeAsync({
      interruptionModeIOS: 1,         // MIX_WITH_OTHERS
      interruptionModeAndroid: 1,     // DO_NOT_MIX
      shouldDuckAndroid: false,
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(console.warn);

    const simulateLoading = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setChecking(false);
    };

    simulateLoading();
  }, []);

  if (checking) {
    return <LoadingScreen />;
  }

  return <Slot />;
}
