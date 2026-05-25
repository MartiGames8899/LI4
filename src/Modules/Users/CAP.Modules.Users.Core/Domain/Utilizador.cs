using CAP.Shared.Domain;

namespace CAP.Modules.Users.Core.Domain;

public class Utilizador : Entity
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Atleta, Treinador, Secretaria, Gerencia
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutEnd { get; set; }
}
