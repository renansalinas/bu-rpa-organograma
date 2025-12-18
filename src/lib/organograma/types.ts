export type OrgChart = {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
};

export type OrgChartNode = {
  id: string;
  chart_id: string;
  parent_id: string | null;
  person_name: string;
  role: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type OrgChartWithNodes = OrgChart & {
  nodes: OrgChartNode[];
};

// Tipos para React Flow
export type RFNodeData = {
  personName: string;
  role: string;
  nodeId: string; // id do banco
  parentId: string | null;
};

export type CreateOrgChartPayload = {
  name: string;
  description?: string | null;
};

export type UpdateOrgChartPayload = {
  name?: string;
  description?: string | null;
};

export type UpsertNodePayload = {
  id?: string; // se não tiver, é novo
  parent_id: string | null;
  person_name: string;
  role: string;
  sort_order: number;
};


