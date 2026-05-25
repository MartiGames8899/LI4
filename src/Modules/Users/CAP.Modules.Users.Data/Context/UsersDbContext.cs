using CAP.Modules.Users.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Users.Data.Context;

public class UsersDbContext : DbContext
{
    public UsersDbContext(DbContextOptions<UsersDbContext> options) : base(options)
    {
    }

    public DbSet<Utilizador> Utilizadores => Set<Utilizador>();
    public DbSet<Atleta> Atletas => Set<Atleta>();
    public DbSet<Treinador> Treinadores => Set<Treinador>();
    public DbSet<EncarregadoEducacao> EncarregadosEducacao => Set<EncarregadoEducacao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("users");

        // Table-per-Hierarchy (TPH) for Users
        modelBuilder.Entity<Utilizador>()
            .HasDiscriminator<string>("UserType")
            .HasValue<Utilizador>("Base")
            .HasValue<Atleta>("Atleta")
            .HasValue<Treinador>("Treinador")
            .HasValue<EncarregadoEducacao>("EncarregadoEducacao");

        base.OnModelCreating(modelBuilder);
    }
}
