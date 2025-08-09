import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { monitorAuthState } from '../lib/auth';

export default function Layout() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    monitorAuthState();

    const initApp = async () => {
     
      setChecking(false);
    };

    initApp();
  }, []);

  if (checking) return <LoadingScreen />;
  return <Slot />;
}
