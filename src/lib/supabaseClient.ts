import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uxgnxnaxkymfcfjrfbpq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_L1Gn0Sx37T46LiwPWs8YeA_8oABnrUV";
// Service Role Key - deve ser configurada no .env.local
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || supabaseAnonKey;

// Função para criar cliente (browser/client-side)
export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}

// Cliente singleton (para manter compatibilidade)
export const supabase = createClient();

// Cliente admin para uso no servidor (com service key para operações privilegiadas)
export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Autenticação com usuário fixo (executar no servidor)
export async function authServiceUser() {
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: 'renansalinas@yanksolutions.com.br',
      password: 'admin123@yank',
    });

    if (error) {
      // Se o erro for de credenciais inválidas, pode ser que não precise autenticar
      if (error.message?.includes('Invalid login credentials')) {
        console.warn('Credenciais inválidas - pode ser que a autenticação não seja necessária');
        return null;
      }
      console.error('Erro ao autenticar usuário de serviço:', error);
      // Não lançar erro, apenas retornar null
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Erro na autenticação (continuando sem auth):', error);
    return null;
  }
}
