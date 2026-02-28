import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { calculateObjectiveProgress, calculateProjectProgress } from "@/lib/utils/progress"
import Link from "next/link"
import { DashboardTasks } from "./dashboard-tasks"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  // Get projects with objectives and key results for progress calculation
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true })

  // Get objectives with key results for each project
  const projectIds = (projects || []).map((p) => p.id)
  let objectives: Array<Record<string, unknown>> = []
  let keyResults: Array<Record<string, unknown>> = []

  if (projectIds.length > 0) {
    const { data: objData } = await supabase
      .from("objectives")
      .select("*")
      .in("project_id", projectIds)
      .eq("user_id", user.id)

    objectives = objData || []

    const objectiveIds = objectives.map((o) => o.id as string)
    if (objectiveIds.length > 0) {
      const { data: krData } = await supabase
        .from("key_results")
        .select("*")
        .in("objective_id", objectiveIds)
        .eq("user_id", user.id)

      keyResults = krData || []
    }
  }

  // Calculate progress per project
  const projectsWithProgress = (projects || []).map((project) => {
    const projectObjectives = objectives
      .filter((o) => o.project_id === project.id)
      .map((o) => ({
        ...o,
        key_results: keyResults
          .filter((kr) => kr.objective_id === o.id)
          .map((kr) => ({
            ...kr,
            current_value: Number(kr.current_value),
            target_value: Number(kr.target_value),
          })),
      }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progress = calculateProjectProgress(projectObjectives as any)
    const objectiveCount = projectObjectives.length
    const krCount = projectObjectives.reduce((sum, o) => sum + o.key_results.length, 0)
    return { ...project, progress, objectiveCount, krCount }
  })

  // Get today's tasks
  const today = new Date().toISOString().split("T")[0]
  const { data: todayTasks } = await supabase
    .from("tasks")
    .select("*, projects(name, emoji)")
    .eq("user_id", user.id)
    .eq("is_completed", false)
    .lte("due_date", today)
    .order("due_date", { ascending: true })
    .limit(5)

  const formattedTasks = (todayTasks || []).map((t) => {
    const project = t.projects as unknown as { name: string; emoji: string | null } | null
    return {
      ...t,
      projects: undefined,
      project_name: project?.name || "",
      project_emoji: project?.emoji || null,
    }
  })

  const displayName = profile?.full_name || user.email?.split("@")[0] || "사용자"

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
          안녕하세요 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {format(new Date(), "yyyy년 M월 d일 EEEE", { locale: ko })} — 오늘도 목표에 한 걸음 더
        </p>
      </div>

      {/* Progress Cards */}
      {projectsWithProgress.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectsWithProgress.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="transition-shadow hover:shadow-md cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{project.emoji || "📁"}</span>
                    <CardTitle className="text-base">{project.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {/* Circular Progress */}
                    <div className="relative h-16 w-16 shrink-0">
                      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-muted/30"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeDasharray={`${(project.progress / 100) * 175.93} 175.93`}
                          strokeLinecap="round"
                          className="text-okra-orange transition-all"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-[family-name:var(--font-heading)]">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>목표 {project.objectiveCount}개</p>
                      <p>핵심 결과 {project.krCount}개</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">🌱</div>
            <p className="text-lg font-medium font-[family-name:var(--font-heading)]">
              아직 프로젝트가 없어요
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              사이드바에서 프로젝트를 추가해보세요
            </p>
          </CardContent>
        </Card>
      )}

      {/* Today's Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-heading)]">
            오늘 할 일
          </h2>
          {formattedTasks.length > 0 && (
            <Link href="/today" className="text-sm text-okra-orange hover:underline">
              전체 보기
            </Link>
          )}
        </div>

        {formattedTasks.length > 0 ? (
          <Card>
            <CardContent className="pt-4">
              <DashboardTasks tasks={formattedTasks} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              오늘 마감인 할 일이 없어요 🎉
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
