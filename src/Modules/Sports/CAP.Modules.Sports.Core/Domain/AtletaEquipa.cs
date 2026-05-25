namespace CAP.Modules.Sports.Core.Domain;

public class AtletaEquipa
{
    public Guid AtletaId { get; set; } // Referência ao Atleta (User)
    public Guid EquipaId { get; set; }
    public Equipa? Equipa { get; set; }
    public DateTime DataInscricao { get; set; } = DateTime.UtcNow;
}
