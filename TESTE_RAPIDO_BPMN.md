# ✅ Checklist Rápido de Teste - Salvamento BPMN

## 🎯 Objetivo
Validar que o bug de salvamento do BPMN foi completamente resolvido.

---

## 📋 Checklist de Teste (5 minutos)

### ✅ Teste 1: Salvamento Básico (2 min)

1. [ ] Abra o navegador e vá para a aplicação
2. [ ] Clique em **"Processos"** no menu
3. [ ] Clique em um processo existente
4. [ ] Faça uma alteração visível no diagrama (ex: adicionar um novo elemento)
5. [ ] Clique no botão **"💾 Salvar Alterações"** dentro do editor BPMN
6. [ ] Verifique se aparece um overlay de "Salvando diagrama BPMN..."
7. [ ] Aguarde aparecer: **"✅ Diagrama BPMN salvo e verificado com sucesso!"**
8. [ ] Clique em "OK" no alerta

**Resultado Esperado**: ✅ Alert de sucesso aparece

---

### ✅ Teste 2: Verificação de Persistência (1 min)

9. [ ] **Feche completamente o navegador** (não apenas a aba)
10. [ ] Abra o navegador novamente
11. [ ] Acesse a aplicação
12. [ ] Vá em **"Processos"** → clique no mesmo processo
13. [ ] **Verifique se a alteração que você fez está lá**

**Resultado Esperado**: ✅ A alteração foi mantida

---

### ✅ Teste 3: Console Debug (1 min)

14. [ ] Abra o Console do Navegador (F12 ou Cmd+Option+J no Mac)
15. [ ] Vá para a aba **"Console"**
16. [ ] Faça outra alteração no BPMN
17. [ ] Clique em **"💾 Salvar Alterações"**
18. [ ] Verifique se aparece a sequência de logs:
   - 🔄 Iniciando salvamento do BPMN...
   - ✅ Processo atualizado com sucesso
   - 🔍 Verificando persistência no banco...
   - ✅ Verificação confirmada

**Resultado Esperado**: ✅ Todos os logs aparecem na ordem correta

---

### ✅ Teste 4: Múltiplas Edições (1 min)

19. [ ] Faça uma alteração → Salve
20. [ ] Faça outra alteração → Salve
21. [ ] Faça mais uma alteração → Salve
22. [ ] Recarregue a página (F5)
23. [ ] Verifique se a **última alteração** está visível

**Resultado Esperado**: ✅ A última alteração foi mantida

---

## 🔍 Logs para Verificar

### No Console do Navegador (F12)
```
🔄 Iniciando salvamento do BPMN... {processId: "...", xmlLength: 1234}
✅ Processo atualizado com sucesso: {id: "...", xmlLength: 1234}
🔍 Verificando persistência no banco...
✅ Verificação confirmada: dados persistidos corretamente
```

### No Terminal onde o Next.js está rodando
```
🔄 [SERVER] Iniciando atualização do processo: {...}
✅ [SERVER] Processo atualizado com sucesso: {...}
```

---

## ❌ O que NÃO deve acontecer

- ❌ Página não deve recarregar automaticamente após salvar
- ❌ Não deve haver erro no console
- ❌ Alterações não devem desaparecer após F5
- ❌ Não deve mostrar "sucesso" se os dados não foram salvos

---

## 🆘 Se algo der errado

### Problema: Alert de sucesso aparece, mas alterações não foram salvas

**Verifique:**
1. Console do navegador - há algum erro em vermelho?
2. Terminal do Next.js - há erros do servidor?
3. Conexão com internet está OK?
4. Supabase está acessível?

**Ação:**
- Copie os logs do console e do terminal
- Verifique se o log diz: "✅ Verificação confirmada"
- Se não confirmar, o sistema vai mostrar erro (como esperado)

---

### Problema: Erro ao salvar

**Se aparecer erro**, isso é **ESPERADO** se houver problema de rede/banco.  
O sistema agora **detecta e avisa** quando não consegue salvar.

**Ação:**
1. Verifique sua conexão com internet
2. Tente novamente
3. Se persistir, verifique logs do servidor

---

## ✅ Critérios de Sucesso

O bug está resolvido se:

1. ✅ Alterações são salvas e **persistem após F5**
2. ✅ Logs confirmam: "✅ Verificação confirmada"
3. ✅ **Não há reload automático** da página
4. ✅ Overlay de "Salvando..." aparece e desaparece
5. ✅ Alert de "✅ salvo e verificado com sucesso" aparece

---

## 📊 Resultados

- **Teste 1 (Salvamento Básico)**: [ ] ✅ PASSOU  [ ] ❌ FALHOU
- **Teste 2 (Persistência)**: [ ] ✅ PASSOU  [ ] ❌ FALHOU
- **Teste 3 (Console Debug)**: [ ] ✅ PASSOU  [ ] ❌ FALHOU
- **Teste 4 (Múltiplas Edições)**: [ ] ✅ PASSOU  [ ] ❌ FALHOU

**Status Geral**: [ ] ✅ TUDO OK  [ ] ❌ HÁ PROBLEMAS

---

**Tempo Total de Teste**: ~5 minutos  
**Última Atualização**: 18/12/2025

