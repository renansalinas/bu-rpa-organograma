# BU RPA – Organograma

Sistema web para gerenciamento de organogramas organizacionais.

## Stack Tecnológica

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Radix UI** (primitives) + Tailwind para visual
- **Supabase** (banco de dados + autenticação)
- **React Flow** (@xyflow/react) para visualização do organograma

## Estrutura do Projeto

```
src/
  app/
    (dashboard)/
      layout.tsx              # Layout com sidebar + topbar
      organograma/
        page.tsx              # Lista de organogramas
        novo/
          page.tsx            # Criar novo organograma
        [id]/
          page.tsx            # Editor de organograma
  components/
    layout/
      Sidebar.tsx
      Topbar.tsx
    organograma/
      OrgChartTable.tsx       # Tabela de listagem
      OrgChartEditor.tsx      # Wrapper do editor
      OrgChartCanvas.tsx      # Canvas React Flow
      OrgChartToolbar.tsx     # Toolbar de ações
      OrgChartSidebar.tsx     # Painel de propriedades
      OrgChartNode.tsx        # Componente de nó customizado
  lib/
    supabaseClient.ts         # Cliente Supabase
    organograma/
      queries.ts              # Funções CRUD
      types.ts                # Tipos TypeScript
    layout/
      designTokens.ts         # Tokens de design
```

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_KEY=sua_service_key
```

### 2. Banco de Dados (Supabase)

Execute os seguintes SQLs no Supabase:

```sql
-- Tabela de organogramas
create table org_charts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de nós (pessoas/cargos)
create table org_chart_nodes (
  id uuid primary key default gen_random_uuid(),
  chart_id uuid not null references org_charts(id) on delete cascade,
  parent_id uuid references org_chart_nodes(id) on delete cascade,
  person_name text not null,
  role text not null,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 3. Autenticação

O sistema usa autenticação com usuário fixo (apenas para ambiente interno/MVP):

- Email: `renansalinas@yanksolutions.com.br`
- Senha: `admin123@yank`

**⚠️ IMPORTANTE**: Esta autenticação é apenas para ambiente interno. Não usar em produção com credenciais expostas.

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Funcionalidades

### Lista de Organogramas (`/organograma`)

- Visualização de todos os organogramas cadastrados
- Informações: nome, quantidade de pessoas, última atualização
- Ações: editar, excluir
- Botão para criar novo organograma

### Editor de Organograma (`/organograma/novo` e `/organograma/[id]`)

- **Metadados**: Nome e descrição do organograma
- **Canvas Interativo**: 
  - Adicionar pessoas (raiz, subordinado, par)
  - Editar propriedades (nome, cargo)
  - Remover pessoas (com confirmação)
  - Layout automático em árvore vertical
  - Zoom in/out, reset zoom
  - Reorganizar layout
- **Painel Lateral**: Edição de propriedades do nó selecionado

## Design System

### Cores

- **Primary (Smart Blue)**: `#2c19b2`
- **Secondary (Light Blue)**: `#20c6ed`
- **Neutros**: `#ffffff` até `#1a1a1a`

### Tipografia

- **Fonte**: Urbane (via Google Fonts - Urbanist como fallback)
- **Tamanhos**: Seguindo escala do Tailwind

### Componentes

- Botões primários/secundários/ghost
- Inputs e textareas com estados de focus
- Tabelas com hover e estados ativos
- Cards com bordas e sombras suaves
- Modais de confirmação

## Estrutura de Dados

### OrgChart

```typescript
{
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}
```

### OrgChartNode

```typescript
{
  id: string;
  chart_id: string;
  parent_id: string | null;  // null = nó raiz
  person_name: string;
  role: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
```

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa linter

## Próximos Passos (Melhorias Futuras)

- [ ] Auto-save periódico
- [ ] Histórico de alterações
- [ ] Exportação (PDF, PNG)
- [ ] Importação de dados
- [ ] Drag & drop para reorganizar manualmente
- [ ] Busca e filtros na lista
- [ ] Paginação na tabela
- [ ] Autenticação real com Supabase Auth
- [ ] Permissões e roles de usuário
