import { Redirect } from 'expo-router'

export default function BouldersTab() {
  return <Redirect href={'/(tabs)/(main)/admin/boulderCrud' as never} />
}
