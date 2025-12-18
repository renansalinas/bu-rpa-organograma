'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
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
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        Sair
      </button>
    </header>
  );
}
