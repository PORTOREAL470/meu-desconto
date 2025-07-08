import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Obter o tipo de usuário do perfil
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).single()

  const userType = profile?.user_type || "cliente"

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userType={userType} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

