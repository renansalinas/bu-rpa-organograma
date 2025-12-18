'use client';

import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  applyNodeChanges,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeChange,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import dagre from 'dagre';

import OrgChartNode from './OrgChartNode';
import type { OrgChartNode as OrgChartNodeType, RFNodeData } from '@/lib/organograma/types';

const nodeTypes: NodeTypes = {
  orgNode: OrgChartNode as any,
};


interface OrgChartCanvasProps {
  nodes: OrgChartNodeType[];
  selectedNodeId: string | null;
  onNodeClick?: (nodeId: string | null) => void;
  onNodesChange?: (nodes: Node[]) => void;
  onNodePositionsChange?: (positions: Map<string, { x: number; y: number }>) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onAddSubordinate?: (nodeId: string) => void;
  onAddPeer?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
}

function calculateTreeLayout(
  dbNodes: OrgChartNodeType[],
  selectedNodeId: string | null = null
): { nodes: Node<RFNodeData>[]; edges: Edge[] } {
  if (dbNodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Verificar se TODOS os nós têm posições salvas
  const allNodesHaveSavedPositions = dbNodes.every(n => n.position_x != null && n.position_y != null);

  // Se todos os nós têm posições salvas, usar essas posições
  if (allNodesHaveSavedPositions) {
    const rfNodes: Node<RFNodeData>[] = [];
    const rfEdges: Edge[] = [];

    dbNodes.forEach((node) => {
      rfNodes.push({
        id: node.id,
        type: 'orgNode',
        position: {
          x: node.position_x!,
          y: node.position_y!,
        },
        data: {
          personName: node.person_name,
          role: node.role,
          nodeId: node.id,
          parentId: node.parent_id,
        },
        selected: selectedNodeId === node.id,
      });
    });

    dbNodes.forEach((node) => {
      if (node.parent_id) {
        rfEdges.push({
          id: `edge-${node.parent_id}-${node.id}`,
          source: node.parent_id,
          target: node.id,
          type: 'smoothstep',
          animated: false,
        });
      }
    });

    return { nodes: rfNodes, edges: rfEdges };
  }

  // Caso contrário, calcular layout automático com Dagre
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    nodesep: 100,
    ranksep: 150,
    marginx: 50,
    marginy: 50,
  });

  dbNodes.forEach((node) => {
    g.setNode(node.id, {
      width: 220,
      height: 85,
    });
  });

  dbNodes.forEach((node) => {
    if (node.parent_id) {
      g.setEdge(node.parent_id, node.id);
    }
  });

  dagre.layout(g);

  const rfNodes: Node<RFNodeData>[] = [];
  const rfEdges: Edge[] = [];

  dbNodes.forEach((node) => {
    const dagreNode = g.node(node.id);

    rfNodes.push({
      id: node.id,
      type: 'orgNode',
      position: {
        x: dagreNode.x - 110,
        y: dagreNode.y - 45,
      },
      data: {
        personName: node.person_name,
        role: node.role,
        nodeId: node.id,
        parentId: node.parent_id,
      },
      selected: selectedNodeId === node.id,
    });
  });

  dbNodes.forEach((node) => {
    if (node.parent_id) {
      rfEdges.push({
        id: `edge-${node.parent_id}-${node.id}`,
        source: node.parent_id,
        target: node.id,
        type: 'smoothstep',
        animated: false,
      });
    }
  });

  return { nodes: rfNodes, edges: rfEdges };
}

function OrgChartCanvasInner({
  nodes: dbNodes,
  selectedNodeId,
  onNodeClick,
  onNodesChange,
  onNodePositionsChange,
  onEdgesChange,
  onAddSubordinate,
  onAddPeer,
  onDeleteNode,
  zoomControlsRef,
}: OrgChartCanvasProps & {
  zoomControlsRef?: React.MutableRefObject<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    reorganize: () => void;
  } | null>;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [autoLayout, setAutoLayout] = useState(true);
  const [rfNodes, setRfNodes] = useState<Node<RFNodeData>[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calcular layout inicial quando dbNodes mudarem e autoLayout estiver ativo
  useEffect(() => {
    if (autoLayout && dbNodes.length > 0) {
      const layout = calculateTreeLayout(dbNodes, selectedNodeId);
      setRfNodes(layout.nodes);
      setRfEdges(layout.edges);
    } else if (dbNodes.length === 0) {
      setRfNodes([]);
      setRfEdges([]);
    }
  }, [dbNodes, selectedNodeId, autoLayout]);

  useEffect(() => {
    if (zoomControlsRef) {
      zoomControlsRef.current = {
        zoomIn: () => zoomIn(),
        zoomOut: () => zoomOut(),
        resetZoom: () => fitView({ padding: 0.2 }),
        reorganize: () => {
          setAutoLayout(true);
          const newLayout = calculateTreeLayout(dbNodes, selectedNodeId);
          setRfNodes(newLayout.nodes);
          setRfEdges(newLayout.edges);
          setTimeout(() => fitView({ padding: 0.2 }), 100);
        },
      };
    }
  }, [zoomControlsRef, zoomIn, zoomOut, fitView, dbNodes, selectedNodeId]);

  // Handler para mudanças nos nodes (incluindo drag)
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    const dragging = changes.some(
      (change) => change.type === 'position' && (change as any).dragging === true
    );
    
    setIsDragging(dragging);
    
    if (dragging && autoLayout) {
      setAutoLayout(false);
    }

    const updatedNodes = applyNodeChanges(changes, rfNodes) as Node<RFNodeData>[];
    setRfNodes(updatedNodes);
    
    if (onNodesChange) {
      onNodesChange(updatedNodes);
    }
  }, [onNodesChange, autoLayout, rfNodes]);

  // Efeito para notificar o pai sobre mudanças de posição APENAS quando o drag termina
  useEffect(() => {
    if (onNodePositionsChange && !isDragging && rfNodes.length > 0) {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
      positionUpdateTimeoutRef.current = setTimeout(() => {
        const positions = new Map<string, { x: number; y: number }>();
        rfNodes.forEach(node => {
          positions.set(node.id, { x: node.position.x, y: node.position.y });
        });
        onNodePositionsChange(positions);
      }, 100);
    }
    return () => {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
    };
  }, [rfNodes, isDragging, onNodePositionsChange]);

  const onNodeClickHandler = useCallback(
    (_e: any, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  const onPaneClick = useCallback(() => {
    onNodeClick?.(null);
  }, [onNodeClick]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClickHandler}
      onPaneClick={onPaneClick}
      onNodesChange={handleNodesChange}
      onEdgesChange={onEdgesChange as any}
      nodesDraggable={true}
      nodesConnectable={false}
      panOnDrag={[1, 2]}
      selectionOnDrag={false}
      minZoom={0.1}
      maxZoom={4}
      fitView={autoLayout}
      fitViewOptions={{ padding: 0.2 }}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
    >
      <Background color="#e8eaf2" gap={16} />
      <Controls />
      <MiniMap nodeColor="#2c19b2" maskColor="rgba(0,0,0,0.2)" />
    </ReactFlow>
  );
}

export function OrgChartCanvas(props: OrgChartCanvasProps & {
  zoomControlsRef?: React.MutableRefObject<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;
    reorganize: () => void;
  } | null>;
}) {
  return (
    <div className="w-full h-full bg-[#f5f6fa]">
      <ReactFlowProvider>
        <OrgChartCanvasInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
