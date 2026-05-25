using MediatR;

namespace CAP.Shared.Domain;

public interface IDomainEvent : INotification
{
    DateTime OccurredOn { get; }
}
