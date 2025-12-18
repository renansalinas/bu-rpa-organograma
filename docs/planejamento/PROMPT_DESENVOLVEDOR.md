# 📋 PROMPT PARA DESENVOLVEDOR - Módulo Planejamento

> **Arquivo Principal**: Este é o documento que você deve ler primeiro e seguir durante a implementação.

---

## 🎯 Resumo Executivo

Você vai implementar o **Módulo Planejamento** do sistema BU RPA. Este módulo permite criar e gerenciar planos de trabalho com linhas editáveis em uma grid interativa.

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Supabase + Radix UI

**Tempo estimado**: 16-24 horas (2-3 dias)

**Complexidade**: Média-Alta (similar ao módulo Organograma)

---

## 🚀 5 Passos para Começar

### 1. Execute o SQL no Supabase

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
  status text default 'pending',
  notes text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(document_id, line_number)
);
```

### 2. Crie a estrutura de pastas

```
src/
  app/
    (dashboard)/
      planejamento/
        page.tsx              # Lista de planejamentos
        novo/
          page.tsx            # Criar novo
        [id]/
          page.tsx            # Editor
  components/
    planejamento/
      PlanningTable.tsx      # Tabela de listagem
      PlanningEditor.tsx     # Wrapper do editor
      PlanningGrid.tsx       # Grid editável
      PlanningToolbar.tsx    # Toolbar de ações
  lib/
    planejamento/
      queries.ts             # CRUD operations
      types.ts               # TypeScript types
```

### 3. Copie os types TypeScript

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
  id: number; // SERIAL do PostgreSQL
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

// Para o frontend (com IDs temporários)
export type PlanningLineDraft = Omit<PlanningLine, 'id'> & {
  id: number; // Pode ser negativo (temporário) ou positivo (do banco)
  _isNew?: boolean;
  _isModified?: boolean;
  _isDeleted?: boolean;
};
```

### 4. Entenda o fluxo de IDs temporários

**Conceito crítico**: Linhas novas recebem IDs negativos (-1, -2, -3...) no frontend. Ao salvar, o backend retorna IDs reais (1, 2, 3...) e o frontend atualiza o state.

```typescript
// Exemplo de state
const [lines, setLines] = useState<PlanningLineDraft[]>([
  { id: -1, line_number: 1, task_name: "Tarefa nova", ... }, // Nova
  { id: 5, line_number: 2, task_name: "Tarefa existente", ... }, // Do banco
]);

// Ao salvar
const saved = await savePlanningLines(documentId, lines);
// Backend retorna: [{ id: 10, ... }, { id: 5, ... }]
// Frontend atualiza: lines[0].id = 10
```

### 5. Implemente na ordem sugerida

1. **Fase 1**: Lista de planejamentos (2h)
2. **Fase 2**: Página de edição base (3h)
3. **Fase 3**: Grid editável (6h)
4. **Fase 4**: Operações CRUD (4h)
5. **Fase 5**: Validações e polish (3h)

---

## 📐 Estrutura de Arquivos

```
src/
  app/
    (dashboard)/
      planejamento/
        page.tsx                    # Lista (server component)
        novo/
          page.tsx                  # Criar (client component)
          actions.ts                # Server actions
        [id]/
          page.tsx                  # Editar (client component)
          actions.ts                # Server actions
  components/
    planejamento/
      PlanningTable.tsx             # Tabela de listagem
      PlanningEditor.tsx            # Wrapper principal
      PlanningGrid.tsx              # Grid editável (CRÍTICO)
      PlanningGridRow.tsx           # Linha da grid
      PlanningToolbar.tsx           # Botões de ação
  lib/
    planejamento/
      queries.ts                    # Funções de banco
      types.ts                      # Types TypeScript
```

---

## 🎨 Comportamento da Grid (CRÍTICO)

### Modo de Visualização (Read-only)

- Linhas exibidas como tabela
- Cada linha mostra: número, tarefa, responsável, prazo, status
- Botão "Editar" em cada linha
- Botão "Adicionar linha" no topo

### Modo de Edição

- Ao clicar "Editar" em uma linha OU "Adicionar linha":
  - Linha vira inputs editáveis
  - Botões: "Salvar linha" / "Cancelar"
  - Outras linhas continuam read-only
- Ao clicar "Salvar linha":
  - Valida campos obrigatórios
  - Atualiza state local
  - Volta para modo read-only
- Ao clicar "Cancelar":
  - Descarta mudanças
  - Volta para modo read-only

### Salvamento do Planejamento

- Botão "Salvar" no topo da página
- Envia TODAS as mudanças em uma única requisição:
  - Linhas novas (id negativo) → INSERT
  - Linhas modificadas (id positivo + _isModified) → UPDATE
  - Linhas deletadas (id positivo + _isDeleted) → DELETE
- Backend retorna estado atualizado
- Frontend atualiza state com IDs reais

---

## 🔄 Fluxo de IDs Temporários (Detalhado)

### Cenário 1: Adicionar nova linha

```typescript
// 1. Usuário clica "Adicionar linha"
const newLine: PlanningLineDraft = {
  id: -1, // ID temporário negativo
  document_id: currentDocId,
  line_number: lines.length + 1,
  task_name: "",
  status: "pending",
  _isNew: true,
  // ... outros campos
};

setLines([...lines, newLine]);
// State: [..., { id: -1, ... }]
```

### Cenário 2: Editar linha existente

```typescript
// 1. Linha do banco: { id: 5, task_name: "Original", ... }
// 2. Usuário edita e salva linha
const updated = { ...line, task_name: "Editado", _isModified: true };
setLines(lines.map(l => l.id === 5 ? updated : l));
// State: [..., { id: 5, task_name: "Editado", _isModified: true, ... }]
```

### Cenário 3: Deletar linha

```typescript
// Linha do banco: { id: 5, ... }
const deleted = { ...line, _isDeleted: true };
setLines(lines.map(l => l.id === 5 ? deleted : l));
// OU simplesmente: setLines(lines.filter(l => l.id !== 5));
```

### Cenário 4: Salvar tudo

```typescript
// Preparar payload
const toInsert = lines.filter(l => l.id < 0); // IDs negativos
const toUpdate = lines.filter(l => l.id > 0 && l._isModified);
const toDelete = lines.filter(l => l.id > 0 && l._isDeleted).map(l => l.id);

// Chamar server action
const result = await savePlanningLines(documentId, {
  insert: toInsert,
  update: toUpdate,
  delete: toDelete,
});

// Backend retorna linhas atualizadas
// Frontend atualiza state: linhas com id negativo recebem IDs reais
```

---

## 🛠️ Operações Principais

### Adicionar Linha

```typescript
const handleAddLine = () => {
  const newLine: PlanningLineDraft = {
    id: Math.min(...lines.map(l => l.id), 0) - 1, // Próximo ID negativo
    document_id: documentId,
    line_number: lines.length + 1,
    task_name: "",
    status: "pending",
    sort_order: lines.length,
    _isNew: true,
  };
  setLines([...lines, newLine]);
  setEditingLineId(newLine.id); // Entra em modo edição
};
```

### Editar Linha

```typescript
const handleEditLine = (lineId: number) => {
  setEditingLineId(lineId);
};

const handleSaveLine = (lineId: number, updates: Partial<PlanningLineDraft>) => {
  setLines(lines.map(line => 
    line.id === lineId 
      ? { ...line, ...updates, _isModified: line.id > 0 }
      : line
  ));
  setEditingLineId(null);
};
```

### Deletar Linha

```typescript
const handleDeleteLine = (lineId: number) => {
  if (lineId < 0) {
    // Linha nova: remove do state
    setLines(lines.filter(l => l.id !== lineId));
  } else {
    // Linha do banco: marca para deletar
    setLines(lines.map(l => 
      l.id === lineId ? { ...l, _isDeleted: true } : l
    ));
  }
};
```

### Salvar Planejamento

```typescript
const handleSavePlanning = async () => {
  const toInsert = lines
    .filter(l => l.id < 0 && !l._isDeleted)
    .map(({ id, _isNew, _isModified, _isDeleted, ...line }) => line);
  
  const toUpdate = lines
    .filter(l => l.id > 0 && l._isModified && !l._isDeleted)
    .map(({ _isNew, _isModified, _isDeleted, ...line }) => line);
  
  const toDelete = lines
    .filter(l => l.id > 0 && l._isDeleted)
    .map(l => l.id);

  await savePlanningLines(documentId, { insert: toInsert, update: toUpdate, delete: toDelete });
  
  // Recarregar do banco para obter IDs atualizados
  const updated = await loadPlanningLines(documentId);
  setLines(updated);
};
```

---

## 🎨 Design System

Use os mesmos tokens do módulo Organograma:

- **Cores**: `#2c19b2` (primary), `#20c6ed` (secondary), neutros
- **Fonte**: Urbanist (já configurada)
- **Componentes**: Seguir padrão de botões, inputs, tabelas do Organograma

### Grid - Estilo

```typescript
// Linha read-only
<tr className="hover:bg-[#f5f6fa]">
  <td className="px-4 py-3 text-sm">{line.line_number}</td>
  <td className="px-4 py-3 text-sm font-medium">{line.task_name}</td>
  {/* ... */}
  <td>
    <button onClick={() => handleEditLine(line.id)}>Editar</button>
  </td>
</tr>

// Linha em edição
<tr className="bg-[#f5f6fa] border-2 border-[#2c19b2]">
  <td className="px-4 py-3">
    <input value={line.task_name} onChange={...} />
  </td>
  {/* ... */}
  <td>
    <button onClick={() => handleSaveLine(line.id)}>Salvar</button>
    <button onClick={() => setEditingLineId(null)}>Cancelar</button>
  </td>
</tr>
```

---

## ✅ Critérios de Aceite (MVP)

1. **Lista de planejamentos**
   - Exibe todos os planejamentos
   - Mostra nome, quantidade de linhas, datas
   - Botão "Adicionar registro" → `/planejamento/novo`

2. **Editor**
   - Grid com linhas editáveis
   - Adicionar/editar/deletar linhas
   - Campos: número, tarefa, responsável, prazo, status, notas
   - Botão "Salvar" persiste tudo

3. **Validações**
   - Nome do planejamento obrigatório
   - Tarefa obrigatória em cada linha
   - Data de término >= data de início

4. **UI/UX**
   - Segue design system
   - Feedback visual claro (editando, salvando, salvo)
   - Mensagens de erro amigáveis

---

## 📅 Ordem de Implementação (4 dias)

### Dia 1: Base
- [ ] Estrutura de pastas
- [ ] Types TypeScript
- [ ] Queries básicas (list, get, create)
- [ ] Página de lista

### Dia 2: Editor Base
- [ ] Página de edição (novo/[id])
- [ ] Componente PlanningEditor
- [ ] Metadados (nome, descrição, datas)
- [ ] Toolbar básica

### Dia 3: Grid
- [ ] Componente PlanningGrid
- [ ] Modo read-only
- [ ] Modo edição inline
- [ ] Adicionar linha

### Dia 4: CRUD Completo
- [ ] Editar linha
- [ ] Deletar linha
- [ ] Salvamento em batch
- [ ] Validações
- [ ] Polish e testes

---

## 🚨 Pontos de Atenção

1. **IDs temporários**: Sempre usar negativos para novas linhas
2. **State management**: Manter estado local até salvar
3. **Validação**: Validar antes de salvar linha individual E antes de salvar planejamento
4. **Performance**: Grid pode ter muitas linhas, considerar virtualização se > 100
5. **UX**: Feedback claro em todas as ações (loading, sucesso, erro)

---

## 📚 Documentação Adicional

- **GUIA_IMPLEMENTACAO_PLANEJAMENTO.md**: Boilerplates e exemplos práticos
- **SPEC_PLANEJAMENTO.md**: Especificação completa e detalhada
- **TECH_LEAD_REVIEW.md**: Decisões de arquitetura e justificativas

---

**Pronto para começar?** Leia o `GUIA_IMPLEMENTACAO_PLANEJAMENTO.md` para exemplos de código prontos para copiar.

