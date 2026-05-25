using CAP.Shared.Events;
using CAP.Modules.Notifications.Core.Domain;
using CAP.Modules.Notifications.Core.Services;
using MediatR;

namespace CAP.Modules.Notifications.Core.Handlers;

public class ClinicalNotificationHandler : INotificationHandler<AthleteStatusChangedEvent>
{
    private readonly INotificationEngine _notificationEngine;

    public ClinicalNotificationHandler(INotificationEngine notificationEngine)
    {
        _notificationEngine = notificationEngine;
    }

    public async Task Handle(AthleteStatusChangedEvent notification, CancellationToken cancellationToken)
    {
        string titulo = notification.IsFit ? "Aptidão Clínica Atualizada" : "Aviso de Inaptidão Clínica";
        string mensagem = $"O estado clínico do atleta foi atualizado. Motivo: {notification.Reason}";

        await _notificationEngine.SendAsync(notification.AtletaId, titulo, mensagem, TipoNotificacao.Clinica);
    }
}
