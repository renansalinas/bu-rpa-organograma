'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type BpmnModelerType from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

interface BpmnModelerComponentProps {
  initialXml: string;
  onSave: (xml: string) => void;
}

export default function BpmnModelerComponent({ initialXml, onSave }: BpmnModelerComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnModelerType | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 10;

  const initModeler = useCallback(async () => {
    if (initializedRef.current || !containerRef.current) {
      return;
    }

    initializedRef.current = true;
    setIsLoading(true);
    setError(null);
    let modelerInstance: BpmnModelerType | null = null;

    try {
      console.log('🚀 Inicializando BPMN Modeler...');
      
      const BpmnModelerModule = await import('bpmn-js/lib/Modeler');
      const BpmnModelerClass = BpmnModelerModule.default;
      
      if (!containerRef.current) {
        throw new Error('Container para BPMN Modeler não encontrado.');
      }

      console.log('📦 Criando instância do Modeler...');
      modelerInstance = new BpmnModelerClass({
        container: containerRef.current,
        keyboard: {
          bindTo: document
        }
      });

      modelerRef.current = modelerInstance;

      console.log('📄 Carregando XML inicial...');
      await modelerInstance.importXML(initialXml);

      console.log('✅ BPMN Modeler inicializado com sucesso');

      const eventBus = modelerInstance.get('eventBus') as any;
      const onChange = () => {
        setHasChanges(true);
      };
      eventBus.on('commandStack.changed', onChange);

      setIsLoading(false);
      setError(null);
      retryCountRef.current = 0;
    } catch (err: any) {
      console.error('❌ Erro ao inicializar BPMN:', err);
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        console.log(`🔄 Tentando novamente em 500ms (Tentativa ${retryCountRef.current}/${MAX_RETRIES})...`);
        initializedRef.current = false;
        setTimeout(initModeler, 500);
      } else {
        setError(err.message || 'Erro ao carregar editor BPMN após múltiplas tentativas.');
        setIsLoading(false);
      }
    }
  }, [initialXml]);

  useEffect(() => {
    initModeler();

    return () => {
      if (modelerRef.current) {
        try {
          const eventBus = modelerRef.current.get('eventBus') as any;
          eventBus.off('commandStack.changed');
          modelerRef.current.destroy();
        } catch (e) {
          console.warn('⚠️ Erro ao destruir modeler:', e);
        }
        modelerRef.current = null;
      }
      initializedRef.current = false;
      retryCountRef.current = 0;
    };
  }, [initModeler]);

  const handleSave = async () => {
    if (!modelerRef.current) return;

    try {
      const { xml } = await modelerRef.current.saveXML({ format: true });
      if (xml) {
        onSave(xml);
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Erro ao salvar BPMN:', err);
      alert('Erro ao salvar diagrama BPMN');
    }
  };

  const handleZoomIn = () => {
    (modelerRef.current?.get('zoomScroll') as any)?.stepZoom(1);
  };

  const handleZoomOut = () => {
    (modelerRef.current?.get('zoomScroll') as any)?.stepZoom(-1);
  };

  const handleZoomReset = () => {
    (modelerRef.current?.get('canvas') as any)?.zoom('fit-viewport');
  };

  return (
    <div className="relative flex flex-col h-full w-full">
      {error && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-20 p-4 rounded-lg">
          <div className="text-sm text-red-600 mb-4 text-center">{error}</div>
          <button
            onClick={() => {
              setError(null);
              initializedRef.current = false;
              initModeler();
            }}
            className="px-4 py-2 bg-[#2c19b2] text-white rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {isLoading && !error && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-20 p-4 rounded-lg">
          <div className="text-sm text-[#646c98] mb-2">Carregando editor BPMN...</div>
          <div className="w-8 h-8 border-4 border-[#2c19b2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-[#f5f6fa] rounded-lg z-10">
        <button 
          onClick={handleZoomIn} 
          disabled={isLoading || !!error || !modelerRef.current}
          className="px-3 py-1.5 text-sm font-medium text-[#646c98] hover:text-[#1a1a1a] hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          🔍+
        </button>
        <button 
          onClick={handleZoomOut} 
          disabled={isLoading || !!error || !modelerRef.current}
          className="px-3 py-1.5 text-sm font-medium text-[#646c98] hover:text-[#1a1a1a] hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          🔍-
        </button>
        <button 
          onClick={handleZoomReset} 
          disabled={isLoading || !!error || !modelerRef.current}
          className="px-3 py-1.5 text-sm font-medium text-[#646c98] hover:text-[#1a1a1a] hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ajustar à tela"
        >
          ⊡ Ajustar
        </button>
        <div className="flex-1" />
        {hasChanges && !isLoading && !error && (
          <button 
            onClick={handleSave} 
            className="px-4 py-1.5 bg-[#2c19b2] text-white rounded text-sm font-medium hover:bg-[#230fb8] transition-colors"
          >
            💾 Salvar Alterações
          </button>
        )}
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef} 
        className="flex-1 border border-[#e8eaf2] rounded-lg bg-white overflow-hidden"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}

