-- ============================================
-- SCHEMA COMPLETO DO SISTEMA BU RPA ORGANOGRAMA
-- ============================================
-- Execute este script no Supabase SQL Editor para criar todas as tabelas
-- Versão: 1.0
-- Data: 18/12/2025

-- ============================================
-- 1. USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'master')),
    password_hash TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. ORGANOGRAMAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.org_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.org_chart_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chart_id UUID NOT NULL REFERENCES public.org_charts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    parent_id UUID REFERENCES public.org_chart_nodes(id) ON DELETE CASCADE,
    position_x DOUBLE PRECISION NOT NULL DEFAULT 0,
    position_y DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. PROCESSOS (BPMN)
-- ============================================
CREATE TABLE IF NOT EXISTS public.processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    bpmn_xml TEXT NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 4. PLANEJAMENTO
-- ============================================
CREATE TABLE IF NOT EXISTS public.planning_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.planning_lines (
    id SERIAL PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.planning_documents(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    task_name TEXT NOT NULL,
    responsible TEXT,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 5. ÍNDICES
-- ============================================
-- Usuários
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Organogramas
CREATE INDEX IF NOT EXISTS idx_org_chart_nodes_chart_id ON public.org_chart_nodes(chart_id);
CREATE INDEX IF NOT EXISTS idx_org_chart_nodes_parent_id ON public.org_chart_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_org_charts_updated_at ON public.org_charts(updated_at DESC);

-- Processos
CREATE INDEX IF NOT EXISTS idx_processes_updated_at ON public.processes(updated_at DESC);

-- Planejamento
CREATE INDEX IF NOT EXISTS idx_planning_lines_document_id ON public.planning_lines(document_id);
CREATE INDEX IF NOT EXISTS idx_planning_lines_sort_order ON public.planning_lines(document_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_planning_documents_updated_at ON public.planning_documents(updated_at DESC);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_chart_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_lines ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. POLÍTICAS DE ACESSO
-- ============================================

-- Service role tem acesso total a tudo
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'org_charts', 'org_chart_nodes', 'processes', 'planning_documents', 'planning_lines')
    LOOP
        EXECUTE format('
            CREATE POLICY IF NOT EXISTS "Service role can do everything on %I"
            ON public.%I
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true)
        ', tbl, tbl);
        
        EXECUTE format('
            CREATE POLICY IF NOT EXISTS "Authenticated users can read %I"
            ON public.%I
            FOR SELECT
            TO authenticated
            USING (true)
        ', tbl, tbl);
    END LOOP;
END $$;

-- ============================================
-- 8. TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'updated_at'
        AND table_name IN ('users', 'org_charts', 'org_chart_nodes', 'processes', 'planning_documents', 'planning_lines')
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON public.%I
                FOR EACH ROW
                EXECUTE FUNCTION public.update_updated_at_column()
        ', tbl, tbl, tbl, tbl);
    END LOOP;
END $$;

-- ============================================
-- 9. DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Usuário master padrão (senha: admin123@yank)
INSERT INTO public.users (email, name, role, password_hash, active)
VALUES (
    'renansalinas@yanksolutions.com.br',
    'Renan Salinas',
    'master',
    '$2a$10$your_hashed_password_here', -- Substitua pela hash real
    true
) ON CONFLICT (email) DO NOTHING;

-- Planejamento de exemplo
INSERT INTO public.planning_documents (name, description, start_date, end_date)
VALUES (
    'Planejamento Estratégico 2025',
    'Planejamento anual da empresa',
    '2025-01-01',
    '2025-12-31'
) ON CONFLICT DO NOTHING;

-- ============================================
-- 10. VERIFICAÇÃO FINAL
-- ============================================
-- Execute para verificar que todas as tabelas foram criadas:
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('users', 'org_charts', 'org_chart_nodes', 'processes', 'planning_documents', 'planning_lines')
ORDER BY table_name;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

