import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getObjectivesWithDetails } from "@/lib/actions/objectives"
import { calculateProjectProgress } from "@/lib/utils/progress"
import { Progress } from "@/components/ui/progress"
import { ObjectiveList } from "@/components/okr/objective-list"
import { ProjectActions } from "./project-actions"

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !project) {
    notFound()
  }

  const objectives = await getObjectivesWithDetails(id)
  const progress = calculateProjectProgress(objectives)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{project.emoji || "📁"}</span>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)]">
              {project.name}
            </h1>
          </div>
          <ProjectActions project={project} />
        </div>

        <div className="flex items-center gap-4">
          <Progress value={progress} className="flex-1 h-2.5" />
          <span className="text-lg font-semibold font-[family-name:var(--font-heading)] text-okra-orange">
            {progress}%
          </span>
        </div>
      </div>

      {/* OKR Tree */}
      <ObjectiveList objectives={objectives} projectId={id} />
    </div>
  )
}
