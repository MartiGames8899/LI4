using CAP.Modules.Notifications.Core.Domain;
using CAP.Modules.Notifications.Core.DTOs;
using CAP.Modules.Notifications.Data.Context;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Notifications.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IRepository<Notificacao> _notificacaoRepository;
    private readonly IRepository<NotificacaoPreferencia> _preferenciaRepository;
    private readonly NotificationsDbContext _dbContext;

    public NotificationsController(
        IRepository<Notificacao> notificacaoRepository,
        IRepository<NotificacaoPreferencia> preferenciaRepository,
        NotificationsDbContext dbContext)
    {
        _notificacaoRepository = notificacaoRepository;
        _preferenciaRepository = preferenciaRepository;
        _dbContext = dbContext;
    }

    [HttpGet("inbox")]
    public async Task<IActionResult> GetInbox()
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var notifications = await _notificacaoRepository.GetAllAsync();
        var userNotifications = notifications
            .Where(n => n.UtilizadorId == userId)
            .OrderByDescending(n => n.DataCriacao)
            .Select(n => new NotificationResponse(n.Id, n.Titulo, n.Mensagem, n.DataCriacao, n.Lida, n.Tipo.ToString()));

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

    [HttpPost("send")]
    [Authorize(Roles = "Treinador,Secretaria,Gerencia")]
    public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
    {
        if (request.TargetUserIds == null || request.TargetUserIds.Length == 0)
            return BadRequest(new { message = "Indica pelo menos um destinatário." });

        foreach (var targetId in request.TargetUserIds.Distinct())
        {
            var notif = new Notificacao
            {
                UtilizadorId = targetId,
                Titulo = request.Titulo,
                Mensagem = request.Mensagem,
                Tipo = TipoNotificacao.Sistema,
                Lida = false,
                DataCriacao = DateTime.UtcNow
            };
            await _notificacaoRepository.AddAsync(notif);
        }
        await _notificacaoRepository.SaveChangesAsync();
        return Ok(new { message = $"Mensagem entregue a {request.TargetUserIds.Distinct().Count()} destinatário(s)." });
    }

    [HttpGet("groups")]
    [Authorize(Roles = "Treinador,Secretaria,Gerencia")]
    public async Task<IActionResult> GetGroups()
    {
        var grupos = await _dbContext.Grupos
            .Include(g => g.Membros)
            .OrderBy(g => g.Nome)
            .ToListAsync();

        var result = grupos.Select(g => new
        {
            g.Id,
            g.Nome,
            g.Descricao,
            g.DataCriacao,
            g.CriadorId,
            MembrosCount = g.Membros.Count,
            MembrosIds = g.Membros.Select(m => m.UtilizadorId).ToList()
        });

        return Ok(result);
    }

    [HttpGet("groups/{id}")]
    [Authorize(Roles = "Treinador,Secretaria,Gerencia")]
    public async Task<IActionResult> GetGroup(Guid id)
    {
        var grupo = await _dbContext.Grupos
            .Include(g => g.Membros)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (grupo == null) return NotFound(new { message = "Grupo não encontrado." });

        return Ok(new
        {
            grupo.Id,
            grupo.Nome,
            grupo.Descricao,
            grupo.DataCriacao,
            grupo.CriadorId,
            Membros = grupo.Membros.Select(m => new { m.UtilizadorId, m.DataAdicao }).ToList()
        });
    }

    [HttpPost("groups")]
    [Authorize(Roles = "Treinador,Secretaria,Gerencia")]
    public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
            return BadRequest(new { message = "O nome do grupo é obrigatório." });

        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

        var grupo = new GrupoNotificacao
        {
            Nome = request.Nome.Trim(),
            Descricao = request.Descricao,
            CriadorId = userId,
            DataCriacao = DateTime.UtcNow,
        };

        if (request.MembrosIds != null)
        {
            foreach (var memberId in request.MembrosIds.Distinct())
            {
                grupo.Membros.Add(new GrupoMembro
                {
                    UtilizadorId = memberId,
                    DataAdicao = DateTime.UtcNow,
                });
            }
        }

        _dbContext.Grupos.Add(grupo);
        await _dbContext.SaveChangesAsync();

        return Ok(new { grupo.Id, grupo.Nome, MembrosCount = grupo.Membros.Count });
    }

    [HttpPut("groups/{id}")]
    [Authorize(Roles = "Treinador,Secretaria,Gerencia")]
    public async Task<IActionResult> UpdateGroup(Guid id, [FromBody] UpdateGroupRequest request)
    {
        var grupo = await _dbContext.Grupos.FirstOrDefaultAsync(g => g.Id == id);
        if (grupo == null) return NotFound(new { message = "Grupo não encontrado." });

        if (!string.IsNullOrWhiteSpace(request.Nome)) grupo.Nome = request.Nome.Trim();
        grupo.Descricao = request.Descricao;

        await _dbContext.SaveChangesAsync();
        return Ok(new { grupo.Id, grupo.Nome, grupo.Descricao });
    }

    [HttpDelete("groups/{id}")]
    [Authorize(Roles = "Treinador,Secretaria,Gerencia")]
    public async Task<IActionResult> DeleteGroup(Guid id)
    {
        var grupo = await _dbContext.Grupos.FirstOrDefaultAsync(g => g.Id == id);
        if (grupo == null) return NotFound(new { message = "Grupo não encontrado." });

        _dbContext.Grupos.Remove(grupo);
        await _dbContext.SaveChangesAsync();
        return Ok(new { message = "Grupo eliminado." });
    }

    [HttpPost("groups/{id}/members")]
    [Authorize(Roles = "Treinador,Secretaria,Gerencia")]
    public async Task<IActionResult> AddMembers(Guid id, [FromBody] AddMembersRequest request)
    {
        var grupo = await _dbContext.Grupos
            .Include(g => g.Membros)
            .FirstOrDefaultAsync(g => g.Id == id);
        if (grupo == null) return NotFound(new { message = "Grupo não encontrado." });

        if (request.UtilizadoresIds == null || request.UtilizadoresIds.Length == 0)
            return BadRequest(new { message = "Indica pelo menos um utilizador." });

        var existentes = grupo.Membros.Select(m => m.UtilizadorId).ToHashSet();
        var novos = request.UtilizadoresIds.Distinct().Where(uid => !existentes.Contains(uid));

        foreach (var uid in novos)
        {
            grupo.Membros.Add(new GrupoMembro
            {
                GrupoId = id,
                UtilizadorId = uid,
                DataAdicao = DateTime.UtcNow,
            });
        }

        await _dbContext.SaveChangesAsync();
        return Ok(new { message = "Membros adicionados.", total = grupo.Membros.Count });
    }

    [HttpDelete("groups/{id}/members/{userId}")]
    [Authorize(Roles = "Treinador,Secretaria,Gerencia")]
    public async Task<IActionResult> RemoveMember(Guid id, Guid userId)
    {
        var membro = await _dbContext.GrupoMembros.FirstOrDefaultAsync(m => m.GrupoId == id && m.UtilizadorId == userId);
        if (membro == null) return NotFound(new { message = "Membro não encontrado neste grupo." });

        _dbContext.GrupoMembros.Remove(membro);
        await _dbContext.SaveChangesAsync();
        return Ok(new { message = "Membro removido." });
    }

    [HttpPost("send-to-group/{groupId}")]
    [Authorize(Roles = "Treinador,Secretaria,Gerencia")]
    public async Task<IActionResult> SendToGroup(Guid groupId, [FromBody] SendGroupMessageRequest request)
    {
        var grupo = await _dbContext.Grupos
            .Include(g => g.Membros)
            .FirstOrDefaultAsync(g => g.Id == groupId);
        if (grupo == null) return NotFound(new { message = "Grupo não encontrado." });

        if (grupo.Membros.Count == 0)
            return BadRequest(new { message = "Este grupo não tem membros." });

        if (string.IsNullOrWhiteSpace(request.Titulo) || string.IsNullOrWhiteSpace(request.Mensagem))
            return BadRequest(new { message = "Título e mensagem são obrigatórios." });

        foreach (var membro in grupo.Membros)
        {
            var notif = new Notificacao
            {
                UtilizadorId = membro.UtilizadorId,
                Titulo = request.Titulo,
                Mensagem = request.Mensagem,
                Tipo = TipoNotificacao.Sistema,
                Lida = false,
                DataCriacao = DateTime.UtcNow,
            };
            await _notificacaoRepository.AddAsync(notif);
        }
        await _notificacaoRepository.SaveChangesAsync();

        return Ok(new { message = $"Mensagem entregue a {grupo.Membros.Count} membro(s) do grupo '{grupo.Nome}'." });
    }
}

public record SendNotificationRequest(Guid[] TargetUserIds, string Titulo, string Mensagem);
public record CreateGroupRequest(string Nome, string? Descricao, Guid[]? MembrosIds);
public record UpdateGroupRequest(string? Nome, string? Descricao);
public record AddMembersRequest(Guid[] UtilizadoresIds);
public record SendGroupMessageRequest(string Titulo, string Mensagem);
