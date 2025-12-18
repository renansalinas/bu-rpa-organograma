'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { PlanningDocument } from '@/lib/planejamento/types';
import { deletePlanningDocument } from '@/lib/planejamento/queries';

interface PlanningTableProps {
  documents: PlanningDocument[];
}

const ITEMS_PER_PAGE = 10;

export function PlanningTable({ documents }: PlanningTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    try {
      await deletePlanningDocument(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      router.refresh();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir planejamento');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDocs = documents.slice(startIndex, endIndex);

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#e8eaf2] p-12 text-center">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">
          Nenhum planejamento cadastrado
        </h3>
        <p className="text-sm text-[#646c98] mb-6">
          Comece criando seu primeiro planejamento.
        </p>
        <Link
          href="/planejamento/novo"
          className="inline-flex items-center gap-2 bg-[#2c19b2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Criar primeiro planejamento
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-[#e8eaf2] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f5f6fa] border-b border-[#e8eaf2]">
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#646c98] uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#646c98] uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#646c98] uppercase tracking-wider">
                Última atualização
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-[#646c98] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8eaf2]">
            {paginatedDocs.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-[#f5f6fa] transition-colors cursor-pointer"
                onClick={() => window.location.href = `/planejamento/${doc.id}`}
              >
                <td className="px-6 py-4 text-sm font-medium text-[#1a1a1a]">
                  {doc.name}
                </td>
                <td className="px-6 py-4 text-sm text-[#646c98]">
                  {doc.description || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-[#646c98]">
                  {formatDate(doc.updated_at)}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/planejamento/${doc.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-[#646c98] hover:text-[#2c19b2] hover:bg-[#f5f6fa] rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                      className="p-2 text-[#646c98] hover:text-[#dc2626] hover:bg-[#f5f6fa] rounded transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-[#646c98]">
            Mostrando {startIndex + 1} a {Math.min(endIndex, documents.length)} de {documents.length} planejamentos
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 text-[#646c98] hover:text-[#1a1a1a] hover:bg-[#f5f6fa] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[#646c98]">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-[#646c98] hover:text-[#1a1a1a] hover:bg-[#f5f6fa] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-semibold text-[#1a1a1a] mb-2">
              Confirmar exclusão
            </Dialog.Title>
            <Dialog.Description className="text-sm text-[#646c98] mb-6">
              Tem certeza que deseja excluir este planejamento? Esta ação não pode ser desfeita.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  className="px-4 py-2 text-sm font-medium text-[#646c98] hover:text-[#1a1a1a] transition-colors"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-[#dc2626] rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

