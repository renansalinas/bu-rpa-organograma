-- ============================================
-- TABELAS DO MÓDULO DE PLANEJAMENTO - VERSÃO SIMPLES
-- ============================================
-- Execute ESTE arquivo no Supabase SQL Editor
-- Versão simplificada e testada

-- ====================
-- PARTE 1: CRIAR TABELAS
-- ====================

-- Tabela de Documentos de Planejamento
CREATE TABLE IF NOT EXISTS public.planning_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de Linhas de Planejamento
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

-- ====================
-- PARTE 2: ÍNDICES
-- ====================

CREATE INDEX IF NOT EXISTS idx_planning_lines_document_id ON public.planning_lines(document_id);
CREATE INDEX IF NOT EXISTS idx_planning_lines_sort_order ON public.planning_lines(document_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_planning_documents_updated_at ON public.planning_documents(updated_at DESC);

-- ====================
-- PARTE 3: RLS (Row Level Security)
-- ====================

ALTER TABLE public.planning_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_lines ENABLE ROW LEVEL SECURITY;

-- ====================
-- PARTE 4: POLÍTICAS
-- ====================

-- Limpar políticas antigas
DROP POLICY IF EXISTS "Service role full access planning_documents" ON public.planning_documents;
DROP POLICY IF EXISTS "Service role full access planning_lines" ON public.planning_lines;
DROP POLICY IF EXISTS "Authenticated read planning_documents" ON public.planning_documents;
DROP POLICY IF EXISTS "Authenticated read planning_lines" ON public.planning_lines;

-- Service role tem acesso total
CREATE POLICY "Service role full access planning_documents"
ON public.planning_documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access planning_lines"
ON public.planning_lines
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Usuários autenticados podem ler
CREATE POLICY "Authenticated read planning_documents"
ON public.planning_documents
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated read planning_lines"
ON public.planning_lines
FOR SELECT
TO authenticated
USING (true);

-- ====================
-- PARTE 5: TRIGGERS
-- ====================

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers antigos
DROP TRIGGER IF EXISTS update_planning_documents_updated_at ON public.planning_documents;
DROP TRIGGER IF EXISTS update_planning_lines_updated_at ON public.planning_lines;

-- Criar triggers novos
CREATE TRIGGER update_planning_documents_updated_at
BEFORE UPDATE ON public.planning_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planning_lines_updated_at
BEFORE UPDATE ON public.planning_lines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ====================
-- PARTE 6: DADOS DE TESTE (OPCIONAL)
-- ====================

INSERT INTO public.planning_documents (name, description, start_date, end_date)
VALUES 
    ('Planejamento de Exemplo', 'Documento de teste', '2025-01-01', '2025-12-31')
ON CONFLICT DO NOTHING;

-- ====================
-- FIM - VERIFICAÇÃO
-- ====================
-- Execute para verificar:
-- SELECT * FROM planning_documents;
-- SELECT * FROM planning_lines;

