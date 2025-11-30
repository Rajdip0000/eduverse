import type { Session as BetterAuthSession, User as BetterAuthUser } from 'better-auth/types'

declare module 'better-auth/types' {
  interface Session extends BetterAuthSession {
    user: User
  }
  
  interface User extends BetterAuthUser {
    role: string
    phoneNumber?: string | null
    dateOfBirth?: Date | null
  }
}
