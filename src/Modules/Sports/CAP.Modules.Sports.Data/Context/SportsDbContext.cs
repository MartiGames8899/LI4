using CAP.Modules.Sports.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Sports.Data.Context;

public class SportsDbContext : DbContext
{
    public SportsDbContext(DbContextOptions<SportsDbContext> options) : base(options)
    {
    }

    public DbSet<Modalidade> Modalidades => Set<Modalidade>();
    public DbSet<Escalao> Escaloes => Set<Escalao>();
    public DbSet<Equipa> Equipas => Set<Equipa>();
    public DbSet<AtletaEquipa> AtletaEquipas => Set<AtletaEquipa>();
    public DbSet<Convocatoria> Convocatorias => Set<Convocatoria>();
    public DbSet<Convite> Convites => Set<Convite>();
    public DbSet<Treino> Treinos => Set<Treino>();
    public DbSet<PresencaTreino> PresencasTreino => Set<PresencaTreino>();
    public DbSet<OcorrenciaJogo> OcorrenciasJogo => Set<OcorrenciaJogo>();
    public DbSet<AvaliacaoQualitativa> AvaliacoesQualitativas => Set<AvaliacaoQualitativa>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("sports");

        // Configuração many-to-many Atleta <-> Equipa
        modelBuilder.Entity<AtletaEquipa>()
            .HasKey(ae => new { ae.AtletaId, ae.EquipaId });

        modelBuilder.Entity<AtletaEquipa>()
            .HasOne(ae => ae.Equipa)
            .WithMany(e => e.Atletas)
            .HasForeignKey(ae => ae.EquipaId);

        base.OnModelCreating(modelBuilder);
    }
}
