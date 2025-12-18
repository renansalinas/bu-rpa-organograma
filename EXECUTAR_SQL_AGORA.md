# ✅ EXECUTE ESTE SQL AGORA - VERSÃO CORRIGIDA

## 🎯 PROBLEMA RESOLVIDO

O erro de sintaxe foi corrigido! Use o arquivo **SIMPLES** agora.

---

## 📋 PASSO A PASSO (3 minutos)

### 1. Abra o Supabase

Acesse: https://supabase.com

### 2. Entre no Projeto

Selecione: `uxgnxnaxkymfcfjrfbpq`

### 3. Abra o SQL Editor

Clique no ícone **</>** (SQL Editor) na lateral esquerda

### 4. Nova Query

Clique em **"New query"** ou no botão **"+"**

### 5. Copie o SQL Correto

Abra o arquivo: **`database/02_planejamento_SIMPLES.sql`**

### 6. Cole TODO o conteúdo

Cole no editor SQL do Supabase (Ctrl+A para selecionar tudo, Ctrl+V para colar)

### 7. Execute

Clique em **"Run"** ou pressione:
- **Mac**: `Cmd + Enter`
- **Windows**: `Ctrl + Enter`

### 8. Aguarde Sucesso

Você verá:
```
✅ Success. No rows returned
```

### 9. Verifique

Clique em **"Table Editor"** (ícone de tabela 📊) na lateral

Você deve ver:
- ✅ `planning_documents`
- ✅ `planning_lines`

---

## 🎨 VISUAL DO PROCESSO

```
1. Supabase.com
   ↓
2. Projeto: uxgnxnaxkymfcfjrfbpq
   ↓
3. SQL Editor (</>)
   ↓
4. New Query (+)
   ↓
5. [Cole o SQL de 02_planejamento_SIMPLES.sql]
   ↓
6. Run (Cmd+Enter)
   ↓
7. ✅ Success!
   ↓
8. Table Editor > Verificar tabelas
```

---

## ⚠️ IMPORTANTE

**USE ESTE ARQUIVO:**
```
✅ database/02_planejamento_SIMPLES.sql
```

**NÃO USE:**
```
❌ database/02_planejamento_tables.sql (tem sintaxe mais complexa)
❌ database/00_schema_completo.sql (pode dar conflito)
```

---

## 🧪 TESTE DEPOIS

1. Aguarde ~10 segundos
2. Abra https://core.yanksolutions.com.br
3. Hard refresh: `Cmd+Shift+R` (Mac) ou `Ctrl+Shift+R` (Windows)
4. Vá em **Planejamento**
5. Clique em **+ Novo Planejamento**
6. Preencha:
   - Nome: "Teste Final Definitivo"
   - Descrição: "Após correção do SQL"
7. Clique em **Salvar**
8. **DEVE FUNCIONAR!** 🎉

---

## ✅ O QUE FOI CORRIGIDO

### Erro Anterior:
```sql
CREATE POLICY IF NOT EXISTS "..." ← ERRO!
```

### Corrigido Para:
```sql
DROP POLICY IF EXISTS "..." ← Limpa primeiro
CREATE POLICY "..." ← Cria novo
```

---

## 📊 ESTRUTURA CRIADA

```
planning_documents (Tabela)
├── id: UUID
├── name: Texto obrigatório
├── description: Texto opcional
├── start_date: Data opcional
├── end_date: Data opcional
├── created_at: Timestamp
└── updated_at: Timestamp

planning_lines (Tabela)
├── id: Serial (auto-incremento)
├── document_id: UUID → planning_documents
├── line_number: Inteiro
├── task_name: Texto obrigatório
├── responsible: Texto opcional
├── due_date: Data opcional
├── status: pending/in_progress/completed/cancelled
├── notes: Texto opcional
├── sort_order: Inteiro
├── created_at: Timestamp
└── updated_at: Timestamp

+ Índices
+ Triggers
+ Políticas RLS
+ Dados de exemplo
```

---

## 💡 DICA

Se der **QUALQUER ERRO**, me mande a mensagem **COMPLETA** do erro.

Mas com este SQL SIMPLES, não deve dar erro! 😊

---

## ⏱️ TEMPO TOTAL

- Copiar SQL: 20 segundos
- Executar: 5 segundos
- Verificar: 10 segundos
- Testar: 1 minuto
- **TOTAL: ~2 minutos**

---

**ARQUIVO A USAR:**

📁 **`database/02_planejamento_SIMPLES.sql`**

**EXECUTE AGORA!** 🚀

