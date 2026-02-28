"use client"

import type { Task } from "@/lib/types/database"
import { TaskList } from "@/components/tasks/task-list"

interface TodayTaskListProps {
  tasks: (Task & { project_name: string; project_emoji: string | null })[]
}

export function TodayTaskList({ tasks }: TodayTaskListProps) {
  // Group tasks by project
  const grouped = tasks.reduce(
    (acc, task) => {
      const key = task.project_id
      if (!acc[key]) {
        acc[key] = {
          projectName: task.project_name,
          projectEmoji: task.project_emoji,
          tasks: [],
        }
      }
      acc[key].tasks.push(task)
      return acc
    },
    {} as Record<string, { projectName: string; projectEmoji: string | null; tasks: typeof tasks }>
  )

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([projectId, group]) => (
        <div key={projectId}>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>{group.projectEmoji || "📁"}</span>
            <span>{group.projectName}</span>
          </div>
          <TaskList tasks={group.tasks} showProject={false} />
        </div>
      ))}
    </div>
  )
}
