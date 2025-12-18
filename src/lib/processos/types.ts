export type Process = {
  id: string;
  name: string;
  description?: string | null;
  bpmn_xml: string;
  thumbnail?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateProcessPayload = {
  name: string;
  description?: string;
  bpmn_xml: string;
  thumbnail?: string;
};

export type UpdateProcessPayload = CreateProcessPayload & {
  id: string;
};

