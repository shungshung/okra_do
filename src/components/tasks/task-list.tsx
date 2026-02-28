"use client"

import { useState } from "react"
import type { Task } from "@/lib/types/database"
import { TaskItem } from "./task-item"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskListProps {
  tasks: (Task & { project_name?: string; project_emoji?: string | null })[]
  showProject?: boolean
  showCompleted?: boolean
}

export function TaskList({ tasks, showProject = false, showCompleted = true }: TaskListProps) {
  const [completedOpen, setCompletedOpen] = useState(false)

  const pendingTasks = tasks.filter((t) => !t.is_completed)
  const completedTasks = tasks.filter((t) => t.is_completed)

  return (
    <div className="space-y-1">
      {pendingTasks.map((task) => (
        <TaskItem key={task.id} task={task} showProject={showProject} />
      ))}

      {showCompleted && completedTasks.length > 0 && (
        <Collapsible open={completedOpen} onOpenChange={setCompletedOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", !completedOpen && "-rotate-90")}
            />
            완료된 항목 {completedTasks.length}개
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} showProject={showProject} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
