using CAP.Modules.Notifications.Core.Domain;
using CAP.Shared.Domain;

namespace CAP.Modules.Notifications.Core.Services;

public interface INotificationEngine
{
    Task SendAsync(Guid utilizadorId, string titulo, string mensagem, TipoNotificacao tipo);
}

public class NotificationEngine : INotificationEngine
{
    private readonly IRepository<Notificacao> _notificacaoRepository;
    private readonly IRepository<NotificacaoPreferencia> _preferenciaRepository;
    private readonly IEmailSender _emailSender;

    public NotificationEngine(
        IRepository<Notificacao> notificacaoRepository,
        IRepository<NotificacaoPreferencia> preferenciaRepository,
        IEmailSender emailSender)
    {
        _notificacaoRepository = notificacaoRepository;
        _preferenciaRepository = preferenciaRepository;
        _emailSender = emailSender;
    }

    public async Task SendAsync(Guid utilizadorId, string titulo, string mensagem, TipoNotificacao tipo)
    {
        // 1. Persistir notificação no histórico (Inbox interno)
        var notificacao = new Notificacao
        {
            UtilizadorId = utilizadorId,
            Titulo = titulo,
            Mensagem = mensagem,
            Tipo = tipo
        };

        await _notificacaoRepository.AddAsync(notificacao);
        await _notificacaoRepository.SaveChangesAsync();

        // 2. Verificar preferências para canais externos (Email/Push)
        var preferencias = await _preferenciaRepository.GetAllAsync();
        var prefsUtilizador = preferencias.Where(p => p.UtilizadorId == utilizadorId && p.Tipo == tipo && p.Ativo);

        foreach (var pref in prefsUtilizador)
        {
            await DispatchExternalAsync(utilizadorId, titulo, mensagem, pref.Canal);
        }
    }

    private async Task DispatchExternalAsync(Guid utilizadorId, string titulo, string mensagem, CanalNotificacao canal)
    {
        if (canal == CanalNotificacao.Email)
        {
            await _emailSender.SendEmailToUserAsync(utilizadorId, titulo, mensagem);
        }
        else
        {
            // Simulação de outros canais (SMS, Push)
            Console.WriteLine($"[NotificationEngine] Enviando via {canal} para {utilizadorId}: {titulo}");
        }
    }
}
