using CAP.Modules.Finance.Data.Context;
using CAP.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Finance.Data.Repositories;

public class FinanceRepository<T> : IRepository<T> where T : Entity
{
    private readonly FinanceDbContext _context;

    public FinanceRepository(FinanceDbContext context) => _context = context;

    public async Task<T?> GetByIdAsync(Guid id) => 
        await _context.Set<T>().FindAsync(id);

    public async Task<IEnumerable<T>> GetAllAsync() => 
        await _context.Set<T>().ToListAsync();

    public async Task AddAsync(T entity) => 
        await _context.Set<T>().AddAsync(entity);

    public Task UpdateAsync(T entity)
    {
        _context.Set<T>().Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(T entity)
    {
        _context.Set<T>().Remove(entity);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync() => 
        await _context.SaveChangesAsync();
}
