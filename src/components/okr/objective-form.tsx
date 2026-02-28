"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createObjective, updateObjective } from "@/lib/actions/objectives"
import type { Objective, PeriodType } from "@/lib/types/database"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ObjectiveFormProps {
  projectId: string
  objective?: Objective
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ObjectiveForm({ projectId, objective, open, onOpenChange }: ObjectiveFormProps) {
  const router = useRouter()
  const isEdit = !!objective
  const [title, setTitle] = useState(objective?.title || "")
  const [description, setDescription] = useState(objective?.description || "")
  const [periodType, setPeriodType] = useState<PeriodType>(objective?.period_type || "quarterly")
  const [periodStart, setPeriodStart] = useState(objective?.period_start || "")
  const [periodEnd, setPeriodEnd] = useState(objective?.period_end || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      if (isEdit && objective) {
        await updateObjective(objective.id, {
          title: title.trim(),
          description: description.trim() || null,
          period_type: periodType,
          period_start: periodStart || null,
          period_end: periodEnd || null,
        })
      } else {
        await createObjective({
          project_id: projectId,
          title: title.trim(),
          description: description.trim() || null,
          period_type: periodType,
          period_start: periodStart || null,
          period_end: periodEnd || null,
        })
      }
      resetForm()
      onOpenChange(false)
      router.refresh()
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    if (!isEdit) {
      setTitle("")
      setDescription("")
      setPeriodType("quarterly")
      setPeriodStart("")
      setPeriodEnd("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "목표 수정" : "목표 추가"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="obj-title">목표 (Objective)</Label>
            <Input
              id="obj-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="이번 분기에 이루고 싶은 목표"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="obj-desc">설명 (선택)</Label>
            <Textarea
              id="obj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="목표에 대한 추가 설명"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>기간</Label>
              <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">분기</SelectItem>
                  <SelectItem value="monthly">월</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-start">시작</Label>
              <Input
                id="period-start"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-end">종료</Label>
              <Input
                id="period-end"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!title.trim() || loading}>
              {loading ? "저장 중..." : isEdit ? "저장" : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
