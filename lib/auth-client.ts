'use client'

// Use require to work around TypeScript module resolution issues  
const { createAuthClient } = require('better-auth/react') as any

// Create the auth client with all hooks
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
})

// Export the methods with proper typing
export const { signIn, signUp, signOut, useSession } = authClient