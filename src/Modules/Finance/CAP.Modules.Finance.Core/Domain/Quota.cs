using CAP.Shared.Domain;

namespace CAP.Modules.Finance.Core.Domain;

public enum EstadoQuota
{
    Pendente,
    ParcialmentePaga,
    Paga,
    Anulada
}

public class Quota : Entity
{
    public Guid AtletaId { get; set; } // Referência ao Atleta (User)
    public Guid QuotaDefinicaoId { get; set; }
    public QuotaDefinicao? Definicao { get; set; }
    public DateTime DataVencimento { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal ValorPago { get; set; }
    public EstadoQuota Estado { get; set; } = EstadoQuota.Pendente;
    
    public decimal ValorRestante => ValorTotal - ValorPago;
}
