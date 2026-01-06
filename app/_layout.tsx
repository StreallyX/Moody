import { Slot } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

function RootLayoutContent() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;
  return <Slot />;
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
