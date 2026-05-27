namespace CAP.Modules.Notifications.Core.Services;

public interface IEmailSender
{
    Task SendEmailAsync(string toEmail, string subject, string body);
    Task SendEmailToUserAsync(Guid userId, string subject, string body);
}

public class MockEmailSender : IEmailSender
{
    public Task SendEmailAsync(string toEmail, string subject, string body)
    {
        Console.WriteLine($"[MockEmailSender] Email enviado para {toEmail} - Assunto: {subject}");
        return Task.CompletedTask;
    }

    public Task SendEmailToUserAsync(Guid userId, string subject, string body)
    {
        // Num cenário real, o UsersDbContext ou um pedido MediatR obteria o e-mail real.
        Console.WriteLine($"[MockEmailSender] Email enviado para Utilizador {userId} - Assunto: {subject}");
        return Task.CompletedTask;
    }
}
