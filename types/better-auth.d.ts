// Type declarations for Better Auth custom fields
export interface CustomUser {
  role: string
  phoneNumber?: string | null
  dateOfBirth?: Date | null
}

declare module 'better-auth' {
  export interface User extends CustomUser {}
}

declare module 'better-auth/client' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      role: string
      phoneNumber?: string | null
      dateOfBirth?: Date | null
      emailVerified: boolean
      createdAt: Date
      updatedAt: Date
    }
  }
}
