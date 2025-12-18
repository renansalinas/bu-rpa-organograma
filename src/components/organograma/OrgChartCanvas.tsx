'use client';

import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { OrgChartNode } from './OrgChartNode';
import type { OrgChartNode as OrgChartNodeType, RFNodeData } from '@/lib/organograma/types';

const nodeTypes: NodeTypes = {
  orgNode: OrgChartNode,
};

interface OrgChartCanvasProps {
  nodes: OrgChartNodeType[];
  selectedNodeId: string | null;
  onNodeClick?: (nodeId: string | null) => void;
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onAddSubordinate?: (nodeId: string) => void;
  onAddPeer?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
}

// Função para calcular layout usando dagre
function calculateTreeLayout(
  dbNodes: OrgChartNodeType[],
  selectedNodeId: string | null = null
): { nodes: Node<RFNodeData>[]; edges: Edge[] } {
  if (dbNodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ 
    rankdir: 'TB', // Top to Bottom
    nodesep: 100,
    ranksep: 150,
    marginx: 50,
    marginy: 50,
  });

  // Adicionar nós ao grafo
  dbNodes.forEach((node) => {
    g.setNode(node.id, { 
      width: 200, 
      height: 80 
    });
  });

  // Adicionar arestas (hierarquia)
  dbNodes.forEach((node) => {
    if (node.parent_id) {
      g.setEdge(node.parent_id, node.id);
    }
  });

  // Calcular layout
  dagre.layout(g);

  // Criar nós do React Flow com posições calculadas
  const rfNodes: Node<RFNodeData>[] = [];
  const rfEdges: Edge[] = [];

  dbNodes.forEach((node) => {
    const dagreNode = g.node(node.id);
    
    rfNodes.push({
      id: node.id,
      type: 'orgNode',
      position: { 
        x: dagreNode.x - 100, // Ajustar para centralizar
        y: dagreNode.y - 40 
      },
      data: {
        personName: node.person_name,
        role: node.role,
        nodeId: node.id,
        parentId: node.parent_id,
        onAddSubordinate: undefined, // Será preenchido pelo componente pai
        onAddPeer: undefined,
        onDelete: undefined,
      },
      selected: selectedNodeId === node.id,
    } as Node<RFNodeData>);
  });

  // Criar edges
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
  
  const { nodes: rfNodes, edges: rfEdges } = useMemo(
    () => calculateTreeLayout(dbNodes, selectedNodeId),
    [dbNodes, selectedNodeId]
  );

  // Adicionar callbacks aos nós
  const nodesWithCallbacks = useMemo(() => {
    return rfNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onAddSubordinate,
        onAddPeer,
        onDelete: onDeleteNode,
      },
    }));
  }, [rfNodes, onAddSubordinate, onAddPeer, onDeleteNode]);

  // Expor controles de zoom via ref
  useEffect(() => {
    if (zoomControlsRef) {
      zoomControlsRef.current = {
        zoomIn: () => zoomIn(),
        zoomOut: () => zoomOut(),
        resetZoom: () => fitView({ padding: 0.2 }),
        reorganize: () => {
          // Reorganizar é feito automaticamente quando os nós mudam
          fitView({ padding: 0.2 });
        },
      };
    }
  }, [zoomIn, zoomOut, fitView, zoomControlsRef]);

  const onNodeClickHandler = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  const onPaneClick = useCallback(() => {
    onNodeClick?.(null);
  }, [onNodeClick]);

  return (
    <ReactFlow
      nodes={nodesWithCallbacks}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClickHandler}
      onPaneClick={onPaneClick}
      onNodesChange={onNodesChange as any}
      onEdgesChange={onEdgesChange as any}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
    >
      <Background color="#e8eaf2" gap={16} />
      <Controls />
      <MiniMap
        nodeColor="#2c19b2"
        maskColor="rgba(0, 0, 0, 0.1)"
        style={{ backgroundColor: '#f5f6fa' }}
      />
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
