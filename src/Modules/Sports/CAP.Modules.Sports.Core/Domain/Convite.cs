using CAP.Shared.Domain;

namespace CAP.Modules.Sports.Core.Domain;

public class Convite : Entity
{
    public Guid ConvocatoriaId { get; set; }
    public Guid AtletaId { get; set; } // Referência ao Atleta (User)
    public EstadoPresenca Presenca { get; set; } = EstadoPresenca.Pendente;
    public string? Observacoes { get; set; }
}
