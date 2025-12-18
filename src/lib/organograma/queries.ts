'use server';
import { supabase } from "../supabaseClient";
import type { 
  OrgChart, 
  OrgChartNode, 
  OrgChartWithNodes,
  CreateOrgChartPayload,
  UpdateOrgChartPayload,
  UpsertNodePayload 
} from "./types";

export async function listOrgCharts(): Promise<OrgChart[]> {
  try {
    const { data, error } = await supabase
      .from("org_charts")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro em listOrgCharts:', error);
    return [];
  }
}

export async function getOrgChart(chartId: string): Promise<OrgChart | null> {
  try {
    const { data, error } = await supabase
      .from("org_charts")
      .select("*")
      .eq("id", chartId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
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
    const { data: chart, error: chartError } = await supabase
      .from("org_charts")
      .select("*")
      .eq("id", chartId)
      .single();

    if (chartError) {
      if (chartError.code === 'PGRST116') return null;
      throw chartError;
    }

    const { data: nodes, error: nodesError } = await supabase
      .from("org_chart_nodes")
      .select("*")
      .eq("chart_id", chartId)
      .order("sort_order", { ascending: true });

    if (nodesError) throw nodesError;

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
    const { data, error } = await supabase
      .from("org_charts")
      .insert({
        name: payload.name,
        description: payload.description || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Erro em createOrgChart:', error);
    throw error;
  }
}

export async function updateOrgChart(
  chartId: string,
  payload: UpdateOrgChartPayload
): Promise<OrgChart> {
  try {
    const { data, error } = await supabase
      .from("org_charts")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chartId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Erro em updateOrgChart:', error);
    throw error;
  }
}

export async function deleteOrgChart(chartId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("org_charts")
      .delete()
      .eq("id", chartId);

    if (error) throw error;
  } catch (error: any) {
    console.error('Erro em deleteOrgChart:', error);
    throw error;
  }
}

export async function upsertNodes(
  chartId: string,
  nodes: UpsertNodePayload[]
): Promise<OrgChartNode[]> {
  try {
    // Deletar nós existentes
    const { error: deleteError } = await supabase
      .from("org_chart_nodes")
      .delete()
      .eq("chart_id", chartId);

    if (deleteError) throw deleteError;

    if (nodes.length === 0) return [];

    const idMap = new Map<string, string>();
    const insertedNodes: OrgChartNode[] = [];
    
    const roots = nodes.filter(n => !n.parent_id);
    const children = nodes.filter(n => n.parent_id);
    
    // Inserir raízes
    for (const root of roots) {
      const { data: inserted, error } = await supabase
        .from("org_chart_nodes")
        .insert({
          chart_id: chartId,
          parent_id: null,
          person_name: root.person_name,
          role: root.role,
          sort_order: root.sort_order,
          position_x: root.position_x ?? null,
          position_y: root.position_y ?? null,
        })
        .select()
        .single();
      
      if (error) throw error;
      if (!inserted) throw new Error('Nó não retornado');
      
      if (root.id) idMap.set(root.id, inserted.id);
      insertedNodes.push(inserted);
    }
    
    // Inserir filhos
    let remaining = [...children];
    let maxIterations = 100;
    
    while (remaining.length > 0 && maxIterations > 0) {
      maxIterations--;
      const levelNodes: UpsertNodePayload[] = [];
      const nextRemaining: UpsertNodePayload[] = [];
      
      remaining.forEach(node => {
        if (node.parent_id && idMap.has(node.parent_id)) {
          levelNodes.push(node);
        } else {
          nextRemaining.push(node);
        }
      });
      
      if (levelNodes.length === 0 && nextRemaining.length > 0) {
        levelNodes.push(...nextRemaining.map(n => ({ ...n, parent_id: null })));
        nextRemaining.length = 0;
      }
      
      for (const node of levelNodes) {
        const mappedParentId = node.parent_id && idMap.has(node.parent_id)
          ? idMap.get(node.parent_id)!
          : null;
        
        const { data: inserted, error } = await supabase
          .from("org_chart_nodes")
          .insert({
            chart_id: chartId,
            parent_id: mappedParentId,
            person_name: node.person_name,
            role: node.role,
            sort_order: node.sort_order,
            position_x: node.position_x ?? null,
            position_y: node.position_y ?? null,
          })
          .select()
          .single();
        
        if (error) throw error;
        if (!inserted) throw new Error('Nó não retornado');
        
        if (node.id) idMap.set(node.id, inserted.id);
        insertedNodes.push(inserted);
      }
      
      remaining = nextRemaining;
    }
    
    return insertedNodes;
  } catch (error: any) {
    console.error('Erro em upsertNodes:', error);
    throw error;
  }
}

export async function getNodeCount(chartId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("org_chart_nodes")
      .select("*", { count: "exact", head: true })
      .eq("chart_id", chartId);

    if (error) return 0;
    return count || 0;
  } catch (error) {
    console.error('Erro em getNodeCount:', error);
    return 0;
  }
}