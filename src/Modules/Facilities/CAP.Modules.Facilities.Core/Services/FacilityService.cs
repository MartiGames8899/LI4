using CAP.Modules.Facilities.Core.Domain;
using CAP.Shared.Domain;

namespace CAP.Modules.Facilities.Core.Services;

public interface IFacilityService
{
    Task<bool> HasConflictAsync(Guid espacoId, DateTime inicio, DateTime fim);
    Task<Reserva?> CreateReservationAsync(Guid espacoId, Guid requisitanteId, string titulo, DateTime inicio, DateTime fim, bool isManutencao = false);
}

public class FacilityService : IFacilityService
{
    private readonly IRepository<Reserva> _reservaRepository;

    public FacilityService(IRepository<Reserva> reservaRepository)
    {
        _reservaRepository = reservaRepository;
    }

    public async Task<bool> HasConflictAsync(Guid espacoId, DateTime inicio, DateTime fim)
    {
        var reservas = await _reservaRepository.GetAllAsync();
        return reservas.Any(r => 
            r.EspacoId == espacoId && 
            ((inicio >= r.DataInicio && inicio < r.DataFim) || 
             (fim > r.DataInicio && fim <= r.DataFim) ||
             (inicio <= r.DataInicio && fim >= r.DataFim)));
    }

    public async Task<Reserva?> CreateReservationAsync(Guid espacoId, Guid requisitanteId, string titulo, DateTime inicio, DateTime fim, bool isManutencao = false)
    {
        if (isManutencao)
        {
            var todasReservas = await _reservaRepository.GetAllAsync();
            var conflitos = todasReservas.Where(r =>
                r.EspacoId == espacoId &&
                ((inicio >= r.DataInicio && inicio < r.DataFim) ||
                 (fim > r.DataInicio && fim <= r.DataFim) ||
                 (inicio <= r.DataInicio && fim >= r.DataFim))).ToList();

            foreach (var conflito in conflitos)
            {
                await _reservaRepository.DeleteAsync(conflito);
                // Aqui seria integrado com NotificationEngine para avisar o requisitante cancelado
            }
        }
        else if (await HasConflictAsync(espacoId, inicio, fim))
        {
            return null;
        }

        var reserva = new Reserva
        {
            EspacoId = espacoId,
            RequisitanteId = requisitanteId,
            Titulo = titulo,
            DataInicio = inicio,
            DataFim = fim,
            IsManutencao = isManutencao
        };

        await _reservaRepository.AddAsync(reserva);
        await _reservaRepository.SaveChangesAsync();

        return reserva;
    }
}
