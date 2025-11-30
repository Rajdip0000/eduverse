declare module 'better-auth' {
  interface User {
    role: string
    phoneNumber?: string | null
    dateOfBirth?: Date | null
  }
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
