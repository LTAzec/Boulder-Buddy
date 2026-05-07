import { useEffect, useMemo } from 'react'
import { Animated, Image } from 'react-native'

import splashImage from '@/assets/images/splash-icon.png'

const BRAND_COLOR = '#33D1CC'

export default function IntroLoading({ onDone }: { onDone: () => void }) {
  // tekst animatie
  const textOpacity = useMemo(() => new Animated.Value(0), [])
  const textTranslateY = useMemo(() => new Animated.Value(10), [])

  // fade-out van heel scherm op het einde
  const screenOpacity = useMemo(() => new Animated.Value(1), [])

  useEffect(() => {
    // 1) tekst fade/slide in
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 250,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start()

    // 2) na ~2s: fade-out en dan onDone()
    const t = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        onDone()
      })
    }, 2000)

    return () => clearTimeout(t)
  }, [onDone, screenOpacity, textOpacity, textTranslateY])

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: screenOpacity,
      }}
    >
      <Image source={splashImage} style={{ width: 170, height: 170 }} resizeMode="contain" />

      <Animated.Text
        style={{
          marginTop: 18,
          fontSize: 28,
          fontWeight: '900',
          letterSpacing: 1,
          color: BRAND_COLOR,
          opacity: textOpacity,
          transform: [{ translateY: textTranslateY }],
        }}
      >
        Boulder Buddy
      </Animated.Text>
    </Animated.View>
  )
}
