import * as SecureStore from 'expo-secure-store'

const KEY = 'bb_token'

export function getToken() {
  return SecureStore.getItemAsync(KEY)
}

export function setToken(token: string) {
  return SecureStore.setItemAsync(KEY, token)
}

export function clearToken() {
  return SecureStore.deleteItemAsync(KEY)
}
