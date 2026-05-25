using CAP.Modules.Sports.Core.Domain;
using CAP.Modules.Sports.Core.DTOs;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Sports.Api.Controllers;

[ApiController]
[Route("api/sports/occurrences")]
[Authorize(Roles = "Treinador,Gerencia")]
public class OcorrenciasController : ControllerBase
{
    private readonly IRepository<OcorrenciaJogo> _ocorrenciaRepository;
    private readonly IRepository<AvaliacaoQualitativa> _avaliacaoRepository;

    public OcorrenciasController(IRepository<OcorrenciaJogo> ocorrenciaRepository, IRepository<AvaliacaoQualitativa> avaliacaoRepository)
    {
        _ocorrenciaRepository = ocorrenciaRepository;
        _avaliacaoRepository = avaliacaoRepository;
    }

    [HttpPost("match-event")]
    public async Task<IActionResult> CreateMatchEvent([FromBody] CreateOcorrenciaRequest request)
    {
        var ocorrencia = new OcorrenciaJogo
        {
            JogoId = request.JogoId,
            AtletaId = request.AtletaId,
            Tipo = request.Tipo,
            Minuto = request.Minuto,
            Descricao = request.Descricao
        };

        await _ocorrenciaRepository.AddAsync(ocorrencia);
        await _ocorrenciaRepository.SaveChangesAsync();

        return Ok(ocorrencia);
    }

    [HttpPost("evaluation")]
    public async Task<IActionResult> CreateEvaluation([FromBody] CreateAvaliacaoRequest request)
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var treinadorId)) return Unauthorized();

        var avaliacao = new AvaliacaoQualitativa
        {
            AtletaId = request.AtletaId,
            TreinadorId = treinadorId,
            TreinoId = request.TreinoId,
            Empenho = request.Empenho,
            Tecnica = request.Tecnica,
            Tatica = request.Tatica,
            Notas = request.Notas
        };

        await _avaliacaoRepository.AddAsync(avaliacao);
        await _avaliacaoRepository.SaveChangesAsync();

        return Ok(avaliacao);
    }
}
