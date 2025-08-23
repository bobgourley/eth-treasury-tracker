import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const ALLOWED_ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',') || []

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log('🔐 Sign-in attempt:', {
        email: user.email,
        provider: account?.provider,
        allowedEmails: ALLOWED_ADMIN_EMAILS
      })
      
      if (!user.email || !ALLOWED_ADMIN_EMAILS.includes(user.email)) {
        console.log(`🚫 Unauthorized login attempt from: ${user.email}`)
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
  },
  debug: process.env.NODE_ENV === 'development'
})

export { handler as GET, handler as POST }
