'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { validateResetToken, resetPassword } from '@/lib/auth/passwordReset';

export default function ResetSenhaPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function checkToken() {
      const result = await validateResetToken(token);
      setTokenValid(result.valid);
      if (!result.valid) {
        setError(result.message || 'Token inválido');
      }
      setValidating(false);
    }
    checkToken();
  }, [token]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        alert('Senha redefinida com sucesso!');
        router.push('/login');
      } else {
        setError(result.message || 'Erro ao redefinir senha');
      }
    } catch (err) {
      setError('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };
  
  if (validating) {
    return (
      <div className="min-h-screen bg-neutral-10 flex items-center justify-center">
        <div className="card p-8">Validando token...</div>
      </div>
    );
  }
  
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-neutral-10 flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✗</span>
          </div>
          <h1 className="text-[24px] font-bold mb-2">Link Inválido</h1>
          <p className="text-neutral-60 mb-6">{error}</p>
          <button onClick={() => router.push('/esqueci-senha')} className="btn-primary w-full">
            Solicitar Novo Link
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-10 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="text-[24px] font-bold mb-2">Redefinir Senha</h1>
          <p className="text-neutral-60">Digite sua nova senha</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error/10 text-error p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Nova Senha</label>
            <input
              type="password"
              className="input-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Confirmar Senha</label>
            <input
              type="password"
              className="input-base"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}

