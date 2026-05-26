using CAP.Modules.Finance.Core.Domain;
using CAP.Modules.Finance.Core.DTOs;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/quotas")]
[Authorize]
public class QuotasController : ControllerBase
{
    private readonly IRepository<QuotaDefinicao> _definicaoRepository;
    private readonly IRepository<Quota> _quotaRepository;

    public QuotasController(IRepository<QuotaDefinicao> definicaoRepository, IRepository<Quota> quotaRepository)
    {
        _definicaoRepository = definicaoRepository;
        _quotaRepository = quotaRepository;
    }

    [HttpPost("types")]
    [Authorize(Roles = "Gerencia")]
    public async Task<IActionResult> CreateType([FromBody] CreateQuotaTypeRequest request)
    {
        var definicao = new QuotaDefinicao
        {
            Nome = request.Nome,
            Valor = request.Valor,
            Descricao = request.Descricao
        };

        await _definicaoRepository.AddAsync(definicao);
        await _definicaoRepository.SaveChangesAsync();

        return Ok(definicao);
    }

    [HttpPost("assign")]
    [Authorize(Roles = "Secretaria,Gerencia")]
    public async Task<IActionResult> Assign([FromBody] AssignQuotaRequest request)
    {
        var definicao = await _definicaoRepository.GetByIdAsync(request.QuotaDefinicaoId);
        if (definicao == null) return NotFound("Tipo de quota não encontrado");

        var quota = new Quota
        {
            AtletaId = request.AtletaId,
            QuotaDefinicaoId = request.QuotaDefinicaoId,
            DataVencimento = request.DataVencimento,
            ValorTotal = definicao.Valor,
            ValorPago = 0,
            Estado = EstadoQuota.Pendente
        };

        await _quotaRepository.AddAsync(quota);
        await _quotaRepository.SaveChangesAsync();

        return Ok(quota);
    }

    [HttpGet]
    [Authorize(Roles = "Secretaria,Gerencia")]
    public async Task<IActionResult> GetAll()
    {
        var quotas = await _quotaRepository.GetAllAsync();
        return Ok(quotas);
    }

    [HttpGet("atraso")]
    [Authorize(Roles = "Secretaria,Gerencia")]
    public async Task<IActionResult> GetUnpaid()
    {
        var quotas = await _quotaRepository.GetAllAsync();
        var unpaid = quotas.Where(q => q.Estado != EstadoQuota.Paga && q.DataVencimento < DateTime.UtcNow);
        return Ok(unpaid);
    }

    [HttpGet("athlete/{atletaId}")]
    public async Task<IActionResult> GetByAthlete(Guid atletaId)
    {
        var quotas = await _quotaRepository.GetAllAsync();
        return Ok(quotas.Where(q => q.AtletaId == atletaId));
    }
}
