"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CalendarCheck, Plus, Menu, X } from "lucide-react"
import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { Profile, Project } from "@/lib/types/database"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { UserMenu } from "@/components/layout/user-menu"
import { ProjectCreateDialog } from "@/components/projects/project-create-dialog"

interface AppSidebarProps {
  user: User
  profile: Profile | null
  projects: Project[]
}

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/today", label: "오늘 할 일", icon: CalendarCheck },
]

export function AppSidebar({ user, profile, projects }: AppSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-okra-orange text-sm font-bold text-white font-[family-name:var(--font-heading)]">
          O
        </div>
        <span className="text-lg font-bold font-[family-name:var(--font-heading)]">
          OKRA Do
        </span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Projects */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          프로젝트
        </span>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-1">
          {projects.map((project) => {
            const isActive = pathname === `/projects/${project.id}`
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <span className="text-base">{project.emoji || "📁"}</span>
                <span className="truncate">{project.name}</span>
                {project.color && (
                  <span
                    className="ml-auto h-2 w-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </ScrollArea>

      {/* Add project + User */}
      <div className="mt-auto border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          프로젝트 추가
        </Button>
        <Separator className="my-2" />
        <UserMenu user={user} profile={profile} />
      </div>

      <ProjectCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-card p-2 shadow-md md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-sidebar border-r">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1 hover:bg-sidebar-accent"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden h-full w-[240px] shrink-0 border-r bg-sidebar md:block">
        {sidebarContent}
      </div>
    </>
  )
}
