import { ActivityIndicator, Image, Text, View } from 'react-native'

import logo from '@/assets/images/splash-icon.png'

const BRAND_COLOR = '#33D1CC'

export default function LoadingScreen({ label = 'Laden…' }: { label?: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Logo */}
      <Image
        source={logo}
        style={{ width: 120, height: 120, marginBottom: 24 }}
        resizeMode="contain"
      />

      {/* Spinner */}
      <ActivityIndicator size="large" color={BRAND_COLOR} />

      {/* Tekst */}
      <Text
        style={{
          marginTop: 16,
          color: BRAND_COLOR,
          fontWeight: '800',
          fontSize: 15,
        }}
      >
        {label}
      </Text>
    </View>
  )
}
