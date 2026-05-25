namespace CAP.Modules.Facilities.Core.DTOs;

public record CreateReservationRequest(Guid EspacoId, string Titulo, DateTime DataInicio, DateTime DataFim, bool IsManutencao);
public record SpaceResponse(Guid Id, string Nome, string Tipo, int Capacidade);
public record ReservationResponse(Guid Id, string EspacoNome, string Titulo, DateTime DataInicio, DateTime DataFim, bool IsManutencao);
