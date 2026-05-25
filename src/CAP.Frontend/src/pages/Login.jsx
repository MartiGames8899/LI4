import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Endpoint que foi desenvolvido no Monólito (AuthController)
      const response = await api.post('/users/auth/login', { email, password });
      
      const { token, role } = response.data;
      
      // Armazenar no browser
      localStorage.setItem('cap_jwt_token', token);
      localStorage.setItem('cap_user_role', role);

      // Redirecionamento baseado no papel
      if (role === 'Treinador') navigate('/dashboard/treinador');
      else if (role === 'Encarregado') navigate('/dashboard/encarregado');
      else if (role === 'Secretaria') navigate('/dashboard/secretaria');
      else navigate('/'); // Fallback
      
    } catch (err) {
      if (err.response?.status === 403) {
        // Bloqueio por excesso de tentativas (Lockout)
        setError("Conta temporariamente bloqueada devido a múltiplas tentativas falhadas. Tente novamente mais tarde.");
      } else {
        setError("Credenciais inválidas. Por favor, verifique o seu email e password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-panel login-card">
        <img src="/assets/logo.png" alt="CAP Logo" className="login-logo" />
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>Clube Amigos de Polvoreira</h2>
          <p style={{ color: 'var(--text-muted)' }}>Aceda à sua área reservada</p>
        </div>

        {error && (
          <div className="status-indicator status-danger" style={{ width: '100%', marginBottom: '24px', padding: '12px', borderRadius: '10px', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Palavra-passe</label>
            <input 
              id="password"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '16px', display: 'flex', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar no Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}
