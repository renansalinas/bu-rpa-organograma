'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title = 'BU RPA – Organograma' }: TopbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-[#e8eaf2] flex items-center justify-between px-6 fixed top-0 left-[260px] right-0 z-10">
      <h1 className="text-lg font-semibold text-[#1a1a1a]">
        {title}
      </h1>
      <button
        onClick={handleLogout}
        className="text-sm text-[#646c98] hover:text-[#1a1a1a] transition-colors"
      >
        → Sair
      </button>
    </header>
  );
}
