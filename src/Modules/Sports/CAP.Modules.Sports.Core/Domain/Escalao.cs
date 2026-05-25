using CAP.Shared.Domain;

namespace CAP.Modules.Sports.Core.Domain;

public class Escalao : Entity
{
    public string Nome { get; set; } = string.Empty; // ex: Sub-15
    public int IdadeMinima { get; set; }
    public int IdadeMaxima { get; set; }
}
