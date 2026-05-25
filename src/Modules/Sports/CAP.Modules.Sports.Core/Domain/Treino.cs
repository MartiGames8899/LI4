using CAP.Shared.Domain;

namespace CAP.Modules.Sports.Core.Domain;

public class Treino : Entity
{
    public Guid EquipaId { get; set; }
    public Equipa? Equipa { get; set; }
    
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public Guid EspacoId { get; set; }
    public string Descricao { get; set; } = string.Empty;

    public ICollection<PresencaTreino> Presencas { get; set; } = new List<PresencaTreino>();
}

public class PresencaTreino : Entity
{
    public Guid TreinoId { get; set; }
    public Guid AtletaId { get; set; }
    
    public EstadoPresencaTreino Estado { get; set; } = EstadoPresencaTreino.Pendente;
    public string Justificacao { get; set; } = string.Empty;
}

public enum EstadoPresencaTreino
{
    Pendente,
    Presente,
    FaltaJustificada,
    FaltaInjustificada,
    AusentePorLesao
}
