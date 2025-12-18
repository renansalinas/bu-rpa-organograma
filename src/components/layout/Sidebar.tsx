'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Network, ClipboardList, Users, Workflow } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

export function Sidebar() {
  const pathname = usePathname();
  const [isMaster, setIsMaster] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const isOrganogramaActive = pathname?.startsWith('/organograma');
  const isPlanejamentoActive = pathname?.startsWith('/planejamento');
  const isUsuariosActive = pathname?.startsWith('/usuarios');
  const isProcessosActive = pathname?.startsWith('/processos');

  useEffect(() => {
    let mounted = true;
    
    async function checkRole() {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        // Aguardar sessão estar pronta
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (mounted) setIsMaster(false);
          return;
        }
        
        // Buscar perfil do usuário
        const { data: profile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar perfil:', error);
          // Retry após delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const retry = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (retry.error) {
            console.error('Erro ao buscar perfil (retry):', retry.error);
            if (mounted) setIsMaster(false);
            return;
          }
          
          if (mounted) {
            const isMasterUser = retry.data?.role === 'master';
            setIsMaster(isMasterUser);
            console.log('Perfil do usuário (retry):', retry.data, 'isMaster:', isMasterUser);
          }
          return;
        }
        
        if (mounted) {
          const isMasterUser = profile?.role === 'master';
          setIsMaster(isMasterUser);
          console.log('Perfil do usuário:', profile, 'isMaster:', isMasterUser);
        }
        
        // Listener para mudanças de sessão
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              const { data: updatedProfile } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();
              setIsMaster(updatedProfile?.role === 'master');
            }
          } else if (event === 'SIGNED_OUT') {
            setIsMaster(false);
          }
        });
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao verificar perfil do usuário:', error);
        if (mounted) setIsMaster(false);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    
    checkRole();
    
    return () => {
      mounted = false;
    };
  }, []);

  const menuItems = [
    { label: 'Organograma', icon: Network, href: '/organograma', isActive: isOrganogramaActive },
    { label: 'Planejamento', icon: ClipboardList, href: '/planejamento', isActive: isPlanejamentoActive },
    { label: 'Processos', icon: Workflow, href: '/processos', isActive: isProcessosActive },
    ...(isMaster ? [{ label: 'Usuários', icon: Users, href: '/usuarios', isActive: isUsuariosActive }] : []),
  ];

  return (
    <aside className="w-[260px] bg-[#2c19b2] text-white flex flex-col fixed left-0 top-0 bottom-0 z-10">
      {/* Logo Yank */}
      <div className="p-6 border-b border-white/10">
        <div className="text-xl font-bold">Yank Solutions</div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${item.isActive
                  ? 'bg-white/20 border-l-4 border-[#20c6ed] text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
