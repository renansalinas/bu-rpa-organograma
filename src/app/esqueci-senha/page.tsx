'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/auth/passwordReset';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const result = await requestPasswordReset(email);
      
      if (result.success) {
        setSuccess(true);
        setMessage(result.message || 'Email enviado com sucesso!');
      } else {
        setError(result.message || 'Erro ao enviar email. Verifique as configurações do servidor SMTP.');
      }
    } catch (err: any) {
      console.error('Erro ao processar solicitação:', err);
      setError(err.message || 'Erro ao processar solicitação. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-neutral-10 flex items-center justify-center p-4">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-[24px] font-bold mb-2">Email Enviado!</h1>
            <p className="text-neutral-60">
              Se o email <strong>{email}</strong> estiver cadastrado, você receberá 
              instruções para redefinir sua senha.
            </p>
          </div>
          
          <div className="bg-info/10 p-4 rounded-lg mb-6">
            <p className="text-sm text-neutral-70">
              📧 Verifique sua caixa de entrada e spam.<br/>
              O link expira em 1 hora.
            </p>
          </div>
          
          <Link href="/login" className="btn-primary w-full inline-block">
            Voltar para Login
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-10 flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="text-[24px] font-bold mb-2">Esqueci Minha Senha</h1>
          <p className="text-neutral-60">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error/10 text-error p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="input-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>
          
          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              Voltar para Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

