using CAP.Modules.Sports.Core.Domain;
using CAP.Modules.Sports.Core.DTOs;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Sports.Api.Controllers;

[ApiController]
[Route("api/sports/trainings")]
[Authorize]
public class TreinosController : ControllerBase
{
    private readonly IRepository<Treino> _treinoRepository;

    public TreinosController(IRepository<Treino> treinoRepository)
    {
        _treinoRepository = treinoRepository;
    }

    [HttpPost]
    [Authorize(Roles = "Treinador,Gerencia")]
    public async Task<IActionResult> Create([FromBody] CreateTreinoRequest request)
    {
        var treino = new Treino
        {
            EquipaId = request.EquipaId,
            DataInicio = request.DataInicio,
            DataFim = request.DataFim,
            EspacoId = request.EspacoId,
            Descricao = request.Descricao
        };

        foreach (var atletaId in request.AtletasIds)
        {
            treino.Presencas.Add(new PresencaTreino { AtletaId = atletaId, Estado = EstadoPresencaTreino.Pendente });
        }

        await _treinoRepository.AddAsync(treino);
        await _treinoRepository.SaveChangesAsync();

        return Ok(treino);
    }

    [HttpPost("{id}/attendance")]
    [Authorize(Roles = "Treinador")]
    public async Task<IActionResult> RecordAttendance(Guid id, [FromBody] List<UpdatePresencaRequest> requests)
    {
        var treino = await _treinoRepository.GetByIdAsync(id);
        if (treino == null) return NotFound("Treino não encontrado");

        foreach (var req in requests)
        {
            var presenca = treino.Presencas.FirstOrDefault(p => p.AtletaId == req.AtletaId);
            if (presenca != null)
            {
                presenca.Estado = req.Estado;
                presenca.Justificacao = req.Justificacao ?? string.Empty;
            }
        }

        await _treinoRepository.SaveChangesAsync();

        return Ok("Assiduidade registada com sucesso");
    }
}
