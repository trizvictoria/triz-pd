const USER_HASHES = new Set([
  '0e1733efb669979a709f05ba0a8d2725095193cf81fd05b75b7cefe5c48e03f9',
  'd919a100ce6b45524d415d52d088d5817587c6dd8c3691b03b8063c44d043523',
  'a3418631ddce958c2fe2206cb362d390c2cc59c86b6ef2083b3d7cbe38e9140d',
  '047007876c105127d9e0299df5dcea30b9fa5fae71be6f9d10ddb6357981cb9c',
  'ccc68482d9e0eee0789e64c7674421076738f8836857ea89bcd0afb832bf3fc3',
  '80c0fcbbfa9d03d861b22230e67c380afb545c12de43094f3985128625858361',
  '3db6c5da02e8275b4cd5d64d91d628b51e0028c3c8a915570492c34ab9e1fdd1',
  '33129567e0bd787efb15a26307e5311e06ba66e3b8dbc2206ad59f99780a4d78',
  '24d4b96f58da6d4a8512313bbd02a28ebf0ca95dec6e4c86ef78ce7f01e788ac',
])

const PASS_HASH = 'e9e69fcd703e857da732ae1e8c0d839920a24cb3407cc98440c04a4c7b62545d'
const PILOTO_USER_HASH = 'ef9d5711a95ddcc209cf8d01664f22d88289cacef4deb6921618b067e0a79c2c'
const PILOTO_PASS_HASH = '6064eb690ce09822d7b456c5f7d862fabbc5e29b12387e45361e053cb6ff25f1'
export const AUTH_STORAGE_KEY = 'pd-ai-auth'
export const AUTH_PASS_KEY = 'pd-ai-pass'

function normalizeUser(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function isValidLogin(user: string, password: string) {
  const [userHash, passHash] = await Promise.all([
    sha256Hex(normalizeUser(user)),
    sha256Hex(`pd-ai|${password}`),
  ])
  if (userHash === PILOTO_USER_HASH) return passHash === PILOTO_PASS_HASH
  return USER_HASHES.has(userHash) && passHash === PASS_HASH
}

export function isPageReload() {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (nav) return nav.type === 'reload'
  } catch {
    // ignore
  }
  return typeof performance !== 'undefined' && performance.navigation?.type === 1
}

export function readAuthSession() {
  try {
    if (isPageReload()) {
      writeAuthSession(false)
      return false
    }
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === PASS_HASH
  } catch {
    return false
  }
}

export function writeAuthSession(authed: boolean, password?: string) {
  try {
    if (authed) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, PASS_HASH)
      if (password) sessionStorage.setItem(AUTH_PASS_KEY, password)
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
      sessionStorage.removeItem(AUTH_PASS_KEY)
    }
  } catch {
    // sessionStorage can be blocked in some preview contexts.
  }
}
