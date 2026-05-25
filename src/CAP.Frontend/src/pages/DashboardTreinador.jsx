import React, { useState, useEffect } from 'react';
import { Users, FilePlus, Loader2 } from 'lucide-react';
import StatusIndicator from '../components/StatusIndicator';

export default function DashboardTreinador() {
  const [loading, setLoading] = useState(true);
  const [plantel, setPlantel] = useState([]);

  useEffect(() => {
    // Simulação de delay para demonstrar a UI de loading
    setTimeout(() => {
      setPlantel([
        { id: 1, nome: 'João Pedro', assiduidade: '95%', atestado: 'ok', quota: 'ok' },
        { id: 2, nome: 'Miguel Silva', assiduidade: '60%', atestado: 'warn', quota: 'ok' },
        { id: 3, nome: 'Rui Costa', assiduidade: '88%', atestado: 'ok', quota: 'danger' },
        { id: 4, nome: 'Bruno Alves', assiduidade: '100%', atestado: 'danger', quota: 'ok' },
        { id: 5, nome: 'Nuno Gomes', assiduidade: '98%', atestado: 'ok', quota: 'ok' },
        { id: 6, nome: 'Cristiano', assiduidade: '100%', atestado: 'ok', quota: 'ok' },
        { id: 7, nome: 'Pepe', assiduidade: '91%', atestado: 'ok', quota: 'ok' }
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Painel do Treinador</h1>
        <p>Visão geral do plantel e estado de aptidão dos atletas.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FilePlus size={18} /> Nova Convocatória
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <Users size={20} color="var(--color-primary)" />
          Resumo do Plantel
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Atleta</th>
              <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Assiduidade</th>
              <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Saúde (Atestado)</th>
              <th style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>Financeiro (Quotas)</th>
              <th style={{ padding: '16px 12px', color: 'var(--text-muted)', textAlign: 'right' }}>Aptidão Geral</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  <Loader2 className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} size={32} />
                  <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>A carregar dados do plantel...</p>
                </td>
              </tr>
            ) : (
              plantel.map(atleta => {
                const isInapto = atleta.atestado === 'danger' || atleta.quota === 'danger';
                
                return (
                  <tr key={atleta.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 12px', fontWeight: 500 }}>{atleta.nome}</td>
                    <td style={{ padding: '16px 12px' }}>{atleta.assiduidade}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <StatusIndicator status={atleta.atestado} label={atleta.atestado === 'ok' ? 'Válido' : (atleta.atestado === 'warn' ? 'A Expirar' : 'Inválido')} />
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <StatusIndicator status={atleta.quota} label={atleta.quota === 'ok' ? 'Regularizado' : 'Em Dívida'} />
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      {isInapto ? (
                        <StatusIndicator status="danger" label="Inapto" />
                      ) : (
                        <StatusIndicator status="ok" label="Apto a Convocar" />
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
