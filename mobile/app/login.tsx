import { useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link } from 'expo-router'
import { useMutation } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'

import { login } from '@/src/auth/auth'
import { useAuth } from '@/src/auth/authProvider'
import logo from '@/assets/images/newIcon.png'

export default function LoginScreen() {
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const m = useMutation({
    mutationFn: () => login(email.trim(), password),
    onSuccess: async (res) => {
      await signIn(res.token)
    },
  })

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Boulder Buddy</Text>
            <Text style={styles.subtitle}>Login to your Bouldering account</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="your@email.com"
              placeholderTextColor="#6b7280"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Enter your password"
                placeholderTextColor="#6b7280"
                style={[styles.input, styles.passwordInput]}
              />

              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={10}
                style={styles.eyeButton}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#0f172a" />
              </Pressable>
            </View>

            {m.isError ? <Text style={styles.error}>Invalid email/password.</Text> : null}

            <Pressable
              onPress={() => m.mutate()}
              disabled={m.isPending}
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }, m.isPending && { opacity: 0.6 }]}
            >
              <Text style={styles.buttonText}>{m.isPending ? 'Logging in…' : 'Login'}</Text>
            </Pressable>

            <Text style={styles.footer}>
              Don&apos;t have an account? <Link href={'/register' as never}>Sign up</Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 16,
  },

  card: {
    marginTop: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 3,
  },

  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 5 },

  title: { fontSize: 22, fontWeight: '900', textAlign: 'center', color: '#0f172a' },
  subtitle: { marginTop: 6, marginBottom: 16, textAlign: 'center', color: '#64748b' },

  label: { marginTop: 10, marginBottom: 6, fontWeight: '800', color: '#0f172a' },

  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },

  error: { marginTop: 10, color: '#dc2626', fontWeight: '800', textAlign: 'center' },

  button: { marginTop: 16, backgroundColor: '#0f172a', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '900' },

  footer: { marginTop: 14, textAlign: 'center', color: '#475569' },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
})
