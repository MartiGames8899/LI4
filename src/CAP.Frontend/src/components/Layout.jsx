import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Users, Calendar, FileText } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('cap_user_role') || 'Convidado';

  const handleLogout = () => {
    localStorage.removeItem('cap_jwt_token');
    localStorage.removeItem('cap_user_role');
    navigate('/login');
  };

  const navItems = [
    { label: 'Início', path: `/dashboard/${role.toLowerCase()}`, icon: Home },
    // Apenas exemplos baseados em papéis
    ...(role === 'Treinador' ? [
      { label: 'Plantel', path: '/plantel', icon: Users },
      { label: 'Calendário', path: '/calendario', icon: Calendar }
    ] : []),
    ...(role === 'Encarregado' ? [
      { label: 'Faturas e Quotas', path: '/quotas', icon: FileText }
    ] : [])
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 0 }}>CAP</h2>
          <span className="status-badge ok" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            Portal {role}
          </span>
        </div>

        <nav style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'white' : 'var(--color-text-main)',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'background-color 0.2s'
                }}
              >
                <Icon size={18} />
                {item.label}
              </div>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', color: 'var(--color-status-danger)' }}
            onClick={handleLogout}
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Área Principal Dinâmica */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
