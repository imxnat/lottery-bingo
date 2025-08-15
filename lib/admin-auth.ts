const ADMIN_SESSION_KEY = "adminSession"
const ADMIN_PASSWORD = "admin123" // In production, this should be hashed and stored securely
const SESSION_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

interface AdminSession {
  isAuthenticated: boolean
  loginTime: number
  lastActivity: number
}

export function authenticateAdmin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    const session: AdminSession = {
      isAuthenticated: true,
      loginTime: Date.now(),
      lastActivity: Date.now(),
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
    }

    return true
  }

  return false
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  try {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY)
    if (!stored) return false

    const session: AdminSession = JSON.parse(stored)
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
  if (typeof window === "undefined") return

  try {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY)
    if (stored) {
      const session: AdminSession = JSON.parse(stored)
      session.lastActivity = Date.now()
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
    }
  } catch (error) {
    console.error("Error updating last activity:", error)
  }
}

export function clearAdminSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_SESSION_KEY)
  }
}

export function getSessionInfo(): AdminSession | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Error getting session info:", error)
  }

  return null
}
