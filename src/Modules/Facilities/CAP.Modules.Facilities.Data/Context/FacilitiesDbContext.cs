using CAP.Modules.Facilities.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Facilities.Data.Context;

public class FacilitiesDbContext : DbContext
{
    public FacilitiesDbContext(DbContextOptions<FacilitiesDbContext> options) : base(options)
    {
    }

    public DbSet<Espaco> Espacos => Set<Espaco>();
    public DbSet<Reserva> Reservas => Set<Reserva>();
    public DbSet<Produto> Produtos => Set<Produto>();
    public DbSet<Encomenda> Encomendas => Set<Encomenda>();
    public DbSet<LinhaEncomenda> LinhasEncomenda => Set<LinhaEncomenda>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("facilities");
        base.OnModelCreating(modelBuilder);
    }
}
