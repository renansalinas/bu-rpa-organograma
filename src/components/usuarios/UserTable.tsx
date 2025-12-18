'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Key } from 'lucide-react';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import type { User } from '@/lib/auth/types';
import { deleteUser, resetPassword } from '@/lib/auth/queries';

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleResetPassword = async (id: string) => {
    setResettingId(id);
    setResetDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    try {
      await deleteUser(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      router.refresh();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir usuário');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmResetPassword = async () => {
    if (!resettingId || !newPassword.trim()) {
      alert('Preencha a nova senha');
      return;
    }
    
    setIsResetting(true);
    try {
      await resetPassword(resettingId, newPassword);
      setResetDialogOpen(false);
      setResettingId(null);
      setNewPassword('');
      alert('Senha resetada com sucesso!');
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      alert(`Erro ao resetar senha: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsResetting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#e8eaf2] p-12 text-center">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">
          Nenhum usuário cadastrado
        </h3>
        <p className="text-sm text-[#646c98]">
          Use o botão acima para criar o primeiro usuário.
        </p>
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
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#646c98] uppercase tracking-wider">
                Perfil
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#646c98] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#646c98] uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-[#646c98] uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8eaf2]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#f5f6fa] transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-[#1a1a1a]">
                  {user.name}
                </td>
                <td className="px-6 py-4 text-sm text-[#646c98]">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'master' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'master' ? 'Master' : 'Usuário'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.is_active === false 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.is_active === false ? 'Inativo' : 'Ativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[#646c98]">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/usuarios/${user.id}`}
                      className="p-2 text-[#646c98] hover:text-[#2c19b2] hover:bg-[#f5f6fa] rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="p-2 text-[#646c98] hover:text-[#2c19b2] hover:bg-[#f5f6fa] rounded transition-colors"
                      title="Resetar senha"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
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

      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-semibold text-[#1a1a1a] mb-2">
              Confirmar exclusão
            </Dialog.Title>
            <Dialog.Description className="text-sm text-[#646c98] mb-6">
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
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

      <Dialog.Root open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-lg font-semibold text-[#1a1a1a] mb-2">
              Resetar senha
            </Dialog.Title>
            <Dialog.Description className="text-sm text-[#646c98] mb-4">
              Digite a nova senha para este usuário:
            </Dialog.Description>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent mb-4"
              placeholder="Nova senha"
            />
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  className="px-4 py-2 text-sm font-medium text-[#646c98] hover:text-[#1a1a1a] transition-colors"
                  disabled={isResetting}
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={confirmResetPassword}
                disabled={isResetting || !newPassword.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2c19b2] rounded-lg hover:bg-[#230fb8] transition-colors disabled:opacity-50"
              >
                {isResetting ? 'Resetando...' : 'Resetar'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

