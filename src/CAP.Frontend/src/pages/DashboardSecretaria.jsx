import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import StatusIndicator from '../components/StatusIndicator';

export default function DashboardSecretaria() {
  const pendentes = [
    { id: 1, nome: 'Manuel Silva', tipo: 'Novo Registo', data: '2026-05-25' },
    { id: 2, nome: 'Equipa Sub-10', tipo: 'Renovação Seguro', data: '2026-05-24' }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard da Secretaria</h1>

      <div className="glass-panel" style={{ padding: '1.5rem', maxWidth: '800px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <ClipboardCheck size={20} color="var(--color-primary)" />
          Fila de Trabalho Pendente
        </h3>
        
        {pendentes.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Não existem tarefas pendentes.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendentes.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{item.nome}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{item.tipo} - Registado a {item.data}</span>
                </div>
                <div>
                  <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }}>Detalhes</button>
                  <button className="btn btn-primary" style={{ backgroundColor: 'var(--color-status-ok)' }}>Aprovar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
