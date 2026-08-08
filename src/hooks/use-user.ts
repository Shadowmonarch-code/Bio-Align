"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"

// Extended user type with additional fields
export interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  institution: string | null
  emailVerified: Date | null
  createdAt: string
  updatedAt: string
  memberSince?: string
  accountAge?: number
}

interface UseUserReturn {
  // Session info
  session: ReturnType<typeof useSession>["session"]
  status: "loading" | "authenticated" | "unauthenticated"
  
  // User profile (from database)
  userProfile: UserProfile | null
  isLoadingProfile: boolean
  
  // Actions
  refreshUser: () => Promise<void>
  updateUser: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
  
  // Convenience getters
  isAuthenticated: boolean
  userDisplayName: string
  userEmail: string | null
  userInitials: string
  userRole: string
}

export function useUser(): UseUserReturn {
  const { data: session, status, update: updateSession } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // Fetch user profile from database when authenticated
  const fetchUserProfile = useCallback(async () => {
    if (status !== "authenticated") {
      setUserProfile(null)
      return
    }

    setIsLoadingProfile(true)
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
      } else {
        console.error("Failed to fetch user profile:", response.status)
        setUserProfile(null)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setUserProfile(null)
    } finally {
      setIsLoadingProfile(false)
    }
  }, [status])

  // Fetch on mount and when auth status changes
  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    await updateSession() // Update NextAuth session
    await fetchUserProfile() // Re-fetch from database
  }, [updateSession, fetchUserProfile])

  // Update user profile
  const updateUser = useCallback(async (data: Partial<UserProfile>) => {
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return { success: false, error: errorData.error || "Update failed" }
      }

      // Refresh user data after update
      await refreshUser()
      return { success: true }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }, [refreshUser])

  // Calculate display values
  const isAuthenticated = status === "authenticated"
  
  const userDisplayName = 
    userProfile?.name || 
    session?.user?.name || 
    "User"
    
  const userEmail = 
    userProfile?.email || 
    session?.user?.email || null

  const userInitials = (() => {
    const name = userProfile?.name || session?.user?.name
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }
    const email = userProfile?.email || session?.user?.email
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  })()

  const userRole = userProfile?.role || session?.user?.role || "user"

  return {
    session,
    status,
    userProfile,
    isLoadingProfile: refreshUser,
    updateUser,
    isAuthenticated,
    userDisplayName,
    userEmail,
    userInitials,
    userRole,
  }
}
