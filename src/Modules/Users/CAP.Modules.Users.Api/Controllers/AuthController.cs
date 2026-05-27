using CAP.Modules.Users.Core.Domain;
using CAP.Modules.Users.Core.DTOs;
using CAP.Modules.Users.Core.Services;
using CAP.Modules.Users.Data.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Users.Api.Controllers;

[ApiController]
[Route("api/users/auth")]
public class AuthController : ControllerBase
{
    private readonly UserRepository _userRepository;
    private readonly IJwtService _jwtService;

    public AuthController(UserRepository userRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
            return Unauthorized(new { message = "Credenciais inválidas" });

        if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
            return Unauthorized(new { message = $"Conta bloqueada. Tente novamente após {user.LockoutEnd.Value.ToLocalTime():HH:mm}" });

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                user.FailedLoginAttempts = 0;
            }
            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
            return Unauthorized(new { message = "Credenciais inválidas" });
        }

        user.FailedLoginAttempts = 0;
        user.LockoutEnd = null;
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);
        return Ok(new LoginResponse(token, user.Nome, user.Role));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing != null)
            return BadRequest("Email já registado");

        var user = new Utilizador
        {
            Nome = request.Nome,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok("Utilizador registado com sucesso");
    }
}
