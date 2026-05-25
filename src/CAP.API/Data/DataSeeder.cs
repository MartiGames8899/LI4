using System;
using System.Linq;
using System.Threading.Tasks;
using CAP.Modules.Users.Core.Domain;
using CAP.Modules.Users.Data.Context;
using CAP.Modules.Sports.Data.Context;
using CAP.Modules.Sports.Core.Domain;
using CAP.Modules.Clinical.Data.Context;
using CAP.Modules.Clinical.Core.Domain;
using CAP.Modules.Finance.Data.Context;
using CAP.Modules.Finance.Core.Domain;

namespace CAP.API.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(
        UsersDbContext usersDb,
        SportsDbContext sportsDb,
        ClinicalDbContext clinicalDb,
        FinanceDbContext financeDb)
    {
        // Povoar Utilizadores Base
        if (!usersDb.Utilizadores.Any())
        {
            var admin = new Utilizador { Nome = "Administrador", Email = "admin@cap.pt", PasswordHash = "123", Role = "Secretaria" };
            var treinador = new Utilizador { Nome = "Mister Silva", Email = "treinador@cap.pt", PasswordHash = "123", Role = "Treinador" };
            var encarregado = new Utilizador { Nome = "Pai João", Email = "pai@cap.pt", PasswordHash = "123", Role = "Encarregado" };
            
            usersDb.Utilizadores.AddRange(admin, treinador, encarregado);
            await usersDb.SaveChangesAsync();

            // Povoar Atletas (como Utilizadores)
            var nomesAtletas = new[] { "João Pedro", "Miguel Silva", "Rui Costa", "Bruno Alves", "Nuno Gomes", "Deco", "Cristiano", "Pepe" };
            var atletas = nomesAtletas.Select(nome => new Utilizador { Nome = nome, Email = $"{nome.Replace(" ", "").ToLower()}@cap.pt", PasswordHash = "123", Role = "Atleta" }).ToList();
            usersDb.Utilizadores.AddRange(atletas);
            await usersDb.SaveChangesAsync();

            // Povoar Desporto
            if (!sportsDb.Equipas.Any())
            {
                var modalidade = new Modalidade { Nome = "Futebol" };
                var escalao = new Escalao { Nome = "Sub-14", IdadeMinima = 12, IdadeMaxima = 14 };
                sportsDb.Set<Modalidade>().Add(modalidade);
                sportsDb.Set<Escalao>().Add(escalao);
                await sportsDb.SaveChangesAsync();

                var equipa = new Equipa { Nome = "Equipa A - Sub-14", ModalidadeId = modalidade.Id, EscalaoId = escalao.Id, TreinadorId = treinador.Id };
                sportsDb.Set<Equipa>().Add(equipa);
                await sportsDb.SaveChangesAsync();

                foreach (var atleta in atletas)
                {
                    equipa.Atletas.Add(new AtletaEquipa { AtletaId = atleta.Id, EquipaId = equipa.Id });
                }
                await sportsDb.SaveChangesAsync();

                // Povoar Clinica e Financeiro
                var now = DateTime.UtcNow;
                var random = new Random();

                var quotaDefinicao = new QuotaDefinicao { Nome = "Mensalidade Formação", Valor = 25.00m };
                financeDb.Set<QuotaDefinicao>().Add(quotaDefinicao);
                await financeDb.SaveChangesAsync();

                foreach (var atleta in atletas)
                {
                    // Atestados
                    var statusRand = random.Next(1, 4);
                    var dataValidade = statusRand == 1 ? now.AddMonths(6) : (statusRand == 2 ? now.AddDays(15) : now.AddDays(-5));
                    
                    clinicalDb.Set<AtestadoMedico>().Add(new AtestadoMedico
                    {
                        AtletaId = atleta.Id,
                        DataEmissao = dataValidade.AddYears(-1),
                        DataExpiracao = dataValidade,
                        CaminhoFicheiro = "/uploads/atestado.pdf"
                    });

                    // Quotas
                    financeDb.Set<Quota>().Add(new Quota
                    {
                        AtletaId = atleta.Id,
                        QuotaDefinicaoId = quotaDefinicao.Id,
                        ValorTotal = quotaDefinicao.Valor,
                        ValorPago = random.Next(0, 2) == 1 ? quotaDefinicao.Valor : 0m,
                        DataVencimento = new DateTime(now.Year, now.Month, 8).ToUniversalTime(),
                        Estado = random.Next(0, 2) == 1 ? EstadoQuota.Paga : EstadoQuota.Pendente
                    });
                }

                await clinicalDb.SaveChangesAsync();
                await financeDb.SaveChangesAsync();
            }
        }
    }
}
