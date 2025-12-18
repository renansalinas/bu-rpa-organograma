"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function OrgChartNode({ data, selected }: any) {
  return (
    <div
      className={`rounded-xl border-2 px-4 py-2 shadow-sm bg-white text-center transition 
      ${selected ? "border-[#2c19b2]" : "border-[#d4d7e8]"}`}
      style={{ width: 200 }}
    >
      <div className="font-bold text-sm text-gray-900">{data.personName}</div>
      <div className="text-[13px] text-gray-600 -mt-1">{data.role}</div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(OrgChartNode);
