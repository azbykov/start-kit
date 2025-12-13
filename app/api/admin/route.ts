import { auth } from "@/lib/auth"
import { verifyUserRole } from "@/lib/auth/roles"
import { Role } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const hasAccess = await verifyUserRole(Role.ADMIN)
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  return NextResponse.json({
    message: "This is an admin-only API route",
    user: {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    }
  })
}

