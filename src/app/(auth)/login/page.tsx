"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 px-4">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-okra-orange text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
            O
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
            OKRA Do
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            목표를 세우고, 실행하고, 성장하세요
          </p>
        </div>

        {/* Sign in */}
        <div className="flex w-full flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground">
            구글 계정으로 안전하게 시작하세요
          </p>
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            size="lg"
            className="w-full gap-3 border-border bg-card py-6 text-base font-medium shadow-sm hover:bg-accent"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 계속하기
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          초대된 사용자만 접근할 수 있습니다
        </p>
      </div>
    </div>
  )
}
