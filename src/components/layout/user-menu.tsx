"use client"

import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types/database"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface UserMenuProps {
  user: User
  profile: Profile | null
}

export function UserMenu({ user, profile }: UserMenuProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const displayName = profile?.full_name || user.email || "사용자"
  const initials = displayName.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-sidebar-accent transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sidebar-foreground">{displayName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          {theme === "dark" ? "라이트 모드" : "다크 모드"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
