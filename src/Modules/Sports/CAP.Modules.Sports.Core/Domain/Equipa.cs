using CAP.Shared.Domain;

namespace CAP.Modules.Sports.Core.Domain;

public class Equipa : Entity
{
    public string Nome { get; set; } = string.Empty;
    public Guid ModalidadeId { get; set; }
    public Modalidade? Modalidade { get; set; }
    public Guid EscalaoId { get; set; }
    public Escalao? Escalao { get; set; }
    public Guid TreinadorId { get; set; } // Referência ao Treinador (User)
    
    public ICollection<AtletaEquipa> Atletas { get; set; } = new List<AtletaEquipa>();
}
