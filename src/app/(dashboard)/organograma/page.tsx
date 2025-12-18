import Link from 'next/link';
import { Plus } from 'lucide-react';
import { OrgChartTable } from '@/components/organograma/OrgChartTable';
import { listOrgCharts, getNodeCount } from '@/lib/organograma/queries';

export default async function OrganogramaListPage() {
  try {
    const charts = await listOrgCharts();
    
    // Buscar contagem de nós para cada organograma
    const chartsWithCounts = await Promise.all(
      charts.map(async (chart) => {
        try {
          const nodeCount = await getNodeCount(chart.id);
          return {
            ...chart,
            nodeCount,
          };
        } catch (error) {
          console.error(`Erro ao buscar contagem de nós para chart ${chart.id}:`, error);
          return {
            ...chart,
            nodeCount: 0,
          };
        }
      })
    );

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[32px] font-bold text-[#1a1a1a]">
            Organogramas
          </h1>

          <Link
            href="/organograma/novo"
            className="flex items-center gap-2 bg-[#2c19b2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar registro
          </Link>
        </div>

        <OrgChartTable charts={chartsWithCounts} />
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar organogramas:', error);
    
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[32px] font-bold text-[#1a1a1a]">
            Organogramas
          </h1>

          <Link
            href="/organograma/novo"
            className="flex items-center gap-2 bg-[#2c19b2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar registro
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e8eaf2] p-12 text-center">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">
            Erro ao carregar organogramas
          </h3>
          <p className="text-sm text-[#646c98] mb-4">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
          <p className="text-xs text-[#646c98]">
            Verifique a conexão com o Supabase e as configurações de autenticação.
          </p>
        </div>
      </div>
    );
  }
}
