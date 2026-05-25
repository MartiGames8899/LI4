using CAP.Modules.Notifications.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Notifications.Data.Context;

public class NotificationsDbContext : DbContext
{
    public NotificationsDbContext(DbContextOptions<NotificationsDbContext> options) : base(options)
    {
    }

    public DbSet<Notificacao> Notificacoes => Set<Notificacao>();
    public DbSet<NotificacaoPreferencia> Preferencias => Set<NotificacaoPreferencia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("notifications");
        base.OnModelCreating(modelBuilder);
    }
}
