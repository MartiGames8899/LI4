using CAP.Modules.Facilities.Core.Domain;
using CAP.Modules.Facilities.Core.DTOs;
using CAP.Modules.Facilities.Core.Services;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Facilities.Api.Controllers;

[ApiController]
[Route("api/facilities")]
[Authorize]
public class FacilitiesController : ControllerBase
{
    private readonly IRepository<Espaco> _espacoRepository;
    private readonly IRepository<Reserva> _reservaRepository;
    private readonly IFacilityService _facilityService;

    public FacilitiesController(
        IRepository<Espaco> espacoRepository,
        IRepository<Reserva> reservaRepository,
        IFacilityService facilityService)
    {
        _espacoRepository = espacoRepository;
        _reservaRepository = reservaRepository;
        _facilityService = facilityService;
    }

    [HttpGet("spaces")]
    public async Task<IActionResult> GetSpaces()
    {
        var spaces = await _espacoRepository.GetAllAsync();
        return Ok(spaces);
    }

    [HttpGet("calendar")]
    public async Task<IActionResult> GetCalendar([FromQuery] DateTime start, [FromQuery] DateTime end)
    {
        var allReservas = await _reservaRepository.GetAllAsync();
        var calendar = allReservas
            .Where(r => r.DataInicio >= start && r.DataFim <= end)
            .OrderBy(r => r.DataInicio);
        
        return Ok(calendar);
    }

    [HttpPost("reservations")]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());

        var reserva = await _facilityService.CreateReservationAsync(
            request.EspacoId,
            userId,
            request.Titulo,
            request.DataInicio,
            request.DataFim,
            request.IsManutencao);

        if (reserva == null)
            return Conflict("Existe um conflito de horário para este espaço");

        return Ok(reserva);
    }

    [HttpGet("reservations")]
    public async Task<IActionResult> GetReservations()
    {
        var reservas = await _reservaRepository.GetAllAsync();
        return Ok(reservas);
    }

    [HttpDelete("reservations/{id}")]
    [Authorize(Roles = "Secretaria,Gerencia")]
    public async Task<IActionResult> DeleteReservation(Guid id)
    {
        var reserva = await _reservaRepository.GetByIdAsync(id);
        if (reserva == null) return NotFound();

        await _reservaRepository.DeleteAsync(reserva);
        await _reservaRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("spaces")]
    [Authorize(Roles = "Secretaria,Gerencia")]
    public async Task<IActionResult> CreateSpace([FromBody] CreateSpaceRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome))
            return BadRequest(new { message = "Nome obrigatório." });
        if (!Enum.TryParse<TipoEspaco>(request.Tipo, true, out var tipoEnum))
            return BadRequest(new { message = "Tipo de espaço inválido." });

        var espaco = new Espaco
        {
            Nome = request.Nome,
            Tipo = tipoEnum,
            Capacidade = request.Capacidade,
            Observacoes = request.Observacoes,
            Ativo = true,
        };
        await _espacoRepository.AddAsync(espaco);
        await _espacoRepository.SaveChangesAsync();
        return Ok(espaco);
    }

    [HttpPut("spaces/{id}")]
    [Authorize(Roles = "Secretaria,Gerencia")]
    public async Task<IActionResult> UpdateSpace(Guid id, [FromBody] UpdateSpaceRequest request)
    {
        var espaco = await _espacoRepository.GetByIdAsync(id);
        if (espaco == null) return NotFound();

        if (Enum.TryParse<TipoEspaco>(request.Tipo, true, out var tipoEnum))
            espaco.Tipo = tipoEnum;

        espaco.Nome = request.Nome;
        espaco.Capacidade = request.Capacidade;
        espaco.Observacoes = request.Observacoes;
        espaco.Ativo = request.Ativo;

        await _espacoRepository.UpdateAsync(espaco);
        await _espacoRepository.SaveChangesAsync();

        return Ok(espaco);
    }

    [HttpPatch("spaces/{id}/maintenance")]
    [Authorize(Roles = "Secretaria,Gerencia")]
    public async Task<IActionResult> ToggleMaintenance(Guid id, [FromBody] ToggleMaintenanceRequest request)
    {
        var espaco = await _espacoRepository.GetByIdAsync(id);
        if (espaco == null) return NotFound();

        espaco.Ativo = !request.EmManutencao;
        if (!string.IsNullOrEmpty(request.Observacoes))
            espaco.Observacoes = request.Observacoes;

        await _espacoRepository.UpdateAsync(espaco);
        await _espacoRepository.SaveChangesAsync();

        return Ok(new { id = espaco.Id, ativo = espaco.Ativo, emManutencao = !espaco.Ativo });
    }
}

public record ToggleMaintenanceRequest(bool EmManutencao, string? Observacoes);
