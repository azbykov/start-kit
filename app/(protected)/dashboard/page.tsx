import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-semibold">Дашборд</h1>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Добро пожаловать, {session.user.email}!
        </p>
        <p className="text-sm">
          Роль: <span className="font-medium">{session.user.role}</span>
        </p>
        {session.user.name && (
          <p className="text-sm">
            Имя: <span className="font-medium">{session.user.name}</span>
          </p>
        )}
      </div>
    </div>
  )
}

