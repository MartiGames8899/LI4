using CAP.Shared.Domain;

namespace CAP.Modules.Finance.Core.Domain;

public enum MetodoPagamento
{
    Dinheiro,
    MBWay,
    Transferencia,
    Outro
}

public class Pagamento : Entity
{
    public Guid AtletaId { get; set; }
    public decimal Valor { get; set; }
    public DateTime DataPagamento { get; set; } = DateTime.UtcNow;
    public MetodoPagamento Metodo { get; set; }
    public string? Referencia { get; set; }
    
    // Um pagamento pode cobrir várias quotas (ex: pagar 3 meses de uma vez)
    public ICollection<Quota> QuotasLiquidadas { get; set; } = new List<Quota>();
}
