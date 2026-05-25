using MediatR;

namespace CAP.Shared.Events;

public record QuotaPagaEvent(Guid AtletaId, decimal Valor) : INotification;
