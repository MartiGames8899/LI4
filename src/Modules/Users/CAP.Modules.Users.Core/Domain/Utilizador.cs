using CAP.Shared.Domain;

namespace CAP.Modules.Users.Core.Domain;

public class Utilizador : Entity
{
    public string NumeroSocio { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Atleta, Treinador, Secretaria, Gerencia
    
    // Socio fields
    public string Tipo { get; set; } = "Regular"; // Regular, Jovem, Honorario, Fundador
    public string Estado { get; set; } = "Ativo"; // Ativo, Suspenso
    public DateTime DataInscricao { get; set; } = DateTime.UtcNow;
    
    public int FailedLoginAttempts { get; set; } = 0;
    public DateTime? LockoutEnd { get; set; }

    public bool MustChangePassword { get; set; } = false;
    public string? InvitationToken { get; set; }
}
