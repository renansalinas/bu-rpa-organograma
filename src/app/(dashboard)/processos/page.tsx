import { listProcesses } from '@/lib/processos/queries';
import Link from 'next/link';
import { ProcessTable } from '@/components/processos/ProcessTable';
import { Plus } from 'lucide-react';
import type { Process } from '@/lib/processos/types';

export default async function ProcessosPage() {
  let processes: Process[] = [];
  let errorLoading = false;

  try {
    processes = await listProcesses();
  } catch (error) {
    console.error('Erro ao carregar processos:', error);
    errorLoading = true;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[32px] font-bold text-[#1a1a1a]">Processos</h1>
        <Link 
          href="/processos/novo" 
          className="flex items-center gap-2 bg-[#2c19b2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Processo
        </Link>
      </div>
      
      {errorLoading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erro ao carregar processos!</strong>
          <span className="block sm:inline"> Por favor, tente novamente mais tarde.</span>
        </div>
      )}

      <ProcessTable processes={processes} />
    </div>
  );
}
