export type PlanningDocument = {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
};

export type PlanningLine = {
  id: number;
  document_id: string;
  line_number: number;
  task_name: string;
  responsible?: string | null;
  due_date?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PlanningLineDraft = Omit<PlanningLine, 'id'> & {
  id: number; // Negativo = novo, Positivo = do banco
  _isNew?: boolean;
  _isModified?: boolean;
  _isDeleted?: boolean;
};

export type PlanningDocumentWithLines = PlanningDocument & {
  lines: PlanningLine[];
};

export type SavePlanningLinesPayload = {
  insert: Omit<PlanningLine, 'id' | 'created_at' | 'updated_at'>[];
  update: PlanningLine[];
  delete: number[];
};

