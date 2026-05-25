using CAP.Shared.Domain;

namespace CAP.Modules.Facilities.Core.Domain;

public enum TipoEspaco
{
    CampoRelvado,
    Pavilhao,
    Ginasio,
    Balneario
}

public class Espaco : Entity
{
    public string Nome { get; set; } = string.Empty;
    public TipoEspaco Tipo { get; set; }
    public int Capacidade { get; set; }
    public bool Ativo { get; set; } = true;
    public string? Observacoes { get; set; }
}

public class Reserva : Entity
{
    public Guid EspacoId { get; set; }
    public Espaco? Espaco { get; set; }
    public Guid RequisitanteId { get; set; } // Referência ao User (Treinador/Gerencia)
    public string Titulo { get; set; } = string.Empty;
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public bool IsManutencao { get; set; } = false;
}
