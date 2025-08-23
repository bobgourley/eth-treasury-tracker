import { cookies } from 'next/headers'

export async function checkAdminBypass(): Promise<{ isAdmin: boolean; email?: string }> {
  try {
    const cookieStore = cookies()
    const bypassCookie = cookieStore.get('admin-bypass-session')
    
    if (!bypassCookie?.value) {
      return { isAdmin: false }
    }
    
    const session = JSON.parse(bypassCookie.value)
    
    // Check if session has expired
    if (session.expires && Date.now() > session.expires) {
      return { isAdmin: false }
    }
    
    return {
      isAdmin: session.isAdmin || false,
      email: session.email
    }
  } catch (error) {
    console.error('Admin bypass check error:', error)
    return { isAdmin: false }
  }
}

export function isValidAdminEmail(email: string): boolean {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL
  return email === ADMIN_EMAIL
}
