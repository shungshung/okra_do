"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Task, TaskInsert, TaskUpdate } from "@/lib/types/database"

export async function createTask(input: TaskInsert): Promise<Task> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get max position
  const { data: existing } = await supabase
    .from("tasks")
    .select("position")
    .eq("project_id", input.project_id)
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: input.project_id,
      key_result_id: input.key_result_id || null,
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      due_date: input.due_date || null,
      position: input.position ?? nextPosition,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/today")
  revalidatePath(`/projects/${input.project_id}`)
  return data
}

export async function updateTask(id: string, input: TaskUpdate): Promise<Task> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("tasks")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/today")
  return data
}

export async function toggleTask(id: string): Promise<Task> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get current state
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("is_completed")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !task) throw new Error("Task not found")

  const { data, error } = await supabase
    .from("tasks")
    .update({ is_completed: !task.is_completed })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/today")
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath("/today")
}

export async function getTodayTasks(): Promise<(Task & { project_name: string; project_emoji: string | null })[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const today = new Date().toISOString().split("T")[0]

  // Get tasks due today or overdue (not completed)
  const { data: dueTasks, error: dueError } = await supabase
    .from("tasks")
    .select("*, projects(name, emoji)")
    .eq("user_id", user.id)
    .lte("due_date", today)
    .order("due_date", { ascending: true })
    .order("position", { ascending: true })

  if (dueError) throw new Error(dueError.message)

  return (dueTasks || []).map((t) => {
    const project = t.projects as unknown as { name: string; emoji: string | null } | null
    return {
      ...t,
      projects: undefined,
      project_name: project?.name || "",
      project_emoji: project?.emoji || null,
    }
  }) as (Task & { project_name: string; project_emoji: string | null })[]
}
