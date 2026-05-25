using CAP.Modules.Sports.Core.Domain;

namespace CAP.Modules.Sports.Core.DTOs;

public record CreateTeamRequest(string Nome, Guid ModalidadeId, Guid EscalaoId, Guid TreinadorId);
public record AssignAthleteRequest(Guid AtletaId);
public record ConvocatoriaResponse(Guid Id, Guid EquipaId, string Modalidade, string Escalao, DateTime DataInicio, string Adversario);

public record CreateTreinoRequest(Guid EquipaId, DateTime DataInicio, DateTime DataFim, Guid EspacoId, string Descricao, List<Guid> AtletasIds);
public record UpdatePresencaRequest(Guid AtletaId, EstadoPresencaTreino Estado, string? Justificacao);
public record CreateOcorrenciaRequest(Guid JogoId, Guid AtletaId, TipoOcorrencia Tipo, int Minuto, string Descricao);
public record CreateAvaliacaoRequest(Guid AtletaId, Guid? TreinoId, int Empenho, int Tecnica, int Tatica, string Notas);
