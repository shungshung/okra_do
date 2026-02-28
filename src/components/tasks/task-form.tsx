"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createTask } from "@/lib/actions/tasks"
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
import { Textarea } from "@/components/ui/textarea"

interface TaskFormProps {
  projectId: string
  keyResultId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskForm({ projectId, keyResultId, open, onOpenChange }: TaskFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await createTask({
        project_id: projectId,
        key_result_id: keyResultId || null,
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
      })
      setTitle("")
      setDescription("")
      setDueDate("")
      onOpenChange(false)
      router.refresh()
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>할 일 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">할 일</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="무엇을 해야 하나요?"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-desc">설명 (선택)</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="추가 설명"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due">마감일 (선택)</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!title.trim() || loading}>
              {loading ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
