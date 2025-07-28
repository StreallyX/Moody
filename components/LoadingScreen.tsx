import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <ActivityIndicator size="large" color="#ffb347" style={styles.spinner} />

      <Text style={styles.text}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 40,
  },
  spinner: {
    marginBottom: 20,
  },
  text: {
    color: '#ffb347',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
