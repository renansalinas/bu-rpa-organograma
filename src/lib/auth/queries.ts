'use server';

import { supabaseAdmin } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import type { User, CreateUserPayload, UpdateUserPayload } from './types';

export async function listUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    throw new Error(`Erro ao listar usuários: ${error.message}`);
  }
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada. Não é possível criar usuários.');
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Usuário não foi criado no Auth');
    
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: payload.email,
        name: payload.name,
        role: payload.role || 'user'
      })
      .select()
      .single();
    
    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }
    
    revalidatePath('/usuarios');
    return userData;
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    throw new Error(`Erro ao criar usuário: ${error.message}`);
  }
}

export async function updateUser(payload: UpdateUserPayload): Promise<User> {
  try {
    const updates: any = {};
    if (payload.name) updates.name = payload.name;
    if (payload.role) updates.role = payload.role;
    if (payload.is_active !== undefined) updates.is_active = payload.is_active;
    
    if (payload.email) {
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
        payload.id,
        { email: payload.email }
      );
      if (emailError) throw emailError;
      updates.email = payload.email;
    }
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', payload.id)
      .select()
      .single();
    
    if (error) throw error;
    
    revalidatePath('/usuarios');
    return data;
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    throw new Error(`Erro ao atualizar usuário: ${error.message}`);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;
    
    const { error: userError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (userError) throw userError;
    
    revalidatePath('/usuarios');
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error);
    throw new Error(`Erro ao deletar usuário: ${error.message}`);
  }
}

export async function resetPassword(userId: string, newPassword: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });
    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao resetar senha:', error);
    throw new Error(`Erro ao resetar senha: ${error.message}`);
  }
}

