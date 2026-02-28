import type { KeyResult, ObjectiveWithKeyResults } from "@/lib/types/database"

export function calculateKRProgress(kr: KeyResult): number {
  if (kr.kr_type === "boolean") {
    return kr.is_completed ? 100 : 0
  }
  if (kr.target_value === 0) return 0
  return Math.min(100, Math.round((kr.current_value / kr.target_value) * 100))
}

export function calculateObjectiveProgress(krs: KeyResult[]): number {
  if (krs.length === 0) return 0
  const total = krs.reduce((sum, kr) => sum + calculateKRProgress(kr), 0)
  return Math.round(total / krs.length)
}

export function calculateProjectProgress(objectives: ObjectiveWithKeyResults[]): number {
  if (objectives.length === 0) return 0
  const total = objectives.reduce(
    (sum, obj) => sum + calculateObjectiveProgress(obj.key_results),
    0
  )
  return Math.round(total / objectives.length)
}
