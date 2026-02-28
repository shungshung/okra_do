"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateProject } from "@/lib/actions/projects"
import type { Project } from "@/lib/types/database"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const EMOJI_OPTIONS = ["💼", "🏃", "🚀", "📚", "💰", "🎨", "🎯", "🏠", "✈️", "🎵"]
const COLOR_OPTIONS = ["#d97757", "#6a9bcc", "#788c5d", "#b0aea5", "#e8a87c", "#7c6fb0", "#d4a574", "#5a9e6f"]

interface ProjectEditDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectEditDialog({ project, open, onOpenChange }: ProjectEditDialogProps) {
  const router = useRouter()
  const [name, setName] = useState(project.name)
  const [emoji, setEmoji] = useState(project.emoji || "📁")
  const [color, setColor] = useState(project.color || COLOR_OPTIONS[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setName(project.name)
    setEmoji(project.emoji || "📁")
    setColor(project.color || COLOR_OPTIONS[0])
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await updateProject(project.id, { name: name.trim(), emoji, color })
      onOpenChange(false)
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
          <DialogTitle>프로젝트 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">이름</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="프로젝트 이름"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>아이콘</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors ${
                    emoji === e
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>색상</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    color === c ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
