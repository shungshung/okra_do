import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user's email is in the whitelist
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email) {
        const { data: allowedEmail } = await supabase
          .from("allowed_emails")
          .select("id")
          .eq("email", user.email)
          .single()

        if (!allowedEmail) {
          // Not whitelisted — sign out and redirect to login with error
          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/login?error=unauthorized`
          )
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
