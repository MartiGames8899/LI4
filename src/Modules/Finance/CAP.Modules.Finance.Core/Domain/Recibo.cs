using CAP.Shared.Domain;

namespace CAP.Modules.Finance.Core.Domain;

public class Recibo : Entity
{
    public string NumeroRecibo { get; set; } = string.Empty; // ex: 2026/001
    public Guid PagamentoId { get; set; }
    public Pagamento? Pagamento { get; set; }
    public DateTime DataEmissao { get; set; } = DateTime.UtcNow;
    public decimal ValorTotal { get; set; }
}
