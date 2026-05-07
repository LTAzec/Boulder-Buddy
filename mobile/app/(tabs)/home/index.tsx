import { View, Text, StyleSheet, } from 'react-native'
import { Link } from 'expo-router'

export default function IndexScreen() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boulder Buddy!</Text>

      <View style={styles.buttonContainer}>
        <Link style={styles.subtitle} href={{ pathname: '/(tabs)/home/wall' as const }}>
          Tik om verder te gaan.
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },

  // Logout knop
  logoutButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 12,
  },
  helperText: {
    marginTop: 16,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
})
