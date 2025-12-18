'use client';

import { Plus, ZoomIn, ZoomOut, RotateCcw, Layout } from 'lucide-react';

interface OrgChartToolbarProps {
  onAddRoot?: () => void;
  onAddPerson?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onReorganize?: () => void;
  hasNodes: boolean;
}

export function OrgChartToolbar({
  onAddRoot,
  onAddPerson,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onReorganize,
  hasNodes,
}: OrgChartToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-white border-b border-[#e8eaf2]">
      {!hasNodes && onAddRoot && (
        <button
          onClick={onAddRoot}
          className="flex items-center gap-2 px-4 py-2 bg-[#2c19b2] text-white rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar raiz
        </button>
      )}
      
      {hasNodes && onAddPerson && (
        <button
          onClick={onAddPerson}
          className="flex items-center gap-2 px-4 py-2 bg-[#2c19b2] text-white rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar pessoa
        </button>
      )}

      <div className="flex-1" />

      {onReorganize && (
        <button
          onClick={onReorganize}
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#646c98] border border-[#e8eaf2] rounded-lg text-sm font-medium hover:bg-[#f5f6fa] transition-colors"
          title="Reorganizar layout"
        >
          <Layout className="w-4 h-4" />
          Reorganizar
        </button>
      )}

      {onZoomIn && (
        <button
          onClick={onZoomIn}
          className="p-2 text-[#646c98] hover:text-[#1a1a1a] hover:bg-[#f5f6fa] rounded transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      )}

      {onZoomOut && (
        <button
          onClick={onZoomOut}
          className="p-2 text-[#646c98] hover:text-[#1a1a1a] hover:bg-[#f5f6fa] rounded transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      )}

      {onResetZoom && (
        <button
          onClick={onResetZoom}
          className="p-2 text-[#646c98] hover:text-[#1a1a1a] hover:bg-[#f5f6fa] rounded transition-colors"
          title="Reset zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}


