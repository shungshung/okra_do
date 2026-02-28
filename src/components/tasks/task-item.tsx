"use client"

import { useRouter } from "next/navigation"
import { toggleTask, deleteTask } from "@/lib/actions/tasks"
import type { Task } from "@/lib/types/database"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format, isPast, isToday } from "date-fns"
import { ko } from "date-fns/locale"

interface TaskItemProps {
  task: Task & { project_name?: string; project_emoji?: string | null }
  showProject?: boolean
}

export function TaskItem({ task, showProject = false }: TaskItemProps) {
  const router = useRouter()

  const handleToggle = async () => {
    try {
      await toggleTask(task.id)
      router.refresh()
    } catch {
      // Handle error
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTask(task.id)
      router.refresh()
    } catch {
      // Handle error
    }
  }

  const dueDateDisplay = task.due_date ? format(new Date(task.due_date), "M/d (EEE)", { locale: ko }) : null
  const isOverdue = task.due_date && !task.is_completed && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))

  return (
    <div className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent/50 transition-colors">
      <Checkbox
        checked={task.is_completed}
        onCheckedChange={handleToggle}
      />

      <span
        className={cn(
          "flex-1 text-sm truncate",
          task.is_completed && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </span>

      {showProject && task.project_name && (
        <Badge variant="secondary" className="shrink-0 text-xs font-normal">
          {task.project_emoji} {task.project_name}
        </Badge>
      )}

      {dueDateDisplay && (
        <span className={cn(
          "flex items-center gap-1 shrink-0 text-xs",
          isOverdue ? "text-destructive" : "text-muted-foreground"
        )}>
          <Calendar className="h-3 w-3" />
          {dueDateDisplay}
        </span>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
