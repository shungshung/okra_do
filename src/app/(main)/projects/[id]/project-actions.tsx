"use client"

import { useState } from "react"
import type { Project } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProjectEditDialog } from "@/components/projects/project-edit-dialog"
import { ProjectDeleteDialog } from "@/components/projects/project-delete-dialog"

interface ProjectActionsProps {
  project: Project
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            프로젝트 수정
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            프로젝트 삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProjectEditDialog project={project} open={editOpen} onOpenChange={setEditOpen} />
      <ProjectDeleteDialog project={project} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  )
}
