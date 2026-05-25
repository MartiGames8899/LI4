using CAP.Modules.Reports.Core.Domain;
using CAP.Shared.Domain;
using CAP.Shared.Events;
using MediatR;

namespace CAP.Modules.Reports.Core.Handlers;

public class ReportsUpdateHandler : INotificationHandler<QuotaPagaEvent>
{
    private readonly IRepository<ResumoFinanceiro> _financeiroRepository;

    public ReportsUpdateHandler(IRepository<ResumoFinanceiro> financeiroRepository)
    {
        _financeiroRepository = financeiroRepository;
    }

    public async Task Handle(QuotaPagaEvent notification, CancellationToken cancellationToken)
    {
        // Pega o resumo do ano atual
        var anoAtual = DateTime.UtcNow.Year;
        
        var resumos = await _financeiroRepository.GetAllAsync();
        var resumo = resumos.FirstOrDefault(r => r.Ano == anoAtual && r.Mes == DateTime.UtcNow.Month);

        if (resumo == null)
        {
            resumo = new ResumoFinanceiro
            {
                Ano = anoAtual,
                Mes = DateTime.UtcNow.Month,
                TotalRecebido = notification.Valor,
                TotalPendente = 0,
                NumeroPagamentos = 1
            };
            await _financeiroRepository.AddAsync(resumo);
        }
        else
        {
            resumo.TotalRecebido += notification.Valor;
            resumo.NumeroPagamentos++;
            await _financeiroRepository.UpdateAsync(resumo);
        }

        await _financeiroRepository.SaveChangesAsync();
    }
}
