-- ============================================================
-- OKRA Do — Initial Database Schema
-- Supabase PostgreSQL
-- ============================================================

-- ============================================================
-- 1. CUSTOM TYPES
-- ============================================================

CREATE TYPE public.period_type AS ENUM ('quarterly', 'monthly');
CREATE TYPE public.kr_type AS ENUM ('percentage', 'boolean');
CREATE TYPE public.ai_context_type AS ENUM ('objective', 'key_result', 'task', 'general');
CREATE TYPE public.ai_user_action AS ENUM ('accepted', 'modified', 'ignored');

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Whitelist table for access control
CREATE TABLE public.allowed_emails (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email       text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT allowed_emails_email_unique UNIQUE (email)
);

-- User profiles (extends auth.users)
CREATE TABLE public.profiles (
    id          uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email       text,
    full_name   text,
    avatar_url  text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Projects (top-level grouping)
CREATE TABLE public.projects (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    name        text NOT NULL,
    emoji       text,
    color       text,
    position    integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Objectives (OKR Objectives)
CREATE TABLE public.objectives (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id    uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    user_id       uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    title         text NOT NULL,
    description   text,
    period_type   public.period_type NOT NULL DEFAULT 'quarterly',
    period_start  date,
    period_end    date,
    position      integer NOT NULL DEFAULT 0,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT objectives_period_range_valid
        CHECK (period_end IS NULL OR period_start IS NULL OR period_end >= period_start)
);

-- Key Results (under Objectives)
CREATE TABLE public.key_results (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id    uuid NOT NULL REFERENCES public.objectives (id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    title           text NOT NULL,
    kr_type         public.kr_type NOT NULL DEFAULT 'percentage',
    current_value   numeric(10, 2) NOT NULL DEFAULT 0,
    target_value    numeric(10, 2) NOT NULL DEFAULT 100,
    is_completed    boolean NOT NULL DEFAULT false,
    position        integer NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT key_results_target_positive CHECK (target_value > 0),
    CONSTRAINT key_results_current_non_negative CHECK (current_value >= 0)
);

-- Tasks (Todo items, optionally linked to KR)
CREATE TABLE public.tasks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key_result_id   uuid REFERENCES public.key_results (id) ON DELETE SET NULL,
    project_id      uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    title           text NOT NULL,
    description     text,
    is_completed    boolean NOT NULL DEFAULT false,
    due_date        date,
    position        integer NOT NULL DEFAULT 0,
    completed_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- AI Coach Logs
CREATE TABLE public.ai_coach_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    context_type    public.ai_context_type NOT NULL,
    context_id      uuid,
    suggestion      text NOT NULL,
    user_action     public.ai_user_action,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================

-- Generic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.objectives
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.key_results
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-set completed_at on task completion
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD.is_completed IS NULL) THEN
        NEW.completed_at = now();
    ELSIF NEW.is_completed = false AND OLD.is_completed = true THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_task_completed_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion();

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_coach_logs ENABLE ROW LEVEL SECURITY;

-- allowed_emails: authenticated can read
CREATE POLICY "Authenticated users can read allowed_emails"
    ON public.allowed_emails FOR SELECT TO authenticated USING (true);

-- profiles: own data only
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- projects: own data CRUD
CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects"
    ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects"
    ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects"
    ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- objectives: own data CRUD
CREATE POLICY "Users can view their own objectives"
    ON public.objectives FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own objectives"
    ON public.objectives FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own objectives"
    ON public.objectives FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own objectives"
    ON public.objectives FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- key_results: own data CRUD
CREATE POLICY "Users can view their own key results"
    ON public.key_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own key results"
    ON public.key_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own key results"
    ON public.key_results FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own key results"
    ON public.key_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- tasks: own data CRUD
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks"
    ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ai_coach_logs: own data CRUD
CREATE POLICY "Users can view their own AI coach logs"
    ON public.ai_coach_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own AI coach logs"
    ON public.ai_coach_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI coach logs"
    ON public.ai_coach_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. INDEXES
-- ============================================================

CREATE INDEX idx_profiles_email ON public.profiles (email);
CREATE INDEX idx_projects_user_id_position ON public.projects (user_id, position);
CREATE INDEX idx_objectives_project_id_position ON public.objectives (project_id, position);
CREATE INDEX idx_objectives_user_id ON public.objectives (user_id);
CREATE INDEX idx_objectives_user_period ON public.objectives (user_id, period_start, period_end);
CREATE INDEX idx_key_results_objective_id_position ON public.key_results (objective_id, position);
CREATE INDEX idx_key_results_user_id ON public.key_results (user_id);
CREATE INDEX idx_tasks_key_result_id_position ON public.tasks (key_result_id, position) WHERE key_result_id IS NOT NULL;
CREATE INDEX idx_tasks_project_id_position ON public.tasks (project_id, position);
CREATE INDEX idx_tasks_user_id ON public.tasks (user_id);
CREATE INDEX idx_tasks_user_due_date_incomplete ON public.tasks (user_id, due_date) WHERE is_completed = false AND due_date IS NOT NULL;
CREATE INDEX idx_ai_coach_logs_user_id_created_at ON public.ai_coach_logs (user_id, created_at DESC);
CREATE INDEX idx_ai_coach_logs_context ON public.ai_coach_logs (context_type, context_id);
