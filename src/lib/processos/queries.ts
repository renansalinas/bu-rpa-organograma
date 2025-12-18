'use server';

import { supabaseAdmin, authServiceUser } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import type { Process, CreateProcessPayload, UpdateProcessPayload } from './types';

async function ensureAuth() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
      const errorMsg = '❌ ERRO CRÍTICO: SUPABASE_SERVICE_ROLE_KEY não configurada!\n' +
        'Configure as variáveis de ambiente na Vercel. Consulte: CONFIGURAR_VERCEL_ENV.md';
      console.error(errorMsg);
      throw new Error('Configuração do servidor incompleta. Entre em contato com o administrador.');
    }
    await authServiceUser();
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    throw error;
  }
}

export async function listProcesses(): Promise<Process[]> {
  try {
    await ensureAuth();
    
    const { data, error } = await supabaseAdmin
      .from('processes')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Erro ao listar processos:', error);
    throw new Error(`Erro ao listar processos: ${error.message}`);
  }
}

export async function getProcess(processId: string): Promise<Process | null> {
  try {
    await ensureAuth();
    
    const { data, error } = await supabaseAdmin
      .from('processes')
      .select('*')
      .eq('id', processId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  } catch (error: any) {
    console.error('Erro ao buscar processo:', error);
    throw new Error(`Erro ao buscar processo: ${error.message}`);
  }
}

export async function createProcess(payload: CreateProcessPayload): Promise<Process> {
  try {
    await ensureAuth();
    
    const { data, error } = await supabaseAdmin
      .from('processes')
      .insert({
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
        bpmn_xml: payload.bpmn_xml,
        thumbnail: payload.thumbnail || null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    revalidatePath('/processos');
    return data;
  } catch (error: any) {
    console.error('Erro ao criar processo:', error);
    throw new Error(`Erro ao criar processo: ${error.message}`);
  }
}

export async function updateProcess(payload: UpdateProcessPayload): Promise<Process> {
  try {
    await ensureAuth();
    
    const updateData = {
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      bpmn_xml: payload.bpmn_xml,
      thumbnail: payload.thumbnail || null,
      updated_at: new Date().toISOString()
    };
    
    console.log('🔄 [SERVER] Iniciando atualização do processo:', {
      processId: payload.id,
      xmlLength: payload.bpmn_xml.length,
      nameLength: payload.name.length,
      timestamp: updateData.updated_at
    });
    
    const { data, error } = await supabaseAdmin
      .from('processes')
      .update(updateData)
      .eq('id', payload.id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [SERVER] Erro Supabase ao atualizar processo:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    if (!data) {
      console.error('❌ [SERVER] Nenhum dado retornado após update');
      throw new Error('Processo não foi atualizado - nenhum dado retornado');
    }
    
    // Verificar se o XML foi realmente salvo
    if (data.bpmn_xml.length !== payload.bpmn_xml.length) {
      console.warn('⚠️ [SERVER] Tamanho do XML retornado difere do enviado:', {
        enviado: payload.bpmn_xml.length,
        retornado: data.bpmn_xml.length
      });
    }
    
    console.log('✅ [SERVER] Processo atualizado com sucesso:', {
      id: data.id,
      xmlLength: data.bpmn_xml.length,
      updatedAt: data.updated_at
    });
    
    // Revalidar cache do Next.js
    revalidatePath(`/processos/${payload.id}`);
    revalidatePath('/processos');
    
    // Pequeno delay para garantir que o banco commitou
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return data;
  } catch (error: any) {
    console.error('❌ [SERVER] Erro ao atualizar processo:', error);
    throw new Error(`Erro ao atualizar processo: ${error.message}`);
  }
}

export async function deleteProcess(processId: string): Promise<void> {
  try {
    await ensureAuth();
    
    const { error } = await supabaseAdmin
      .from('processes')
      .delete()
      .eq('id', processId);
    
    if (error) throw error;
    
    revalidatePath('/processos');
  } catch (error: any) {
    console.error('Erro ao deletar processo:', error);
    throw new Error(`Erro ao deletar processo: ${error.message}`);
  }
}

