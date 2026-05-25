using CAP.Shared.Domain;

namespace CAP.Modules.Sports.Core.Domain;

public class OcorrenciaJogo : Entity
{
    public Guid JogoId { get; set; } // Pode ser ConvocatoriaId
    public Guid AtletaId { get; set; }
    
    public TipoOcorrencia Tipo { get; set; }
    public int Minuto { get; set; }
    public string Descricao { get; set; } = string.Empty;
}

public enum TipoOcorrencia
{
    Golo,
    CartaoAmarelo,
    CartaoVermelho,
    SubstituicaoEntrada,
    SubstituicaoSaida,
    IncidenteDisciplinar
}

public class AvaliacaoQualitativa : Entity
{
    public Guid AtletaId { get; set; }
    public Guid TreinadorId { get; set; }
    public Guid? TreinoId { get; set; }
    
    public DateTime DataAvaliacao { get; set; } = DateTime.UtcNow;
    
    // Escala de 1 a 5
    public int Empenho { get; set; }
    public int Tecnica { get; set; }
    public int Tatica { get; set; }
    
    public string Notas { get; set; } = string.Empty;
}
