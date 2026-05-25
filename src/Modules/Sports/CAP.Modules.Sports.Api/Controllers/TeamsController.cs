using CAP.Modules.Sports.Core.Domain;
using CAP.Modules.Sports.Core.DTOs;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Sports.Api.Controllers;

[ApiController]
[Route("api/sports/teams")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly IRepository<Equipa> _teamRepository;
    private readonly IRepository<Modalidade> _modalidadeRepository;
    private readonly IRepository<Escalao> _escalaoRepository;

    public TeamsController(
        IRepository<Equipa> teamRepository,
        IRepository<Modalidade> modalidadeRepository,
        IRepository<Escalao> escalaoRepository)
    {
        _teamRepository = teamRepository;
        _modalidadeRepository = modalidadeRepository;
        _escalaoRepository = escalaoRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var teams = await _teamRepository.GetAllAsync();
        return Ok(teams);
    }

    [HttpPost]
    [Authorize(Roles = "Gerencia")]
    public async Task<IActionResult> Create([FromBody] CreateTeamRequest request)
    {
        var team = new Equipa
        {
            Nome = request.Nome,
            ModalidadeId = request.ModalidadeId,
            EscalaoId = request.EscalaoId,
            TreinadorId = request.TreinadorId
        };

        await _teamRepository.AddAsync(team);
        await _teamRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = team.Id }, team);
    }

    [HttpPost("{id}/athletes")]
    [Authorize(Roles = "Gerencia,Secretaria")]
    public async Task<IActionResult> AssignAthlete(Guid id, [FromBody] AssignAthleteRequest request)
    {
        var team = await _teamRepository.GetByIdAsync(id);
        if (team == null) return NotFound("Equipa não encontrada");

        team.Atletas.Add(new AtletaEquipa { AtletaId = request.AtletaId, EquipaId = id });
        await _teamRepository.SaveChangesAsync();

        return Ok("Atleta associado com sucesso");
    }
}
