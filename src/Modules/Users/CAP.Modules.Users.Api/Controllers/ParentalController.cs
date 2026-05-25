using CAP.Modules.Users.Core.Domain;
using CAP.Modules.Users.Core.DTOs;
using CAP.Modules.Users.Data.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Users.Api.Controllers;

[ApiController]
[Route("api/users/parental")]
[Authorize(Roles = "EncarregadoEducacao")]
public class ParentalController : ControllerBase
{
    private readonly UserRepository _userRepository;

    public ParentalController(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpPost("link")]
    public async Task<IActionResult> LinkDependent([FromBody] LinkDependentRequest request)
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

        var encarregado = await _userRepository.GetEncarregadoWithDependentesAsync(userId);
        if (encarregado == null) return NotFound("Perfil parental não encontrado");

        var atleta = await _userRepository.GetAtletaByIdAsync(request.AtletaId);
        if (atleta == null) return NotFound("Atleta não encontrado");

        if (encarregado.AtletasDependentes.Any(a => a.Id == atleta.Id))
            return BadRequest("Atleta já vinculado a este encarregado");

        encarregado.AtletasDependentes.Add(atleta);
        atleta.EncarregadoEducacaoId = encarregado.Id;

        await _userRepository.SaveChangesAsync();

        return Ok("Atleta vinculado com sucesso");
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

        var encarregado = await _userRepository.GetEncarregadoWithDependentesAsync(userId);
        if (encarregado == null) return NotFound("Perfil parental não encontrado");

        // Here we could fetch the specific data from other modules or return the linked athletes for the client to query
        var dependentes = encarregado.AtletasDependentes.Select(a => new
        {
            a.Id,
            a.Nome,
            a.Email,
            a.NumeroCamisola,
            a.Posicao
        });

        return Ok(new { Dependentes = dependentes });
    }
}
