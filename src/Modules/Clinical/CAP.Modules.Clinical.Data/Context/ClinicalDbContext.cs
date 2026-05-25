using CAP.Modules.Clinical.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Clinical.Data.Context;

public class ClinicalDbContext : DbContext
{
    public ClinicalDbContext(DbContextOptions<ClinicalDbContext> options) : base(options)
    {
    }

    public DbSet<AtestadoMedico> Atestados => Set<AtestadoMedico>();
    public DbSet<Lesao> Lesoes => Set<Lesao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("clinical");

        modelBuilder.Entity<AtestadoMedico>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MedicoResponsavel).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<Lesao>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TipoLesao).IsRequired().HasMaxLength(100);
        });

        base.OnModelCreating(modelBuilder);
    }
}
