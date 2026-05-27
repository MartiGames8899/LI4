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

        if (user.MustChangePassword && user.PasswordHash == "INVITED_PENDING_SETUP")
        {
            return Unauthorized(new { message = "A sua conta ainda não foi ativada. Por favor, utilize o link de convite enviado para o seu email." });
        }

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
        return Ok(new LoginResponse(token, user.Nome, user.Role, user.MustChangePassword));
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
            Role = request.Role,
            MustChangePassword = string.IsNullOrEmpty(request.Password),
            InvitationToken = string.IsNullOrEmpty(request.Password) ? Guid.NewGuid().ToString("N") : null
        };

        if (!string.IsNullOrEmpty(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }
        else
        {
            // Dummy hash for accounts without password yet
            user.PasswordHash = "INVITED_PENDING_SETUP";
        }

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new { message = "Utilizador registado com sucesso", invitationToken = user.InvitationToken });
    }

    [HttpGet("invitation/validate")]
    public async Task<IActionResult> ValidateInvitation([FromQuery] string token)
    {
        var users = await _userRepository.GetAllAsync();
        var user = users.FirstOrDefault(u => u.InvitationToken == token);
        
        if (user == null)
            return NotFound(new { message = "Convite inválido ou expirado" });

        return Ok(new { nome = user.Nome, email = user.Email });
    }

    [HttpPost("invitation/setup")]
    public async Task<IActionResult> SetupPassword([FromBody] SetupPasswordRequest request)
    {
        var users = await _userRepository.GetAllAsync();
        var user = users.FirstOrDefault(u => u.InvitationToken == request.Token);
        
        if (user == null)
            return NotFound(new { message = "Convite inválido ou expirado" });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        user.InvitationToken = null;
        user.MustChangePassword = false;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new { message = "Palavra-passe configurada com sucesso. Já pode iniciar sessão." });
    }
}

public record SetupPasswordRequest(string Token, string Password);
