using CAP.Modules.Reports.Core.Domain;
using CAP.Modules.Reports.Core.DTOs;
using CAP.Modules.Reports.Core.Services;
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
    private readonly IExportService _exportService;
    private readonly ISaftService _saftService;

    public ReportsController(
        IRepository<ResumoFinanceiro> financeRepository,
        IRepository<ResumoDesportivo> sportsRepository,
        IExportService exportService,
        ISaftService saftService)
    {
        _financeRepository = financeRepository;
        _sportsRepository = sportsRepository;
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
    public IActionResult ExportPdf([FromQuery] string type)
    {
        var pdf = _exportService.GeneratePdfReport($"Relatório {type}", $"Conteúdo do relatório de {type} para o CAP.");
        return File(pdf, "application/pdf", $"relatorio_{type}_{DateTime.UtcNow:yyyyMMdd}.pdf");
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel()
    {
        var summaries = await _financeRepository.GetAllAsync();
        var excel = _exportService.GenerateExcelReport("Financeiro", summaries);
        return File(excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"financeiro_{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    [HttpGet("export/saft")]
    public IActionResult ExportSaft()
    {
        var year = DateTime.UtcNow.Year;
        var month = DateTime.UtcNow.Month;
        var xml = _saftService.GenerateSaftXml(year, month);
        return Content(xml, "application/xml");
    }
}
