"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  name: string
  role: "student" | "admin"
  department?: string | null
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string, role: "student" | "admin", department?: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        // Quick check: Use getSession which reads from localStorage first (faster)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // User is logged in, load their profile
          await loadUserProfile(session.user)
        } else {
          // No session found, stop loading immediately
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setIsLoading(false)
      } finally {
        setInitialCheckDone(true)
      }
    }

    // Only run initialization once
    if (!initialCheckDone) {
      initializeAuth()
    }

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [initialCheckDone])

  const loadUserProfile = async (authUser: SupabaseUser, retryCount = 0) => {
    try {
      console.log(`📥 [Auth] Loading profile for user: ${authUser.id} (attempt ${retryCount + 1}/3)`)
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      console.log('📊 [Auth] Profile data:', data)
      console.log('❌ [Auth] Profile error:', error)

      if (error) {
        console.error("❌ [Auth] Error loading profile:", error)
        
        // If profile doesn't exist, don't create it automatically
        // Profile should only be created by database trigger after email confirmation
        if (error.code === 'PGRST116') {
          console.error('🚫 [Auth] Profile not found. User may need to confirm email first.')
        }
        
        setIsLoading(false)
        return false
      }

      if (data) {
        console.log('✅ [Auth] Profile loaded successfully')
        const profile = data as any
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          department: profile.department,
        })
      }
    } catch (error) {
      console.error("🔥 [Auth] Exception loading user profile:", error)
    } finally {
      // Always set loading to false after profile load attempt
      console.log('✅ [Auth] Profile load complete, setting loading to false')
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error.message)
        
        // Check for email not confirmed error
        if (error.message.includes('Email not confirmed')) {
          console.error('📧 [Auth] Email not confirmed. User must verify email first.')
        }
        
        return false
      }

      if (data.user) {
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          console.error('🚫 [Auth] Email not confirmed. Cannot log in.')
          await supabase.auth.signOut()
          return false
        }
        
        await loadUserProfile(data.user)
        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: "student" | "admin",
    department?: string
  ): Promise<boolean> => {
    try {
      console.log('📝 [Auth] Starting signup process...')
      console.log('📝 [Auth] Email:', email)
      console.log('📝 [Auth] Name:', name)
      console.log('📝 [Auth] Role:', role)
      console.log('📝 [Auth] Department:', department)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            department,
          },
        },
      })

      console.log('📊 [Auth] Signup response data:', data)
      console.log('❌ [Auth] Signup error:', error)

      if (error) {
        console.error('❌ [Auth] Signup error:', error.message)
        return false
      }

      if (data.user) {
        console.log('✅ [Auth] User created:', data.user.id)
        console.log('📧 [Auth] Email confirmation required:', data.user.confirmation_sent_at ? 'Yes' : 'No')
        console.log('📧 [Auth] Confirmation sent at:', data.user.confirmation_sent_at)
        
        // If email confirmation is required, the user won't be able to log in yet
        // and the profile might not be created until they confirm
        if (data.user.confirmation_sent_at) {
          console.log('✉️ [Auth] Email confirmation sent. User needs to confirm email before logging in.')
          // Don't try to load profile yet - it will be created after email confirmation
          setIsLoading(false)
          return true
        }
        
        // Wait a moment for the trigger to create the profile
        console.log('⏳ [Auth] Waiting for profile creation...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Profile is automatically created via trigger
        await loadUserProfile(data.user)
        return true
      }

      console.log('⚠️ [Auth] No user returned from signup')
      return false
    } catch (error) {
      console.error('🔥 [Auth] Signup exception:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
