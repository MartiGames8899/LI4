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
    public DbSet<GrupoNotificacao> Grupos => Set<GrupoNotificacao>();
    public DbSet<GrupoMembro> GrupoMembros => Set<GrupoMembro>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("notifications");
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<GrupoNotificacao>(entity =>
        {
            entity.HasKey(g => g.Id);
            entity.Property(g => g.Nome).IsRequired().HasMaxLength(120);
            entity.Property(g => g.Descricao).HasMaxLength(500);
            entity.HasMany(g => g.Membros)
                .WithOne(m => m.Grupo)
                .HasForeignKey(m => m.GrupoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<GrupoMembro>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.HasIndex(m => new { m.GrupoId, m.UtilizadorId }).IsUnique();
        });
    }
}
