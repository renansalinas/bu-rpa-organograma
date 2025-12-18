'use server';

import { supabaseAdmin, authServiceUser } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import type { PlanningDocument, PlanningLine, PlanningDocumentWithLines, SavePlanningLinesPayload } from './types';

async function ensureAuth() {
  try {
    // Verificar se temos service key configurada
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
      const errorMsg = '❌ ERRO CRÍTICO: SUPABASE_SERVICE_ROLE_KEY não configurada!\n\n' +
        'Configure as variáveis de ambiente na Vercel:\n' +
        '1. Acesse https://vercel.com\n' +
        '2. Vá em Settings > Environment Variables\n' +
        '3. Adicione SUPABASE_SERVICE_ROLE_KEY\n' +
        '4. Faça Redeploy\n\n' +
        'Consulte: CONFIGURAR_VERCEL_ENV.md';
      console.error(errorMsg);
      throw new Error('Configuração do servidor incompleta. Entre em contato com o administrador.');
    }
    await authServiceUser();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    throw error;
  }
}

export async function listPlanningDocuments(): Promise<PlanningDocument[]> {
  try {
    await ensureAuth();
    const { data, error } = await supabaseAdmin
      .from('planning_documents')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Erro ao listar planejamentos:', error);
    throw new Error(`Erro ao listar planejamentos: ${error.message}`);
  }
}

export async function getPlanningDocumentWithLines(documentId: string): Promise<PlanningDocumentWithLines> {
  try {
    await ensureAuth();
    const { data: doc, error: docError } = await supabaseAdmin
      .from('planning_documents')
      .select('*')
      .eq('id', documentId)
      .single();
    if (docError) throw docError;
    
    const { data: lines, error: linesError } = await supabaseAdmin
      .from('planning_lines')
      .select('*')
      .eq('document_id', documentId)
      .order('sort_order', { ascending: true });
    if (linesError) throw linesError;
    
    return { ...doc, lines: lines || [] };
  } catch (error: any) {
    console.error('Erro ao buscar planejamento:', error);
    throw new Error(`Erro ao buscar planejamento: ${error.message}`);
  }
}

export async function createPlanningDocument(name: string, description?: string): Promise<PlanningDocument> {
  try {
    await ensureAuth();
    
    const insertData = {
      name: name.trim(),
      description: description?.trim() || null,
    };
    
    console.log('Criando planejamento com dados:', insertData);
    
    const { data, error } = await supabaseAdmin
      .from('planning_documents')
      .insert(insertData)
      .select()
      .single();
      
    if (error) {
      console.error('Erro Supabase ao criar planejamento:', error);
      console.error('Código do erro:', error.code);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      throw new Error(`Erro ao criar planejamento: ${error.message || 'Erro desconhecido'}`);
    }
    
    if (!data) {
      throw new Error('Planejamento não foi criado - nenhum dado retornado');
    }
    
    console.log('Planejamento criado com sucesso:', data.id);
    revalidatePath('/planejamento');
    return data;
  } catch (error: any) {
    console.error('Erro ao criar planejamento:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Erro ao criar planejamento: ${error.message || 'Erro desconhecido'}`);
  }
}

export async function updatePlanningDocument(
  documentId: string,
  updates: { name?: string; description?: string; start_date?: string; end_date?: string }
): Promise<PlanningDocument> {
  try {
    await ensureAuth();
    const { data, error } = await supabaseAdmin
      .from('planning_documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();
    if (error) throw error;
    revalidatePath(`/planejamento/${documentId}`);
    revalidatePath('/planejamento');
    return data;
  } catch (error: any) {
    console.error('Erro ao atualizar planejamento:', error);
    throw new Error(`Erro ao atualizar planejamento: ${error.message}`);
  }
}

export async function savePlanningLines(
  documentId: string,
  payload: SavePlanningLinesPayload
): Promise<PlanningLine[]> {
  try {
    await ensureAuth();
    
    // Deletar
    if (payload.delete.length > 0) {
      const { error } = await supabaseAdmin
        .from('planning_lines')
        .delete()
        .in('id', payload.delete);
      if (error) throw error;
    }
    
    // Atualizar
    if (payload.update.length > 0) {
      for (const line of payload.update) {
        const { id, created_at, updated_at, ...updateData } = line;
        const { error } = await supabaseAdmin
          .from('planning_lines')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      }
    }
    
    // Inserir
    if (payload.insert.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('planning_lines')
        .insert(payload.insert.map(l => ({
          ...l,
          updated_at: new Date().toISOString(),
        })))
        .select();
      if (error) throw error;
    }
    
    // Retornar linhas atualizadas
    const { data, error } = await supabaseAdmin
      .from('planning_lines')
      .select('*')
      .eq('document_id', documentId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    
    revalidatePath(`/planejamento/${documentId}`);
    return data || [];
  } catch (error: any) {
    console.error('Erro ao salvar linhas:', error);
    throw new Error(`Erro ao salvar linhas: ${error.message}`);
  }
}

export async function deletePlanningDocument(documentId: string): Promise<void> {
  try {
    await ensureAuth();
    const { error } = await supabaseAdmin
      .from('planning_documents')
      .delete()
      .eq('id', documentId);
    if (error) throw error;
    revalidatePath('/planejamento');
  } catch (error: any) {
    console.error('Erro ao deletar planejamento:', error);
    throw new Error(`Erro ao deletar planejamento: ${error.message}`);
  }
}

