using Microsoft.Extensions.DependencyInjection;
using CAP.Modules.Users.Core.Services;
using CAP.Modules.Users.Data.Repositories;
using CAP.Modules.Sports.Data.Repositories;
using CAP.Modules.Clinical.Core.Domain;
using CAP.Modules.Clinical.Core.Services;
using CAP.Modules.Clinical.Data.Repositories;
using CAP.Modules.Finance.Data.Repositories;
using CAP.Modules.Finance.Core.Domain;
using CAP.Modules.Notifications.Data.Repositories;
using CAP.Modules.Notifications.Core.Domain;
using CAP.Modules.Notifications.Core.Services;
using CAP.Modules.Facilities.Data.Repositories;
using CAP.Modules.Facilities.Core.Domain;
using CAP.Modules.Facilities.Core.Services;
using CAP.Modules.Reports.Data.Repositories;
using CAP.Modules.Reports.Core.Domain;
using CAP.Modules.Reports.Core.Services;
using CAP.Shared.Domain;

namespace CAP.API.Extensions;

public static class ModuleExtensions
{
    public static IServiceCollection AddUsersModule(this IServiceCollection services)
    {
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<UserRepository>();
        return services;
    }

    public static IServiceCollection AddSportsModule(this IServiceCollection services)
    {
        services.AddScoped(typeof(IRepository<>), typeof(SportsRepository<>));
        return services;
    }

    public static IServiceCollection AddClinicalModule(this IServiceCollection services)
    {
        services.AddScoped<IRepository<AtestadoMedico>, ClinicalRepository<AtestadoMedico>>();
        services.AddScoped<IRepository<Lesao>, ClinicalRepository<Lesao>>();
        services.AddScoped<IClinicalService, ClinicalService>();
        return services;
    }

    public static IServiceCollection AddFinanceModule(this IServiceCollection services)
    {
        services.AddScoped<IRepository<QuotaDefinicao>, FinanceRepository<QuotaDefinicao>>();
        services.AddScoped<IRepository<Quota>, FinanceRepository<Quota>>();
        services.AddScoped<IRepository<Pagamento>, FinanceRepository<Pagamento>>();
        services.AddScoped<IRepository<Recibo>, FinanceRepository<Recibo>>();
        return services;
    }

    public static IServiceCollection AddNotificationsModule(this IServiceCollection services)
    {
        services.AddScoped<IRepository<Notificacao>, NotificationsRepository<Notificacao>>();
        services.AddScoped<IRepository<NotificacaoPreferencia>, NotificationsRepository<NotificacaoPreferencia>>();
        services.AddScoped<IEmailSender, MockEmailSender>();
        services.AddScoped<INotificationEngine, NotificationEngine>();
        return services;
    }

    public static IServiceCollection AddFacilitiesModule(this IServiceCollection services)
    {
        services.AddScoped<IRepository<Espaco>, FacilitiesRepository<Espaco>>();
        services.AddScoped<IRepository<Reserva>, FacilitiesRepository<Reserva>>();
        services.AddScoped<IFacilityService, FacilityService>();
        return services;
    }

    public static IServiceCollection AddReportsModule(this IServiceCollection services)
    {
        services.AddScoped<IRepository<ResumoFinanceiro>, ReportsRepository<ResumoFinanceiro>>();
        services.AddScoped<IRepository<ResumoDesportivo>, ReportsRepository<ResumoDesportivo>>();
        services.AddScoped<IExportService, ExportService>();
        services.AddScoped<ISaftService, SaftService>();
        return services;
    }
}
