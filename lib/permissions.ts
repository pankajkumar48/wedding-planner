import { Database } from './types/database.types'

type Role = Database['public']['Tables']['roles']['Row']
type Permissions = Record<string, string[]>

export const MODULES = {
  GUESTS: 'guests',
  VENDORS: 'vendors',
  WEBSITE: 'website',
  TEAM: 'team',
  PAYMENTS: 'payments',
  SETTINGS: 'settings',
} as const

export const ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
} as const

export function hasPermission(
  permissions: Permissions,
  module: string,
  action: string
): boolean {
  if (!permissions[module]) return false
  return permissions[module].includes(action)
}

export function canReadModule(permissions: Permissions, module: string): boolean {
  return hasPermission(permissions, module, ACTIONS.READ)
}

export function canWriteModule(permissions: Permissions, module: string): boolean {
  return hasPermission(permissions, module, ACTIONS.WRITE)
}

export function canDeleteModule(permissions: Permissions, module: string): boolean {
  return hasPermission(permissions, module, ACTIONS.DELETE)
}

export function parsePermissions(role: Role): Permissions {
  return (role.permissions as Permissions) || {}
}

export const DEFAULT_OWNER_PERMISSIONS: Permissions = {
  [MODULES.GUESTS]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE],
  [MODULES.VENDORS]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE],
  [MODULES.WEBSITE]: [ACTIONS.READ, ACTIONS.WRITE],
  [MODULES.TEAM]: [ACTIONS.READ, ACTIONS.WRITE, ACTIONS.DELETE],
  [MODULES.PAYMENTS]: [ACTIONS.READ, ACTIONS.WRITE],
  [MODULES.SETTINGS]: [ACTIONS.READ, ACTIONS.WRITE],
}

export const DEFAULT_ADMIN_PERMISSIONS: Permissions = {
  [MODULES.GUESTS]: [ACTIONS.READ, ACTIONS.WRITE],
  [MODULES.VENDORS]: [ACTIONS.READ, ACTIONS.WRITE],
  [MODULES.WEBSITE]: [ACTIONS.READ],
  [MODULES.TEAM]: [ACTIONS.READ],
  [MODULES.PAYMENTS]: [ACTIONS.READ],
  [MODULES.SETTINGS]: [ACTIONS.READ],
}

export const DEFAULT_HELPER_PERMISSIONS: Permissions = {
  [MODULES.GUESTS]: [ACTIONS.READ],
  [MODULES.VENDORS]: [ACTIONS.READ],
  [MODULES.WEBSITE]: [ACTIONS.READ, ACTIONS.WRITE],
  [MODULES.TEAM]: [],
  [MODULES.PAYMENTS]: [],
  [MODULES.SETTINGS]: [],
}
