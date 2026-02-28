"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteObjective } from "@/lib/actions/objectives"
import type { ObjectiveWithDetails } from "@/lib/types/database"
import { calculateObjectiveProgress } from "@/lib/utils/progress"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ObjectiveForm } from "./objective-form"
import { KeyResultForm } from "./key-result-form"
import { KeyResultItem } from "./key-result-item"

interface ObjectiveCardProps {
  objective: ObjectiveWithDetails
  projectId: string
}

export function ObjectiveCard({ objective, projectId }: ObjectiveCardProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [krFormOpen, setKrFormOpen] = useState(false)
  const progress = calculateObjectiveProgress(objective.key_results)

  const handleDelete = async () => {
    try {
      await deleteObjective(objective.id, projectId)
      router.refresh()
    } catch {
      // Handle error
    }
  }

  return (
    <div className="rounded-xl border-l-4 border-l-okra-orange border bg-card p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] truncate">
              {objective.title}
            </h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {objective.period_type === "quarterly" ? "분기" : "월"}
            </Badge>
          </div>
          {objective.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {objective.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-bold font-[family-name:var(--font-heading)] text-okra-orange">
            {progress}%
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="mt-3 h-2" />

      {/* Key Results */}
      <div className="mt-5 space-y-3">
        {objective.key_results.map((kr) => (
          <KeyResultItem key={kr.id} keyResult={kr} projectId={projectId} />
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 border border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground"
          onClick={() => setKrFormOpen(true)}
        >
          <Plus className="h-4 w-4" />
          핵심 결과 추가
        </Button>
      </div>

      <ObjectiveForm
        projectId={projectId}
        objective={objective}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <KeyResultForm
        objectiveId={objective.id}
        open={krFormOpen}
        onOpenChange={setKrFormOpen}
      />
    </div>
  )
}
