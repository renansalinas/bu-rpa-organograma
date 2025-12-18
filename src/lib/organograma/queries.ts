import { supabaseAdmin, authServiceUser } from "../supabaseClient";
import type { 
  OrgChart, 
  OrgChartNode, 
  OrgChartWithNodes,
  CreateOrgChartPayload,
  UpdateOrgChartPayload,
  UpsertNodePayload 
} from "./types";

// Autenticar antes de fazer queries (executar no servidor)
async function ensureAuth() {
  try {
    const result = await authServiceUser();
    if (!result) {
      console.warn('Autenticação retornou resultado vazio, continuando...');
    }
  } catch (error) {
    // Não lançar erro, apenas logar - pode ser que a autenticação não seja necessária
    console.warn('Aviso na autenticação (pode ser normal):', error);
  }
}

export async function listOrgCharts(): Promise<OrgChart[]> {
  try {
    await ensureAuth();
    
    const { data, error } = await supabaseAdmin
      .from("org_charts")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error('Erro ao listar organogramas:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro em listOrgCharts:', error);
    // Retornar array vazio em caso de erro para não quebrar a página
    return [];
  }
}

export async function getOrgChart(chartId: string): Promise<OrgChart | null> {
  try {
    await ensureAuth();
    
    const { data, error } = await supabaseAdmin
      .from("org_charts")
      .select("*")
      .eq("id", chartId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // não encontrado
      console.error('Erro ao buscar organograma:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Erro em getOrgChart:', error);
    return null;
  }
}

export async function getOrgChartWithNodes(chartId: string): Promise<OrgChartWithNodes | null> {
  try {
    await ensureAuth();
    
    const { data: chart, error: chartError } = await supabaseAdmin
      .from("org_charts")
      .select("*")
      .eq("id", chartId)
      .single();

    if (chartError) {
      if (chartError.code === 'PGRST116') return null;
      console.error('Erro ao buscar organograma:', chartError);
      throw chartError;
    }

    const { data: nodes, error: nodesError } = await supabaseAdmin
      .from("org_chart_nodes")
      .select("*")
      .eq("chart_id", chartId)
      .order("sort_order", { ascending: true });

    if (nodesError) {
      console.error('Erro ao buscar nós:', nodesError);
      throw nodesError;
    }

    return {
      ...chart,
      nodes: nodes || [],
    };
  } catch (error) {
    console.error('Erro em getOrgChartWithNodes:', error);
    return null;
  }
}

export async function createOrgChart(payload: CreateOrgChartPayload): Promise<OrgChart> {
  try {
    await ensureAuth();
    
    const { data, error } = await supabaseAdmin
      .from("org_charts")
      .insert({
        name: payload.name,
        description: payload.description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar organograma:', error);
      throw new Error(`Erro ao criar organograma: ${error.message || JSON.stringify(error)}`);
    }
    return data;
  } catch (error: any) {
    console.error('Erro em createOrgChart:', error);
    throw error instanceof Error ? error : new Error('Erro desconhecido ao criar organograma');
  }
}

export async function updateOrgChart(
  chartId: string,
  payload: UpdateOrgChartPayload
): Promise<OrgChart> {
  try {
    await ensureAuth();
    
    const { data, error } = await supabaseAdmin
      .from("org_charts")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chartId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar organograma:', error);
      throw new Error(`Erro ao atualizar organograma: ${error.message || JSON.stringify(error)}`);
    }
    return data;
  } catch (error: any) {
    console.error('Erro em updateOrgChart:', error);
    throw error instanceof Error ? error : new Error('Erro desconhecido ao atualizar organograma');
  }
}

export async function deleteOrgChart(chartId: string): Promise<void> {
  try {
    await ensureAuth();
    
    const { error } = await supabaseAdmin
      .from("org_charts")
      .delete()
      .eq("id", chartId);

    if (error) {
      console.error('Erro ao deletar organograma:', error);
      throw new Error(`Erro ao deletar organograma: ${error.message || JSON.stringify(error)}`);
    }
  } catch (error: any) {
    console.error('Erro em deleteOrgChart:', error);
    throw error instanceof Error ? error : new Error('Erro desconhecido ao deletar organograma');
  }
}

export async function upsertNodes(
  chartId: string,
  nodes: UpsertNodePayload[]
): Promise<OrgChartNode[]> {
  try {
    await ensureAuth();
    
    console.log('🔵 upsertNodes - Iniciando', { chartId, nodesCount: nodes.length });
    console.log('🔵 Nós recebidos:', nodes.map(n => ({ id: n.id, parent_id: n.parent_id, name: n.person_name })));
    
    // Primeiro, deletar todos os nós existentes do chart
    const { error: deleteError } = await supabaseAdmin
      .from("org_chart_nodes")
      .delete()
      .eq("chart_id", chartId);

    if (deleteError) {
      console.error('Erro ao deletar nós:', deleteError);
      throw new Error(`Erro ao deletar nós: ${deleteError.message || JSON.stringify(deleteError)}`);
    }

    // Se não há nós para inserir, retornar array vazio
    if (nodes.length === 0) {
      return [];
    }

    // Mapa de IDs antigos (frontend) para IDs novos (banco)
    const idMap = new Map<string, string>();
    const insertedNodes: OrgChartNode[] = [];
    
    // Separar raízes (sem parent) e filhos (com parent)
    const roots = nodes.filter(n => !n.parent_id);
    const children = nodes.filter(n => n.parent_id);
    
    console.log('🔵 Raízes:', roots.length, 'Filhos:', children.length);
    
    // 1. Inserir raízes primeiro (parent_id = null)
    for (const root of roots) {
      const nodeToInsert = {
        chart_id: chartId,
        parent_id: null,
        person_name: root.person_name,
        role: root.role,
        sort_order: root.sort_order,
      };
      
      console.log('🔵 Inserindo raiz:', { oldId: root.id, nodeToInsert });
      
      const { data: inserted, error } = await supabaseAdmin
        .from("org_chart_nodes")
        .insert(nodeToInsert)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao inserir nó raiz:', error, nodeToInsert);
        throw new Error(`Erro ao inserir nó raiz: ${error.message || JSON.stringify(error)}`);
      }
      
      if (!inserted) {
        throw new Error('Nó raiz inserido mas não retornado pelo banco');
      }
      
      console.log('✅ Raiz inserida:', { oldId: root.id, newId: inserted.id });
      
      // Mapear ID antigo para ID novo do banco
      if (root.id) {
        idMap.set(root.id, inserted.id);
        console.log('📝 Mapeamento:', root.id, '->', inserted.id);
      }
      
      insertedNodes.push(inserted);
    }
    
    console.log('🔵 ID Map após raízes:', Array.from(idMap.entries()));
    
    // 2. Inserir filhos nível por nível
    let remaining = [...children];
    let maxIterations = 100;
    let iteration = 0;
    
    while (remaining.length > 0 && maxIterations > 0) {
      iteration++;
      maxIterations--;
      const levelNodes: UpsertNodePayload[] = [];
      const nextRemaining: UpsertNodePayload[] = [];
      
      console.log(`🔵 Iteração ${iteration}, Restantes: ${remaining.length}`);
      
      // Separar nós que podem ser inseridos agora (parent já existe no banco)
      remaining.forEach(node => {
        if (node.parent_id && idMap.has(node.parent_id)) {
          levelNodes.push(node);
          console.log('✅ Nó pode ser inserido:', { id: node.id, parent_id: node.parent_id, mappedParent: idMap.get(node.parent_id) });
        } else {
          nextRemaining.push(node);
          console.log('⏳ Nó aguardando:', { id: node.id, parent_id: node.parent_id, parentExists: node.parent_id ? idMap.has(node.parent_id) : 'N/A' });
        }
      });
      
      // Se não há nós para inserir neste nível, pode haver referência inválida
      if (levelNodes.length === 0 && nextRemaining.length > 0) {
        console.warn('⚠️ Alguns nós têm parent_id inválido, inserindo como raiz:', nextRemaining);
        // Inserir os restantes como raízes para evitar erro
        levelNodes.push(...nextRemaining.map(n => ({ ...n, parent_id: null })));
        nextRemaining.length = 0;
      }
      
      // Inserir nós deste nível
      for (const node of levelNodes) {
        const mappedParentId = node.parent_id && idMap.has(node.parent_id)
          ? idMap.get(node.parent_id)!
          : null;
        
        const nodeToInsert = {
          chart_id: chartId,
          parent_id: mappedParentId,
          person_name: node.person_name,
          role: node.role,
          sort_order: node.sort_order,
        };
        
        console.log('🔵 Inserindo nó:', { oldId: node.id, oldParentId: node.parent_id, mappedParentId, nodeToInsert });
        
        const { data: inserted, error } = await supabaseAdmin
          .from("org_chart_nodes")
          .insert(nodeToInsert)
          .select()
          .single();
        
        if (error) {
          console.error('❌ Erro ao inserir nó:', error, nodeToInsert);
          console.error('❌ ID Map atual:', Array.from(idMap.entries()));
          throw new Error(`Erro ao inserir nó: ${error.message || JSON.stringify(error)}`);
        }
        
        if (!inserted) {
          throw new Error('Nó inserido mas não retornado pelo banco');
        }
        
        console.log('✅ Nó inserido:', { oldId: node.id, newId: inserted.id });
        
        // Mapear ID antigo para ID novo
        if (node.id) {
          idMap.set(node.id, inserted.id);
          console.log('📝 Novo mapeamento:', node.id, '->', inserted.id);
        }
        
        insertedNodes.push(inserted);
      }
      
      remaining = nextRemaining;
    }
    
    if (maxIterations === 0 && remaining.length > 0) {
      console.warn('⚠️ Atingido limite de iterações, alguns nós podem não ter sido inseridos:', remaining);
    }
    
    console.log('✅ upsertNodes - Concluído', { insertedCount: insertedNodes.length });
    
    return insertedNodes;
  } catch (error: any) {
    console.error('❌ Erro em upsertNodes:', error);
    throw error instanceof Error ? error : new Error('Erro desconhecido ao salvar nós');
  }
}

export async function getNodeCount(chartId: string): Promise<number> {
  try {
    await ensureAuth();
    
    const { count, error } = await supabaseAdmin
      .from("org_chart_nodes")
      .select("*", { count: "exact", head: true })
      .eq("chart_id", chartId);

    if (error) {
      console.error('Erro ao contar nós:', error);
      return 0; // Retornar 0 em caso de erro
    }
    return count || 0;
  } catch (error) {
    console.error('Erro em getNodeCount:', error);
    return 0;
  }
}
