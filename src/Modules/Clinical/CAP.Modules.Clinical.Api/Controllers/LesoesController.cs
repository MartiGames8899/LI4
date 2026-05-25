using CAP.Modules.Clinical.Core.Domain;
using CAP.Modules.Clinical.Core.DTOs;
using CAP.Shared.Events;
using CAP.Shared.Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Clinical.Api.Controllers;

[ApiController]
[Route("api/clinical/injuries")]
[Authorize]
public class LesoesController : ControllerBase
{
    private readonly IRepository<Lesao> _lesaoRepository;
    private readonly IMediator _mediator;

    public LesoesController(IRepository<Lesao> lesaoRepository, IMediator mediator)
    {
        _lesaoRepository = lesaoRepository;
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Treinador,Gerencia")]
    public async Task<IActionResult> Register([FromBody] RegisterInjuryRequest request)
    {
        var lesao = new Lesao
        {
            AtletaId = request.AtletaId,
            TipoLesao = request.TipoLesao,
            DataOcorrencia = request.DataOcorrencia,
            DataRecuperacaoPrevista = request.DataRecuperacaoPrevista,
            Status = StatusLesao.Ativa,
            Descricao = request.Descricao
        };

        await _lesaoRepository.AddAsync(lesao);
        await _lesaoRepository.SaveChangesAsync();

        await _mediator.Publish(new AthleteStatusChangedEvent(lesao.AtletaId, false, $"Lesão Ativa: {lesao.TipoLesao}"));

        return Ok(lesao);
    }

    [HttpPatch("{id}/recover")]
    [Authorize(Roles = "Treinador,Gerencia")]
    public async Task<IActionResult> MarkRecovered(Guid id)
    {
        var lesao = await _lesaoRepository.GetByIdAsync(id);
        if (lesao == null) return NotFound();

        lesao.Status = StatusLesao.Recuperado;
        await _lesaoRepository.SaveChangesAsync();

        await _mediator.Publish(new AthleteStatusChangedEvent(lesao.AtletaId, true, "Recuperado de Lesão"));

        return Ok("Atleta marcado como recuperado");
    }
}
