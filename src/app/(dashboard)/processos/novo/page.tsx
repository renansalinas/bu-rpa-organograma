'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, X } from 'lucide-react';
import { createProcess } from '@/lib/processos/queries';
import { emptyBpmnXml } from '@/lib/processos/bpmnTemplate';
import BpmnModelerComponent from '@/components/processos/BpmnModeler';

export default function NovoProcessoPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bpmnXml, setBpmnXml] = useState(emptyBpmnXml);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleSave = async () => {
    if (!name.trim()) {
      alert('Nome do processo é obrigatório');
      return;
    }
    
    setLoading(true);
    try {
      const process = await createProcess({
        name: name.trim(),
        description: description.trim() || undefined,
        bpmn_xml: bpmnXml
      });
      
      alert('Processo criado com sucesso!');
      router.push(`/processos/${process.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao criar processo:', error);
      alert(`Erro ao criar processo: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sm text-[#646c98]">
          <Link href="/processos" className="hover:text-[#1a1a1a] transition-colors">
            Processos
          </Link>
          <span>/</span>
          <span className="text-[#1a1a1a]">Novo Processo</span>
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
            onClick={handleSave} 
            className="flex items-center gap-2 px-4 py-2 bg-[#2c19b2] text-white rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors" 
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar'}
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
              placeholder="Ex: Processo de Aprovação"
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
              placeholder="Descreva o processo"
            />
          </div>
        </div>
      </div>
      
      {/* Editor BPMN */}
      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-[#e8eaf2] p-6 overflow-hidden">
        <BpmnModelerComponent
          initialXml={emptyBpmnXml}
          onSave={setBpmnXml}
        />
      </div>
    </div>
  );
}

