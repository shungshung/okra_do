import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { TodayTaskList } from "./today-task-list"

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const today = new Date().toISOString().split("T")[0]

  // Get all tasks that are due today or before (including overdue)
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, projects(name, emoji)")
    .eq("user_id", user.id)
    .lte("due_date", today)
    .order("is_completed", { ascending: true })
    .order("due_date", { ascending: true })
    .order("position", { ascending: true })

  const formattedTasks = (tasks || []).map((t) => {
    const project = t.projects as unknown as { name: string; emoji: string | null } | null
    return {
      ...t,
      projects: undefined,
      project_name: project?.name || "",
      project_emoji: project?.emoji || null,
    }
  })

  const pendingCount = formattedTasks.filter((t) => !t.is_completed).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
          오늘 할 일
        </h1>
        <div className="mt-1 flex items-center gap-2 text-muted-foreground">
          <span>{format(new Date(), "yyyy년 M월 d일 EEEE", { locale: ko })}</span>
          <Badge variant="secondary">{pendingCount}개 남음</Badge>
        </div>
      </div>

      {formattedTasks.length > 0 ? (
        <TodayTaskList tasks={formattedTasks} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-lg font-medium">오늘 할 일이 없어요</p>
          <p className="mt-1 text-sm text-muted-foreground">
            KR에서 할 일을 추가해보세요
          </p>
        </div>
      )}
    </div>
  )
}
