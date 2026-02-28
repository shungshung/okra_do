// ============================================================
// OKRA Do — Database TypeScript Types
// ============================================================

export type PeriodType = "quarterly" | "monthly"
export type KRType = "percentage" | "boolean"
export type AIContextType = "objective" | "key_result" | "task" | "general"
export type AIUserAction = "accepted" | "modified" | "ignored"

// ---- Profiles ----

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type ProfileUpdate = Partial<Pick<Profile, "full_name" | "avatar_url">>

// ---- Projects ----

export type Project = {
  id: string
  user_id: string
  name: string
  emoji: string | null
  color: string | null
  position: number
  created_at: string
  updated_at: string
}

export type ProjectInsert = {
  name: string
  emoji?: string | null
  color?: string | null
  position?: number
}

export type ProjectUpdate = Partial<Pick<Project, "name" | "emoji" | "color" | "position">>

// ---- Objectives ----

export type Objective = {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  period_type: PeriodType
  period_start: string | null
  period_end: string | null
  position: number
  created_at: string
  updated_at: string
}

export type ObjectiveInsert = {
  project_id: string
  title: string
  description?: string | null
  period_type?: PeriodType
  period_start?: string | null
  period_end?: string | null
  position?: number
}

export type ObjectiveUpdate = Partial<
  Pick<Objective, "title" | "description" | "period_type" | "period_start" | "period_end" | "position">
>

// ---- Key Results ----

export type KeyResult = {
  id: string
  objective_id: string
  user_id: string
  title: string
  kr_type: KRType
  current_value: number
  target_value: number
  is_completed: boolean
  position: number
  created_at: string
  updated_at: string
}

export type KeyResultInsert = {
  objective_id: string
  title: string
  kr_type?: KRType
  current_value?: number
  target_value?: number
  is_completed?: boolean
  position?: number
}

export type KeyResultUpdate = Partial<
  Pick<KeyResult, "title" | "kr_type" | "current_value" | "target_value" | "is_completed" | "position">
>

// ---- Tasks ----

export type Task = {
  id: string
  key_result_id: string | null
  project_id: string
  user_id: string
  title: string
  description: string | null
  is_completed: boolean
  due_date: string | null
  position: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type TaskInsert = {
  project_id: string
  key_result_id?: string | null
  title: string
  description?: string | null
  due_date?: string | null
  position?: number
}

export type TaskUpdate = Partial<
  Pick<Task, "title" | "description" | "is_completed" | "due_date" | "key_result_id" | "position">
>

// ---- AI Coach Logs ----

export type AICoachLog = {
  id: string
  user_id: string
  context_type: AIContextType
  context_id: string | null
  suggestion: string
  user_action: AIUserAction | null
  created_at: string
}

// ---- Composite Types (with relations) ----

export type KeyResultWithTasks = KeyResult & {
  tasks: Task[]
}

export type ObjectiveWithKeyResults = Objective & {
  key_results: KeyResult[]
}

export type ObjectiveWithDetails = Objective & {
  key_results: KeyResultWithTasks[]
}

export type ProjectWithObjectives = Project & {
  objectives: ObjectiveWithKeyResults[]
}

export type ProjectWithDetails = Project & {
  objectives: ObjectiveWithDetails[]
}
