using CAP.Modules.Sports.Core.Domain;
using CAP.Modules.Sports.Core.DTOs;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Sports.Api.Controllers;

[ApiController]
[Route("api/sports/trainings")]
[Authorize]
public class TreinosController : ControllerBase
{
    private readonly IRepository<Treino> _treinoRepository;
    private readonly CAP.Modules.Sports.Data.Context.SportsDbContext _dbContext;

    public TreinosController(IRepository<Treino> treinoRepository, CAP.Modules.Sports.Data.Context.SportsDbContext dbContext)
    {
        _treinoRepository = treinoRepository;
        _dbContext = dbContext;
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
        var treino = await _dbContext.Treinos.Include(t => t.Presencas).FirstOrDefaultAsync(t => t.Id == id);
        if (treino == null) return NotFound("Treino não encontrado");

        foreach (var req in requests)
        {
            var presenca = treino.Presencas.FirstOrDefault(p => p.AtletaId == req.AtletaId);
            if (presenca != null)
            {
                presenca.Estado = req.Estado;
                presenca.Justificacao = req.Justificacao ?? string.Empty;
            }
            else
            {
                treino.Presencas.Add(new PresencaTreino { TreinoId = id, AtletaId = req.AtletaId, Estado = req.Estado, Justificacao = req.Justificacao ?? string.Empty });
            }
        }

        await _dbContext.SaveChangesAsync();

        return Ok("Assiduidade registada com sucesso");
    }

    [HttpGet]
    [Authorize(Roles = "Treinador,Gerencia,Atleta")]
    public async Task<IActionResult> GetAll()
    {
        var treinos = await _dbContext.Treinos.Include(t => t.Presencas).ToListAsync();
        return Ok(treinos);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Treinador,Gerencia,Atleta")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var treino = await _dbContext.Treinos.Include(t => t.Presencas).FirstOrDefaultAsync(t => t.Id == id);
        if (treino == null) return NotFound();
        return Ok(treino);
    }

    [HttpGet("athlete/{atletaId}")]
    public async Task<IActionResult> GetByAthlete(Guid atletaId)
    {
        var treinos = await _dbContext.Treinos.Include(t => t.Presencas).ToListAsync();
        var athleteTreinos = treinos.Where(t => t.Presencas.Any(p => p.AtletaId == atletaId)).ToList();
        return Ok(athleteTreinos);
    }
}
