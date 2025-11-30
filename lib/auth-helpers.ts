import { getSessionWithRole } from './auth-utils'
import { headers } from 'next/headers'

/**
 * Get the current session from the request
 */
export async function getSession() {
  try {
    const session = await getSessionWithRole(await headers())
    return session
  } catch (error) {
    return null
  }
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Authentication required')
  }
  return session
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string) {
  const user = await getCurrentUser()
  if (!user) return false
  return user.role === role
}

/**
 * Require a specific role - throws error if user doesn't have it
 */
export async function requireRole(role: string) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  if (user.role !== role) {
    throw new Error('Insufficient permissions')
  }
  return user
}
