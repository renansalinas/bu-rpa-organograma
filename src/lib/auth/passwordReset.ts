'use server';

import { supabaseAdmin } from '@/lib/supabaseClient';
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/email/emailService';
import crypto from 'crypto';

// Gerar token único
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Solicitar reset de senha
export async function requestPasswordReset(email: string) {
  try {
    const emailNormalized = email.toLowerCase().trim();
    
    // 1. Buscar usuário na tabela users pelo email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, is_active')
      .eq('email', emailNormalized)
      .maybeSingle(); // Usa maybeSingle para não dar erro se não encontrar
    
    // 2. Validar se usuário existe
    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
      // Por segurança, não revela se email existe ou não
      return { success: true, message: 'Se o email existir, você receberá instruções' };
    }
    
    // 3. CRÍTICO: Validar se usuário existe antes de continuar
    if (!userData || !userData.id) {
      // Usuário não existe - retorna mensagem genérica mas NÃO envia email
      console.log(`⚠️ Tentativa de reset para email não cadastrado: ${emailNormalized}`);
      // Por segurança, não revela se email existe ou não
      return { success: true, message: 'Se o email existir, você receberá instruções' };
    }

    // 4. Verificar se o usuário está ativo
    if (userData.is_active === false) {
      console.log(`⚠️ Tentativa de reset para usuário inativo: ${emailNormalized}`);
      // Por segurança, não revela se email existe ou não
      return { success: true, message: 'Se o email existir, você receberá instruções' };
    }

    // 5. Gerar token (usuário existe e está ativo)
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira em 1 hora

    // 6. Salvar token no banco
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: userData.id,
        token,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Erro ao salvar token:', tokenError);
      // Se a tabela não existir, retorna erro específico
      if (tokenError.code === '42P01' || tokenError.message?.includes('does not exist')) {
        throw new Error('Tabela password_reset_tokens não encontrada. Execute o script SQL em docs/auth/PASSWORD_RESET_SQL.sql');
      }
      throw tokenError;
    }

    // 7. Montar link de reset
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-senha/${token}`;

    // 8. Enviar email APENAS se usuário existe e está ativo
    const emailTemplate = getPasswordResetEmailTemplate(resetLink, userData.name || '');
    const emailResult = await sendEmail({
      to: emailNormalized,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    if (!emailResult.success) {
      const errorMsg = emailResult.error instanceof Error 
        ? emailResult.error.message 
        : 'Erro ao enviar email. Verifique a configuração do servidor SMTP.';
      console.error('Erro ao enviar email:', emailResult.error);
      throw new Error(errorMsg);
    }

    console.log(`✅ Email de recuperação enviado para: ${emailNormalized}`);
    return { success: true, message: 'Email de recuperação enviado com sucesso!' };
  } catch (error: any) {
    console.error('Erro ao solicitar reset:', error);
    
    // Mensagens de erro mais específicas
    let errorMessage = 'Erro ao processar solicitação';
    if (error.message) {
      errorMessage = error.message;
    } else if (error.code) {
      errorMessage = `Erro: ${error.code}`;
    }
    
    return { success: false, message: errorMessage };
  }
}

// Validar token
export async function validateResetToken(token: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return { valid: false, message: 'Token inválido ou expirado' };
    }

    return { valid: true, userId: data.user_id };
  } catch (error) {
    return { valid: false, message: 'Erro ao validar token' };
  }
}

// Resetar senha
export async function resetPassword(token: string, newPassword: string) {
  try {
    // 1. Validar token
    const validation = await validateResetToken(token);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // 2. Atualizar senha
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      validation.userId!,
      { password: newPassword }
    );

    if (updateError) throw updateError;

    // 3. Marcar token como usado
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    return { success: true, message: 'Senha atualizada com sucesso' };
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return { success: false, message: 'Erro ao resetar senha' };
  }
}

