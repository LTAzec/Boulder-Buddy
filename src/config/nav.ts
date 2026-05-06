import type {Route} from 'next'

export type AppRole = 'User' | 'Setter' | 'Admin' | 'SuperAdmin'

export type NavItem = {
  href: Route
  label: string
  minRole?: AppRole
}

const roleRank: Record<AppRole, number> = {
  User: 1,
  Setter: 2,
  Admin: 3,
  SuperAdmin: 4,
}

export function canSee(item: NavItem, role: AppRole | undefined) {
  if (!item.minRole) return true
  const r = role ?? 'User'
  return roleRank[r] >= roleRank[item.minRole]
}

export const navItems: NavItem[] = [
  {href: '/walls' as Route, label: 'walls'},
  {href: '/sectors' as Route, label: 'Sectors'},
  {href: '/boulders' as Route, label: 'Boulders'},
  {href: '/admin/walls' as Route, label: 'Walls', minRole: 'Setter'},
  {href: '/admin/sectors' as Route, label: 'Sectors', minRole: 'Setter'},
  {href: '/admin/boulders' as Route, label: 'Boulders', minRole: 'Setter'},
  {href: '/admin/tags' as Route, label: 'Tags', minRole: 'Admin'},
  {href: '/admin/users' as Route, label: 'Users', minRole: 'Admin'},
  {href: '/admin/gyms' as Route, label: 'Gyms', minRole: 'SuperAdmin'},
]
