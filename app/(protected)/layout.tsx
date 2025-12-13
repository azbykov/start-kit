import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return <AppLayout>{children}</AppLayout>;
}

