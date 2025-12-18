-- ============================================
-- TABELAS DO MÓDULO DE PLANEJAMENTO
-- ============================================
-- Este script cria as tabelas necessárias para o módulo de Planejamento
-- Execute no Supabase SQL Editor

-- 1. Tabela de Documentos de Planejamento
CREATE TABLE IF NOT EXISTS public.planning_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de Linhas de Planejamento
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

-- 3. Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_planning_lines_document_id ON public.planning_lines(document_id);
CREATE INDEX IF NOT EXISTS idx_planning_lines_sort_order ON public.planning_lines(document_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_planning_documents_updated_at ON public.planning_documents(updated_at DESC);

-- 4. Comentários para documentação
COMMENT ON TABLE public.planning_documents IS 'Documentos de planejamento estratégico';
COMMENT ON TABLE public.planning_lines IS 'Linhas/tarefas de cada documento de planejamento';

COMMENT ON COLUMN public.planning_documents.id IS 'ID único do documento';
COMMENT ON COLUMN public.planning_documents.name IS 'Nome do planejamento';
COMMENT ON COLUMN public.planning_documents.description IS 'Descrição detalhada do planejamento';
COMMENT ON COLUMN public.planning_documents.start_date IS 'Data de início do planejamento';
COMMENT ON COLUMN public.planning_documents.end_date IS 'Data de término do planejamento';

COMMENT ON COLUMN public.planning_lines.document_id IS 'Referência ao documento de planejamento';
COMMENT ON COLUMN public.planning_lines.line_number IS 'Número da linha no documento';
COMMENT ON COLUMN public.planning_lines.task_name IS 'Nome da tarefa/atividade';
COMMENT ON COLUMN public.planning_lines.responsible IS 'Responsável pela tarefa';
COMMENT ON COLUMN public.planning_lines.due_date IS 'Data de vencimento da tarefa';
COMMENT ON COLUMN public.planning_lines.status IS 'Status da tarefa: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN public.planning_lines.notes IS 'Observações adicionais';
COMMENT ON COLUMN public.planning_lines.sort_order IS 'Ordem de exibição das linhas';

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.planning_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_lines ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de acesso (permissivo para service_role)

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Service role can do everything on planning_documents" ON public.planning_documents;
DROP POLICY IF EXISTS "Service role can do everything on planning_lines" ON public.planning_lines;
DROP POLICY IF EXISTS "Authenticated users can read planning_documents" ON public.planning_documents;
DROP POLICY IF EXISTS "Authenticated users can read planning_lines" ON public.planning_lines;

-- Service role tem acesso total
CREATE POLICY "Service role can do everything on planning_documents"
    ON public.planning_documents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can do everything on planning_lines"
    ON public.planning_lines
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Usuários autenticados podem ler
CREATE POLICY "Authenticated users can read planning_documents"
    ON public.planning_documents
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read planning_lines"
    ON public.planning_lines
    FOR SELECT
    TO authenticated
    USING (true);

-- 7. Trigger para atualizar updated_at automaticamente

-- Remover triggers antigos se existirem
DROP TRIGGER IF EXISTS update_planning_documents_updated_at ON public.planning_documents;
DROP TRIGGER IF EXISTS update_planning_lines_updated_at ON public.planning_lines;

-- Criar função se não existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
CREATE TRIGGER update_planning_documents_updated_at
    BEFORE UPDATE ON public.planning_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planning_lines_updated_at
    BEFORE UPDATE ON public.planning_lines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Dados de exemplo (opcional - pode comentar se não quiser)
INSERT INTO public.planning_documents (name, description, start_date, end_date)
VALUES 
    ('Planejamento Q1 2025', 'Planejamento estratégico do primeiro trimestre', '2025-01-01', '2025-03-31')
ON CONFLICT DO NOTHING;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Verificação: Execute o comando abaixo para confirmar que as tabelas foram criadas
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'planning%';

