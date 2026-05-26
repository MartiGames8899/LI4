using CAP.Modules.Users.Core.Domain;
using CAP.Modules.Users.Core.DTOs;
using CAP.Modules.Users.Data.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Users.Api.Controllers;

[ApiController]
[Route("api/users/socios")]
[Authorize(Roles = "Secretaria,Gerencia")]
public class SociosController : ControllerBase
{
    private readonly UserRepository _userRepository;

    public SociosController(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userRepository.GetAllAsync();
        
        var socios = users.Select(u => new
        {
            u.Id,
            u.NumeroSocio,
            u.Nome,
            u.Email,
            u.Telefone,
            u.Tipo,
            u.Estado,
            u.DataInscricao,
            QuotasEmDia = true // TODO: Integrate with Finance module
        });

        return Ok(socios);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSocioRequest request)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing != null) return BadRequest("Email já registado.");

        var socio = new Utilizador
        {
            NumeroSocio = request.NumeroSocio ?? $"CAP-{new Random().Next(1000, 9999)}",
            Nome = request.Nome,
            Email = request.Email,
            Telefone = request.Telefone,
            PasswordHash = "123456", // Default password for new members
            Role = "Socio", // Default role
            Tipo = request.Tipo,
            Estado = "Ativo",
            DataInscricao = request.DataInscricao ?? DateTime.UtcNow
        };

        await _userRepository.AddAsync(socio);
        await _userRepository.SaveChangesAsync();

        return Ok(socio);
    }
}

public class CreateSocioRequest
{
    public string? NumeroSocio { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public DateTime? DataInscricao { get; set; }
}
