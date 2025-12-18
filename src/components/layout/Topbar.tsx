'use client';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title = 'BU RPA – Organograma' }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-[#e8eaf2] flex items-center px-6 fixed top-0 left-[260px] right-0 z-10">
      <h1 className="text-lg font-semibold text-[#1a1a1a]">
        {title}
      </h1>
    </header>
  );
}
