import { Redirect } from 'expo-router'

export default function SectorsTab() {
  return <Redirect href={'/(tabs)/(main)/admin/sectorCrud' as never} />
}
