"use client"

import type { Task } from "@/lib/types/database"
import { TaskList } from "@/components/tasks/task-list"

interface DashboardTasksProps {
  tasks: (Task & { project_name: string; project_emoji: string | null })[]
}

export function DashboardTasks({ tasks }: DashboardTasksProps) {
  return <TaskList tasks={tasks} showProject showCompleted={false} />
}
