using System.Text;
using CAP.Modules.Users.Core.Services;
using CAP.Modules.Users.Data.Context;
using CAP.Modules.Users.Data.Repositories;
using CAP.Modules.Sports.Data.Context;
using CAP.Modules.Sports.Data.Repositories;
using CAP.Modules.Clinical.Data.Context;
using CAP.Modules.Clinical.Core.Domain;
using CAP.Modules.Clinical.Core.Services;
using CAP.Modules.Clinical.Data.Repositories;
using CAP.Modules.Finance.Data.Context;
using CAP.Modules.Finance.Data.Repositories;
using CAP.Modules.Finance.Core.Domain;
using CAP.Modules.Notifications.Data.Context;
using CAP.Modules.Notifications.Data.Repositories;
using CAP.Modules.Notifications.Core.Domain;
using CAP.Modules.Notifications.Core.Services;
using CAP.Modules.Facilities.Data.Context;
using CAP.Modules.Facilities.Data.Repositories;
using CAP.Modules.Facilities.Core.Domain;
using CAP.Modules.Facilities.Core.Services;
using CAP.Modules.Reports.Data.Context;
using CAP.Modules.Reports.Data.Repositories;
using CAP.Modules.Reports.Core.Domain;
using CAP.Modules.Reports.Core.Services;
using CAP.Shared.Domain;
using CAP.Modules.Users.Core.Domain;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Database - Users Module
builder.Services.AddDbContext<UsersDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.MigrationsHistoryTable("__EFMigrationsHistory", "users")));

// Configure Database - Sports Module
builder.Services.AddDbContext<SportsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.MigrationsHistoryTable("__EFMigrationsHistory", "sports")));

// Configure Database - Clinical Module
builder.Services.AddDbContext<ClinicalDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.MigrationsHistoryTable("__EFMigrationsHistory", "clinical")));

// Configure Database - Finance Module
builder.Services.AddDbContext<FinanceDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.MigrationsHistoryTable("__EFMigrationsHistory", "finance")));

// Configure Database - Notifications Module
builder.Services.AddDbContext<NotificationsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.MigrationsHistoryTable("__EFMigrationsHistory", "notifications")));

// Configure Database - Facilities Module
builder.Services.AddDbContext<FacilitiesDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.MigrationsHistoryTable("__EFMigrationsHistory", "facilities")));

// Configure Database - Reports Module
builder.Services.AddDbContext<ReportsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        x => x.MigrationsHistoryTable("__EFMigrationsHistory", "reports")));

// MediatR (Cross-module communication)
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(AppDomain.CurrentDomain.GetAssemblies()));

// Authentication

var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"] ?? "secret_key_with_at_least_32_characters");
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// Dependency Injection
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<UserRepository>();

// Sports Module Repositories
builder.Services.AddScoped(typeof(IRepository<>), typeof(SportsRepository<>));

// Clinical Module Repositories
builder.Services.AddScoped<IRepository<AtestadoMedico>, ClinicalRepository<AtestadoMedico>>();
builder.Services.AddScoped<IRepository<Lesao>, ClinicalRepository<Lesao>>();
builder.Services.AddScoped<IClinicalService, ClinicalService>();

// Finance Module Repositories
builder.Services.AddScoped<IRepository<QuotaDefinicao>, FinanceRepository<QuotaDefinicao>>();
builder.Services.AddScoped<IRepository<Quota>, FinanceRepository<Quota>>();
builder.Services.AddScoped<IRepository<Pagamento>, FinanceRepository<Pagamento>>();
builder.Services.AddScoped<IRepository<Recibo>, FinanceRepository<Recibo>>();

// Notifications Module
builder.Services.AddScoped<IRepository<Notificacao>, NotificationsRepository<Notificacao>>();
builder.Services.AddScoped<IRepository<NotificacaoPreferencia>, NotificationsRepository<NotificacaoPreferencia>>();
builder.Services.AddScoped<INotificationEngine, NotificationEngine>();

// Facilities Module
builder.Services.AddScoped<IRepository<Espaco>, FacilitiesRepository<Espaco>>();
builder.Services.AddScoped<IRepository<Reserva>, FacilitiesRepository<Reserva>>();
builder.Services.AddScoped<IFacilityService, FacilityService>();

// Reports Module
builder.Services.AddScoped<IRepository<ResumoFinanceiro>, ReportsRepository<ResumoFinanceiro>>();
builder.Services.AddScoped<IRepository<ResumoDesportivo>, ReportsRepository<ResumoDesportivo>>();
builder.Services.AddScoped<IExportService, ExportService>();
builder.Services.AddScoped<ISaftService, SaftService>();

var app = builder.Build();

// Executa as Migrações e Seeder Automaticamente no Arranque
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    
    var usersDb = services.GetRequiredService<UsersDbContext>();
    var sportsDb = services.GetRequiredService<SportsDbContext>();
    var clinicalDb = services.GetRequiredService<ClinicalDbContext>();
    var financeDb = services.GetRequiredService<FinanceDbContext>();
    
    usersDb.Database.Migrate();
    sportsDb.Database.Migrate();
    clinicalDb.Database.Migrate();
    financeDb.Database.Migrate();
    services.GetRequiredService<NotificationsDbContext>().Database.Migrate();
    services.GetRequiredService<FacilitiesDbContext>().Database.Migrate();
    services.GetRequiredService<ReportsDbContext>().Database.Migrate();
    
    // Correr Seeder
    await CAP.API.Data.DataSeeder.SeedAsync(usersDb, sportsDb, clinicalDb, financeDb);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
