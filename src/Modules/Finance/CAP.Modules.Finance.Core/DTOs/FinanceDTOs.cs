namespace CAP.Modules.Finance.Core.DTOs;

public record CreateQuotaTypeRequest(string Nome, decimal Valor, string Descricao);
public record AssignQuotaRequest(Guid AtletaId, Guid QuotaDefinicaoId, DateTime DataVencimento);
public record RegisterPaymentRequest(Guid AtletaId, decimal Valor, List<Guid> QuotasIds, string Metodo, string? Referencia);
