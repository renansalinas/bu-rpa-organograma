# 🚀 Deploy na Vercel - Passo a Passo Simples

## 📋 O que você precisa fazer:

### 1️⃣ Enviar código para o Git

Abra o terminal e execute:

```bash
# Ver o que mudou
git status

# Adicionar tudo
git add .

# Fazer commit
git commit -m "Deploy: Sistema completo"

# Enviar para o Git (isso vai fazer deploy automático na Vercel!)
git push
```

**Pronto!** A Vercel vai fazer o deploy automaticamente quando você fizer `git push` 🎉

---

### 2️⃣ Configurar Variáveis de Ambiente na Vercel

**IMPORTANTE:** Faça isso ANTES de testar!

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)
5. Adicione cada variável abaixo:

#### Copie e cole estas variáveis:

```
NEXT_PUBLIC_SUPABASE_URL
https://uxgnxnaxkymfcfjrfbpq.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
sb_publishable_L1Gn0Sx37T46LiwPWs8YeA_8oABnrUV

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Z254bmF4a3ltZmNmanJmYnBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjAwNjgyNCwiZXhwIjoyMDgxNTgyODI0fQ.GxzRakCkpq_nnDwh-6DEzopfmrZn7ZHjsx2bhqwwu1o

EMAIL_HOST
smtp.office365.com

EMAIL_PORT
587

EMAIL_USER
robo@yanksolutions.com.br

EMAIL_PASSWORD
Y@nkR2020

EMAIL_FROM
robo@yanksolutions.com.br

EMAIL_FROM_NAME
Yank Solutions - BU RPA

NEXT_PUBLIC_APP_URL
https://seu-projeto.vercel.app
```

**⚠️ ATENÇÃO:**
- No último item (`NEXT_PUBLIC_APP_URL`), substitua `seu-projeto.vercel.app` pela URL REAL do seu projeto na Vercel
- Você encontra a URL no dashboard da Vercel (exemplo: `bu-rpa-organograma.vercel.app`)

---

### 3️⃣ Aguardar o Deploy

1. Após fazer `git push`, vá para o dashboard da Vercel
2. Você verá um novo deploy sendo criado
3. Aguarde alguns minutos (geralmente 2-5 minutos)
4. Quando aparecer "Ready" ✅, está pronto!

---

### 4️⃣ Testar na URL de Produção

1. Clique no link do deploy na Vercel (ou acesse a URL do projeto)
2. Teste:
   - ✅ Login
   - ✅ Recuperação de senha
   - ✅ Módulos (Organograma, Processos)

---

## 🔧 Se algo der errado:

### Deploy falhou?
- Verifique os logs na Vercel (clique no deploy que falhou)
- Confirme que todas as variáveis de ambiente foram adicionadas

### Erro de variáveis?
- Verifique se copiou TODAS as variáveis
- Confirme que não há espaços extras nos valores

### Build local funciona mas deploy falha?
- Geralmente é problema de variáveis de ambiente
- Verifique se todas estão configuradas na Vercel

---

## ✅ Checklist Rápido:

- [ ] Código commitado e pushado (`git push`)
- [ ] Todas as variáveis de ambiente adicionadas na Vercel
- [ ] `NEXT_PUBLIC_APP_URL` configurada com a URL correta
- [ ] Deploy concluído (status "Ready")
- [ ] Testado na URL de produção

---

## 🎯 Comandos Rápidos (copie e cole):

```bash
git add .
git commit -m "Deploy: Sistema completo"
git push
```

**Pronto!** 🚀

