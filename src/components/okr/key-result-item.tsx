"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateKeyResult, deleteKeyResult } from "@/lib/actions/key-results"
import type { KeyResultWithTasks, Task } from "@/lib/types/database"
import { calculateKRProgress } from "@/lib/utils/progress"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { KeyResultForm } from "./key-result-form"
import { TaskItem } from "@/components/tasks/task-item"
import { TaskForm } from "@/components/tasks/task-form"

interface KeyResultItemProps {
  keyResult: KeyResultWithTasks
  projectId: string
}

export function KeyResultItem({ keyResult, projectId }: KeyResultItemProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [progressInput, setProgressInput] = useState(keyResult.current_value.toString())

  const progress = calculateKRProgress(keyResult)
  const isBoolean = keyResult.kr_type === "boolean"

  const handleProgressUpdate = async () => {
    const newValue = Number(progressInput)
    if (isNaN(newValue) || newValue < 0) return
    if (newValue === keyResult.current_value) return

    try {
      await updateKeyResult(keyResult.id, { current_value: newValue })
      router.refresh()
    } catch {
      setProgressInput(keyResult.current_value.toString())
    }
  }

  const handleBooleanToggle = async () => {
    try {
      await updateKeyResult(keyResult.id, { is_completed: !keyResult.is_completed })
      router.refresh()
    } catch {
      // Handle error
    }
  }

  const handleDelete = async () => {
    try {
      await deleteKeyResult(keyResult.id)
      router.refresh()
    } catch {
      // Handle error
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-3">
          <CollapsibleTrigger asChild>
            <button className="shrink-0 rounded p-0.5 hover:bg-accent">
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", isOpen && "rotate-0", !isOpen && "-rotate-90")}
              />
            </button>
          </CollapsibleTrigger>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium font-[family-name:var(--font-heading)] truncate">
                {keyResult.title}
              </span>
              <span className="shrink-0 text-sm font-semibold text-okra-blue">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="mt-2 h-1.5 [&>div]:bg-okra-blue" />
          </div>

          {/* Progress input */}
          {!isBoolean ? (
            <div className="flex items-center gap-1 shrink-0">
              <Input
                type="number"
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                onBlur={handleProgressUpdate}
                onKeyDown={(e) => e.key === "Enter" && handleProgressUpdate()}
                className="h-7 w-16 text-xs text-center"
                min="0"
                max={keyResult.target_value}
              />
              <span className="text-xs text-muted-foreground">/ {keyResult.target_value}</span>
            </div>
          ) : (
            <Button
              variant={keyResult.is_completed ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={handleBooleanToggle}
            >
              {keyResult.is_completed ? "완료" : "미완료"}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CollapsibleContent className="mt-3 space-y-1.5 pl-7">
          {(keyResult.tasks as Task[]).map((task) => (
            <TaskItem key={task.id} task={task} showProject={false} />
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground"
            onClick={() => setTaskFormOpen(true)}
          >
            <Plus className="h-3 w-3" />할 일 추가
          </Button>
        </CollapsibleContent>
      </Collapsible>

      <KeyResultForm
        objectiveId={keyResult.objective_id}
        keyResult={keyResult}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <TaskForm
        projectId={projectId}
        keyResultId={keyResult.id}
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
      />
    </div>
  )
}
