namespace CAP.Modules.Reports.Core.DTOs;

public record FinancialDashboardResponse(decimal TotalRecebido, decimal TotalPendente, int NumeroPagamentos);
public record SportsDashboardResponse(string EquipaNome, int NumeroAtletas, int NumeroConvocatorias, double MediaPresencas);
