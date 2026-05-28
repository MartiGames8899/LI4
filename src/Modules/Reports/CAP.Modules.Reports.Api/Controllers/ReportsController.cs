using CAP.Modules.Finance.Core.Domain;
using CAP.Modules.Reports.Core.Domain;
using CAP.Modules.Reports.Core.DTOs;
using CAP.Modules.Reports.Core.Services;
using CAP.Modules.Users.Core.Domain;
using CAP.Modules.Users.Data.Repositories;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Reports.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "Gerencia,Secretaria")]
public class ReportsController : ControllerBase
{
    private readonly IRepository<ResumoFinanceiro> _financeRepository;
    private readonly IRepository<ResumoDesportivo> _sportsRepository;
    private readonly IRepository<Quota> _quotaRepository;
    private readonly IRepository<Pagamento> _pagamentoRepository;
    private readonly UserRepository _userRepository;
    private readonly IExportService _exportService;
    private readonly ISaftService _saftService;

    public ReportsController(
        IRepository<ResumoFinanceiro> financeRepository,
        IRepository<ResumoDesportivo> sportsRepository,
        IRepository<Quota> quotaRepository,
        IRepository<Pagamento> pagamentoRepository,
        UserRepository userRepository,
        IExportService exportService,
        ISaftService saftService)
    {
        _financeRepository = financeRepository;
        _sportsRepository = sportsRepository;
        _quotaRepository = quotaRepository;
        _pagamentoRepository = pagamentoRepository;
        _userRepository = userRepository;
        _exportService = exportService;
        _saftService = saftService;
    }

    [HttpGet("financial")]
    public async Task<IActionResult> GetFinancialSummary()
    {
        var summaries = await _financeRepository.GetAllAsync();
        return Ok(summaries);
    }

    [HttpGet("sports")]
    public async Task<IActionResult> GetSportsSummary()
    {
        var summaries = await _sportsRepository.GetAllAsync();
        return Ok(summaries);
    }

    [HttpGet("export/pdf")]
    public async Task<IActionResult> ExportPdf([FromQuery] string type)
    {
        try
        {
            var quotas = (await _quotaRepository.GetAllAsync()).ToList();
            var pagamentos = (await _pagamentoRepository.GetAllAsync()).ToList();
            var utilizadores = (await _userRepository.GetAllAsync()).ToList();
            var atletas = utilizadores.OfType<Atleta>().ToList();

            byte[] pdf;
            string filename;

            if (string.Equals(type, "financeiro", StringComparison.OrdinalIgnoreCase))
            {
                var totalQuotas = quotas.Sum(q => q.ValorTotal);
                var totalPago = quotas.Sum(q => q.ValorPago);
                var totalPendente = totalQuotas - totalPago;
                var quotasPagas = quotas.Count(q => q.Estado == EstadoQuota.Paga);
                var taxaCobranca = quotas.Count > 0 ? Math.Round((double)quotasPagas / quotas.Count * 100, 1) : 0;

                var stats = new List<(string, string)>
                {
                    ("Total de Quotas", quotas.Count.ToString()),
                    ("Quotas Pagas", quotasPagas.ToString()),
                    ("Valor Total Faturado", $"{totalQuotas:F2} €"),
                    ("Valor Recebido", $"{totalPago:F2} €"),
                    ("Valor Pendente", $"{totalPendente:F2} €"),
                    ("Taxa de Cobrança", $"{taxaCobranca}%"),
                    ("Total de Pagamentos", pagamentos.Count.ToString()),
                };

                var headers = new[] { "Data", "Valor", "Método", "Referência" };
                var rows = pagamentos
                    .OrderByDescending(p => p.DataPagamento)
                    .Take(50)
                    .Select(p => new[]
                    {
                        p.DataPagamento.ToString("dd/MM/yyyy"),
                        $"{p.Valor:F2} €",
                        p.Metodo.ToString(),
                        p.Referencia ?? "—"
                    })
                    .ToList();

                pdf = _exportService.GeneratePdfReport("Relatório Financeiro", stats, rows, headers);
                filename = $"relatorio_financeiro_{DateTime.UtcNow:yyyyMMdd}.pdf";
            }
            else
            {
                var totalSocios = utilizadores.Count;
                var totalAtletas = atletas.Count;
                var atletasAtivos = atletas.Count(a => a.Estado == "Ativo");

                var stats = new List<(string, string)>
                {
                    ("Total de Utilizadores", totalSocios.ToString()),
                    ("Total de Atletas", totalAtletas.ToString()),
                    ("Atletas Ativos", atletasAtivos.ToString()),
                    ("Total de Quotas", quotas.Count.ToString()),
                    ("Quotas Pagas", quotas.Count(q => q.Estado == EstadoQuota.Paga).ToString()),
                    ("Receita Total", $"{quotas.Sum(q => q.ValorPago):F2} €"),
                };

                pdf = _exportService.GeneratePdfReport("Relatório Geral do CAP", stats);
                filename = $"relatorio_geral_{DateTime.UtcNow:yyyyMMdd}.pdf";
            }

            return File(pdf, "application/pdf", filename);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao gerar PDF: {ex.Message}" });
        }
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel()
    {
        try
        {
            var quotas = (await _quotaRepository.GetAllAsync()).ToList();
            var data = quotas.Select(q => new
            {
                AtletaId = q.AtletaId,
                DataVencimento = q.DataVencimento.ToString("dd/MM/yyyy"),
                ValorTotal = q.ValorTotal,
                ValorPago = q.ValorPago,
                ValorRestante = q.ValorTotal - q.ValorPago,
                Estado = q.Estado.ToString()
            }).ToList();

            var excel = _exportService.GenerateExcelReport("Quotas", data);
            return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"financeiro_{DateTime.UtcNow:yyyyMMdd}.xlsx");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao gerar Excel: {ex.Message}" });
        }
    }

    [HttpGet("export/saft")]
    public IActionResult ExportSaft()
    {
        try
        {
            var year = DateTime.UtcNow.Year;
            var month = DateTime.UtcNow.Month;
            var xml = _saftService.GenerateSaftXml(year, month);
            var bytes = System.Text.Encoding.UTF8.GetBytes(xml);
            return File(bytes, "application/xml", $"saft_{year}_{month:D2}.xml");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao gerar SAF-T: {ex.Message}" });
        }
    }
}
