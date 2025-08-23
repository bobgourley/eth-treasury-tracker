// Simple admin authentication helpers
const ALLOWED_ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',') || []
const ADMIN_BYPASS_SECRET = process.env.ADMIN_BYPASS_SECRET || ''

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
