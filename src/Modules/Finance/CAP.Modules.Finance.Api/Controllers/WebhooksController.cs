using CAP.Modules.Finance.Core.Domain;
using CAP.Shared.Domain;
using CAP.Shared.Events;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Finance.Api.Controllers;

[ApiController]
[Route("api/finance/webhooks")]
public class WebhooksController : ControllerBase
{
    private readonly IRepository<Quota> _quotaRepository;
    private readonly IMediator _mediator;

    public WebhooksController(IRepository<Quota> quotaRepository, IMediator mediator)
    {
        _quotaRepository = quotaRepository;
        _mediator = mediator;
    }

    [HttpPost("easypay")]
    public async Task<IActionResult> EasypayWebhook([FromBody] EasypayWebhookPayload payload)
    {
        // Simulação de receção de um webhook da Easypay/Stripe
        // Na vida real verificaríamos a assinatura do webhook
        
        var quota = await _quotaRepository.GetByIdAsync(payload.QuotaId);
        if (quota == null) return NotFound();

        if (payload.Status == "paid")
        {
            quota.Estado = EstadoQuota.Paga;
            quota.ValorPago = quota.ValorTotal; // Simulação de pagamento integral

            await _quotaRepository.UpdateAsync(quota);
            await _quotaRepository.SaveChangesAsync();

            // Lançar um evento de domínio (PagamentoRealizadoEvent) se necessário
            await _mediator.Publish(new QuotaPagaEvent(quota.AtletaId, quota.ValorPago));
        }

        return Ok();
    }
}

public class EasypayWebhookPayload
{
    public Guid QuotaId { get; set; }
    public string Status { get; set; } = string.Empty; // "paid", "failed"
    public decimal Amount { get; set; }
}
