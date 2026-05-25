using CAP.Shared.Domain;

namespace CAP.Modules.Sports.Core.Domain;

public class Convocatoria : Entity
{
    public string Titulo { get; set; } = string.Empty;
    public DateTime DataEvento { get; set; }
    public string Local { get; set; } = string.Empty;
    public Guid EquipaId { get; set; }
    public Equipa? Equipa { get; set; }
    public EstadoConvocatoria Estado { get; set; } = EstadoConvocatoria.Rascunho;
    
    public ICollection<Convite> Convites { get; set; } = new List<Convite>();
}
