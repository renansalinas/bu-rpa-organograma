'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { MoreVertical } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface NodeData {
  personName: string;
  role: string;
  nodeId: string;
  parentId: string | null;
  onAddSubordinate?: (nodeId: string) => void;
  onAddPeer?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

export function OrgChartNode({ data, selected }: NodeProps<NodeData>) {
  const nodeData = data as NodeData;

  return (
    <div
      className={`
        bg-white rounded-xl border-2 shadow-sm px-4 py-3 min-w-[180px] relative
        ${selected 
          ? 'border-[#2c19b2] shadow-[0_0_0_3px_rgba(44,25,178,0.1)]' 
          : 'border-[#d4d7e8]'
        }
        transition-all
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-[#2c19b2]"
      />
      
      <div className="relative">
        {/* Menu de 3 pontos */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="absolute top-2 right-2 p-1 text-[#646c98] hover:text-[#1a1a1a] hover:bg-[#f5f6fa] rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] bg-white rounded-lg shadow-lg border border-[#e8eaf2] p-1 z-50"
              sideOffset={5}
            >
              {nodeData.onAddSubordinate && (
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#f5f6fa] rounded cursor-pointer outline-none"
                  onSelect={() => nodeData.onAddSubordinate?.(nodeData.nodeId)}
                >
                  Adicionar subordinado
                </DropdownMenu.Item>
              )}
              {nodeData.onAddPeer && (
                <DropdownMenu.Item
                  className="px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#f5f6fa] rounded cursor-pointer outline-none"
                  onSelect={() => nodeData.onAddPeer?.(nodeData.nodeId)}
                >
                  Adicionar par
                </DropdownMenu.Item>
              )}
              {nodeData.onDelete && (
                <>
                  <DropdownMenu.Separator className="h-px bg-[#e8eaf2] my-1" />
                  <DropdownMenu.Item
                    className="px-3 py-2 text-sm text-[#dc2626] hover:bg-[#fef2f2] rounded cursor-pointer outline-none"
                    onSelect={() => nodeData.onDelete?.(nodeData.nodeId)}
                  >
                    Excluir
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <div className="flex items-start justify-between gap-2 pr-6">
          <div className="flex-1">
            {/* Nome em negrito (Urbane Bold) */}
            <div className="font-bold text-[15px] text-[#1a1a1a] mb-1">
              {nodeData.personName || 'Sem nome'}
            </div>
            {/* Cargo abaixo, sem negrito (Urbane Medium) */}
            <div className="text-[13px] text-[#646c98] font-medium">
              {nodeData.role || 'Sem cargo'}
            </div>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-[#2c19b2]"
      />
    </div>
  );
}
