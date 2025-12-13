import { Role } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface User {
    role: Role
    teamId?: string | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: Role
      teamId?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name?: string | null
    role: Role
    teamId?: string | null
  }
}

