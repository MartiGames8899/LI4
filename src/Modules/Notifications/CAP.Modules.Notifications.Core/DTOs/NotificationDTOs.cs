namespace CAP.Modules.Notifications.Core.DTOs;

public record UpdatePreferenceRequest(string Tipo, string Canal, bool Ativo);
public record NotificationResponse(Guid Id, string Titulo, string Mensagem, DateTime DataCriacao, bool Lida);
