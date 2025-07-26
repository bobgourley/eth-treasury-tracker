import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Authenticate admin user
 */
export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  try {
    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      return false
    }

    return verifyPassword(password, admin.password)
  } catch (error) {
    console.error('Authentication error:', error)
    return false
  }
}

/**
 * Create admin user (for initial setup)
 */
export async function createAdmin(username: string, password: string): Promise<boolean> {
  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    })

    if (existingAdmin) {
      throw new Error('Admin user already exists')
    }

    const hashedPassword = await hashPassword(password)
    
    await prisma.admin.create({
      data: {
        username,
        password: hashedPassword
      }
    })

    return true
  } catch (error) {
    console.error('Failed to create admin:', error)
    return false
  }
}

/**
 * Simple session token generation (for demo purposes)
 * In production, use proper JWT or session management
 */
export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Validate session token (basic implementation)
 * In production, implement proper session storage and validation
 */
const activeSessions = new Set<string>()

export function createSession(token: string): void {
  activeSessions.add(token)
  
  // Auto-expire sessions after 1 hour
  setTimeout(() => {
    activeSessions.delete(token)
  }, 60 * 60 * 1000)
}

export function validateSession(token: string): boolean {
  return activeSessions.has(token)
}

export function destroySession(token: string): void {
  activeSessions.delete(token)
}

/**
 * Verify session from request cookies
 */
export async function verifySession(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session-token')?.value
    
    if (!sessionToken || !validateSession(sessionToken)) {
      return null
    }
    
    return sessionToken
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}
