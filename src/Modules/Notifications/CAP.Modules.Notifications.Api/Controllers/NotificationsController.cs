using CAP.Modules.Notifications.Core.Domain;
using CAP.Modules.Notifications.Core.DTOs;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Notifications.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IRepository<Notificacao> _notificacaoRepository;
    private readonly IRepository<NotificacaoPreferencia> _preferenciaRepository;

    public NotificationsController(
        IRepository<Notificacao> notificacaoRepository,
        IRepository<NotificacaoPreferencia> preferenciaRepository)
    {
        _notificacaoRepository = notificacaoRepository;
        _preferenciaRepository = preferenciaRepository;
    }

    [HttpGet("inbox")]
    public async Task<IActionResult> GetInbox()
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var notifications = await _notificacaoRepository.GetAllAsync();
        var userNotifications = notifications
            .Where(n => n.UtilizadorId == userId)
            .OrderByDescending(n => n.DataCriacao)
            .Select(n => new NotificationResponse(n.Id, n.Titulo, n.Mensagem, n.DataCriacao, n.Lida));

        return Ok(userNotifications);
    }

    [HttpPatch("inbox/{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var notification = await _notificacaoRepository.GetByIdAsync(id);
        if (notification == null) return NotFound();

        notification.Lida = true;
        await _notificacaoRepository.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdatePreferenceRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        
        if (!Enum.TryParse<TipoNotificacao>(request.Tipo, true, out var tipo) ||
            !Enum.TryParse<CanalNotificacao>(request.Canal, true, out var canal))
        {
            return BadRequest("Tipo ou Canal inválido");
        }

        var preferencias = await _preferenciaRepository.GetAllAsync();
        var pref = preferencias.FirstOrDefault(p => p.UtilizadorId == userId && p.Tipo == tipo && p.Canal == canal);

        if (pref == null)
        {
            pref = new NotificacaoPreferencia { UtilizadorId = userId, Tipo = tipo, Canal = canal, Ativo = request.Ativo };
            await _preferenciaRepository.AddAsync(pref);
        }
        else
        {
            pref.Ativo = request.Ativo;
        }

        await _preferenciaRepository.SaveChangesAsync();
        return Ok("Preferência atualizada");
    }
}
