#!/bin/bash

# Script de verificação pré-deploy
# Uso: ./scripts/pre-deploy.sh

echo "🔍 Verificando pré-requisitos para deploy..."

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
  echo "❌ Arquivo .env.local não encontrado!"
  exit 1
fi

echo "✅ .env.local encontrado"

# Verificar variáveis essenciais
REQUIRED_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "EMAIL_HOST"
  "EMAIL_USER"
  "EMAIL_PASSWORD"
  "NEXT_PUBLIC_APP_URL"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${var}=" .env.local; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo "❌ Variáveis faltando no .env.local:"
  for var in "${MISSING_VARS[@]}"; do
    echo "   - $var"
  done
  exit 1
fi

echo "✅ Todas as variáveis essenciais encontradas"

# Testar build
echo "🔨 Testando build..."
if npm run build > /dev/null 2>&1; then
  echo "✅ Build bem-sucedido!"
else
  echo "❌ Build falhou! Verifique os erros acima."
  exit 1
fi

echo ""
echo "✅ Tudo pronto para deploy!"
echo "📝 Próximos passos:"
echo "   1. git add ."
echo "   2. git commit -m 'Deploy'"
echo "   3. git push"
echo "   4. Configure as variáveis de ambiente na Vercel"

