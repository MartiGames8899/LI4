namespace CAP.Modules.Users.Core.DTOs;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string Nome, string Role, bool MustChangePassword);
public record RegisterRequest(string Nome, string Email, string? Password, string Role);
public record LinkDependentRequest(Guid AtletaId);
public record UserProfileResponse(Guid Id, string Nome, string Email, string Role);
public record UpdateProfileRequest(string Nome, string Email);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
