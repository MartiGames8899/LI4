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
        var result = teams.Select(t => new
        {
            t.Id,
            t.Nome,
            t.ModalidadeId,
            t.EscalaoId,
            t.TreinadorId,
            Atletas = t.Atletas?.Select(a => new { a.AtletaId }).ToList()
        });
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Gerencia")]
    public async Task<IActionResult> Create([FromBody] CreateTeamRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
            return BadRequest(new { message = "O nome da equipa é obrigatório." });

        var modalidades = await _modalidadeRepository.GetAllAsync();
        if (!modalidades.Any(m => m.Id == request.ModalidadeId))
            return BadRequest(new { message = "Modalidade inválida." });

        var escaloes = await _escalaoRepository.GetAllAsync();
        if (!escaloes.Any(e => e.Id == request.EscalaoId))
            return BadRequest(new { message = "Escalão inválido." });

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

    [HttpGet("modalidades")]
    public async Task<IActionResult> GetModalidades()
    {
        var modalidades = await _modalidadeRepository.GetAllAsync();
        return Ok(modalidades.Select(m => new { m.Id, m.Nome, m.Descricao }));
    }

    [HttpGet("escaloes")]
    public async Task<IActionResult> GetEscaloes()
    {
        var escaloes = await _escalaoRepository.GetAllAsync();
        return Ok(escaloes.Select(e => new { e.Id, e.Nome, e.IdadeMinima, e.IdadeMaxima }));
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
