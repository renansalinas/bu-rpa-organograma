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
    
    try {
      console.log('🔓 Iniciando logout...');
      const supabase = createClient();
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
      } else {
        console.log('✅ Logout realizado com sucesso');
      }
      
      // Limpar localStorage (se houver dados salvos)
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Força recarregar a página na rota de login
      window.location.href = '/login';
      
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      // Mesmo com erro, redireciona para login
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
