// Admin authentication utilities

interface AdminSession {
  isAuthenticated: boolean
  loginTime: number
  lastActivity: number
  sessionId: string
}

const ADMIN_PASSWORD = "admin123"
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds
const SESSION_STORAGE_KEY = "adminSession"

export function authenticateAdmin(password: string): boolean {
  if (password !== ADMIN_PASSWORD) {
    return false
  }

  const session: AdminSession = {
    isAuthenticated: true,
    loginTime: Date.now(),
    lastActivity: Date.now(),
    sessionId: generateSessionId(),
  }

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    return true
  } catch (error) {
    console.error("Error saving admin session:", error)
    return false
  }
}

export function isAdminAuthenticated(): boolean {
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!sessionData) return false

    const session: AdminSession = JSON.parse(sessionData)
    const now = Date.now()

    // Check if session has expired
    if (now - session.lastActivity > SESSION_DURATION) {
      clearAdminSession()
      return false
    }

    return session.isAuthenticated
  } catch (error) {
    console.error("Error checking admin authentication:", error)
    return false
  }
}

export function updateLastActivity(): void {
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!sessionData) return

    const session: AdminSession = JSON.parse(sessionData)
    session.lastActivity = Date.now()

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch (error) {
    console.error("Error updating last activity:", error)
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing admin session:", error)
  }
}

export function getSessionInfo(): AdminSession | null {
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!sessionData) return null

    return JSON.parse(sessionData)
  } catch (error) {
    console.error("Error getting session info:", error)
    return null
  }
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
