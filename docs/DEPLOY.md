# 🚀 Guia de Deploy - Vercel

## Passo a Passo Simples

### 1️⃣ Fazer Commit e Push no Git

```bash
# Verificar o que mudou
git status

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Deploy: Sistema completo com autenticação e recuperação de senha"

# Enviar para o Git
git push
```

### 2️⃣ Configurar Variáveis de Ambiente na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione estas variáveis:

#### Variáveis Obrigatórias:

```
NEXT_PUBLIC_SUPABASE_URL
https://uxgnxnaxkymfcfjrfbpq.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
sua_anon_key_aqui

SUPABASE_SERVICE_ROLE_KEY
sua_service_role_key_aqui

EMAIL_HOST
smtp.office365.com

EMAIL_PORT
587

EMAIL_USER
robo@yanksolutions.com.br

EMAIL_PASSWORD
sua_senha_aqui

EMAIL_FROM
robo@yanksolutions.com.br

EMAIL_FROM_NAME
Yank Solutions - BU RPA

NEXT_PUBLIC_APP_URL
https://seu-projeto.vercel.app
```

**⚠️ IMPORTANTE:**
- Substitua `sua_anon_key_aqui` pela chave real do Supabase
- Substitua `sua_service_role_key_aqui` pela Service Role Key
- Substitua `sua_senha_aqui` pela senha do email
- Substitua `https://seu-projeto.vercel.app` pela URL real do seu projeto na Vercel

### 3️⃣ Deploy Automático

A Vercel faz deploy automaticamente quando você faz `git push`!

Após o push:
1. A Vercel detecta as mudanças
2. Faz build automaticamente
3. Deploy em alguns minutos

### 4️⃣ Verificar Deploy

1. Acesse o Dashboard da Vercel
2. Veja o status do deploy (deve aparecer "Building" → "Ready")
3. Clique no link do deploy para testar

### 5️⃣ Testar na URL de Produção

1. Acesse: `https://seu-projeto.vercel.app`
2. Teste o login
3. Teste a recuperação de senha
4. Verifique se tudo está funcionando

## 🔧 Troubleshooting

### Deploy falhou?

1. Verifique os logs na Vercel
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Verifique se o build local funciona: `npm run build`

### Erro de variáveis de ambiente?

- Certifique-se de adicionar TODAS as variáveis listadas acima
- Verifique se não há espaços extras nos valores
- Use o mesmo formato do `.env.local`

### Erro de build?

```bash
# Teste localmente primeiro
npm run build

# Se funcionar local, o problema pode ser variáveis de ambiente
```

## 📝 Checklist Pré-Deploy

- [ ] Todas as variáveis de ambiente configuradas na Vercel
- [ ] `NEXT_PUBLIC_APP_URL` aponta para a URL correta da Vercel
- [ ] Tabelas criadas no Supabase (execute os SQLs se necessário)
- [ ] Build local funciona (`npm run build`)
- [ ] Código commitado e pushado no Git

## 🎯 Comandos Rápidos

```bash
# Verificar status
git status

# Adicionar tudo
git add .

# Commit
git commit -m "Deploy"

# Push (deploy automático)
git push

# Verificar build local
npm run build
```

Pronto! 🎉

