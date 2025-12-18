'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { OrgChartCanvas } from './OrgChartCanvas';
import { OrgChartToolbar } from './OrgChartToolbar';
import { OrgChartSidebar } from './OrgChartSidebar';
import type { OrgChartNode } from '@/lib/organograma/types';
import type { Node, Edge } from '@xyflow/react';
import * as Dialog from '@radix-ui/react-dialog';

interface OrgChartEditorProps {
  initialNodes: OrgChartNode[];
  onNodesChange: (nodes: OrgChartNode[]) => void;
}

export function OrgChartEditor({ initialNodes, onNodesChange }: OrgChartEditorProps) {
  const [nodes, setNodes] = useState<OrgChartNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [addPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');
  const [addAsSubordinate, setAddAsSubordinate] = useState(true);
  const zoomControlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    reorganize: () => void;
  } | null>(null);

  // Sincronizar initialNodes quando mudarem externamente
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const handleNodeClick = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleUpdateNode = useCallback(
    (nodeId: string, updates: { person_name?: string; role?: string }) => {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === nodeId ? { ...node, ...updates } : node
        )
      );
    },
    []
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (!confirm('Tem certeza que deseja remover esta pessoa e todos os seus subordinados?')) {
        return;
      }

      // Remover o nó e todos os seus descendentes
      const removeNodeAndDescendants = (id: string): string[] => {
        const toRemove = [id];
        const children = nodes.filter((n) => n.parent_id === id);
        children.forEach((child) => {
          toRemove.push(...removeNodeAndDescendants(child.id));
        });
        return toRemove;
      };

      const idsToRemove = removeNodeAndDescendants(nodeId);
      setNodes((prev) => prev.filter((n) => !idsToRemove.includes(n.id)));
      setSelectedNodeId(null);
    },
    [nodes]
  );

  const handleAddSubordinate = useCallback((parentId: string) => {
    setSelectedNodeId(parentId);
    setAddAsSubordinate(true);
    setAddPersonDialogOpen(true);
  }, []);

  const handleAddPeer = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    setSelectedNodeId(nodeId);
    setAddAsSubordinate(false);
    setAddPersonDialogOpen(true);
  }, [nodes]);

  const handleAddPerson = useCallback(() => {
    if (!newPersonName.trim() || !newPersonRole.trim()) {
      alert('Preencha nome e cargo');
      return;
    }

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    const newNode: OrgChartNode = {
      id: crypto.randomUUID(),
      chart_id: nodes[0]?.chart_id || '',
      parent_id: addAsSubordinate && selectedNodeId 
        ? selectedNodeId 
        : selectedNode?.parent_id || null,
      person_name: newPersonName,
      role: newPersonRole,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNodes((prev) => [...prev, newNode]);
    setNewPersonName('');
    setNewPersonRole('');
    setAddPersonDialogOpen(false);
    setSelectedNodeId(newNode.id);
  }, [newPersonName, newPersonRole, addAsSubordinate, selectedNodeId, nodes]);

  const handleAddRoot = useCallback(() => {
    setAddAsSubordinate(false);
    setSelectedNodeId(null);
    setAddPersonDialogOpen(true);
  }, []);

  const handleReorganize = useCallback(() => {
    // Limpar posições salvas para forçar recálculo do layout
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        position_x: null,
        position_y: null,
      }))
    );
    // Reorganizar após um pequeno delay para garantir que o estado foi atualizado
    setTimeout(() => {
      zoomControlsRef.current?.reorganize();
    }, 50);
  }, []);

  // Handler para mudanças de posição dos nós
  const handleNodePositionsChange = useCallback((positions: Map<string, { x: number; y: number }>) => {
    requestAnimationFrame(() => {
      setNodes((prev) =>
        prev.map((node) => {
          const position = positions.get(node.id);
          if (position) {
            return {
              ...node,
              position_x: position.x,
              position_y: position.y,
            };
          }
          return node;
        })
      );
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    zoomControlsRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    zoomControlsRef.current?.zoomOut();
  }, []);

  const handleResetZoom = useCallback(() => {
    zoomControlsRef.current?.resetZoom();
  }, []);

  // Sincronizar mudanças com o componente pai
  useEffect(() => {
    onNodesChange(nodes);
  }, [nodes, onNodesChange]);

  return (
    <div className="flex flex-col h-full">
      <OrgChartToolbar
        onAddRoot={nodes.length === 0 ? handleAddRoot : undefined}
        onAddPerson={nodes.length > 0 ? () => {
          setAddAsSubordinate(true);
          setAddPersonDialogOpen(true);
        } : undefined}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onReorganize={handleReorganize}
        hasNodes={nodes.length > 0}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          {nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center bg-[#f5f6fa]">
              <div className="text-center">
                <p className="text-sm text-[#646c98] mb-4">
                  Este organograma ainda não tem pessoas.
                </p>
                <button
                  onClick={handleAddRoot}
                  className="px-4 py-2 bg-[#2c19b2] text-white rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
                >
                  Adicionar primeira pessoa
                </button>
              </div>
            </div>
          ) : (
            <OrgChartCanvas
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onNodeClick={handleNodeClick}
              onNodePositionsChange={handleNodePositionsChange}
              onAddSubordinate={handleAddSubordinate}
              onAddPeer={handleAddPeer}
              onDeleteNode={handleDeleteNode}
              zoomControlsRef={zoomControlsRef}
            />
          )}
        </div>

        <OrgChartSidebar
          selectedNode={selectedNode}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
        />
      </div>

      {/* Dialog para adicionar pessoa */}
      <Dialog.Root open={addPersonDialogOpen} onOpenChange={setAddPersonDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-semibold text-[#1a1a1a] mb-4">
              Adicionar pessoa
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Nome da pessoa
                </label>
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
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
                  value={newPersonRole}
                  onChange={(e) => setNewPersonRole(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent"
                  placeholder="Cargo/função"
                />
              </div>

              {selectedNodeId && (
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                    Relação
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={addAsSubordinate}
                        onChange={() => setAddAsSubordinate(true)}
                        className="w-4 h-4 text-[#2c19b2]"
                      />
                      <span className="text-sm text-[#1a1a1a]">Adicionar como subordinado</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!addAsSubordinate}
                        onChange={() => setAddAsSubordinate(false)}
                        className="w-4 h-4 text-[#2c19b2]"
                      />
                      <span className="text-sm text-[#1a1a1a]">Adicionar como par (mesmo nível)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-[#646c98] hover:text-[#1a1a1a] transition-colors">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={handleAddPerson}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2c19b2] rounded-lg hover:bg-[#230fb8] transition-colors"
              >
                Adicionar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
