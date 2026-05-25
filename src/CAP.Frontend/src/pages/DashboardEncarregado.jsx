import React, { useState } from 'react';
import StatusIndicator from '../components/StatusIndicator';
import PaymentModal from '../components/PaymentModal';

export default function DashboardEncarregado() {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedQuota, setSelectedQuota] = useState(null);

  // Mock data para apresentação visual premium baseada na arquitetura real
  const atletas = [
    { id: 1, nome: 'João Pedro', escalao: 'Sub-14', atestado: 'ok', validadeAtestado: '12/08/2027' },
    { id: 2, nome: 'Miguel Silva', escalao: 'Sub-10', atestado: 'warn', validadeAtestado: '15/06/2026' }
  ];

  const quotas = [
    { id: 101, atletaNome: 'João Pedro', mes: 'Maio 2026', valor: 25.00, estado: 'Pendente' },
    { id: 102, atletaNome: 'Miguel Silva', mes: 'Maio 2026', valor: 20.00, estado: 'Paga' }
  ];

  const handleOpenPayment = (quota) => {
    setSelectedQuota(quota);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (quotaId) => {
    setShowPayment(false);
    // Na vida real isto recarregaria da API, aqui atualizamos visualmente apenas para mock UI
    alert(`Pagamento processado e webhook enviado para a quota ${quotaId}!`);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Portal do Encarregado</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Painel de Atletas */}
        <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)' }}>
          <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            Meus Atletas (Saúde)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {atletas.map(atleta => (
              <div key={atleta.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{atleta.nome}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Equipa: {atleta.escalao}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StatusIndicator 
                    status={atleta.atestado} 
                    label={atleta.atestado === 'ok' ? 'Atestado Válido' : 'A Renovar'} 
                  />
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--color-text-muted)' }}>
                    Validade: {atleta.validadeAtestado}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Painel de Quotas */}
        <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)' }}>
          <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            Estado Financeiro (Maio)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {quotas.map(quota => (
              <div key={quota.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>{quota.atletaNome}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Quota: {quota.mes}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 600 }}>{quota.valor}€</span>
                  {quota.estado === 'Paga' ? (
                    <StatusIndicator status="ok" label="Paga" />
                  ) : (
                    <button className="btn btn-primary" onClick={() => handleOpenPayment(quota)}>
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPayment && selectedQuota && (
        <PaymentModal 
          quota={selectedQuota} 
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
