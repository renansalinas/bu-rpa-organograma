# 🗄️ Como Criar Tabelas no Supabase

## ❌ PROBLEMA IDENTIFICADO

```
"Could not find the table 'public.planning_documents' in the schema cache"
```

**Causa**: As tabelas do módulo de Planejamento **NÃO EXISTEM** no banco de dados!

---

## ✅ SOLUÇÃO (5 minutos)

### Passo 1: Acesse o Supabase

1. Vá para https://supabase.com
2. Faça login
3. Selecione o projeto: `uxgnxnaxkymfcfjrfbpq`

### Passo 2: Abra o SQL Editor

```
Dashboard > SQL Editor (ícone </>)
```

### Passo 3: Crie Nova Query

Clique em **"New query"** ou **"+"**

### Passo 4: Cole o SQL

Abra o arquivo: `database/02_planejamento_tables.sql`

**Cole TODO o conteúdo** no editor SQL

### Passo 5: Execute

Clique em **"Run"** ou pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Passo 6: Verifique

Você deve ver:
```
✅ Success. No rows returned
```

Vá em **Table Editor** e confirme que as tabelas apareceram:
- ✅ planning_documents
- ✅ planning_lines

---

## 📋 CHECKLIST

- [ ] Acessei o Supabase
- [ ] Abri o SQL Editor
- [ ] Copiei o conteúdo de `database/02_planejamento_tables.sql`
- [ ] Colei no editor
- [ ] Executei (Run)
- [ ] Vi mensagem de sucesso
- [ ] Verifiquei no Table Editor que as tabelas existem
- [ ] Testei criar planejamento na aplicação

---

## 🎨 VISUAL DO PROCESSO

```
Supabase Dashboard
    ↓
SQL Editor (</>)
    ↓
New Query (+)
    ↓
[Cole o SQL aqui]
    ↓
Run (Ctrl+Enter)
    ↓
✅ Success
    ↓
Table Editor > Verifique tabelas
```

---

## 🗄️ TABELAS QUE SERÃO CRIADAS

### 1. `planning_documents`
- Armazena os documentos de planejamento
- Campos: id, name, description, start_date, end_date

### 2. `planning_lines`
- Armazena as tarefas de cada planejamento
- Campos: id, document_id, task_name, responsible, due_date, status

---

## 🧪 COMO TESTAR DEPOIS

1. ✅ Execute o SQL no Supabase
2. ✅ Aguarde ~30 segundos
3. ✅ Abra https://core.yanksolutions.com.br
4. ✅ Faça hard refresh: `Cmd+Shift+R`
5. ✅ Vá em **Planejamento**
6. ✅ Clique em **+ Novo Planejamento**
7. ✅ Preencha:
   - Nome: "Primeiro Planejamento"
   - Descrição: "Teste após criar tabelas"
8. ✅ Clique em **Salvar**
9. ✅ **DEVE FUNCIONAR!** 🎉

---

## ❓ SE DER ERRO AO EXECUTAR SQL

### Erro: "relation already exists"
✅ **Ignorar** - significa que a tabela já existe

### Erro: "permission denied"
❌ Você precisa de permissão de administrador no Supabase

### Erro: "syntax error"
❌ Verifique se copiou TODO o conteúdo do arquivo SQL

---

## 🔍 VERIFICAÇÃO RÁPIDA

Execute esta query no SQL Editor para ver todas as tabelas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Você deve ver:
- ✅ org_charts
- ✅ org_chart_nodes
- ✅ planning_documents ← NOVA
- ✅ planning_lines ← NOVA
- ✅ processes
- ✅ users

---

## 📊 ESTRUTURA COMPLETA

```
planning_documents
├── id (UUID, PK)
├── name (TEXT)
├── description (TEXT)
├── start_date (DATE)
├── end_date (DATE)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

planning_lines
├── id (SERIAL, PK)
├── document_id (UUID, FK → planning_documents)
├── line_number (INTEGER)
├── task_name (TEXT)
├── responsible (TEXT)
├── due_date (DATE)
├── status (TEXT: pending/in_progress/completed/cancelled)
├── notes (TEXT)
├── sort_order (INTEGER)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

---

## 💡 IMPORTANTE

- ✅ **RLS está habilitado** para segurança
- ✅ **Índices criados** para performance
- ✅ **Triggers configurados** para atualizar updated_at
- ✅ **Políticas de acesso** configuradas
- ✅ **Dados de exemplo** incluídos (opcional)

---

**Tempo total**: ~5 minutos

**Execute agora e me avise quando terminar!** 🚀

