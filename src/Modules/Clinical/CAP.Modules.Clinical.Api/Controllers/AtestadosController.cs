using CAP.Modules.Clinical.Core.Domain;
using CAP.Modules.Clinical.Core.DTOs;
using CAP.Shared.Events;
using CAP.Shared.Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Clinical.Api.Controllers;

[ApiController]
[Route("api/clinical/certificates")]
[Authorize]
public class AtestadosController : ControllerBase
{
    private readonly IRepository<AtestadoMedico> _atestadoRepository;
    private readonly IMediator _mediator;

    public AtestadosController(IRepository<AtestadoMedico> atestadoRepository, IMediator mediator)
    {
        _atestadoRepository = atestadoRepository;
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Secretaria,Gerencia")]
    public async Task<IActionResult> Register([FromBody] RegisterCertificateRequest request)
    {
        var atestado = new AtestadoMedico
        {
            AtletaId = request.AtletaId,
            DataEmissao = request.DataEmissao,
            DataExpiracao = request.DataExpiracao,
            MedicoResponsavel = request.MedicoResponsavel,
            Observacoes = request.Observacoes
        };

        await _atestadoRepository.AddAsync(atestado);
        await _atestadoRepository.SaveChangesAsync();

        if (!atestado.IsValid)
        {
            await _mediator.Publish(new AthleteStatusChangedEvent(atestado.AtletaId, false, "Atestado Médico Expirado"));
        }

        return Ok(atestado);
    }

    [HttpGet("athlete/{atletaId}")]
    public async Task<IActionResult> GetByAthlete(Guid atletaId)
    {
        var atestados = await _atestadoRepository.GetAllAsync();
        return Ok(atestados.Where(a => a.AtletaId == atletaId));
    }

    [HttpPost("{id}/upload")]
    [Authorize(Roles = "Secretaria,Gerencia")]
    public async Task<IActionResult> UploadFicheiro(Guid id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Ficheiro inválido");

        var atestado = await _atestadoRepository.GetByIdAsync(id);
        if (atestado == null) return NotFound("Atestado não encontrado");

        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Atestados");
        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        atestado.CaminhoFicheiro = filePath;
        await _atestadoRepository.UpdateAsync(atestado);
        await _atestadoRepository.SaveChangesAsync();

        return Ok(new { FilePath = filePath });
    }
}
