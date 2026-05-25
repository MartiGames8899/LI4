using CAP.Shared.Domain;

namespace CAP.Modules.Reports.Core.Domain;

public class ResumoFinanceiro : Entity
{
    public int Mes { get; set; }
    public int Ano { get; set; }
    public decimal TotalRecebido { get; set; }
    public decimal TotalPendente { get; set; }
    public int NumeroPagamentos { get; set; }
}

public class ResumoDesportivo : Entity
{
    public Guid EquipaId { get; set; }
    public string EquipaNome { get; set; } = string.Empty;
    public int NumeroAtletas { get; set; }
    public int NumeroConvocatorias { get; set; }
    public double MediaPresencas { get; set; }
}
