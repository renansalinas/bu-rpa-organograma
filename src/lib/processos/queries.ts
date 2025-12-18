'use server';

import { supabaseAdmin, authServiceUser } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import type { Process, CreateProcessPayload, UpdateProcessPayload } from './types';

async function ensureAuth() {
  try {
    await authServiceUser();
  } catch (error) {
    console.warn('Erro na autenticação (continuando):', error);
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
    
    console.log('Atualizando processo:', payload.id, 'XML length:', payload.bpmn_xml.length);
    
    const { data, error } = await supabaseAdmin
      .from('processes')
      .update(updateData)
      .eq('id', payload.id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro Supabase ao atualizar processo:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Processo não foi atualizado - nenhum dado retornado');
    }
    
    console.log('Processo atualizado com sucesso:', data.id);
    revalidatePath(`/processos/${payload.id}`);
    revalidatePath('/processos');
    return data;
  } catch (error: any) {
    console.error('Erro ao atualizar processo:', error);
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

