using CAP.Modules.Users.Core.Domain;
using CAP.Modules.Users.Data.Context;
using CAP.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace CAP.Modules.Users.Data.Repositories;

public class UserRepository : IRepository<Utilizador>
{
    private readonly UsersDbContext _context;

    public UserRepository(UsersDbContext context) => _context = context;

    public async Task<Utilizador?> GetByIdAsync(Guid id) => 
        await _context.Utilizadores.FindAsync(id);

    public async Task<IEnumerable<Utilizador>> GetAllAsync() => 
        await _context.Utilizadores.ToListAsync();

    public virtual async Task AddAsync(Utilizador entity) => 
        await _context.Utilizadores.AddAsync(entity);

    public virtual Task UpdateAsync(Utilizador entity)
    {
        _context.Utilizadores.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Utilizador entity)
    {
        _context.Utilizadores.Remove(entity);
        return Task.CompletedTask;
    }

    public virtual async Task SaveChangesAsync() => 
        await _context.SaveChangesAsync();

    public virtual async Task<Utilizador?> GetByEmailAsync(string email) =>
        await _context.Utilizadores.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<EncarregadoEducacao?> GetEncarregadoWithDependentesAsync(Guid id) =>
        await _context.Utilizadores.OfType<EncarregadoEducacao>()
            .Include(e => e.AtletasDependentes)
            .FirstOrDefaultAsync(e => e.Id == id);

    public async Task<Atleta?> GetAtletaByIdAsync(Guid id) =>
        await _context.Utilizadores.OfType<Atleta>()
            .FirstOrDefaultAsync(a => a.Id == id);
}
