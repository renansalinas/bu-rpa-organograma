'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Network } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const isActive = pathname?.startsWith('/organograma');

  return (
    <aside className="w-[260px] bg-[#2c19b2] text-white flex flex-col fixed left-0 top-0 bottom-0 z-10">
      {/* Logo Yank */}
      <div className="p-6 border-b border-white/10">
        <div className="text-xl font-bold">Yank Solutions</div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3">
        <Link
          href="/organograma"
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
            ${isActive 
              ? 'bg-white/20 border-l-4 border-[#20c6ed] text-white' 
              : 'text-white/80 hover:bg-white/10 hover:text-white'
            }
          `}
        >
          <Network className="w-5 h-5" />
          <span className="font-medium">Organograma</span>
        </Link>
      </nav>
    </aside>
  );
}
