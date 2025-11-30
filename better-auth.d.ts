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

declare module 'better-auth' {
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
