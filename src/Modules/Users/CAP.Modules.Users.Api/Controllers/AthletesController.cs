using CAP.Modules.Users.Core.Domain;
using CAP.Modules.Users.Data.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace CAP.Modules.Users.Api.Controllers;

[ApiController]
[Route("api/users/athletes")]
[Authorize]
public class AthletesController : ControllerBase
{
    private readonly UserRepository _userRepository;
    private readonly CAP.Modules.Clinical.Data.Context.ClinicalDbContext _clinicalDb;
    private readonly CAP.Modules.Sports.Data.Context.SportsDbContext _sportsDb;

    public AthletesController(
        UserRepository userRepository,
        CAP.Modules.Clinical.Data.Context.ClinicalDbContext clinicalDb,
        CAP.Modules.Sports.Data.Context.SportsDbContext sportsDb)
    {
        _userRepository = userRepository;
        _clinicalDb = clinicalDb;
        _sportsDb = sportsDb;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userRepository.GetAllAsync();
        var atletas = users.OfType<Atleta>().ToList();
        
        var hoje = DateTime.UtcNow;

        var result = atletas.Select(a => {
            var atestado = _clinicalDb.Atestados
                .Where(at => at.AtletaId == a.Id)
                .OrderByDescending(at => at.DataExpiracao)
                .FirstOrDefault();
            
            var atestadoValido = atestado != null && atestado.DataExpiracao >= hoje;

            // Media de presencas
            var presencasAtleta = _sportsDb.PresencasTreino
                .Where(p => p.AtletaId == a.Id)
                .ToList();
            
            int presencaMedia = 0;
            if (presencasAtleta.Count() > 0)
            {
                int presencasConfirmadas = presencasAtleta.Count(p => p.Estado == CAP.Modules.Sports.Core.Domain.EstadoPresencaTreino.Presente);
                presencaMedia = (int)Math.Round((double)presencasConfirmadas / presencasAtleta.Count() * 100);
            }

            // Equipa Principal
            var equipa = _sportsDb.AtletaEquipas
                .Where(ae => ae.AtletaId == a.Id)
                .Select(ae => ae.Equipa.Nome)
                .FirstOrDefault() ?? "Sem Equipa";

            return new
            {
                Id = a.Id,
                Nome = a.Nome,
                Email = a.Email,
                Posicao = a.Posicao,
                Numero = a.NumeroCamisola,
                Idade = DateTime.Today.Year - a.DataNascimento.Year,
                Telefone = a.Telefone ?? "",
                Equipa = equipa,
                AtestadoValido = atestadoValido,
                PresencaMedia = presencaMedia,
                Estado = a.Estado == "Ativo" ? "ativo" : "suspenso"
            };
        });

        return Ok(result);
    }
}
