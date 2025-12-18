# 🔧 Configurar Variáveis de Ambiente na Vercel

## ❌ PROBLEMA ATUAL

Erro ao criar planejamento:
```
POST /planejamento/novo 500 (Internal Server Error)
```

**Causa**: Variável `SUPABASE_SERVICE_ROLE_KEY` não está configurada na Vercel!

---

## ✅ SOLUÇÃO: Configurar na Vercel

### Passo a Passo:

1. **Acesse** https://vercel.com
2. **Entre** no seu projeto `bu-rpa-organograma`
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)
5. **Adicione** as seguintes variáveis:

#### Variáveis Necessárias:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Z254bmF4a3ltZmNmanJmYnBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjAwNjgyNCwiZXhwIjoyMDgxNTgyODI0fQ.GxzRakCkpq_nnDwh-6DEzopfmrZn7ZHjsx2bhqwwu1o
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://uxgnxnaxkymfcfjrfbpq.supabase.co
```

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_L1Gn0Sx37T46LiwPWs8YeA_8oABnrUV
```

---

### Como Adicionar:

Para cada variável:

1. Clique em **Add New**
2. **Name**: Cole o nome (ex: `SUPABASE_SERVICE_ROLE_KEY`)
3. **Value**: Cole o valor correspondente
4. **Environments**: Selecione `Production`, `Preview` e `Development`
5. Clique em **Save**

---

### Depois de Adicionar:

1. Vá em **Deployments** (Implantações)
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **Redeploy**
4. Aguarde ~2 minutos

---

## 🧪 Como Testar

Após o redeploy:

1. Acesse a aplicação
2. Vá em **Planejamento**
3. Clique em **Novo Planejamento**
4. Preencha nome e descrição
5. Clique em **Salvar**
6. **Deve funcionar** ✅

---

## ❓ FAQ

**P: Por que funciona local mas não na Vercel?**  
R: Localmente você tem o arquivo `.env.local` com as variáveis. Na Vercel precisa configurar manualmente.

**P: Essas chaves são seguras de compartilhar?**  
R: A `ANON_KEY` sim, é pública. A `SERVICE_ROLE_KEY` é sensível mas está em ambiente controlado.

**P: Preciso fazer isso toda vez?**  
R: Não! Só precisa configurar uma vez. A Vercel guarda as variáveis.

---

## 🎯 Status

- ✅ Variáveis identificadas
- ⏳ Aguardando configuração na Vercel
- ⏳ Redeploy necessário

**Tempo total**: ~5 minutos

