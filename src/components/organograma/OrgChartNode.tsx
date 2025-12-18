'use client';

import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

export type NodeData = {
  personName: string;
  role: string;
};

export default function OrgChartNode({ data, selected }: NodeProps<NodeData>) {
  return (
    <div
      className={`rounded-xl border-2 px-4 py-2 shadow-sm bg-white text-center transition 
      ${selected ? 'border-[#2c19b2]' : 'border-[#d4d7e8]'}`}
      style={{ width: 200 }}
    >
      <div className="font-bold text-sm text-gray-900">{data.personName}</div>
      <div className="text-[13px] text-gray-600 -mt-1">{data.role}</div>

      {/* Conectores */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
