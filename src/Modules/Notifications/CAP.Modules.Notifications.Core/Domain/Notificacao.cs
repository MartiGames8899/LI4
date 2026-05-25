using CAP.Shared.Domain;

namespace CAP.Modules.Notifications.Core.Domain;

public enum TipoNotificacao
{
    Sistema,
    Convocatoria,
    Financeira,
    Clinica
}

public enum CanalNotificacao
{
    Email,
    SMS,
    Push
}

public class Notificacao : Entity
{
    public Guid UtilizadorId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public bool Lida { get; set; } = false;
    public TipoNotificacao Tipo { get; set; }
}

public class NotificacaoPreferencia : Entity
{
    public Guid UtilizadorId { get; set; }
    public TipoNotificacao Tipo { get; set; }
    public CanalNotificacao Canal { get; set; }
    public bool Ativo { get; set; } = true;
}
