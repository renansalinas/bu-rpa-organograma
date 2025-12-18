import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function ProcessosPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[32px] font-bold text-[#1a1a1a]">
          Processos
        </h1>
        <Link
          href="/processos/novo"
          className="flex items-center gap-2 bg-[#2c19b2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar registro
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-[#e8eaf2] p-12 text-center">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">
          Módulo em desenvolvimento
        </h3>
        <p className="text-sm text-[#646c98]">
          O módulo de Processos BPM está sendo implementado.
        </p>
      </div>
    </div>
  );
}

