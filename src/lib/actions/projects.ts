"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Project, ProjectInsert, ProjectUpdate } from "@/lib/types/database"

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function createProject(input: ProjectInsert): Promise<Project> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get max position
  const { data: existing } = await supabase
    .from("projects")
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: input.name,
      emoji: input.emoji || null,
      color: input.color || null,
      position: input.position ?? nextPosition,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/")
  return data
}

export async function updateProject(id: string, input: ProjectUpdate): Promise<Project> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("projects")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/")
  revalidatePath(`/projects/${id}`)
  return data
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}
