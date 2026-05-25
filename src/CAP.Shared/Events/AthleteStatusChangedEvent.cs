using CAP.Shared.Domain;

namespace CAP.Shared.Events;

public record AthleteStatusChangedEvent(Guid AtletaId, bool IsFit, string Reason) : IDomainEvent
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
