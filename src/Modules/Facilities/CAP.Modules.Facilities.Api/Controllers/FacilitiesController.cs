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
}
