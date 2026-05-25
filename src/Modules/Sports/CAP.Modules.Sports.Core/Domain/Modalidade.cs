using CAP.Shared.Domain;

namespace CAP.Modules.Sports.Core.Domain;

public class Modalidade : Entity
{
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public ICollection<Equipa> Equipas { get; set; } = new List<Equipa>();
}
