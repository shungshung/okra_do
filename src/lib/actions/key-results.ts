"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { KeyResult, KeyResultInsert, KeyResultUpdate } from "@/lib/types/database"

export async function createKeyResult(input: KeyResultInsert): Promise<KeyResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Get max position
  const { data: existing } = await supabase
    .from("key_results")
    .select("position")
    .eq("objective_id", input.objective_id)
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from("key_results")
    .insert({
      objective_id: input.objective_id,
      user_id: user.id,
      title: input.title,
      kr_type: input.kr_type || "percentage",
      current_value: input.current_value ?? 0,
      target_value: input.target_value ?? 100,
      is_completed: input.is_completed ?? false,
      position: input.position ?? nextPosition,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/")
  return { ...data, current_value: Number(data.current_value), target_value: Number(data.target_value) }
}

export async function updateKeyResult(id: string, input: KeyResultUpdate): Promise<KeyResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("key_results")
    .update(input)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/")
  return { ...data, current_value: Number(data.current_value), target_value: Number(data.target_value) }
}

export async function deleteKeyResult(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("key_results")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}
