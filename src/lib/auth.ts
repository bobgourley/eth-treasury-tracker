import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

// List of allowed admin email addresses
const ALLOWED_ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL, // Your email from environment variable
].filter(Boolean) as string[]

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    async session({ session, user }) {
      // Add isAdmin flag to session
      if (session.user?.email && ALLOWED_ADMIN_EMAILS.includes(session.user.email)) {
        // Update user record to mark as admin
        await prisma.user.upsert({
          where: { email: session.user.email },
          update: { isAdmin: true },
          create: {
            email: session.user.email,
            name: session.user.name,
            image: session.user.image,
            isAdmin: true,
          },
        })
        
        // Add admin flag to session
        session.user.isAdmin = true
      }
      
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'database',
    maxAge: 4 * 60 * 60, // 4 hours
  },
}

/**
 * Helper function to check if user is admin
 */
export async function isUserAdmin(email: string): Promise<boolean> {
  if (!email || !ALLOWED_ADMIN_EMAILS.includes(email)) {
    return false
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { isAdmin: true },
    })
    
    return user?.isAdmin || false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
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
