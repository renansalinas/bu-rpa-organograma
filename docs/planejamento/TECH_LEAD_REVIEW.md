# 🔵 Tech Lead Review - Módulo Planejamento

> **Análise técnica**: Decisões de arquitetura, trade-offs e justificativas.

---

## 1. Análise da Especificação Original

### 1.1 Ambiguidades Identificadas e Resolvidas

#### ❌ Ambiguidade 1: IDs Incrementais
**Especificação original**: "ID gerado automaticamente"

**Decisão técnica**:
- ✅ **SERIAL do PostgreSQL** para IDs de linhas (inteiros incrementais)
- ✅ **IDs temporários negativos** no frontend (-1, -2, -3...)
- ✅ **Mapeamento** frontend → backend ao salvar

**Justificativa**:
- SERIAL é nativo do PostgreSQL, performático e confiável
- IDs negativos evitam conflitos com IDs reais
- Mapeamento permite edição otimista e rollback

---

#### ❌ Ambiguidade 2: Estratégia de Salvamento
**Especificação original**: Não especificada

**Decisão técnica**:
- ✅ **Salvamento explícito em batch** (não auto-save)
- ✅ **Uma requisição** para todas as mudanças
- ✅ **Transação atômica** no backend

**Justificativa**:
- Auto-save pode ser intrusivo em grids grandes
- Batch reduz número de requisições
- Transação garante consistência

---

#### ❌ Ambiguidade 3: Edição de Linhas
**Especificação original**: "Editar" sem detalhes

**Decisão técnica**:
- ✅ **Edição inline** (não modal)
- ✅ **Uma linha por vez** em edição
- ✅ **Modo explícito** (read-only ↔ edição)

**Justificativa**:
- Inline é mais rápido que modal
- Uma linha por vez evita confusão
- Modo explícito melhora UX

---

#### ❌ Ambiguidade 4: Validações
**Especificação original**: Não especificadas

**Decisão técnica**:
- ✅ **Zod no frontend** (opcional, mas recomendado)
- ✅ **Constraints no banco** (NOT NULL, CHECK)
- ✅ **Validação em duas camadas**

**Justificativa**:
- Frontend: feedback imediato
- Backend: segurança e integridade
- Duas camadas: defesa em profundidade

---

## 2. Decisões de Arquitetura

### 2.1 Estrutura de Pastas

**Decisão**: Seguir padrão do módulo Organograma

```
src/
  app/(dashboard)/planejamento/    # Rotas
  components/planejamento/          # Componentes
  lib/planejamento/                # Lógica de negócio
```

**Justificativa**:
- Consistência com código existente
- Fácil navegação
- Escalável para novos módulos

---

### 2.2 State Management

**Decisão**: useState local (não Redux/Zustand)

**Justificativa**:
- Escopo limitado (uma página)
- Complexidade não justifica lib externa
- Performance adequada com React 19

**Trade-off**:
- ❌ Se precisar compartilhar state entre páginas, refatorar
- ✅ Simplicidade e performance

---

### 2.3 IDs Temporários

**Decisão**: IDs negativos no frontend

**Implementação**:
```typescript
// Gerar próximo ID negativo
const nextTempId = Math.min(...lines.map(l => l.id), 0) - 1;

// Verificar se é novo
const isNew = line.id < 0;
```

**Justificativa**:
- Evita conflitos com IDs reais (sempre positivos)
- Fácil identificar linhas novas
- Mapeamento simples ao salvar

**Alternativa considerada**: UUIDs temporários
- ❌ Mais complexo
- ❌ Menos legível
- ✅ Mais robusto (mas desnecessário aqui)

---

### 2.4 Salvamento em Batch

**Decisão**: Uma requisição com insert/update/delete

**Estrutura**:
```typescript
{
  insert: PlanningLine[],  // Novas
  update: PlanningLine[],  // Modificadas
  delete: number[]         // IDs para deletar
}
```

**Justificativa**:
- Reduz latência (1 requisição vs N)
- Transação atômica no backend
- Rollback simples se falhar

**Alternativa considerada**: Múltiplas requisições
- ❌ Mais lento
- ❌ Risco de inconsistência
- ✅ Mais simples (mas pior UX)

---

### 2.5 Edição Inline

**Decisão**: Uma linha por vez em edição

**Estado**:
```typescript
const [editingLineId, setEditingLineId] = useState<number | null>(null);
```

**Justificativa**:
- UX clara (só uma linha editável)
- Menos confusão
- Performance melhor (menos re-renders)

**Alternativa considerada**: Múltiplas linhas
- ❌ UX confusa
- ❌ Mais complexo
- ✅ Mais flexível (mas desnecessário)

---

## 3. Comparativo: Organograma vs Planejamento

### 3.1 Similaridades

| Aspecto | Organograma | Planejamento |
|--------|-------------|--------------|
| Stack | Next.js 16, TypeScript, Supabase | ✅ Igual |
| Design System | Tailwind CSS 4, Radix UI | ✅ Igual |
| Autenticação | Usuário fixo | ✅ Igual |
| Estrutura | App Router, Server Actions | ✅ Igual |

### 3.2 Diferenças

| Aspecto | Organograma | Planejamento |
|--------|-------------|--------------|
| Visualização | React Flow (gráfico) | Grid (tabela) |
| Layout | Automático (Dagre) | Manual (linhas) |
| Complexidade | Alta (grafo) | Média (lista) |
| IDs | UUID (nós) | SERIAL (linhas) |
| Hierarquia | Árvore (parent_id) | Linear (sort_order) |

### 3.3 Aprendizados Aplicados

1. **IDs Temporários**: Conceito do Organograma adaptado para SERIAL
2. **Salvamento Batch**: Mesma estratégia
3. **Error Handling**: Mesmo padrão robusto
4. **Design System**: Reutilização total

---

## 4. UX/UI Decisions

### 4.1 Grid vs Modal

**Decisão**: Grid inline (não modal)

**Justificativa**:
- Contexto visual (vê todas as linhas)
- Mais rápido (sem abrir/fechar)
- Melhor para muitas linhas

**Trade-off**:
- ❌ Menos foco (distrações)
- ✅ Melhor para edição rápida

---

### 4.2 Feedback Visual

**Decisão**: Estados claros (editando, salvando, salvo)

**Implementação**:
- Linha em edição: borda azul, fundo cinza
- Salvando: spinner no botão
- Salvo: toast verde
- Erro: mensagem vermelha

**Justificativa**:
- UX profissional
- Reduz ansiedade do usuário
- Facilita debugging

---

### 4.3 Soft Delete

**Decisão**: Marcar para deletar (não remover imediatamente)

**Implementação**:
```typescript
// Marcar
line._isDeleted = true;

// Ao salvar
const toDelete = lines.filter(l => l._isDeleted).map(l => l.id);
```

**Justificativa**:
- Permite undo antes de salvar
- Visual claro (linha riscada)
- Consistente com padrão de apps profissionais

---

## 5. Estratégia de Testes

### 5.1 Testes Manuais (MVP)

**Cenários críticos**:
1. Criar novo planejamento
2. Adicionar/editar/deletar linhas
3. Salvar e verificar persistência
4. Validações (campos obrigatórios)
5. Edge cases (muitas linhas, linhas vazias)

**Justificativa**:
- MVP não justifica testes automatizados
- Testes manuais são suficientes
- Foco em entregar funcionalidade

---

### 5.2 Testes Automatizados (Futuro)

**Recomendação**:
- Unit tests: funções de transformação (prepareSavePayload)
- Integration tests: Server actions
- E2E tests: Fluxo completo (Playwright)

**Prioridade**: Baixa (pós-MVP)

---

## 6. Riscos e Mitigações

### 6.1 Risco: Performance com Muitas Linhas

**Mitigação**:
- Virtualização (react-window) se > 100 linhas
- Lazy loading de linhas
- Debounce em salvamento

**Probabilidade**: Média
**Impacto**: Alto
**Status**: Monitorar

---

### 6.2 Risco: Conflitos de IDs Temporários

**Mitigação**:
- IDs negativos sequenciais
- Validação antes de salvar
- Logs detalhados

**Probabilidade**: Baixa
**Impacto**: Médio
**Status**: Coberto

---

### 6.3 Risco: Perda de Dados

**Mitigação**:
- Validação antes de salvar
- Confirmação ao deletar
- Auto-save opcional (futuro)

**Probabilidade**: Baixa
**Impacto**: Alto
**Status**: Coberto

---

## 7. Métricas de Sucesso

### 7.1 Técnicas

- ✅ Zero erros de runtime
- ✅ Performance: < 100ms para operações locais
- ✅ Salvamento: < 2s para 100 linhas
- ✅ Cobertura: 100% dos critérios de aceite

### 7.2 UX

- ✅ Tempo para adicionar linha: < 3s
- ✅ Tempo para editar linha: < 2s
- ✅ Taxa de erro do usuário: < 5%

---

## 8. Roadmap Futuro

### Fase 2: Melhorias (1-2 meses)

- [ ] Templates de planejamento
- [ ] Exportação (PDF, Excel)
- [ ] Histórico de alterações
- [ ] Busca e filtros

### Fase 3: Colaboração (3-6 meses)

- [ ] Compartilhamento de planejamentos
- [ ] Comentários em linhas
- [ ] Notificações de mudanças

### Fase 4: Automação (6+ meses)

- [ ] Integração com calendário
- [ ] Lembretes automáticos
- [ ] Relatórios automáticos

---

## 9. Conclusão

### 9.1 Decisões Críticas

1. ✅ **IDs temporários negativos**: Simples e eficaz
2. ✅ **Salvamento em batch**: Performance e consistência
3. ✅ **Edição inline**: UX clara
4. ✅ **Soft delete**: Permite undo

### 9.2 Pontos Fortes

- Arquitetura consistente com Organograma
- Decisões técnicas bem fundamentadas
- Documentação completa
- Pronto para implementação

### 9.3 Pontos de Atenção

- Monitorar performance com muitas linhas
- Considerar virtualização se necessário
- Planejar testes automatizados (pós-MVP)

---

**Status**: 🟢 **APROVADO PARA DESENVOLVIMENTO**

**Próximo passo**: Entregar `PROMPT_DESENVOLVEDOR.md` ao desenvolvedor.

