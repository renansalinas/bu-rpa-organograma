'use server';

import { getOrgChartWithNodes, updateOrgChart, upsertNodes } from '@/lib/organograma/queries';
import type { UpsertNodePayload } from '@/lib/organograma/types';

export async function loadChart(chartId: string) {
  try {
    if (!chartId) {
      throw new Error('ID do organograma é obrigatório');
    }
    return await getOrgChartWithNodes(chartId);
  } catch (error: any) {
    console.error('Erro em loadChart:', error);
    const message = error?.message || 'Erro desconhecido ao carregar organograma';
    throw new Error(message);
  }
}

export async function saveChart(
  chartId: string,
  name: string,
  description: string | null,
  nodes: UpsertNodePayload[]
) {
  try {
    if (!chartId) {
      throw new Error('ID do organograma é obrigatório');
    }

    if (!name || !name.trim()) {
      throw new Error('Nome do organograma é obrigatório');
    }

    await updateOrgChart(chartId, {
      name: name.trim(),
      description: description?.trim() || null,
    });

    await upsertNodes(chartId, nodes);
  } catch (error: any) {
    console.error('Erro em saveChart:', error);
    const message = error?.message || 'Erro desconhecido ao salvar organograma';
    throw new Error(message);
  }
}
