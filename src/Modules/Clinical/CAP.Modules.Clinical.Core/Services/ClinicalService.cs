using CAP.Modules.Clinical.Core.Domain;
using CAP.Shared.Domain;

namespace CAP.Modules.Clinical.Core.Services;

public interface IClinicalService
{
    Task<bool> IsAthleteFitAsync(Guid atletaId);
}

public class ClinicalService : IClinicalService
{
    private readonly IRepository<AtestadoMedico> _atestadoRepository;
    private readonly IRepository<Lesao> _lesaoRepository;

    public ClinicalService(IRepository<AtestadoMedico> atestadoRepository, IRepository<Lesao> lesaoRepository)
    {
        _atestadoRepository = atestadoRepository;
        _lesaoRepository = lesaoRepository;
    }

    public async Task<bool> IsAthleteFitAsync(Guid atletaId)
    {
        var atestados = await _atestadoRepository.GetAllAsync();
        var ultimoAtestado = atestados
            .Where(a => a.AtletaId == atletaId)
            .OrderByDescending(a => a.DataExpiracao)
            .FirstOrDefault();

        if (ultimoAtestado == null || !ultimoAtestado.IsValid)
            return false;

        var lesoes = await _lesaoRepository.GetAllAsync();
        var temLesaoAtiva = lesoes.Any(l => l.AtletaId == atletaId && l.Status != StatusLesao.Recuperado);

        return !temLesaoAtiva;
    }
}
