import { listUsers } from '@/lib/auth/queries';
import Link from 'next/link';
import { UserTable } from '@/components/usuarios/UserTable';
import { Plus } from 'lucide-react';
import type { User } from '@/lib/auth/types';

export default async function UsuariosPage() {
  let users: User[] = [];
  let errorLoading = false;

  try {
    users = await listUsers();
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    errorLoading = true;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[32px] font-bold text-[#1a1a1a]">Usuários</h1>
        <Link 
          href="/usuarios/novo" 
          className="flex items-center gap-2 bg-[#2c19b2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#230fb8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </Link>
      </div>
      
      {errorLoading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Erro ao carregar usuários!</strong>
          <span className="block sm:inline"> Por favor, tente novamente mais tarde.</span>
        </div>
      )}

      <UserTable users={users} />
    </div>
  );
}
