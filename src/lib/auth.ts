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
 * Simple but robust session storage for development
 * In production, use Redis or database-backed sessions
 */
const activeSessions = new Set<string>()

export function createSession(token: string): void {
  activeSessions.add(token)
  console.log('✅ Session created:', token.substring(0, 8) + '...')
  
  // Auto-expire sessions after 4 hours (longer for development)
  setTimeout(() => {
    activeSessions.delete(token)
    console.log('⏰ Session expired:', token.substring(0, 8) + '...')
  }, 4 * 60 * 60 * 1000)
}

export function validateSession(token: string): boolean {
  const isValid = activeSessions.has(token)
  console.log('🔐 Session validation:', token.substring(0, 8) + '...', isValid ? 'VALID' : 'INVALID')
  return isValid
}

export function destroySession(token: string): void {
  activeSessions.delete(token)
  console.log('🗑️ Session destroyed:', token.substring(0, 8) + '...')
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
