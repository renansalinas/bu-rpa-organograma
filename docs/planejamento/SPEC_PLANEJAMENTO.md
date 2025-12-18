# 📋 Especificação Técnica Completa - Módulo Planejamento

> **Especificação detalhada**: Use este documento como referência durante o desenvolvimento.

---

## 1. Visão Geral

### 1.1 Objetivo

O **Módulo Planejamento** permite criar e gerenciar planos de trabalho estruturados em linhas editáveis. Cada planejamento contém múltiplas linhas (tarefas) que podem ser adicionadas, editadas e removidas.

### 1.2 Escopo

**MVP (Fase 1)**:
- Lista de planejamentos
- Criar/editar/deletar planejamentos
- Grid editável com linhas
- Campos: número, tarefa, responsável, prazo, status, notas
- Salvamento em batch

**Futuro (Fase 2+)**:
- Templates de planejamento
- Exportação (PDF, Excel)
- Histórico de alterações
- Colaboração em tempo real

### 1.3 Stack Tecnológica

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4
- **UI Primitives**: Radix UI
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth (usuário fixo)

---

## 2. Arquitetura de Pastas

```
src/
  app/
    (dashboard)/
      planejamento/
        page.tsx                    # Lista (Server Component)
        novo/
          page.tsx                   # Criar (Client Component)
          actions.ts                 # Server Actions
        [id]/
          page.tsx                   # Editar (Client Component)
          actions.ts                 # Server Actions
  components/
    planejamento/
      PlanningTable.tsx              # Tabela de listagem
      PlanningEditor.tsx             # Wrapper principal do editor
      PlanningGrid.tsx               # Grid editável (CRÍTICO)
      PlanningGridRow.tsx            # Componente de linha (opcional)
      PlanningToolbar.tsx            # Toolbar de ações
      PlanningMetadata.tsx            # Formulário de metadados
  lib/
    planejamento/
      queries.ts                     # Funções de banco de dados
      types.ts                       # TypeScript types
      validations.ts                 # Schemas Zod (opcional)
```

---

## 3. Modelagem de Dados

### 3.1 Tabelas SQL

```sql
-- Tabela de planejamentos
create table planning_documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de linhas do planejamento
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

-- Índices para performance
create index idx_planning_lines_document on planning_lines(document_id);
create index idx_planning_lines_sort on planning_lines(document_id, sort_order);
```

### 3.2 TypeScript Types

```typescript
// src/lib/planejamento/types.ts

// Documento de planejamento
export type PlanningDocument = {
  id: string;
  name: string;
  description?: string | null;
  start_date?: string | null; // ISO date string
  end_date?: string | null;   // ISO date string
  created_at: string;
  updated_at: string;
};

// Linha do planejamento (do banco)
export type PlanningLine = {
  id: number; // SERIAL do PostgreSQL
  document_id: string;
  line_number: number;
  task_name: string;
  responsible?: string | null;
  due_date?: string | null; // ISO date string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// Linha em edição no frontend (com IDs temporários)
export type PlanningLineDraft = Omit<PlanningLine, 'id'> & {
  id: number; // Negativo = novo, Positivo = do banco
  _isNew?: boolean;
  _isModified?: boolean;
  _isDeleted?: boolean;
};

// Payload para salvamento
export type SavePlanningLinesPayload = {
  insert: Omit<PlanningLine, 'id' | 'created_at' | 'updated_at'>[];
  update: PlanningLine[];
  delete: number[];
};

// Documento com linhas
export type PlanningDocumentWithLines = PlanningDocument & {
  lines: PlanningLine[];
};
```

---

## 4. API de Dados (Server Actions)

### 4.1 Queries (src/lib/planejamento/queries.ts)

```typescript
import { supabaseAdmin } from '@/lib/supabaseClient';
import { authServiceUser } from '@/lib/supabaseClient';
import type { PlanningDocument, PlanningLine, SavePlanningLinesPayload } from './types';

async function ensureAuth() {
  await authServiceUser();
}

// Listar todos os planejamentos
export async function listPlanningDocuments(): Promise<PlanningDocument[]> {
  try {
    await ensureAuth();
    const { data, error } = await supabaseAdmin
      .from('planning_documents')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Erro ao listar planejamentos:', error);
    throw new Error(`Erro ao listar planejamentos: ${error.message}`);
  }
}

// Buscar planejamento com linhas
export async function getPlanningDocumentWithLines(
  documentId: string
): Promise<PlanningDocumentWithLines | null> {
  try {
    await ensureAuth();
    
    const { data: doc, error: docError } = await supabaseAdmin
      .from('planning_documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (docError) throw docError;
    if (!doc) return null;
    
    const { data: lines, error: linesError } = await supabaseAdmin
      .from('planning_lines')
      .select('*')
      .eq('document_id', documentId)
      .order('sort_order', { ascending: true });
    
    if (linesError) throw linesError;
    
    return { ...doc, lines: lines || [] };
  } catch (error: any) {
    console.error('Erro ao buscar planejamento:', error);
    throw new Error(`Erro ao buscar planejamento: ${error.message}`);
  }
}

// Criar novo planejamento
export async function createPlanningDocument(
  payload: { name: string; description?: string | null; start_date?: string | null; end_date?: string | null }
): Promise<PlanningDocument> {
  try {
    await ensureAuth();
    const { data, error } = await supabaseAdmin
      .from('planning_documents')
      .insert({
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
        start_date: payload.start_date || null,
        end_date: payload.end_date || null,
      })
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Planejamento criado mas não retornado');
    return data;
  } catch (error: any) {
    console.error('Erro ao criar planejamento:', error);
    throw new Error(`Erro ao criar planejamento: ${error.message}`);
  }
}

// Atualizar planejamento
export async function updatePlanningDocument(
  documentId: string,
  payload: { name?: string; description?: string | null; start_date?: string | null; end_date?: string | null }
): Promise<void> {
  try {
    await ensureAuth();
    const { error } = await supabaseAdmin
      .from('planning_documents')
      .update({
        ...payload,
        name: payload.name?.trim(),
        description: payload.description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao atualizar planejamento:', error);
    throw new Error(`Erro ao atualizar planejamento: ${error.message}`);
  }
}

// Deletar planejamento
export async function deletePlanningDocument(documentId: string): Promise<void> {
  try {
    await ensureAuth();
    const { error } = await supabaseAdmin
      .from('planning_documents')
      .delete()
      .eq('id', documentId);
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao deletar planejamento:', error);
    throw new Error(`Erro ao deletar planejamento: ${error.message}`);
  }
}

// Salvar linhas (batch)
export async function savePlanningLines(
  documentId: string,
  payload: SavePlanningLinesPayload
): Promise<PlanningLine[]> {
  try {
    await ensureAuth();
    
    // 1. Deletar linhas marcadas
    if (payload.delete.length > 0) {
      const { error } = await supabaseAdmin
        .from('planning_lines')
        .delete()
        .in('id', payload.delete);
      if (error) throw error;
    }
    
    // 2. Atualizar linhas modificadas
    if (payload.update.length > 0) {
      for (const line of payload.update) {
        const { id, created_at, updated_at, ...updateData } = line;
        const { error } = await supabaseAdmin
          .from('planning_lines')
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        if (error) throw error;
      }
    }
    
    // 3. Inserir novas linhas
    if (payload.insert.length > 0) {
      const { error } = await supabaseAdmin
        .from('planning_lines')
        .insert(
          payload.insert.map(line => ({
            ...line,
            updated_at: new Date().toISOString(),
          }))
        );
      if (error) throw error;
    }
    
    // 4. Retornar estado atualizado
    const { data, error } = await supabaseAdmin
      .from('planning_lines')
      .select('*')
      .eq('document_id', documentId)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('Erro ao salvar linhas:', error);
    throw new Error(`Erro ao salvar linhas: ${error.message}`);
  }
}
```

### 4.2 Server Actions (src/app/(dashboard)/planejamento/novo/actions.ts)

```typescript
'use server';

import { createPlanningDocument, savePlanningLines } from '@/lib/planejamento/queries';
import type { PlanningLineDraft } from '@/lib/planejamento/types';

export async function createNewPlanning(
  name: string,
  description: string | null,
  startDate: string | null,
  endDate: string | null,
  lines: PlanningLineDraft[]
) {
  try {
    const doc = await createPlanningDocument({
      name: name.trim(),
      description: description?.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
    });
    
    if (lines.length > 0) {
      const toInsert = lines
        .filter(l => l.id < 0 && !l._isDeleted)
        .map(({ id, _isNew, _isModified, _isDeleted, ...line }) => line);
      
      await savePlanningLines(doc.id, {
        insert: toInsert,
        update: [],
        delete: [],
      });
    }
    
    return doc;
  } catch (error: any) {
    console.error('Erro em createNewPlanning:', error);
    throw new Error(error?.message || 'Erro ao criar planejamento');
  }
}
```

### 4.3 Server Actions (src/app/(dashboard)/planejamento/[id]/actions.ts)

```typescript
'use server';

import { getPlanningDocumentWithLines, updatePlanningDocument, savePlanningLines } from '@/lib/planejamento/queries';
import type { PlanningLineDraft } from '@/lib/planejamento/types';

export async function loadPlanning(documentId: string) {
  try {
    const doc = await getPlanningDocumentWithLines(documentId);
    if (!doc) throw new Error('Planejamento não encontrado');
    return doc;
  } catch (error: any) {
    console.error('Erro em loadPlanning:', error);
    throw new Error(error?.message || 'Erro ao carregar planejamento');
  }
}

export async function savePlanning(
  documentId: string,
  name: string,
  description: string | null,
  startDate: string | null,
  endDate: string | null,
  lines: PlanningLineDraft[]
) {
  try {
    await updatePlanningDocument(documentId, {
      name: name.trim(),
      description: description?.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
    });
    
    const toInsert = lines
      .filter(l => l.id < 0 && !l._isDeleted)
      .map(({ id, _isNew, _isModified, _isDeleted, ...line }) => line);
    
    const toUpdate = lines
      .filter(l => l.id > 0 && l._isModified && !l._isDeleted)
      .map(({ _isNew, _isModified, _isDeleted, ...line }) => line);
    
    const toDelete = lines
      .filter(l => l.id > 0 && l._isDeleted)
      .map(l => l.id);
    
    await savePlanningLines(documentId, {
      insert: toInsert,
      update: toUpdate,
      delete: toDelete,
    });
  } catch (error: any) {
    console.error('Erro em savePlanning:', error);
    throw new Error(error?.message || 'Erro ao salvar planejamento');
  }
}
```

---

## 5. Componentes - Especificação

### 5.1 PlanningTable (Lista)

**Localização**: `src/components/planejamento/PlanningTable.tsx`

**Props**:
```typescript
interface PlanningTableProps {
  documents: PlanningDocument[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Comportamento**:
- Tabela com colunas: Nome, Descrição, Período, Linhas, Última atualização
- Botão "Editar" → navega para `/planejamento/[id]`
- Botão "Excluir" → confirmação → deleta
- Empty state quando não há planejamentos

**UI**:
- Seguir design system (mesmo padrão do Organograma)
- Hover states
- Loading states

### 5.2 PlanningEditor (Wrapper Principal)

**Localização**: `src/components/planejamento/PlanningEditor.tsx`

**Props**:
```typescript
interface PlanningEditorProps {
  initialLines: PlanningLineDraft[];
  onLinesChange: (lines: PlanningLineDraft[]) => void;
}
```

**Comportamento**:
- Gerencia state das linhas
- Coordena grid + toolbar
- Handles: add, edit, delete, save

**Estrutura**:
```tsx
<div className="flex flex-col h-full">
  <PlanningToolbar onAddLine={...} />
  <PlanningGrid lines={lines} onLinesChange={...} />
</div>
```

### 5.3 PlanningGrid (Grid Editável) - **CRÍTICO**

**Localização**: `src/components/planejamento/PlanningGrid.tsx`

**Props**:
```typescript
interface PlanningGridProps {
  lines: PlanningLineDraft[];
  onLinesChange: (lines: PlanningLineDraft[]) => void;
}
```

**Comportamento**:

#### Modo Read-only
- Tabela HTML com linhas
- Cada linha mostra: #, Tarefa, Responsável, Prazo, Status, Ações
- Botão "Editar" em cada linha
- Linhas deletadas (com `_isDeleted`) não aparecem OU aparecem riscadas

#### Modo Edição
- Uma linha por vez pode estar em edição
- Linha em edição: inputs em vez de texto
- Botões: "Salvar linha" / "Cancelar"
- Validação: tarefa obrigatória
- Ao salvar: atualiza state, volta para read-only
- Ao cancelar: descarta mudanças, volta para read-only

**Estados visuais**:
- Linha normal: fundo branco
- Linha em edição: fundo `#f5f6fa`, borda `#2c19b2`
- Linha deletada: texto riscado, opacidade reduzida

### 5.4 PlanningToolbar

**Localização**: `src/components/planejamento/PlanningToolbar.tsx`

**Props**:
```typescript
interface PlanningToolbarProps {
  onAddLine: () => void;
  hasLines: boolean;
}
```

**Comportamento**:
- Botão "Adicionar linha" → adiciona nova linha (id negativo) e entra em edição
- Pode ter outros botões futuros (exportar, etc.)

---

## 6. Grid - Comportamento Crítico Detalhado

### 6.1 Adicionar Linha

```typescript
const handleAddLine = () => {
  const nextLineNumber = lines.length > 0 
    ? Math.max(...lines.map(l => l.line_number)) + 1 
    : 1;
  
  const nextTempId = Math.min(...lines.map(l => l.id), 0) - 1;
  
  const newLine: PlanningLineDraft = {
    id: nextTempId,
    document_id: documentId,
    line_number: nextLineNumber,
    task_name: '',
    status: 'pending',
    sort_order: lines.length,
    _isNew: true,
  };
  
  setLines([...lines, newLine]);
  setEditingLineId(nextTempId); // Entra em edição imediatamente
};
```

### 6.2 Editar Linha

```typescript
const handleEditLine = (lineId: number) => {
  const line = lines.find(l => l.id === lineId);
  if (!line) return;
  
  setEditingLineId(lineId);
  setEditingData({ ...line }); // Cópia para edição
};

const handleSaveLine = (lineId: number) => {
  // Validar
  if (!editingData.task_name?.trim()) {
    alert('Tarefa é obrigatória');
    return;
  }
  
  // Atualizar state
  const updated = lines.map(line =>
    line.id === lineId
      ? { 
          ...line, 
          ...editingData, 
          _isModified: line.id > 0, // Só marca como modificado se já existia
        }
      : line
  );
  
  onLinesChange(updated);
  setEditingLineId(null);
  setEditingData({});
};
```

### 6.3 Deletar Linha

```typescript
const handleDeleteLine = (lineId: number) => {
  if (lineId < 0) {
    // Nova: remove direto do state
    setLines(lines.filter(l => l.id !== lineId));
  } else {
    // Existente: marca para deletar
    setLines(lines.map(l =>
      l.id === lineId ? { ...l, _isDeleted: true } : l
    ));
  }
};
```

### 6.4 Renderização Condicional

```typescript
{lines
  .filter(l => !l._isDeleted) // Não mostrar deletadas
  .map((line) => (
    <tr key={line.id}>
      {editingLineId === line.id ? (
        // Modo edição
        <EditableRow 
          line={line}
          data={editingData}
          onDataChange={setEditingData}
          onSave={() => handleSaveLine(line.id)}
          onCancel={() => setEditingLineId(null)}
        />
      ) : (
        // Modo read-only
        <ReadOnlyRow 
          line={line}
          onEdit={() => handleEditLine(line.id)}
          onDelete={() => handleDeleteLine(line.id)}
        />
      )}
    </tr>
  ))}
```

---

## 7. State Management

### 7.1 Estado Local (useState)

```typescript
// Página de edição
const [name, setName] = useState('');
const [description, setDescription] = useState('');
const [startDate, setStartDate] = useState<string | null>(null);
const [endDate, setEndDate] = useState<string | null>(null);
const [lines, setLines] = useState<PlanningLineDraft[]>([]);
const [editingLineId, setEditingLineId] = useState<number | null>(null);
const [isSaving, setIsSaving] = useState(false);
```

### 7.2 Fluxo de Dados

```
Usuário interage
  ↓
Atualiza state local (lines)
  ↓
Grid re-renderiza
  ↓
Usuário clica "Salvar"
  ↓
Prepara payload (insert/update/delete)
  ↓
Chama server action
  ↓
Backend persiste
  ↓
Retorna estado atualizado
  ↓
Frontend atualiza state com IDs reais
```

---

## 8. Fluxo de Salvamento

### 8.1 Preparação do Payload

```typescript
const prepareSavePayload = (lines: PlanningLineDraft[]) => {
  const toInsert = lines
    .filter(l => l.id < 0 && !l._isDeleted)
    .map(({ id, _isNew, _isModified, _isDeleted, ...line }) => line);
  
  const toUpdate = lines
    .filter(l => l.id > 0 && l._isModified && !l._isDeleted)
    .map(({ _isNew, _isModified, _isDeleted, ...line }) => line);
  
  const toDelete = lines
    .filter(l => l.id > 0 && l._isDeleted)
    .map(l => l.id);
  
  return { insert: toInsert, update: toUpdate, delete: toDelete };
};
```

### 8.2 Salvamento

```typescript
const handleSave = async () => {
  // Validar metadados
  if (!name.trim()) {
    alert('Nome é obrigatório');
    return;
  }
  
  setIsSaving(true);
  try {
    const payload = prepareSavePayload(lines);
    await savePlanning(documentId, name, description, startDate, endDate, lines);
    
    // Recarregar do banco para obter IDs atualizados
    const updated = await loadPlanning(documentId);
    setLines(updated.lines);
    
    alert('Salvo com sucesso!');
  } catch (error: any) {
    alert(`Erro ao salvar: ${error.message}`);
  } finally {
    setIsSaving(false);
  }
};
```

---

## 9. Validações

### 9.1 Frontend (Zod - Opcional)

```typescript
import { z } from 'zod';

const planningLineSchema = z.object({
  task_name: z.string().min(1, 'Tarefa é obrigatória').max(200),
  responsible: z.string().max(100).optional(),
  due_date: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  notes: z.string().max(1000).optional(),
});

const planningDocumentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200),
  description: z.string().max(1000).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
}).refine(
  (data) => !data.start_date || !data.end_date || data.end_date >= data.start_date,
  { message: 'Data de término deve ser >= data de início' }
);
```

### 9.2 Backend

- Validações do banco (constraints, checks)
- Validações nas queries (throw errors)

---

## 10. UI/UX - Design System

### 10.1 Cores

- **Primary**: `#2c19b2`
- **Secondary**: `#20c6ed`
- **Neutros**: `#ffffff` até `#1a1a1a`
- **Success**: `#10b981`
- **Error**: `#ef4444`
- **Warning**: `#f59e0b`

### 10.2 Tipografia

- **Fonte**: Urbanist (já configurada)
- **Tamanhos**: Seguir escala Tailwind

### 10.3 Componentes

- Botões: primário, secundário, ghost
- Inputs: border, focus ring
- Tabelas: hover, estados
- Cards: bordas, sombras

### 10.4 Estados Visuais

- **Loading**: Spinner ou skeleton
- **Sucesso**: Toast ou mensagem inline
- **Erro**: Mensagem vermelha
- **Editando**: Destaque visual (borda, fundo)

---

## 11. Critérios de Aceite (MVP)

### 11.1 Lista de Planejamentos

- [ ] Exibe todos os planejamentos cadastrados
- [ ] Mostra: nome, descrição, período, quantidade de linhas, última atualização
- [ ] Botão "Adicionar registro" → `/planejamento/novo`
- [ ] Botão "Editar" → `/planejamento/[id]`
- [ ] Botão "Excluir" → confirmação → deleta
- [ ] Empty state quando não há planejamentos

### 11.2 Editor

- [ ] Metadados editáveis: nome, descrição, datas
- [ ] Grid com linhas editáveis
- [ ] Adicionar linha: cria nova linha (id negativo), entra em edição
- [ ] Editar linha: modo inline, salva linha individual
- [ ] Deletar linha: remove nova ou marca existente para deletar
- [ ] Botão "Salvar" persiste tudo (metadados + linhas)
- [ ] Feedback visual: salvando, salvo, erro

### 11.3 Validações

- [ ] Nome do planejamento obrigatório
- [ ] Tarefa obrigatória em cada linha
- [ ] Data de término >= data de início (se ambas preenchidas)

### 11.4 UI/UX

- [ ] Segue design system
- [ ] Responsivo (mobile-friendly)
- [ ] Acessível (ARIA labels)
- [ ] Performance: grid com 100+ linhas sem lag

---

## 12. Ordem de Implementação (8 Fases)

### Fase 1: Base (2h)
- [ ] SQL no Supabase
- [ ] Types TypeScript
- [ ] Queries básicas (list, get, create)

### Fase 2: Lista (2h)
- [ ] Página de lista
- [ ] Componente PlanningTable
- [ ] Empty state

### Fase 3: Editor Base (3h)
- [ ] Página de edição (novo/[id])
- [ ] Metadados editáveis
- [ ] Componente PlanningEditor

### Fase 4: Grid Read-only (2h)
- [ ] Componente PlanningGrid
- [ ] Renderização de linhas
- [ ] Estilos básicos

### Fase 5: Grid Edição (4h)
- [ ] Modo edição inline
- [ ] Adicionar linha
- [ ] Salvar linha individual

### Fase 6: CRUD Completo (3h)
- [ ] Editar linha
- [ ] Deletar linha
- [ ] Soft delete

### Fase 7: Salvamento (3h)
- [ ] Preparação de payload
- [ ] Server action de salvamento
- [ ] Atualização de state com IDs reais

### Fase 8: Polish (3h)
- [ ] Validações
- [ ] Mensagens de erro
- [ ] Loading states
- [ ] Testes manuais

**Total estimado**: 22 horas (3 dias)

---

**Próximo**: Consulte `TECH_LEAD_REVIEW.md` para análise técnica e decisões de arquitetura.

