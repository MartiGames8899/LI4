using CAP.Modules.Sports.Core.Domain;

namespace CAP.Modules.Sports.Core.DTOs;

public record CreateConvocationRequest(string Titulo, DateTime DataEvento, string Local, Guid EquipaId, List<Guid> AtletasIds);
public record UpdatePresenceRequest(Guid AtletaId, EstadoPresenca Presenca, string? Observacoes);
