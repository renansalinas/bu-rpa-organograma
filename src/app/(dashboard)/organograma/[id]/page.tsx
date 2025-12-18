'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { OrgChartEditor } from '@/components/organograma/OrgChartEditor';
import type { OrgChartNode } from '@/lib/organograma/types';
import { loadChart, saveChart } from './actions';

export default function EditarOrganogramaPage() {
  const router = useRouter();
  const params = useParams();
  const chartId = params.id as string;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nodes, setNodes] = useState<OrgChartNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [metadataExpanded, setMetadataExpanded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const chart = await loadChart(chartId);
        if (!chart) {
          router.push('/organograma');
          return;
        }

        setName(chart.name);
        setDescription(chart.description || '');
        setNodes(chart.nodes);
      } catch (error) {
        console.error('Erro ao carregar organograma:', error);
        router.push('/organograma');
      } finally {
        setIsLoading(false);
      }
    }

    if (chartId) {
      load();
    }
  }, [chartId, router]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Preencha o nome do organograma');
      return;
    }

    setIsSaving(true);
    try {
      const nodesToSave = nodes.map((node) => ({
        id: node.id,
        parent_id: node.parent_id,
        person_name: node.person_name,
        role: node.role,
        sort_order: node.sort_order,
        position_x: node.position_x ?? null,
        position_y: node.position_y ?? null,
      }));

      await saveChart(chartId, name, description, nodesToSave);

      router.refresh();
      alert('Organograma salvo com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      const errorMessage = error?.message || 'Erro desconhecido ao salvar organograma';
      alert(`Erro ao salvar organograma: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-sm text-[#646c98]">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Breadcrumb e ações */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-[#646c98]">
          <Link href="/organograma" className="hover:text-[#1a1a1a] transition-colors">
            Organograma
          </Link>
          <span>/</span>
          <span className="text-[#1a1a1a]">{name || 'Carregando...'}</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/organograma"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#646c98] hover:text-[#1a1a1a] transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-[#2c19b2] text-white rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Metadados - Compacto e colapsável */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e8eaf2] mb-4">
        <button
          onClick={() => setMetadataExpanded(!metadataExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#f5f6fa] transition-colors"
        >
          <span className="text-sm font-medium text-[#1a1a1a]">Informações do organograma</span>
          {metadataExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#646c98]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#646c98]" />
          )}
        </button>
        
        {metadataExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-[#e8eaf2]">
            <div>
              <label className="block text-xs font-medium text-[#646c98] mb-1">
                Nome do organograma <span className="text-[#dc2626]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent"
                placeholder="Ex: Organograma da Empresa"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#646c98] mb-1">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent resize-none"
                placeholder="Descrição opcional"
              />
            </div>
          </div>
        )}
      </div>

      {/* Editor - Ocupa o resto do espaço */}
      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-[#e8eaf2] overflow-hidden">
        <OrgChartEditor
          initialNodes={nodes}
          onNodesChange={setNodes}
        />
      </div>
    </div>
  );
}
