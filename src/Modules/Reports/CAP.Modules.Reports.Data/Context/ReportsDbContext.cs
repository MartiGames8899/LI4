using CAP.Modules.Reports.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Reports.Data.Context;

public class ReportsDbContext : DbContext
{
    public ReportsDbContext(DbContextOptions<ReportsDbContext> options) : base(options)
    {
    }

    public DbSet<ResumoFinanceiro> ResumosFinanceiros => Set<ResumoFinanceiro>();
    public DbSet<ResumoDesportivo> ResumosDesportivos => Set<ResumoDesportivo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("reports");
        base.OnModelCreating(modelBuilder);
    }
}
