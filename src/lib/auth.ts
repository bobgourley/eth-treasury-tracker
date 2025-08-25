import GoogleProvider from 'next-auth/providers/google'
import { NextAuthOptions } from 'next-auth'

// Simple admin authentication helpers
const ALLOWED_ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',') || []
const ADMIN_BYPASS_SECRET = process.env.ADMIN_BYPASS_SECRET || ''

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      console.log('🔐 Sign-in attempt:', {
        email: user.email,
        provider: account?.provider,
        allowedEmails: ALLOWED_ADMIN_EMAILS,
        allowedEmailsLength: ALLOWED_ADMIN_EMAILS.length,
        adminEmailEnv: process.env.ADMIN_EMAIL
      })
      
      if (!user.email) {
        console.log('🚫 No email provided by OAuth provider')
        return false
      }
      
      if (!ALLOWED_ADMIN_EMAILS.includes(user.email)) {
        console.log(`🚫 Unauthorized login attempt from: ${user.email}`)
        console.log('🚫 Allowed emails:', ALLOWED_ADMIN_EMAILS)
        console.log('🚫 Email match check:', ALLOWED_ADMIN_EMAILS.map(email => ({
          allowed: email,
          matches: email === user.email,
          caseSensitive: email.toLowerCase() === (user.email?.toLowerCase() || '')
        })))
        return false
      }
      
      console.log(`✅ Authorized admin login: ${user.email}`)
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = ALLOWED_ADMIN_EMAILS.includes(user.email || '')
        console.log('🎫 JWT token created:', {
          email: user.email,
          isAdmin: token.isAdmin
        })
      }
      return token
    },
    async session({ session, token }) {
      console.log('📋 Session callback:', {
        email: session.user?.email,
        tokenIsAdmin: token.isAdmin
      })
      
      if (session.user && token.isAdmin) {
        session.user.isAdmin = true
      }
      
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.ethereumlist.com' : undefined
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  debug: process.env.NODE_ENV === 'development'
}

// Helper function to check if user is admin
export function isAdminEmail(email: string): boolean {
  return ALLOWED_ADMIN_EMAILS.includes(email)
}

// Helper function to get allowed admin emails
export function getAllowedAdminEmails(): string[] {
  return ALLOWED_ADMIN_EMAILS
}

// Helper function to validate admin credentials
export function validateAdminCredentials(email: string, secret: string): boolean {
  return isAdminEmail(email) && secret === ADMIN_BYPASS_SECRET
}

// Helper function to get admin bypass secret
export function getAdminBypassSecret(): string {
  return ADMIN_BYPASS_SECRET
}
