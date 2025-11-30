declare module 'better-auth/react' {
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
