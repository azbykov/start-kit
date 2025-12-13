"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface SignOutButtonProps {
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export function SignOutButton({ 
  size = "sm", 
  variant = "ghost" 
}: SignOutButtonProps = {}) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Выйти
    </Button>
  )
}

