using CAP.Shared.Domain;

namespace CAP.Modules.Finance.Core.Domain;

public class QuotaDefinicao : Entity
{
    public string Nome { get; set; } = string.Empty; // ex: Quota Mensal Atleta
    public decimal Valor { get; set; }
    public string Descricao { get; set; } = string.Empty;
}
