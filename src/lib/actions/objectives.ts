"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Objective, ObjectiveInsert, ObjectiveUpdate, ObjectiveWithDetails } from "@/lib/types/database"

export async function getObjectivesWithDetails(projectId: string): Promise<ObjectiveWithDetails[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Fetch objectives
  const { data: objectives, error: objError } = await supabase
    .from("objectives")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("position", { ascending: true })

  if (objError) throw new Error(objError.message)
  if (!objectives || objectives.length === 0) return []

  // Fetch key results for all objectives
  const objectiveIds = objectives.map((o) => o.id)
  const { data: keyResults, error: krError } = await supabase
    .from("key_results")
    .select("*")
    .in("objective_id", objectiveIds)
    .eq("user_id", user.id)
    .order("position", { ascending: true })

  if (krError) throw new Error(krError.message)

  // Fetch tasks for all key results
  const krIds = (keyResults || []).map((kr) => kr.id)
  let tasks: Array<Record<string, unknown>> = []
  if (krIds.length > 0) {
    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .in("key_result_id", krIds)
      .eq("user_id", user.id)
      .order("position", { ascending: true })

    if (taskError) throw new Error(taskError.message)
    tasks = taskData || []
  }

  // Also fetch standalone tasks for this project
  const { data: standaloneTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .is("key_result_id", null)
    .eq("user_id", user.id)
    .order("position", { ascending: true })

  // Assemble the tree
  return objectives.map((obj) => ({
    ...obj,
    key_results: (keyResults || [])
      .filter((kr) => kr.objective_id === obj.id)
      .map((kr) => ({
        ...kr,
        current_value: Number(kr.current_value),
        target_value: Number(kr.target_value),
        tasks: tasks.filter((t) => t.key_result_id === kr.id),
      })),
    _standaloneTasks: standaloneTasks || [],
  })) as unknown as ObjectiveWithDetails[]
}

export async function createObjective(input: ObjectiveInsert): Promise<Objective> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get max position
  const { data: existing } = await supabase
    .from("objectives")
    .select("position")
    .eq("project_id", input.project_id)
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from("objectives")
    .insert({
      project_id: input.project_id,
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      period_type: input.period_type || "quarterly",
      period_start: input.period_start || null,
      period_end: input.period_end || null,
      position: input.position ?? nextPosition,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${input.project_id}`)
  revalidatePath("/")
  return data
}

export async function updateObjective(id: string, input: ObjectiveUpdate): Promise<Objective> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("objectives")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/")
  return data
}

export async function deleteObjective(id: string, projectId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("objectives")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/projects/${projectId}`)
  revalidatePath("/")
}
