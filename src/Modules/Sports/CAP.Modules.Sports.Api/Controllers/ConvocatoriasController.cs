using CAP.Modules.Sports.Core.Domain;
using CAP.Modules.Sports.Core.DTOs;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CAP.Modules.Clinical.Core.Services;

namespace CAP.Modules.Sports.Api.Controllers;

[ApiController]
[Route("api/sports/convocations")]
[Authorize]
public class ConvocatoriasController : ControllerBase
{
    private readonly IRepository<Convocatoria> _convocatoriaRepository;
    private readonly IClinicalService _clinicalService;

    public ConvocatoriasController(IRepository<Convocatoria> convocatoriaRepository, IClinicalService clinicalService)
    {
        _convocatoriaRepository = convocatoriaRepository;
        _clinicalService = clinicalService;
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
}
