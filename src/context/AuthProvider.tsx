import React from "react"
import {
  saveCredentials,
  getCredentials,
  clearCredentials,
  Credentials,
} from "@/auth/credentialStorage"
import { supabase } from "@/integrations/supabase/client"

interface AuthContextValue {
  user: Credentials | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<Credentials | null>(null)

  const login = React.useCallback(async (email: string, password: string) => {
    console.log("Logging in user via AuthProvider", { email })
    // Save first so we have them even if network fails
    saveCredentials(email, password)

    // Attempt Supabase sign-in so the backend session is established
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error("Supabase sign-in error", error.message)
      } else {
        console.log("Supabase sign-in success", data.session?.user?.email)
        setUser({ email, password })
      }
    } catch (err) {
      console.error("Unexpected Supabase sign-in failure", err)
    }
  }, [])

  const logout = React.useCallback(() => {
    console.log("Logging out user via AuthProvider")
    clearCredentials()
    supabase.auth.signOut()
    setUser(null)
  }, [])

  // Restore session & parse URL on mount
  React.useEffect(() => {
    const init = async () => {
      // 1. Parse URL params first (highest priority)
      const params = new URLSearchParams(window.location.search)
      const emailParam = params.get("email")
      const passParam = params.get("password")

      if (emailParam && passParam) {
        await login(emailParam, passParam)

        // Clean credentials from URL for security
        params.delete("email")
        params.delete("password")
        const newQuery = params.toString()
        const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`
        window.history.replaceState({}, "", newUrl)
        return
      }

      // 2. Use stored credentials if user is not already authenticated
      const stored = getCredentials()
      if (stored) {
        await login(stored.email, stored.password)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, login, logout }),
    [user, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
} 