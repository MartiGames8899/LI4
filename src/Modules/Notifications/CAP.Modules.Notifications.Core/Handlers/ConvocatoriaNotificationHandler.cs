using CAP.Shared.Events;
using CAP.Modules.Notifications.Core.Domain;
using CAP.Modules.Notifications.Core.Services;
using MediatR;

namespace CAP.Modules.Notifications.Core.Handlers;

public class ConvocatoriaNotificationHandler : INotificationHandler<ConvocatoriaPublicadaEvent>
{
    private readonly INotificationEngine _notificationEngine;

    public ConvocatoriaNotificationHandler(INotificationEngine notificationEngine)
    {
        _notificationEngine = notificationEngine;
    }

    public async Task Handle(ConvocatoriaPublicadaEvent notification, CancellationToken cancellationToken)
    {
        string titulo = "Nova Convocatória: " + notification.Titulo;
        string mensagem = "Foste convocado para um novo evento. Por favor, confirma a tua presença no dashboard.";

        foreach (var atletaId in notification.AtletasIds)
        {
            await _notificationEngine.SendAsync(atletaId, titulo, mensagem, TipoNotificacao.Convocatoria);
        }
    }
}
