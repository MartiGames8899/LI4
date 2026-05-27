using CAP.Modules.Sports.Core.Domain;
using CAP.Modules.Sports.Core.DTOs;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CAP.Modules.Clinical.Core.Services;

using CAP.Shared.Events;
using MediatR;

namespace CAP.Modules.Sports.Api.Controllers;

[ApiController]
[Route("api/sports/convocations")]
[Authorize]
public class ConvocatoriasController : ControllerBase
{
    private readonly IRepository<Convocatoria> _convocatoriaRepository;
    private readonly IClinicalService _clinicalService;
    private readonly IMediator _mediator;

    public ConvocatoriasController(IRepository<Convocatoria> convocatoriaRepository, IClinicalService clinicalService, IMediator mediator)
    {
        _convocatoriaRepository = convocatoriaRepository;
        _clinicalService = clinicalService;
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Treinador,Gerencia")]
    public async Task<IActionResult> Create([FromBody] CreateConvocationRequest request)
    {
        var convocatoria = new Convocatoria
        {
            Titulo = request.Titulo,
            DataEvento = request.DataEvento,
            Local = request.Local,
            EquipaId = request.EquipaId,
            Estado = EstadoConvocatoria.Rascunho
        };

        foreach (var atletaId in request.AtletasIds)
        {
            var isFit = await _clinicalService.IsAthleteFitAsync(atletaId);
            if (!isFit)
                return BadRequest($"Atleta {atletaId} não está apto clinicamente (lesão ativa ou atestado expirado).");

            convocatoria.Convites.Add(new Convite { AtletaId = atletaId, Presenca = EstadoPresenca.Pendente });
        }

        await _convocatoriaRepository.AddAsync(convocatoria);
        await _convocatoriaRepository.SaveChangesAsync();

        return Ok(convocatoria);
    }

    [HttpPatch("{id}/publish")]
    [Authorize(Roles = "Treinador,Gerencia")]
    public async Task<IActionResult> Publish(Guid id)
    {
        var conv = await _convocatoriaRepository.GetByIdAsync(id);
        if (conv == null) return NotFound();

        conv.Estado = EstadoConvocatoria.Publicada;
        await _convocatoriaRepository.SaveChangesAsync();

        // Notificar atletas via MediatR
        await _mediator.Publish(new ConvocatoriaPublicadaEvent 
        { 
            ConvocatoriaId = conv.Id, 
            Titulo = conv.Titulo, 
            AtletasIds = conv.Convites.Select(c => c.AtletaId).ToList() 
        });

        return Ok("Convocatória publicada e atletas notificados");
    }

    [HttpPost("{id}/presence")]
    [Authorize(Roles = "Treinador")]
    public async Task<IActionResult> RecordPresence(Guid id, [FromBody] UpdatePresenceRequest request)
    {
        var conv = await _convocatoriaRepository.GetByIdAsync(id);
        if (conv == null) return NotFound("Convocatória não encontrada");

        var convite = conv.Convites.FirstOrDefault(c => c.AtletaId == request.AtletaId);
        if (convite == null) return NotFound("Atleta não encontrado nesta convocatória");

        convite.Presenca = request.Presenca;
        convite.Observacoes = request.Observacoes;

        await _convocatoriaRepository.SaveChangesAsync();

        return Ok("Presença registada com sucesso");
    }

    [HttpGet]
    [Authorize(Roles = "Treinador,Gerencia")]
    public async Task<IActionResult> GetAll()
    {
        var convs = await _convocatoriaRepository.GetAllAsync();
        var result = convs.Select(c => new
        {
            Id = c.Id,
            Titulo = c.Titulo,
            Tipo = "treino", // default fallback
            Data = c.DataEvento.ToString("yyyy-MM-dd"),
            Hora = c.DataEvento.ToString("HH:mm"),
            Local = c.Local,
            Status = c.Estado == EstadoConvocatoria.Rascunho ? "rascunho" : c.Estado == EstadoConvocatoria.Publicada ? "enviada" : "fechada",
            Respostas = new {
                Confirmados = c.Convites.Count(cv => cv.Presenca == EstadoPresenca.Confirmada),
                Recusados = c.Convites.Count(cv => cv.Presenca == EstadoPresenca.Ausente || cv.Presenca == EstadoPresenca.Justificada),
                Pendentes = c.Convites.Count(cv => cv.Presenca == EstadoPresenca.Pendente)
            },
            Atletas = c.Convites.Select(cv => new {
                Id = cv.AtletaId,
                Nome = "Atleta " + cv.AtletaId.ToString().Substring(0,4), // Mocked for simplicity
                Resposta = cv.Presenca == EstadoPresenca.Confirmada ? "confirmado" : cv.Presenca == EstadoPresenca.Pendente ? "pendente" : "recusado",
                Motivo = cv.Observacoes
            })
        });
        return Ok(result);
    }
    [HttpGet("my")]
    [Authorize(Roles = "Atleta")]
    public async Task<IActionResult> GetMyConvocations()
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var all = await _convocatoriaRepository.GetAllAsync();
        var myConvs = all.Where(c => c.Convites.Any(cv => cv.AtletaId == userId)).Select(c => {
            var myConvite = c.Convites.First(cv => cv.AtletaId == userId);
            string estado = myConvite.Presenca switch {
                EstadoPresenca.Confirmada => "confirmado",
                EstadoPresenca.Ausente => "recusado",
                EstadoPresenca.Justificada => "recusado",
                _ => "pendente"
            };

            return new {
                Id = c.Id,
                Titulo = c.Titulo,
                Tipo = "treino", // default fallback
                Data = c.DataEvento.ToString("yyyy-MM-dd"),
                Hora = c.DataEvento.ToString("HH:mm"),
                Local = c.Local,
                Adversario = "",
                Estado = estado
            };
        });
        
        return Ok(myConvs);
    }

    [HttpPatch("{id}/my-presence")]
    [Authorize(Roles = "Atleta")]
    public async Task<IActionResult> UpdateMyPresence(Guid id, [FromBody] UpdateMyPresenceRequest request)
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
        var userId = Guid.Parse(userIdStr);

        var conv = await _convocatoriaRepository.GetByIdAsync(id);
        if (conv == null) return NotFound("Convocatória não encontrada");

        var convite = conv.Convites.FirstOrDefault(c => c.AtletaId == userId);
        if (convite == null) return NotFound("Atleta não encontrado nesta convocatória");

        convite.Presenca = request.Estado == "confirmado" ? EstadoPresenca.Confirmada : EstadoPresenca.Ausente;

        await _convocatoriaRepository.SaveChangesAsync();

        return Ok(new { message = "Resposta registada com sucesso" });
    }

    [HttpGet("athlete/{atletaId}")]
    public async Task<IActionResult> GetByAthlete(Guid atletaId)
    {
        var convs = await _convocatoriaRepository.GetAllAsync();
        var athleteConvs = convs.Where(c => c.Convites.Any(convite => convite.AtletaId == atletaId)).ToList();
        return Ok(athleteConvs);
    }

    [HttpPatch("{id}")]
    [Authorize(Roles = "Treinador,Gerencia")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateConvocationRequest request)
    {
        var conv = await _convocatoriaRepository.GetByIdAsync(id);
        if (conv == null) return NotFound();

        conv.Titulo = request.Titulo;
        conv.DataEvento = request.DataEvento;
        conv.Local = request.Local;

        await _convocatoriaRepository.UpdateAsync(conv);
        await _convocatoriaRepository.SaveChangesAsync();

        return Ok(conv);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Treinador,Gerencia")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var conv = await _convocatoriaRepository.GetByIdAsync(id);
        if (conv == null) return NotFound();

        await _convocatoriaRepository.DeleteAsync(conv);
        await _convocatoriaRepository.SaveChangesAsync();

        return NoContent();
    }
}

public class UpdateMyPresenceRequest
{
    public string Estado { get; set; } = string.Empty;
}
