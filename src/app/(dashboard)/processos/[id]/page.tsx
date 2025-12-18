'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Save, X } from 'lucide-react';
import { getProcess, updateProcess } from '@/lib/processos/queries';
import BpmnModelerComponent from '@/components/processos/BpmnModeler';
import type { Process } from '@/lib/processos/types';

export default function EditProcessPage() {
  const router = useRouter();
  const params = useParams();
  const processId = params.id as string;
  
  const [process, setProcess] = useState<Process | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bpmnXml, setBpmnXml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProcess(processId);
        if (data) {
          setProcess(data);
          setName(data.name);
          setDescription(data.description || '');
          setBpmnXml(data.bpmn_xml);
        } else {
          router.push('/processos');
        }
      } catch (error: any) {
        console.error('Erro ao carregar processo:', error);
        alert(`Erro ao carregar processo: ${error.message || 'Erro desconhecido'}`);
        router.push('/processos');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [processId, router]);

  const handleSaveBpmn = async (xml: string) => {
    if (!processId || !name.trim()) {
      alert('Nome do processo é obrigatório');
      return;
    }

    setSaving(true);
    try {
      console.log('🔄 Iniciando salvamento do BPMN...', {
        processId,
        xmlLength: xml.length,
        timestamp: new Date().toISOString()
      });

      const updated = await updateProcess({
        id: processId,
        name: name.trim(),
        description: description.trim() || undefined,
        bpmn_xml: xml
      });

      console.log('✅ Processo atualizado com sucesso:', {
        id: updated.id,
        xmlLength: updated.bpmn_xml.length,
        updatedAt: updated.updated_at
      });

      // Verificação de integridade: confirmar que o XML foi salvo corretamente
      if (updated.bpmn_xml.length !== xml.length) {
        console.warn('⚠️ Tamanho do XML retornado difere do enviado!', {
          enviado: xml.length,
          recebido: updated.bpmn_xml.length
        });
      }

      // Verificação adicional: buscar o registro do banco para confirmar
      console.log('🔍 Verificando persistência no banco...');
      const verified = await getProcess(processId);
      
      if (verified && verified.bpmn_xml.length === xml.length) {
        console.log('✅ Verificação confirmada: dados persistidos corretamente');
      } else {
        console.error('❌ AVISO: Verificação falhou! Dados podem não ter sido salvos corretamente');
        throw new Error('Falha na verificação de persistência dos dados');
      }

      // Atualizar estado local com os dados confirmados do servidor
      setProcess(updated);
      setName(updated.name);
      setDescription(updated.description || '');
      setBpmnXml(updated.bpmn_xml);

      // Feedback visual de sucesso
      alert('✅ Diagrama BPMN salvo e verificado com sucesso!');
      
      // Revalidar apenas o necessário sem reload completo
      router.refresh();
      
    } catch (error: any) {
      console.error('❌ Erro ao salvar processo:', error);
      alert(`Erro ao salvar processo: ${error.message || 'Erro desconhecido'}`);
    } finally {
      // Sempre resetar o estado de salvamento
      setSaving(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!processId || !name.trim()) {
      alert('Nome do processo é obrigatório');
      return;
    }

    setSaving(true);
    try {
      await updateProcess({
        id: processId,
        name: name.trim(),
        description: description.trim() || undefined,
        bpmn_xml: bpmnXml
      });
      router.refresh();
      alert('Metadados salvos com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar processo:', error);
      alert(`Erro ao salvar processo: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-sm text-[#646c98]">Carregando...</div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Processo não encontrado</h1>
        <Link href="/processos" className="btn-primary">Voltar para lista de processos</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Loading Overlay durante salvamento */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#2c19b2] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-lg font-medium text-[#1a1a1a]">Salvando diagrama BPMN...</div>
            <div className="text-sm text-[#646c98]">Aguarde enquanto verificamos a persistência dos dados</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sm text-[#646c98]">
          <Link href="/processos" className="hover:text-[#1a1a1a] transition-colors">
            Processos
          </Link>
          <span>/</span>
          <span className="text-[#1a1a1a]">{name || 'Carregando...'}</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/processos"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#646c98] hover:text-[#1a1a1a] transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Link>
          <button 
            onClick={handleSaveMetadata} 
            className="flex items-center gap-2 px-4 py-2 bg-[#2c19b2] text-white rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors" 
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Metadados */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e8eaf2] p-6 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Nome do Processo <span className="text-red-600">*</span>
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

      {/* Editor BPMN */}
      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-[#e8eaf2] p-6 overflow-hidden">
        {bpmnXml && (
          <BpmnModelerComponent
            key={processId} // Key estável - não força re-render desnecessário
            initialXml={bpmnXml}
            onSave={handleSaveBpmn}
          />
        )}
      </div>
    </div>
  );
}

