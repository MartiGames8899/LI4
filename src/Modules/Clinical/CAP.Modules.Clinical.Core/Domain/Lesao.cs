using CAP.Shared.Domain;

namespace CAP.Modules.Clinical.Core.Domain;

public class Lesao : Entity
{
    public Guid AtletaId { get; set; }
    public string TipoLesao { get; set; } = string.Empty;
    public DateTime DataOcorrencia { get; set; }
    public DateTime? DataRecuperacaoPrevista { get; set; }
    public StatusLesao Status { get; set; } = StatusLesao.Ativa;
    public string? Descricao { get; set; }
}
