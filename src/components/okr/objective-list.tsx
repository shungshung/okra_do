"use client"

import { useState } from "react"
import type { ObjectiveWithDetails } from "@/lib/types/database"
import { ObjectiveCard } from "./objective-card"
import { ObjectiveForm } from "./objective-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface ObjectiveListProps {
  objectives: ObjectiveWithDetails[]
  projectId: string
}

export function ObjectiveList({ objectives, projectId }: ObjectiveListProps) {
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="space-y-6">
      {objectives.map((objective) => (
        <ObjectiveCard
          key={objective.id}
          objective={objective}
          projectId={projectId}
        />
      ))}

      <Button
        variant="ghost"
        className="w-full gap-2 border-2 border-dashed border-muted-foreground/20 py-8 text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
        onClick={() => setFormOpen(true)}
      >
        <Plus className="h-5 w-5" />
        Objective 추가
      </Button>

      <ObjectiveForm
        projectId={projectId}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  )
}
