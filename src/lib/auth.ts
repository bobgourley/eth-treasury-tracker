import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// List of allowed admin email addresses
const ALLOWED_ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL, // Your email from environment variable
].filter(Boolean) as string[]

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow sign-in for allowed admin emails
      if (!user.email || !ALLOWED_ADMIN_EMAILS.includes(user.email)) {
        console.log(`🚫 Unauthorized login attempt from: ${user.email}`)
        return false
      }
      
      console.log(`✅ Authorized admin login: ${user.email}`)
      return true
    },
    async session({ session, token }) {
      // Add isAdmin flag to session using JWT token
      if (session.user?.email && ALLOWED_ADMIN_EMAILS.includes(session.user.email)) {
        session.user.isAdmin = true
      }
      
      return session
    },
    async jwt({ token, user, account }) {
      // Store user info in JWT token
      if (user) {
        token.isAdmin = ALLOWED_ADMIN_EMAILS.includes(user.email || '')
      }
      return token
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 4 * 60 * 60, // 4 hours
  },
}

/**
 * Helper function to check if user is admin
 */
// Simple admin check using environment variable (no database dependency)
export function isUserAdmin(email: string): boolean {
  return ALLOWED_ADMIN_EMAILS.includes(email)
}

/**
 * Add an email to the allowed admins list (for future use)
 */
export function addAllowedAdmin(email: string): void {
  if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
    ALLOWED_ADMIN_EMAILS.push(email)
    console.log(`✅ Added new admin email: ${email}`)
  }
}

/**
 * Get list of allowed admin emails (for debugging)
 */
export function getAllowedAdmins(): string[] {
  return [...ALLOWED_ADMIN_EMAILS]
}
