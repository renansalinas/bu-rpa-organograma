'use server';

import { createOrgChart, upsertNodes } from '@/lib/organograma/queries';
import type { UpsertNodePayload } from '@/lib/organograma/types';

export async function createNewChart(
  name: string,
  description: string | null,
  nodes: UpsertNodePayload[]
) {
  try {
    if (!name || !name.trim()) {
      throw new Error('Nome do organograma é obrigatório');
    }

    const chart = await createOrgChart({
      name: name.trim(),
      description: description?.trim() || null,
    });

    if (!chart || !chart.id) {
      throw new Error('Erro ao criar organograma: chart não foi criado');
    }

    if (nodes.length > 0) {
      await upsertNodes(chart.id, nodes);
    }

    return chart;
  } catch (error: any) {
    console.error('Erro em createNewChart:', error);
    const message = error?.message || 'Erro desconhecido ao criar organograma';
    throw new Error(message);
  }
}
