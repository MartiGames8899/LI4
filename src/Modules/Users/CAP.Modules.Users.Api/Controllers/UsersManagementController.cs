using CAP.Modules.Users.Core.Domain;
using CAP.Modules.Users.Data.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Users.Api.Controllers;

[ApiController]
[Route("api/users/management")]
[Authorize(Roles = "Gerencia")]
public class UsersManagementController : ControllerBase
{
    private readonly UserRepository _userRepository;

    public UsersManagementController(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? role = null)
    {
        var users = await _userRepository.GetAllAsync();

        var filtered = string.IsNullOrEmpty(role)
            ? users
            : users.Where(u => string.Equals(u.Role, role, StringComparison.OrdinalIgnoreCase));

        var result = filtered
            .OrderBy(u => u.Nome)
            .Select(u => new
            {
                u.Id,
                u.Nome,
                u.Email,
                u.Telefone,
                u.Role,
                u.Estado,
                u.NumeroSocio,
                u.DataInscricao,
                u.MustChangePassword,
                IsPending = u.PasswordHash == "INVITED_PENDING_SETUP"
            });

        return Ok(result);
    }

    [HttpGet("staff")]
    public async Task<IActionResult> GetStaff()
    {
        var users = await _userRepository.GetAllAsync();
        var staffRoles = new[] { "Treinador", "Secretaria", "Gerencia" };

        var result = users
            .Where(u => staffRoles.Contains(u.Role, StringComparer.OrdinalIgnoreCase))
            .OrderBy(u => u.Role).ThenBy(u => u.Nome)
            .Select(u => new
            {
                u.Id,
                u.Nome,
                u.Email,
                u.Telefone,
                u.Role,
                u.Estado,
                u.DataInscricao,
                IsPending = u.PasswordHash == "INVITED_PENDING_SETUP"
            });

        return Ok(result);
    }

    [HttpGet("by-role/{role}")]
    [Authorize(Roles = "Gerencia,Secretaria,Treinador")]
    public async Task<IActionResult> GetByRole(string role)
    {
        var users = await _userRepository.GetAllAsync();
        var result = users
            .Where(u => string.Equals(u.Role, role, StringComparison.OrdinalIgnoreCase))
            .OrderBy(u => u.Nome)
            .Select(u => new { u.Id, u.Nome, u.Email });
        return Ok(result);
    }

    [HttpPut("{id}/state")]
    public async Task<IActionResult> UpdateState(Guid id, [FromBody] UpdateUserStateRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound(new { message = "Utilizador não encontrado." });

        if (request.Estado != "Ativo" && request.Estado != "Suspenso")
            return BadRequest(new { message = "Estado inválido. Deve ser 'Ativo' ou 'Suspenso'." });

        user.Estado = request.Estado;
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new { message = $"Utilizador {(request.Estado == "Ativo" ? "ativado" : "suspenso")} com sucesso." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound(new { message = "Utilizador não encontrado." });

        if (string.Equals(user.Role, "Gerencia", StringComparison.OrdinalIgnoreCase))
        {
            var users = await _userRepository.GetAllAsync();
            var gerenciaCount = users.Count(u => string.Equals(u.Role, "Gerencia", StringComparison.OrdinalIgnoreCase));
            if (gerenciaCount <= 1)
                return BadRequest(new { message = "Não é possível eliminar o último utilizador de Gerência." });
        }

        await _userRepository.DeleteAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new { message = "Utilizador eliminado com sucesso." });
    }
}

public record UpdateUserStateRequest(string Estado);
