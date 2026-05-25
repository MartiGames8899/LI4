using CAP.Shared.Domain;

namespace CAP.Modules.Clinical.Core.Domain;

public class AtestadoMedico : Entity
{
    public Guid AtletaId { get; set; } // Referência ao Atleta (User)
    public DateTime DataEmissao { get; set; }
    public DateTime DataExpiracao { get; set; }
    public string MedicoResponsavel { get; set; } = string.Empty;
    public string? Observacoes { get; set; }
    public string CaminhoFicheiro { get; set; } = string.Empty;
    public bool IsValid => DataExpiracao > DateTime.UtcNow;
}
