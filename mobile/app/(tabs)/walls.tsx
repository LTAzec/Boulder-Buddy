import { Redirect } from 'expo-router'

export default function WallsTab() {
  return <Redirect href={'/(tabs)/(main)/admin/wallCrud' as never} />
}
