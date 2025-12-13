import { auth } from "@/lib/auth"
import { verifyUserRole } from "@/lib/auth/roles"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect("/sign-in?callbackUrl=/admin")
  }

  const hasAccess = await verifyUserRole(Role.ADMIN)
  if (!hasAccess) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-semibold">Панель администратора</h1>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Добро пожаловать в панель администратора, {session.user.email}!
        </p>
        <p className="text-sm">
          Эта страница доступна только пользователям с ролью ADMIN.
        </p>
      </div>
    </div>
  )
}

