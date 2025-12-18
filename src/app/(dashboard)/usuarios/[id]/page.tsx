'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Save, X } from 'lucide-react';
import { listUsers, updateUser } from '@/lib/auth/queries';
import type { User } from '@/lib/auth/types';

export default function EditUsuarioPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'master' | 'user'>('user');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const users = await listUsers();
        const foundUser = users.find(u => u.id === userId);
        if (foundUser) {
          setUser(foundUser);
          setName(foundUser.name);
          setEmail(foundUser.email);
          setRole(foundUser.role);
          setIsActive(foundUser.is_active !== false);
        } else {
          router.push('/usuarios');
        }
      } catch (error: any) {
        console.error('Erro ao carregar usuário:', error);
        alert(`Erro ao carregar usuário: ${error.message || 'Erro desconhecido'}`);
        router.push('/usuarios');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, router]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        id: userId,
        name: name.trim(),
        email: email.trim(),
        role,
        is_active: isActive,
      });
      router.refresh();
      alert('Usuário atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      alert(`Erro ao salvar usuário: ${error.message || 'Erro desconhecido'}`);
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

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Usuário não encontrado</h1>
        <Link href="/usuarios" className="btn-primary">Voltar para lista</Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-[#646c98]">
          <Link href="/usuarios" className="hover:text-[#1a1a1a] transition-colors">
            Usuários
          </Link>
          <span>/</span>
          <span className="text-[#1a1a1a]">{name || 'Carregando...'}</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/usuarios"
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

      <div className="bg-white rounded-xl shadow-sm border border-[#e8eaf2] p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Nome <span className="text-red-600">*</span>
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
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Perfil
            </label>
            <select
              className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent"
              value={role}
              onChange={(e) => setRole(e.target.value as 'master' | 'user')}
            >
              <option value="user">Usuário</option>
              <option value="master">Master</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent"
              value={isActive ? 'active' : 'inactive'}
              onChange={(e) => setIsActive(e.target.value === 'active')}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

