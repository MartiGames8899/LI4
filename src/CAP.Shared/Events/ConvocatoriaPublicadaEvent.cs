using MediatR;

namespace CAP.Shared.Events;

public class ConvocatoriaPublicadaEvent : INotification
{
    public Guid ConvocatoriaId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public List<Guid> AtletasIds { get; set; } = new();
}
