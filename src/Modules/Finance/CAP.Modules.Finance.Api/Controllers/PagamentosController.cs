using CAP.Modules.Finance.Core.Domain;
using CAP.Modules.Finance.Core.DTOs;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/payments")]
[Authorize]
public class PagamentosController : ControllerBase
{
    private readonly IRepository<Pagamento> _paymentRepository;
    private readonly IRepository<Quota> _quotaRepository;
    private readonly IRepository<Recibo> _receiptRepository;

    public PagamentosController(
        IRepository<Pagamento> paymentRepository,
        IRepository<Quota> quotaRepository,
        IRepository<Recibo> receiptRepository)
    {
        _paymentRepository = paymentRepository;
        _quotaRepository = quotaRepository;
        _receiptRepository = receiptRepository;
    }

    [HttpPost]
    [Authorize(Roles = "Secretaria,Gerencia,Encarregado")]
    public async Task<IActionResult> Register([FromBody] RegisterPaymentRequest request)
    {
        if (!Enum.TryParse<MetodoPagamento>(request.Metodo, true, out var metodo))
            return BadRequest("Método de pagamento inválido");

        var pagamento = new Pagamento
        {
            AtletaId = request.AtletaId,
            Valor = request.Valor,
            Metodo = metodo,
            Referencia = request.Referencia
        };

        var valorDistribuir = request.Valor;

        foreach (var quotaId in request.QuotasIds)
        {
            if (valorDistribuir <= 0) break;

            var quota = await _quotaRepository.GetByIdAsync(quotaId);
            if (quota == null) continue;

            var valorAPagar = Math.Min(quota.ValorRestante, valorDistribuir);
            quota.ValorPago += valorAPagar;
            valorDistribuir -= valorAPagar;

            if (quota.ValorRestante == 0)
                quota.Estado = EstadoQuota.Paga;
            else
                quota.Estado = EstadoQuota.ParcialmentePaga;

            pagamento.QuotasLiquidadas.Add(quota);
        }

        await _paymentRepository.AddAsync(pagamento);
        await _paymentRepository.SaveChangesAsync();

        // Gerar Recibo (Simplificado)
        var recibo = new Recibo
        {
            PagamentoId = pagamento.Id,
            NumeroRecibo = $"{DateTime.UtcNow.Year}/{Guid.NewGuid().ToString().Substring(0, 5).ToUpper()}",
            ValorTotal = pagamento.Valor
        };

        await _receiptRepository.AddAsync(recibo);
        await _receiptRepository.SaveChangesAsync();

        return Ok(new { Pagamento = pagamento, Recibo = recibo });
    }

    [HttpGet]
    [Authorize(Roles = "Secretaria,Gerencia")]
    public async Task<IActionResult> GetAll()
    {
        var pagamentos = await _paymentRepository.GetAllAsync();
        return Ok(pagamentos);
    }

    [HttpGet("athlete/{atletaId}")]
    public async Task<IActionResult> GetByAthlete(Guid atletaId)
    {
        var pagamentos = await _paymentRepository.GetAllAsync();
        return Ok(pagamentos.Where(p => p.AtletaId == atletaId));
    }

    [HttpPost("generate")]
    [Authorize(Roles = "Secretaria,Gerencia,Encarregado")]
    public IActionResult GenerateReference([FromBody] GenerateReferenceRequest request)
    {
        var rng = new Random();
        if (request.Metodo == "MBWay")
        {
            return Ok(new { 
                Telefone = "91" + rng.Next(1000000, 9999999).ToString(), 
                Valor = request.Valor,
                Validade = DateTime.UtcNow.AddMinutes(5)
            });
        }
        else if (request.Metodo == "Multibanco")
        {
            return Ok(new {
                Entidade = "12345",
                Referencia = rng.Next(100000000, 999999999).ToString("D9"),
                Valor = request.Valor
            });
        }
        
        return BadRequest("Método não suportado para geração de referência.");
    }
}
