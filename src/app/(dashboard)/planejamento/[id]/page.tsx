'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Save, X, Plus } from 'lucide-react';
import { getPlanningDocumentWithLines, updatePlanningDocument, savePlanningLines } from '@/lib/planejamento/queries';
import type { PlanningDocumentWithLines, PlanningLineDraft } from '@/lib/planejamento/types';

export default function EditPlanejamentoPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  
  const [document, setDocument] = useState<PlanningDocumentWithLines | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<PlanningLineDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLineId, setEditingLineId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<PlanningLineDraft>>({});

  useEffect(() => {
    async function load() {
      try {
        const data = await getPlanningDocumentWithLines(documentId);
        setDocument(data);
        setName(data.name);
        setDescription(data.description || '');
        setLines(data.lines.map(l => ({ ...l, _isNew: false, _isModified: false, _isDeleted: false })));
      } catch (error: any) {
        console.error('Erro ao carregar planejamento:', error);
        alert(`Erro ao carregar planejamento: ${error.message || 'Erro desconhecido'}`);
        router.push('/planejamento');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [documentId, router]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Nome do planejamento é obrigatório');
      return;
    }

    setSaving(true);
    try {
      await updatePlanningDocument(documentId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      const toInsert = lines.filter(l => l.id < 0).map(({ id, _isNew, _isModified, _isDeleted, ...rest }) => rest);
      const toUpdate = lines.filter(l => l.id > 0 && l._isModified).map(({ _isNew, _isModified, _isDeleted, ...rest }) => rest as any);
      const toDelete = lines.filter(l => l.id > 0 && l._isDeleted).map(l => l.id);

      const updatedLines = await savePlanningLines(documentId, {
        insert: toInsert,
        update: toUpdate,
        delete: toDelete,
      });

      setLines(updatedLines.map(l => ({ ...l, _isNew: false, _isModified: false, _isDeleted: false })));
      router.refresh();
      alert('Planejamento salvo com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar planejamento:', error);
      alert(`Erro ao salvar planejamento: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLine = () => {
    const newId = Math.min(...lines.map(l => l.id), 0) - 1;
    const newLine: PlanningLineDraft = {
      id: newId,
      document_id: documentId,
      line_number: lines.length + 1,
      task_name: '',
      status: 'pending',
      sort_order: lines.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _isNew: true,
    };
    setLines([...lines, newLine]);
    setEditingLineId(newId);
    setEditingData(newLine);
  };

  const handleEditLine = (lineId: number) => {
    const line = lines.find(l => l.id === lineId);
    if (line) {
      setEditingData({ ...line });
      setEditingLineId(lineId);
    }
  };

  const handleSaveLine = (lineId: number) => {
    const updated = lines.map(line =>
      line.id === lineId
        ? { ...line, ...editingData, _isModified: line.id > 0, _isNew: line.id < 0 }
        : line
    );
    setLines(updated);
    setEditingLineId(null);
    setEditingData({});
  };

  const handleCancelEdit = () => {
    setEditingLineId(null);
    setEditingData({});
  };

  const handleDeleteLine = (lineId: number) => {
    if (lineId < 0) {
      setLines(lines.filter(l => l.id !== lineId));
    } else {
      setLines(lines.map(l => l.id === lineId ? { ...l, _isDeleted: true } : l));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-sm text-[#646c98]">Carregando...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Planejamento não encontrado</h1>
        <Link href="/planejamento" className="btn-primary">Voltar para lista</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-[#646c98]">
          <Link href="/planejamento" className="hover:text-[#1a1a1a] transition-colors">
            Planejamento
          </Link>
          <span>/</span>
          <span className="text-[#1a1a1a]">{name || 'Carregando...'}</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/planejamento"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#646c98] hover:text-[#1a1a1a] transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Link>
          <button 
            onClick={handleSave} 
            className="flex items-center gap-2 px-4 py-2 bg-[#2c19b2] text-white rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors" 
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e8eaf2] p-6 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Nome do Planejamento <span className="text-red-600">*</span>
            </label>
            <input
              className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Descrição
            </label>
            <input
              className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#e8eaf2] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">Linhas do Planejamento</h2>
          <button
            onClick={handleAddLine}
            className="flex items-center gap-2 px-4 py-2 bg-[#2c19b2] text-white rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Linha
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f6fa] border-b border-[#e8eaf2]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#646c98] uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#646c98] uppercase">Ação</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#646c98] uppercase">Responsável</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#646c98] uppercase">Prazo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#646c98] uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#646c98] uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8eaf2]">
              {lines.filter(l => !l._isDeleted).map((line) => (
                <tr key={line.id} className={editingLineId === line.id ? 'bg-[#f5f6fa]' : ''}>
                  {editingLineId === line.id ? (
                    <>
                      <td className="px-4 py-3">{line.line_number}</td>
                      <td className="px-4 py-3">
                        <input
                          value={editingData.task_name || ''}
                          onChange={(e) => setEditingData({ ...editingData, task_name: e.target.value })}
                          className="w-full px-2 py-1 border border-[#d4d7e8] rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={editingData.responsible || ''}
                          onChange={(e) => setEditingData({ ...editingData, responsible: e.target.value })}
                          className="w-full px-2 py-1 border border-[#d4d7e8] rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={editingData.due_date || ''}
                          onChange={(e) => setEditingData({ ...editingData, due_date: e.target.value })}
                          className="w-full px-2 py-1 border border-[#d4d7e8] rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editingData.status || 'pending'}
                          onChange={(e) => setEditingData({ ...editingData, status: e.target.value as any })}
                          className="w-full px-2 py-1 border border-[#d4d7e8] rounded text-sm"
                        >
                          <option value="pending">Pendente</option>
                          <option value="in_progress">Em Progresso</option>
                          <option value="completed">Concluído</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSaveLine(line.id)}
                            className="px-3 py-1 text-sm bg-[#2c19b2] text-white rounded hover:bg-[#230fb8]"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-sm bg-[#f5f6fa] text-[#646c98] rounded hover:bg-[#e8eaf2]"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm">{line.line_number}</td>
                      <td className="px-4 py-3 text-sm font-medium">{line.task_name}</td>
                      <td className="px-4 py-3 text-sm">{line.responsible || '-'}</td>
                      <td className="px-4 py-3 text-sm">{line.due_date ? new Date(line.due_date).toLocaleDateString('pt-BR') : '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          line.status === 'completed' ? 'bg-green-100 text-green-800' :
                          line.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          line.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {line.status === 'pending' ? 'Pendente' :
                           line.status === 'in_progress' ? 'Em Progresso' :
                           line.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditLine(line.id)}
                            className="px-3 py-1 text-sm text-[#2c19b2] hover:bg-[#f5f6fa] rounded"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteLine(line.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-[#f5f6fa] rounded"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

