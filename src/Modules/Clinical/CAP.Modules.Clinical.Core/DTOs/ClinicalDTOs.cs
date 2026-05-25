namespace CAP.Modules.Clinical.Core.DTOs;

public record RegisterCertificateRequest(Guid AtletaId, DateTime DataEmissao, DateTime DataExpiracao, string MedicoResponsavel, string? Observacoes);
public record RegisterInjuryRequest(Guid AtletaId, string TipoLesao, DateTime DataOcorrencia, DateTime? DataRecuperacaoPrevista, string? Descricao);
