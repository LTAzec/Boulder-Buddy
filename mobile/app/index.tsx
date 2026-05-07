import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { Link } from 'expo-router'
import Logo from '../assets/images/IconBig.png'

const ACCENT = '#00E5FF'
const BG = '#fff'
const DARK = '#0f172a'
const MUTED = '#64748b'

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={Logo}
        style={styles.logo}
        resizeMode="contain"
      />


      {/* App title */}
      <Text style={styles.title}>BoulderBuddy</Text>
      <Text style={styles.subtitle}>
        Ontdek boulders, bekijk routes en volg wat er op de wand hangt.
      </Text>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Klaar om te klimmen?</Text>
        <Text style={styles.cardText}>
          Ga naar de zaal, kies een muur en ontdek alle boulders.
        </Text>

        <Link href="/(tabs)/home/wall" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Ga naar de muren</Text>
          </Pressable>
        </Link>
      </View>

      {/* Footer hint */}
      <Text style={styles.helperText}>
        BoulderBuddy • mobile climbing companion
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    padding: 24,
    justifyContent: 'center',
  },

  logo: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: -200,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    color: DARK,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: MUTED,
    marginBottom: 28,
    lineHeight: 22,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 16,
    lineHeight: 20,
  },

  primaryButton: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: DARK,
    fontWeight: '900',
    fontSize: 15,
  },

  helperText: {
    marginTop: 28,
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
})
