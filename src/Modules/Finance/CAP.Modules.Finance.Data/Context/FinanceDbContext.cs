using CAP.Modules.Finance.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Finance.Data.Context;

public class FinanceDbContext : DbContext
{
    public FinanceDbContext(DbContextOptions<FinanceDbContext> options) : base(options)
    {
    }

    public DbSet<QuotaDefinicao> QuotaDefinicoes => Set<QuotaDefinicao>();
    public DbSet<Quota> Quotas => Set<Quota>();
    public DbSet<Pagamento> Pagamentos => Set<Pagamento>();
    public DbSet<Recibo> Recibos => Set<Recibo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("finance");

        modelBuilder.Entity<Quota>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Definicao)
                .WithMany()
                .HasForeignKey(e => e.QuotaDefinicaoId);
        });

        modelBuilder.Entity<Pagamento>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasMany(e => e.QuotasLiquidadas)
                .WithMany(); // Relacionamento many-to-many entre Pagamento e Quota
        });

        modelBuilder.Entity<Recibo>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.NumeroRecibo).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }
}
