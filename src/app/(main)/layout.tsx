import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/layout/sidebar"
import { redirect } from "next/navigation"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true })

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        user={user}
        profile={profile}
        projects={projects || []}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
