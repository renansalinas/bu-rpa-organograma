'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, X } from 'lucide-react';
import { createUser } from '@/lib/auth/queries';

export default function NovoUsuarioPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'master' | 'user'>('user');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    setLoading(true);
    try {
      await createUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });
      alert('Usuário criado com sucesso!');
      router.push('/usuarios');
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      alert(`Erro ao criar usuário: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-[#646c98]">
          <Link href="/usuarios" className="hover:text-[#1a1a1a] transition-colors">
            Usuários
          </Link>
          <span>/</span>
          <span className="text-[#1a1a1a]">Novo Usuário</span>
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
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Salvando...' : 'Salvar'}
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
              placeholder="Nome completo"
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
              placeholder="email@exemplo.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
              Senha <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-[#d4d7e8] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c19b2] focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha inicial"
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
        </div>
      </div>
    </div>
  );
}

