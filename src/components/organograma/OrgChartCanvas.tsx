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

  const { nodes, edges } = useMemo(
    () => calculateTreeLayout(dbNodes, selectedNodeId),
    [dbNodes, selectedNodeId]
  );

  useEffect(() => {
    if (zoomControlsRef) {
      zoomControlsRef.current = {
        zoomIn: () => zoomIn(),
        zoomOut: () => zoomOut(),
        resetZoom: () => fitView({ padding: 0.2 }),
        reorganize: () => fitView({ padding: 0.2 }),
      };
    }
  }, [zoomControlsRef, zoomIn, zoomOut, fitView]);

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
      nodes={nodes}
      edges={edges}
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
