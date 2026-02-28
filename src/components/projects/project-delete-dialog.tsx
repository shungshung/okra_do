"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteProject } from "@/lib/actions/projects"
import type { Project } from "@/lib/types/database"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ProjectDeleteDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectDeleteDialog({ project, open, onOpenChange }: ProjectDeleteDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteProject(project.id)
      onOpenChange(false)
      router.push("/")
      router.refresh()
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로젝트 삭제</DialogTitle>
          <DialogDescription>
            &quot;{project.emoji} {project.name}&quot; 프로젝트를 삭제하시겠습니까?
            이 프로젝트의 모든 목표, 핵심 결과, 할 일이 함께 삭제됩니다.
            이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "삭제 중..." : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
