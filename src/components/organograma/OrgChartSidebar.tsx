'use client';

import { Trash2 } from 'lucide-react';
import type { OrgChartNode } from '@/lib/organograma/types';

interface OrgChartSidebarProps {
  selectedNode: OrgChartNode | null;
  onUpdateNode: (nodeId: string, updates: { person_name?: string; role?: string }) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function OrgChartSidebar({
  selectedNode,
  onUpdateNode,
  onDeleteNode,
}: OrgChartSidebarProps) {
  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-[#e8eaf2] p-6">
        <div className="text-center text-sm text-[#646c98] mt-8">
          Selecione uma pessoa no organograma para editar
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-[#e8eaf2] p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-[#1a1a1a] mb-6">
        Propriedades da pessoa
      </h3>

      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Nome da pessoa
          </label>
          <input
            type="text"
            value={selectedNode.person_name}
            onChange={(e) =>
              onUpdateNode(selectedNode.id, { person_name: e.target.value })
            }
            className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent"
            placeholder="Nome completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Cargo
          </label>
          <input
            type="text"
            value={selectedNode.role}
            onChange={(e) =>
              onUpdateNode(selectedNode.id, { role: e.target.value })
            }
            className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent"
            placeholder="Cargo/função"
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-[#e8eaf2]">
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-lg text-sm font-medium hover:bg-[#b91c1c] transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Remover pessoa
        </button>
      </div>
    </div>
  );
}


