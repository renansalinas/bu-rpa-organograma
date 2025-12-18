import { Handle, NodeProps, Position } from '@xyflow/react';

export type NodeData = {
  personName: string;
  role: string;
};

export default function OrgChartNode(props: NodeProps<NodeData>) {
  const { data, selected } = props;

  return (
    <div
      className={`rounded-xl border bg-white px-4 py-2 text-center shadow-sm
        ${selected ? "border-blue-500 shadow-md" : "border-gray-300"}`}
    >
      <div className="font-bold">{data.personName}</div>
      <div className="text-sm text-gray-500">{data.role}</div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
