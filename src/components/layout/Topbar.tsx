'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevenir múltiplos cliques
    
    setIsLoggingOut(true);
    
    // Timeout de segurança: SEMPRE redireciona após 2 segundos
    const safetyTimeout = setTimeout(() => {
      console.log('⏰ Timeout de segurança ativado - redirecionando...');
      window.location.href = '/login';
    }, 2000);
    
    try {
      console.log('🔓 Iniciando logout...');
      
      // Limpar storage IMEDIATAMENTE
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Storage limpo');
      } catch (e) {
        console.warn('⚠️ Erro ao limpar storage:', e);
      }
      
      // Tentar fazer logout no Supabase (não bloqueia se falhar)
      try {
        const supabase = createClient();
        await Promise.race([
          supabase.auth.signOut(),
          new Promise((_, reject) => setTimeout(() => reject('timeout'), 1000))
        ]);
        console.log('✅ Logout Supabase OK');
      } catch (e) {
        console.warn('⚠️ Erro/timeout no signOut:', e);
      }
      
      // Limpar timeout de segurança
      clearTimeout(safetyTimeout);
      
      // Redirecionar IMEDIATAMENTE
      console.log('🔄 Redirecionando para login...');
      window.location.href = '/login';
      
    } catch (error) {
      console.error('❌ Erro crítico:', error);
      clearTimeout(safetyTimeout);
      window.location.href = '/login';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#e8eaf2] flex items-center justify-between px-6 fixed top-0 left-[260px] right-0 z-10">
      {title && (
        <h1 className="text-lg font-semibold text-[#1a1a1a]">
          {title}
        </h1>
      )}
      {!title && <div />}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut className="w-4 h-4" />
        {isLoggingOut ? 'Saindo...' : 'Sair'}
      </button>
    </header>
  );
}
