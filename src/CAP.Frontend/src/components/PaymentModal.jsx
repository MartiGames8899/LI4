import React, { useState } from 'react';
import { CreditCard, X, CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentModal({ quota, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = () => {
    setLoading(true);
    // Simula uma chamada ao webhook financeiro
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess(quota.id);
      }, 1500);
    }, 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-panel" style={{ width: '400px', padding: '2rem', backgroundColor: 'var(--color-surface)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={20} color="var(--color-text-muted)" />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle size={64} color="var(--color-status-ok)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--color-status-ok)' }}>Pagamento Concluído!</h3>
            <p>O recibo será enviado para o seu email.</p>
          </div>
        ) : (
          <>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={24} color="var(--color-primary)" />
              Pagamento de Quota
            </h3>
            
            <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Atleta</p>
              <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{quota.atletaNome}</p>
              
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Mês Referência</p>
              <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{quota.mes}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                <span style={{ fontWeight: 500 }}>Total a Pagar</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>{quota.valor}€</span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Pagamento Seguro'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
