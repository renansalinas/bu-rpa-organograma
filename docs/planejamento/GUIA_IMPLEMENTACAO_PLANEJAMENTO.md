# 🛠️ Guia de Implementação - Módulo Planejamento

> **Complemento prático**: Use este guia durante a implementação para boilerplates e exemplos.

---

## 🚀 Quick Start (5 Passos)

### 1. SQL no Supabase

```sql
create table planning_documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table planning_lines (
  id serial primary key,
  document_id uuid not null references planning_documents(id) on delete cascade,
  line_number int not null,
  task_name text not null,
  responsible text,
  due_date date,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  notes text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(document_id, line_number)
);

create index idx_planning_lines_document on planning_lines(document_id);
create index idx_planning_lines_sort on planning_lines(document_id, sort_order);
```

### 2. Types TypeScript

```typescript
// src/lib/planejamento/types.ts
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

export type SavePlanningLinesPayload = {
  insert: Omit<PlanningLine, 'id' | 'created_at' | 'updated_at'>[];
  update: PlanningLine[];
  delete: number[];
};
```

### 3. Queries Base

```typescript
// src/lib/planejamento/queries.ts
import { supabaseAdmin } from '../supabaseClient';
import type { PlanningDocument, PlanningLine } from './types';

export async function listPlanningDocuments() {
  await ensureAuth();
  const { data, error } = await supabaseAdmin
    .from('planning_documents')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getPlanningDocumentWithLines(documentId: string) {
  await ensureAuth();
  const { data: doc, error: docError } = await supabaseAdmin
    .from('planning_documents')
    .select('*')
    .eq('id', documentId)
    .single();
  if (docError) throw docError;
  
  const { data: lines, error: linesError } = await supabaseAdmin
    .from('planning_lines')
    .select('*')
    .eq('document_id', documentId)
    .order('sort_order', { ascending: true });
  if (linesError) throw linesError;
  
  return { ...doc, lines: lines || [] };
}

export async function savePlanningLines(
  documentId: string,
  payload: { insert: any[]; update: any[]; delete: number[] }
) {
  await ensureAuth();
  
  // Deletar
  if (payload.delete.length > 0) {
    const { error } = await supabaseAdmin
      .from('planning_lines')
      .delete()
      .in('id', payload.delete);
    if (error) throw error;
  }
  
  // Atualizar
  if (payload.update.length > 0) {
    for (const line of payload.update) {
      const { id, ...updateData } = line;
      const { error } = await supabaseAdmin
        .from('planning_lines')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    }
  }
  
  // Inserir
  if (payload.insert.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('planning_lines')
      .insert(payload.insert.map(l => ({
        ...l,
        updated_at: new Date().toISOString(),
      })))
      .select();
    if (error) throw error;
    return data || [];
  }
  
  // Retornar linhas atualizadas
  const { data, error } = await supabaseAdmin
    .from('planning_lines')
    .select('*')
    .eq('document_id', documentId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}
```

### 4. Componente Grid Base

```typescript
// src/components/planejamento/PlanningGrid.tsx
'use client';

import { useState } from 'react';
import type { PlanningLineDraft } from '@/lib/planejamento/types';

interface PlanningGridProps {
  lines: PlanningLineDraft[];
  onLinesChange: (lines: PlanningLineDraft[]) => void;
}

export function PlanningGrid({ lines, onLinesChange }: PlanningGridProps) {
  const [editingLineId, setEditingLineId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<PlanningLineDraft>>({});

  const handleEdit = (lineId: number) => {
    const line = lines.find(l => l.id === lineId);
    if (line) {
      setEditingData({ ...line });
      setEditingLineId(lineId);
    }
  };

  const handleSave = (lineId: number) => {
    const updated = lines.map(line =>
      line.id === lineId
        ? { ...line, ...editingData, _isModified: line.id > 0 }
        : line
    );
    onLinesChange(updated);
    setEditingLineId(null);
    setEditingData({});
  };

  const handleCancel = () => {
    setEditingLineId(null);
    setEditingData({});
  };

  return (
    <div className="bg-white rounded-xl border border-[#e8eaf2] overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#f5f6fa] border-b border-[#e8eaf2]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#646c98] uppercase">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#646c98] uppercase">Tarefa</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#646c98] uppercase">Responsável</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#646c98] uppercase">Prazo</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#646c98] uppercase">Status</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-[#646c98] uppercase">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e8eaf2]">
          {lines.map((line) => (
            <tr key={line.id} className={editingLineId === line.id ? 'bg-[#f5f6fa]' : ''}>
              {editingLineId === line.id ? (
                // Modo edição
                <>
                  <td className="px-4 py-3">{line.line_number}</td>
                  <td className="px-4 py-3">
                    <input
                      value={editingData.task_name || ''}
                      onChange={(e) => setEditingData({ ...editingData, task_name: e.target.value })}
                      className="w-full px-2 py-1 border border-[#d4d7e8] rounded text-sm"
                    />
                  </td>
                  {/* ... outros campos ... */}
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleSave(line.id)}>Salvar</button>
                    <button onClick={handleCancel}>Cancelar</button>
                  </td>
                </>
              ) : (
                // Modo read-only
                <>
                  <td className="px-4 py-3 text-sm">{line.line_number}</td>
                  <td className="px-4 py-3 text-sm font-medium">{line.task_name}</td>
                  <td className="px-4 py-3 text-sm">{line.responsible || '-'}</td>
                  <td className="px-4 py-3 text-sm">{line.due_date || '-'}</td>
                  <td className="px-4 py-3 text-sm">{line.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(line.id)}>Editar</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 5. Página de Edição Base

```typescript
// src/app/(dashboard)/planejamento/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { PlanningEditor } from '@/components/planejamento/PlanningEditor';
import { loadPlanning, savePlanning } from './actions';
import type { PlanningLineDraft } from '@/lib/planejamento/types';

export default function EditPlanningPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState('');
  const [lines, setLines] = useState<PlanningLineDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlanning(params.id).then(data => {
      setName(data.name);
      setLines(data.lines);
      setIsLoading(false);
    });
  }, [params.id]);

  const handleSave = async () => {
    await savePlanning(params.id, { name, lines });
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <PlanningEditor lines={lines} onLinesChange={setLines} />
      <button onClick={handleSave}>Salvar</button>
    </div>
  );
}
```

---

## ✅ Checklist de Implementação

### Fase 1: Base
- [ ] SQL executado no Supabase
- [ ] Types TypeScript criados
- [ ] Queries básicas implementadas
- [ ] Página de lista funcionando

### Fase 2: Editor
- [ ] Página de edição criada
- [ ] Metadados editáveis
- [ ] Componente PlanningEditor criado
- [ ] State management funcionando

### Fase 3: Grid
- [ ] Grid renderizando linhas
- [ ] Modo read-only funcionando
- [ ] Modo edição inline funcionando
- [ ] Adicionar linha funcionando

### Fase 4: CRUD
- [ ] Editar linha funcionando
- [ ] Deletar linha funcionando
- [ ] Salvamento em batch funcionando
- [ ] IDs temporários mapeando corretamente

### Fase 5: Polish
- [ ] Validações implementadas
- [ ] Mensagens de erro
- [ ] Loading states
- [ ] Testes manuais

---

## 🎯 Conceitos Técnicos

### IDs Temporários

```typescript
// Gerar próximo ID negativo
const getNextTempId = (lines: PlanningLineDraft[]) => {
  const minId = Math.min(...lines.map(l => l.id), 0);
  return minId - 1;
};

// Verificar se é novo
const isNewLine = (line: PlanningLineDraft) => line.id < 0;

// Verificar se foi modificado
const isModified = (line: PlanningLineDraft) => line._isModified === true;
```

### Edição Inline

```typescript
// Estado de edição
const [editingLineId, setEditingLineId] = useState<number | null>(null);
const [editingData, setEditingData] = useState<Partial<PlanningLineDraft>>({});

// Entrar em edição
const startEdit = (lineId: number) => {
  const line = lines.find(l => l.id === lineId);
  setEditingData(line ? { ...line } : {});
  setEditingLineId(lineId);
};

// Salvar edição
const saveEdit = () => {
  if (!editingLineId) return;
  const updated = lines.map(line =>
    line.id === editingLineId
      ? { ...line, ...editingData, _isModified: line.id > 0 }
      : line
  );
  onLinesChange(updated);
  setEditingLineId(null);
};
```

### Soft Delete

```typescript
// Marcar para deletar (não remove do state ainda)
const markForDelete = (lineId: number) => {
  if (lineId < 0) {
    // Nova: remove direto
    setLines(lines.filter(l => l.id !== lineId));
  } else {
    // Existente: marca para deletar
    setLines(lines.map(l =>
      l.id === lineId ? { ...l, _isDeleted: true } : l
    ));
  }
};

// Ao salvar, filtrar deletados
const toDelete = lines
  .filter(l => l.id > 0 && l._isDeleted)
  .map(l => l.id);
```

---

## 🧪 Como Testar

### Cenário 1: Criar novo planejamento
1. Acessar `/planejamento/novo`
2. Preencher nome
3. Adicionar 3 linhas
4. Salvar
5. ✅ Verificar: planejamento criado com 3 linhas

### Cenário 2: Editar linhas
1. Abrir planejamento existente
2. Editar linha 1
3. Adicionar nova linha
4. Deletar linha 2
5. Salvar
6. ✅ Verificar: mudanças persistidas

### Cenário 3: Validações
1. Tentar salvar sem nome → ❌ Erro
2. Tentar salvar linha sem tarefa → ❌ Erro
3. Preencher tudo → ✅ Salva

---

## 📦 Dependências Necessárias

Já instaladas (do Organograma):
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `lucide-react`

Opcional (se quiser validação):
- `zod` - Para validação de schemas

---

**Próximo passo**: Consulte `SPEC_PLANEJAMENTO.md` para detalhes completos.

