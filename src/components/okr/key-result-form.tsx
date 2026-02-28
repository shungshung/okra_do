"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createKeyResult, updateKeyResult } from "@/lib/actions/key-results"
import type { KeyResult, KRType } from "@/lib/types/database"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface KeyResultFormProps {
  objectiveId: string
  keyResult?: KeyResult
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyResultForm({ objectiveId, keyResult, open, onOpenChange }: KeyResultFormProps) {
  const router = useRouter()
  const isEdit = !!keyResult
  const [title, setTitle] = useState(keyResult?.title || "")
  const [krType, setKrType] = useState<KRType>(keyResult?.kr_type || "percentage")
  const [targetValue, setTargetValue] = useState(keyResult?.target_value?.toString() || "100")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      if (isEdit && keyResult) {
        await updateKeyResult(keyResult.id, {
          title: title.trim(),
          kr_type: krType,
          target_value: krType === "percentage" ? Number(targetValue) : 100,
        })
      } else {
        await createKeyResult({
          objective_id: objectiveId,
          title: title.trim(),
          kr_type: krType,
          target_value: krType === "percentage" ? Number(targetValue) : 100,
        })
      }
      if (!isEdit) {
        setTitle("")
        setKrType("percentage")
        setTargetValue("100")
      }
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
          <DialogTitle>{isEdit ? "핵심 결과 수정" : "핵심 결과 추가"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kr-title">핵심 결과 (Key Result)</Label>
            <Input
              id="kr-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="측정 가능한 결과 지표"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>유형</Label>
              <Select value={krType} onValueChange={(v) => setKrType(v as KRType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">수치 (%)</SelectItem>
                  <SelectItem value="boolean">완료/미완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {krType === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="target">목표값</Label>
                <Input
                  id="target"
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  min="1"
                />
              </div>
            )}
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
