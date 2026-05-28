using CAP.Modules.Users.Core.Domain;
using CAP.Modules.Users.Data.Context;
using CAP.Modules.Sports.Data.Context;
using CAP.Modules.Sports.Core.Domain;
using CAP.Modules.Clinical.Data.Context;
using CAP.Modules.Clinical.Core.Domain;
using CAP.Modules.Finance.Data.Context;
using CAP.Modules.Finance.Core.Domain;
using CAP.Modules.Facilities.Data.Context;
using CAP.Modules.Facilities.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace CAP.API.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(
        UsersDbContext usersDb,
        SportsDbContext sportsDb,
        ClinicalDbContext clinicalDb,
        FinanceDbContext financeDb,
        FacilitiesDbContext facilitiesDb)
    {
        if (usersDb.Utilizadores.Any(u => u.Email == "secretaria@cap.pt"))
        {
            await EnsureDemoAccountsWorkAsync(usersDb);
            return;
        }

        // Limpar dados anteriores (ordem de FK)
        financeDb.Database.ExecuteSqlRaw("DELETE FROM finance.\"PagamentoQuota\"");
        financeDb.Database.ExecuteSqlRaw("DELETE FROM finance.\"Quotas\"");
        financeDb.Database.ExecuteSqlRaw("DELETE FROM finance.\"Pagamentos\"");
        financeDb.Database.ExecuteSqlRaw("DELETE FROM finance.\"Recibos\"");
        financeDb.Database.ExecuteSqlRaw("DELETE FROM finance.\"QuotaDefinicoes\"");
        clinicalDb.Database.ExecuteSqlRaw("DELETE FROM clinical.\"Atestados\"");
        clinicalDb.Database.ExecuteSqlRaw("DELETE FROM clinical.\"Lesoes\"");
        sportsDb.Database.ExecuteSqlRaw("DELETE FROM sports.\"Convites\"");
        sportsDb.Database.ExecuteSqlRaw("DELETE FROM sports.\"Convocatorias\"");
        sportsDb.Database.ExecuteSqlRaw("DELETE FROM sports.\"PresencasTreino\"");
        sportsDb.Database.ExecuteSqlRaw("DELETE FROM sports.\"AvaliacoesQualitativas\"");
        sportsDb.Database.ExecuteSqlRaw("DELETE FROM sports.\"OcorrenciasJogo\"");
        sportsDb.Database.ExecuteSqlRaw("DELETE FROM sports.\"Treinos\"");
        sportsDb.Database.ExecuteSqlRaw("DELETE FROM sports.\"AtletaEquipas\"");
        sportsDb.Database.ExecuteSqlRaw("DELETE FROM sports.\"Equipas\"");
        sportsDb.Database.ExecuteSqlRaw("DELETE FROM sports.\"Escaloes\"");
        sportsDb.Database.ExecuteSqlRaw("DELETE FROM sports.\"Modalidades\"");
        facilitiesDb.Database.ExecuteSqlRaw("DELETE FROM facilities.\"Reservas\"");
        facilitiesDb.Database.ExecuteSqlRaw("DELETE FROM facilities.\"Espacos\"");
        usersDb.Database.ExecuteSqlRaw("DELETE FROM users.\"Utilizadores\"");

        var now = DateTime.UtcNow;

        // ─────────────────────────────────────────────────────────────────────
        // STAFF
        // ─────────────────────────────────────────────────────────────────────
        var secretaria = new Utilizador { Nome = "Ana Ferreira", Email = "secretaria@cap.pt", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "912 345 678", Role = "Secretaria", NumeroSocio = "CAP-0001", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2018, 9, 1, 0, 0, 0, DateTimeKind.Utc) };
        var gerencia    = new Utilizador { Nome = "Miguel Rodrigues", Email = "gerencia@cap.pt", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "913 456 789", Role = "Gerencia", NumeroSocio = "CAP-0002", Tipo = "Fundador", Estado = "Ativo", DataInscricao = new DateTime(2010, 1, 15, 0, 0, 0, DateTimeKind.Utc) };

        // Treinadores — um por equipa
        var trFutSub11  = new Treinador { Nome = "Carlos Mendes",     Email = "treinador@cap.pt",         PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "914 100 001", Role = "Treinador", NumeroSocio = "CAP-0010", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2019, 8, 1, 0, 0, 0, DateTimeKind.Utc), Especialidade = "Futebol Formação" };
        var trFutSub13  = new Treinador { Nome = "Rui Baptista",      Email = "treinador2@cap.pt",        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "914 100 002", Role = "Treinador", NumeroSocio = "CAP-0011", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2021, 3, 1, 0, 0, 0, DateTimeKind.Utc), Especialidade = "Futebol Formação" };
        var trFutSub15  = new Treinador { Nome = "Pedro Carvalho",    Email = "treinador3@cap.pt",        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "914 100 003", Role = "Treinador", NumeroSocio = "CAP-0012", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2022, 9, 1, 0, 0, 0, DateTimeKind.Utc), Especialidade = "Futebol Formação" };
        var trFutSub17  = new Treinador { Nome = "José Pinheiro",     Email = "treinador4@cap.pt",        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "914 100 004", Role = "Treinador", NumeroSocio = "CAP-0013", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2020, 9, 1, 0, 0, 0, DateTimeKind.Utc), Especialidade = "Futebol Sénior" };
        var trBasSub14  = new Treinador { Nome = "Filipa Moura",      Email = "treinador5@cap.pt",        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "914 100 005", Role = "Treinador", NumeroSocio = "CAP-0014", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2021, 9, 1, 0, 0, 0, DateTimeKind.Utc), Especialidade = "Basquetebol" };
        var trBasSen    = new Treinador { Nome = "Bruno Loureiro",    Email = "treinador6@cap.pt",        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "914 100 006", Role = "Treinador", NumeroSocio = "CAP-0015", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2018, 9, 1, 0, 0, 0, DateTimeKind.Utc), Especialidade = "Basquetebol Sénior" };
        var trNatSub12  = new Treinador { Nome = "Sandra Fonseca",    Email = "treinador7@cap.pt",        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "914 100 007", Role = "Treinador", NumeroSocio = "CAP-0016", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2020, 3, 1, 0, 0, 0, DateTimeKind.Utc), Especialidade = "Natação" };
        var trNatSub16  = new Treinador { Nome = "Hélder Matos",      Email = "treinador8@cap.pt",        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "914 100 008", Role = "Treinador", NumeroSocio = "CAP-0017", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2019, 9, 1, 0, 0, 0, DateTimeKind.Utc), Especialidade = "Natação Competição" };
        usersDb.Utilizadores.AddRange(secretaria, gerencia);
        usersDb.Treinadores.AddRange(trFutSub11, trFutSub13, trFutSub15, trFutSub17, trBasSub14, trBasSen, trNatSub12, trNatSub16);
        await usersDb.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────────────
        // ENCARREGADOS DE EDUCAÇÃO (14 — partilhados pelos atletas menores)
        // ─────────────────────────────────────────────────────────────────────
        var encs = new[]
        {
            new EncarregadoEducacao { Nome = "João Santos",      Email = "encarregado@cap.pt",       PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 001", Role = "Encarregado", NumeroSocio = "CAP-0101", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2020, 9, 1, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "Maria Oliveira",   Email = "maria.o@cap.pt",           PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 002", Role = "Encarregado", NumeroSocio = "CAP-0102", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2021, 9, 1, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "António Costa",    Email = "antonio.c@cap.pt",         PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 003", Role = "Encarregado", NumeroSocio = "CAP-0103", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2022, 1, 10, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "Sofia Pereira",    Email = "sofia.p@cap.pt",           PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 004", Role = "Encarregado", NumeroSocio = "CAP-0104", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2022, 9, 1, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "Paulo Fernandes",  Email = "paulo.f@cap.pt",           PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 005", Role = "Encarregado", NumeroSocio = "CAP-0105", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2023, 2, 5, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "Luísa Machado",    Email = "luisa.ma@cap.pt",          PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 006", Role = "Encarregado", NumeroSocio = "CAP-0106", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2021, 9, 1, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "Ricardo Neves",    Email = "ricardo.n@cap.pt",         PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 007", Role = "Encarregado", NumeroSocio = "CAP-0107", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2020, 3, 15, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "Catarina Ramos",   Email = "catarina.r@cap.pt",        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 008", Role = "Encarregado", NumeroSocio = "CAP-0108", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2022, 9, 1, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "Vítor Simões",     Email = "vitor.s@cap.pt",           PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 009", Role = "Encarregado", NumeroSocio = "CAP-0109", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2021, 9, 1, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "Helena Barros",    Email = "helena.b@cap.pt",          PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 010", Role = "Encarregado", NumeroSocio = "CAP-0110", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2023, 9, 1, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "Fernando Lopes",   Email = "fernando.l@cap.pt",        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 011", Role = "Encarregado", NumeroSocio = "CAP-0111", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2020, 9, 1, 0, 0, 0, DateTimeKind.Utc) },
            new EncarregadoEducacao { Nome = "Graça Teixeira",   Email = "graca.t@cap.pt",           PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "917 200 012", Role = "Encarregado", NumeroSocio = "CAP-0112", Tipo = "Regular", Estado = "Ativo", DataInscricao = new DateTime(2022, 3, 1, 0, 0, 0, DateTimeKind.Utc) },
        };
        usersDb.EncarregadosEducacao.AddRange(encs);
        await usersDb.SaveChangesAsync();

        // Helper
        Guid E(int i) => encs[i % encs.Length].Id;

        // ─────────────────────────────────────────────────────────────────────
        // ATLETAS — FUTEBOL Sub-11
        // ─────────────────────────────────────────────────────────────────────
        var futSub11 = new[]
        {
            new Atleta { Nome = "Tomás Santos",    Email = "atleta@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 111 001", Role = "Atleta", NumeroSocio = "CAP-1001", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Guarda-redes", NumeroCamisola = 1,  DataNascimento = Dt(2015,4), EncarregadoEducacaoId = E(0) },
            new Atleta { Nome = "Gonçalo Martins", Email = "goncalo.m@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 111 002", Role = "Atleta", NumeroSocio = "CAP-1002", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Defesa",       NumeroCamisola = 4,  DataNascimento = Dt(2015,7), EncarregadoEducacaoId = E(1) },
            new Atleta { Nome = "Diogo Lopes",     Email = "diogo.l@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 111 003", Role = "Atleta", NumeroSocio = "CAP-1003", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Defesa",       NumeroCamisola = 5,  DataNascimento = Dt(2014,11), EncarregadoEducacaoId = E(2) },
            new Atleta { Nome = "Rafael Sousa",    Email = "rafael.s@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 111 004", Role = "Atleta", NumeroSocio = "CAP-1004", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Médio",        NumeroCamisola = 6,  DataNascimento = Dt(2015,2), EncarregadoEducacaoId = E(3) },
            new Atleta { Nome = "André Rodrigues", Email = "andre.r@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 111 005", Role = "Atleta", NumeroSocio = "CAP-1005", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Médio",        NumeroCamisola = 8,  DataNascimento = Dt(2015,9), EncarregadoEducacaoId = E(4) },
            new Atleta { Nome = "Mateus Coelho",   Email = "mateus.c@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 111 006", Role = "Atleta", NumeroSocio = "CAP-1006", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Avançado",     NumeroCamisola = 9,  DataNascimento = Dt(2015,6), EncarregadoEducacaoId = E(5) },
            new Atleta { Nome = "Salvador Pinto",  Email = "salvador.p@cap.pt",  PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 111 007", Role = "Atleta", NumeroSocio = "CAP-1007", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Avançado",     NumeroCamisola = 10, DataNascimento = Dt(2015,1), EncarregadoEducacaoId = E(6) },
        };

        // ─────────────────────────────────────────────────────────────────────
        // ATLETAS — FUTEBOL Sub-13
        // ─────────────────────────────────────────────────────────────────────
        var futSub13 = new[]
        {
            new Atleta { Nome = "Rodrigo Almeida", Email = "rodrigo.a@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 112 001", Role = "Atleta", NumeroSocio = "CAP-1101", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Guarda-redes", NumeroCamisola = 1,  DataNascimento = Dt(2013,5), EncarregadoEducacaoId = E(0) },
            new Atleta { Nome = "Hugo Ferreira",   Email = "hugo.f@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 112 002", Role = "Atleta", NumeroSocio = "CAP-1102", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Defesa",       NumeroCamisola = 3,  DataNascimento = Dt(2013,8), EncarregadoEducacaoId = E(1) },
            new Atleta { Nome = "Nuno Pinto",      Email = "nuno.p@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 112 003", Role = "Atleta", NumeroSocio = "CAP-1103", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Defesa",       NumeroCamisola = 4,  DataNascimento = Dt(2014,1), EncarregadoEducacaoId = E(2) },
            new Atleta { Nome = "Bernardo Cruz",   Email = "bernardo.c@cap.pt",  PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 112 004", Role = "Atleta", NumeroSocio = "CAP-1104", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Médio",        NumeroCamisola = 6,  DataNascimento = Dt(2013,3), EncarregadoEducacaoId = E(3) },
            new Atleta { Nome = "Fábio Monteiro",  Email = "fabio.m@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 112 005", Role = "Atleta", NumeroSocio = "CAP-1105", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Médio",        NumeroCamisola = 8,  DataNascimento = Dt(2013,11), EncarregadoEducacaoId = E(4) },
            new Atleta { Nome = "Luís Azevedo",    Email = "luis.a@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 112 006", Role = "Atleta", NumeroSocio = "CAP-1106", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Avançado",     NumeroCamisola = 9,  DataNascimento = Dt(2014,6), EncarregadoEducacaoId = E(5) },
            new Atleta { Nome = "Tomé Guerreiro",  Email = "tome.g@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 112 007", Role = "Atleta", NumeroSocio = "CAP-1107", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Avançado",     NumeroCamisola = 11, DataNascimento = Dt(2013,9), EncarregadoEducacaoId = E(6) },
        };

        // ─────────────────────────────────────────────────────────────────────
        // ATLETAS — FUTEBOL Sub-15
        // ─────────────────────────────────────────────────────────────────────
        var futSub15 = new[]
        {
            new Atleta { Nome = "Tiago Vieira",    Email = "tiago.v@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 113 001", Role = "Atleta", NumeroSocio = "CAP-1201", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2021,9), Posicao = "Guarda-redes", NumeroCamisola = 1,  DataNascimento = Dt(2011,3), EncarregadoEducacaoId = E(7) },
            new Atleta { Nome = "Dinis Carvalho",  Email = "dinis.c@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 113 002", Role = "Atleta", NumeroSocio = "CAP-1202", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2021,9), Posicao = "Defesa",       NumeroCamisola = 2,  DataNascimento = Dt(2011,7), EncarregadoEducacaoId = E(8) },
            new Atleta { Nome = "Simão Ribeiro",   Email = "simao.r@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 113 003", Role = "Atleta", NumeroSocio = "CAP-1203", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2021,9), Posicao = "Defesa",       NumeroCamisola = 5,  DataNascimento = Dt(2012,10), EncarregadoEducacaoId = E(9) },
            new Atleta { Nome = "Martim Nunes",    Email = "martim.n@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 113 004", Role = "Atleta", NumeroSocio = "CAP-1204", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2021,9), Posicao = "Médio",        NumeroCamisola = 6,  DataNascimento = Dt(2011,1), EncarregadoEducacaoId = E(10) },
            new Atleta { Nome = "Afonso Cunha",    Email = "afonso.c@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 113 005", Role = "Atleta", NumeroSocio = "CAP-1205", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2021,9), Posicao = "Médio",        NumeroCamisola = 8,  DataNascimento = Dt(2011,12), EncarregadoEducacaoId = E(11) },
            new Atleta { Nome = "Guilherme Brito", Email = "guilherme.b@cap.pt", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 113 006", Role = "Atleta", NumeroSocio = "CAP-1206", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2021,9), Posicao = "Avançado",     NumeroCamisola = 9,  DataNascimento = Dt(2012,5), EncarregadoEducacaoId = E(0) },
            new Atleta { Nome = "Francisco Melo",  Email = "francisco.m@cap.pt", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 113 007", Role = "Atleta", NumeroSocio = "CAP-1207", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2021,9), Posicao = "Avançado",     NumeroCamisola = 10, DataNascimento = Dt(2011,8), EncarregadoEducacaoId = E(1) },
        };

        // ─────────────────────────────────────────────────────────────────────
        // ATLETAS — FUTEBOL Sub-17
        // ─────────────────────────────────────────────────────────────────────
        var futSub17 = new[]
        {
            new Atleta { Nome = "Rúben Soares",    Email = "ruben.s@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 114 001", Role = "Atleta", NumeroSocio = "CAP-1301", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2020,9), Posicao = "Guarda-redes", NumeroCamisola = 1,  DataNascimento = Dt(2009,2), EncarregadoEducacaoId = E(2) },
            new Atleta { Nome = "Diogo Faria",     Email = "diogo.fa@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 114 002", Role = "Atleta", NumeroSocio = "CAP-1302", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2020,9), Posicao = "Defesa",       NumeroCamisola = 3,  DataNascimento = Dt(2009,6), EncarregadoEducacaoId = E(3) },
            new Atleta { Nome = "Leandro Silva",   Email = "leandro.s@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 114 003", Role = "Atleta", NumeroSocio = "CAP-1303", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2020,9), Posicao = "Defesa",       NumeroCamisola = 4,  DataNascimento = Dt(2009,11), EncarregadoEducacaoId = E(4) },
            new Atleta { Nome = "Éder Campos",     Email = "eder.c@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 114 004", Role = "Atleta", NumeroSocio = "CAP-1304", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2020,9), Posicao = "Médio",        NumeroCamisola = 7,  DataNascimento = Dt(2009,4), EncarregadoEducacaoId = E(5) },
            new Atleta { Nome = "Joel Antunes",    Email = "joel.a@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 114 005", Role = "Atleta", NumeroSocio = "CAP-1305", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2020,9), Posicao = "Médio",        NumeroCamisola = 8,  DataNascimento = Dt(2009,8), EncarregadoEducacaoId = E(6) },
            new Atleta { Nome = "Kevin Tavares",   Email = "kevin.t@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 114 006", Role = "Atleta", NumeroSocio = "CAP-1306", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2020,9), Posicao = "Avançado",     NumeroCamisola = 11, DataNascimento = Dt(2009,1), EncarregadoEducacaoId = E(7) },
            new Atleta { Nome = "Bryan Costa",     Email = "bryan.c@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 114 007", Role = "Atleta", NumeroSocio = "CAP-1307", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2020,9), Posicao = "Avançado",     NumeroCamisola = 9,  DataNascimento = Dt(2009,5), EncarregadoEducacaoId = E(8) },
        };

        // ─────────────────────────────────────────────────────────────────────
        // ATLETAS — BASQUETEBOL Sub-14 Masculino
        // ─────────────────────────────────────────────────────────────────────
        var basSub14M = new[]
        {
            new Atleta { Nome = "Frederico Cunha",  Email = "fred.c@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 200 001", Role = "Atleta", NumeroSocio = "CAP-2001", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Base",    NumeroCamisola = 5,  DataNascimento = Dt(2012,3), EncarregadoEducacaoId = E(9) },
            new Atleta { Nome = "Hélder Barros",    Email = "helder.b@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 200 002", Role = "Atleta", NumeroSocio = "CAP-2002", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Escolta", NumeroCamisola = 7,  DataNascimento = Dt(2012,7), EncarregadoEducacaoId = E(10) },
            new Atleta { Nome = "Danilo Monteiro",  Email = "danilo.m@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 200 003", Role = "Atleta", NumeroSocio = "CAP-2003", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Avançado",NumeroCamisola = 10, DataNascimento = Dt(2012,11), EncarregadoEducacaoId = E(11) },
            new Atleta { Nome = "Cláudio Teixeira", Email = "claudio.t@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 200 004", Role = "Atleta", NumeroSocio = "CAP-2004", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Poste",   NumeroCamisola = 14, DataNascimento = Dt(2012,5), EncarregadoEducacaoId = E(0) },
            new Atleta { Nome = "Renato Ferreira",  Email = "renato.f@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 200 005", Role = "Atleta", NumeroSocio = "CAP-2005", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Poste",   NumeroCamisola = 15, DataNascimento = Dt(2013,2), EncarregadoEducacaoId = E(1) },
            new Atleta { Nome = "Artur Pinheiro",   Email = "artur.p@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 200 006", Role = "Atleta", NumeroSocio = "CAP-2006", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Pivot",   NumeroCamisola = 21, DataNascimento = Dt(2012,9), EncarregadoEducacaoId = E(2) },
        };

        // ─────────────────────────────────────────────────────────────────────
        // ATLETAS — BASQUETEBOL Sénior Feminino
        // ─────────────────────────────────────────────────────────────────────
        var basSenF = new[]
        {
            new Atleta { Nome = "Inês Rodrigues",  Email = "ines.r@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 201 001", Role = "Atleta", NumeroSocio = "CAP-2101", Tipo = "Regular", Estado = "Ativo", DataInscricao = Dt(2019,9), Posicao = "Base",    NumeroCamisola = 4,  DataNascimento = Dt(1998,6), EncarregadoEducacaoId = null },
            new Atleta { Nome = "Beatriz Lopes",   Email = "beatriz.l@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 201 002", Role = "Atleta", NumeroSocio = "CAP-2102", Tipo = "Regular", Estado = "Ativo", DataInscricao = Dt(2020,9), Posicao = "Escolta", NumeroCamisola = 6,  DataNascimento = Dt(2000,3), EncarregadoEducacaoId = null },
            new Atleta { Nome = "Mariana Costa",   Email = "mariana.c@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 201 003", Role = "Atleta", NumeroSocio = "CAP-2103", Tipo = "Regular", Estado = "Ativo", DataInscricao = Dt(2021,9), Posicao = "Avançado",NumeroCamisola = 9,  DataNascimento = Dt(1999,10), EncarregadoEducacaoId = null },
            new Atleta { Nome = "Catarina Neves",  Email = "catarina.n@cap.pt",  PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 201 004", Role = "Atleta", NumeroSocio = "CAP-2104", Tipo = "Regular", Estado = "Ativo", DataInscricao = Dt(2019,9), Posicao = "Poste",   NumeroCamisola = 13, DataNascimento = Dt(1997,8), EncarregadoEducacaoId = null },
            new Atleta { Nome = "Raquel Simões",   Email = "raquel.s@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 201 005", Role = "Atleta", NumeroSocio = "CAP-2105", Tipo = "Regular", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Pivot",   NumeroCamisola = 15, DataNascimento = Dt(2001,2), EncarregadoEducacaoId = null },
            new Atleta { Nome = "Ana Mendes",      Email = "ana.me@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 201 006", Role = "Atleta", NumeroSocio = "CAP-2106", Tipo = "Regular", Estado = "Ativo", DataInscricao = Dt(2020,9), Posicao = "Base",    NumeroCamisola = 3,  DataNascimento = Dt(1999,5), EncarregadoEducacaoId = null },
            new Atleta { Nome = "Joana Figueiredo",Email = "joana.fi@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 201 007", Role = "Atleta", NumeroSocio = "CAP-2107", Tipo = "Regular", Estado = "Ativo", DataInscricao = Dt(2021,3), Posicao = "Escolta", NumeroCamisola = 8,  DataNascimento = Dt(2000,11), EncarregadoEducacaoId = null },
        };

        // ─────────────────────────────────────────────────────────────────────
        // ATLETAS — NATAÇÃO Sub-12
        // ─────────────────────────────────────────────────────────────────────
        var natSub12 = new[]
        {
            new Atleta { Nome = "Miguel Carvalho", Email = "miguel.ca@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 300 001", Role = "Atleta", NumeroSocio = "CAP-3001", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Crol",       NumeroCamisola = 1,  DataNascimento = Dt(2014,4), EncarregadoEducacaoId = E(3) },
            new Atleta { Nome = "Lara Pereira",    Email = "lara.p@cap.pt",      PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 300 002", Role = "Atleta", NumeroSocio = "CAP-3002", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Mariposa",   NumeroCamisola = 2,  DataNascimento = Dt(2014,8), EncarregadoEducacaoId = E(4) },
            new Atleta { Nome = "Tomás Monteiro",  Email = "tomas.mo@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 300 003", Role = "Atleta", NumeroSocio = "CAP-3003", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Costas",     NumeroCamisola = 3,  DataNascimento = Dt(2014,1), EncarregadoEducacaoId = E(5) },
            new Atleta { Nome = "Marta Oliveira",  Email = "marta.o@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 300 004", Role = "Atleta", NumeroSocio = "CAP-3004", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Bruços",     NumeroCamisola = 4,  DataNascimento = Dt(2013,11), EncarregadoEducacaoId = E(6) },
            new Atleta { Nome = "Ivo Santos",      Email = "ivo.s@cap.pt",       PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 300 005", Role = "Atleta", NumeroSocio = "CAP-3005", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Estilos",    NumeroCamisola = 5,  DataNascimento = Dt(2014,6), EncarregadoEducacaoId = E(7) },
            new Atleta { Nome = "Beatriz Cunha",   Email = "beatriz.cu@cap.pt",  PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 300 006", Role = "Atleta", NumeroSocio = "CAP-3006", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2023,9), Posicao = "Crol",       NumeroCamisola = 6,  DataNascimento = Dt(2014,3), EncarregadoEducacaoId = E(8) },
        };

        // ─────────────────────────────────────────────────────────────────────
        // ATLETAS — NATAÇÃO Sub-16
        // ─────────────────────────────────────────────────────────────────────
        var natSub16 = new[]
        {
            new Atleta { Nome = "Gonçalo Reis",    Email = "goncalo.r@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 301 001", Role = "Atleta", NumeroSocio = "CAP-3101", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Crol",       NumeroCamisola = 1,  DataNascimento = Dt(2010,5), EncarregadoEducacaoId = E(9) },
            new Atleta { Nome = "Filipa Cruz",     Email = "filipa.cr@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 301 002", Role = "Atleta", NumeroSocio = "CAP-3102", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Mariposa",   NumeroCamisola = 2,  DataNascimento = Dt(2010,9), EncarregadoEducacaoId = E(10) },
            new Atleta { Nome = "Nuno Marques",    Email = "nuno.ma@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 301 003", Role = "Atleta", NumeroSocio = "CAP-3103", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Costas",     NumeroCamisola = 3,  DataNascimento = Dt(2010,2), EncarregadoEducacaoId = E(11) },
            new Atleta { Nome = "Sofia Tavares",   Email = "sofia.ta@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 301 004", Role = "Atleta", NumeroSocio = "CAP-3104", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Estilos",    NumeroCamisola = 4,  DataNascimento = Dt(2011,7), EncarregadoEducacaoId = E(0) },
            new Atleta { Nome = "Rafael Lemos",    Email = "rafael.le@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 301 005", Role = "Atleta", NumeroSocio = "CAP-3105", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Bruços",     NumeroCamisola = 5,  DataNascimento = Dt(2010,12), EncarregadoEducacaoId = E(1) },
            new Atleta { Nome = "Madalena Pinto",  Email = "madalena.p@cap.pt",  PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "920 301 006", Role = "Atleta", NumeroSocio = "CAP-3106", Tipo = "Jovem", Estado = "Ativo", DataInscricao = Dt(2022,9), Posicao = "Crol",       NumeroCamisola = 6,  DataNascimento = Dt(2010,4), EncarregadoEducacaoId = E(2) },
        };

        usersDb.Atletas.AddRange(futSub11);
        usersDb.Atletas.AddRange(futSub13);
        usersDb.Atletas.AddRange(futSub15);
        usersDb.Atletas.AddRange(futSub17);
        usersDb.Atletas.AddRange(basSub14M);
        usersDb.Atletas.AddRange(basSenF);
        usersDb.Atletas.AddRange(natSub12);
        usersDb.Atletas.AddRange(natSub16);
        await usersDb.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────────────
        // SÓCIOS ADICIONAIS
        // ─────────────────────────────────────────────────────────────────────
        var socios = new[]
        {
            new Utilizador { Nome = "Manuel Gomes",     Email = "manuel.g@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 001", Role = "Socio", NumeroSocio = "CAP-4001", Tipo = "Regular",   Estado = "Ativo",    DataInscricao = Dt(2015,3) },
            new Utilizador { Nome = "Isaura Machado",   Email = "isaura.m@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 002", Role = "Socio", NumeroSocio = "CAP-4002", Tipo = "Regular",   Estado = "Ativo",    DataInscricao = Dt(2016,6) },
            new Utilizador { Nome = "Armando Teixeira", Email = "armando.t@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 003", Role = "Socio", NumeroSocio = "CAP-4003", Tipo = "Honorario", Estado = "Ativo",    DataInscricao = Dt(2010,1) },
            new Utilizador { Nome = "Rosa Marques",     Email = "rosa.ma@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 004", Role = "Socio", NumeroSocio = "CAP-4004", Tipo = "Regular",   Estado = "Ativo",    DataInscricao = Dt(2019,11) },
            new Utilizador { Nome = "Filipe Duarte",    Email = "filipe.d@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 005", Role = "Socio", NumeroSocio = "CAP-4005", Tipo = "Regular",   Estado = "Suspenso", DataInscricao = Dt(2017,4) },
            new Utilizador { Nome = "Conceição Silva",  Email = "conceicao.s@cap.pt", PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 006", Role = "Socio", NumeroSocio = "CAP-4006", Tipo = "Regular",   Estado = "Ativo",    DataInscricao = Dt(2020,7) },
            new Utilizador { Nome = "Vasco Melo",       Email = "vasco.me@cap.pt",    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 007", Role = "Socio", NumeroSocio = "CAP-4007", Tipo = "Jovem",     Estado = "Ativo",    DataInscricao = Dt(2023,9) },
            new Utilizador { Nome = "Helena Castro",    Email = "helena.ca@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 008", Role = "Socio", NumeroSocio = "CAP-4008", Tipo = "Regular",   Estado = "Ativo",    DataInscricao = Dt(2018,2) },
            new Utilizador { Nome = "Óscar Pereira",    Email = "oscar.p@cap.pt",     PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 009", Role = "Socio", NumeroSocio = "CAP-4009", Tipo = "Fundador",  Estado = "Ativo",    DataInscricao = Dt(2010,1) },
            new Utilizador { Nome = "Lurdes Mendonça",  Email = "lurdes.me@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 010", Role = "Socio", NumeroSocio = "CAP-4010", Tipo = "Regular",   Estado = "Ativo",    DataInscricao = Dt(2021,5) },
            new Utilizador { Nome = "Carlos Azevedo",   Email = "carlos.az@cap.pt",   PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 011", Role = "Socio", NumeroSocio = "CAP-4011", Tipo = "Regular",   Estado = "Ativo",    DataInscricao = Dt(2017,9) },
            new Utilizador { Nome = "Fernanda Brites",  Email = "fernanda.b@cap.pt",  PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"), Telefone = "930 001 012", Role = "Socio", NumeroSocio = "CAP-4012", Tipo = "Regular",   Estado = "Suspenso", DataInscricao = Dt(2016,3) },
        };
        usersDb.Utilizadores.AddRange(socios);
        await usersDb.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────────────
        // MODALIDADES E ESCALÕES
        // ─────────────────────────────────────────────────────────────────────
        var futebol      = new Modalidade { Nome = "Futebol",      Descricao = "Futebol de formação e competição" };
        var basquetebol  = new Modalidade { Nome = "Basquetebol",  Descricao = "Basquetebol masculino e feminino" };
        var natacao      = new Modalidade { Nome = "Natação",      Descricao = "Natação de competição" };
        sportsDb.Set<Modalidade>().AddRange(futebol, basquetebol, natacao);
        await sportsDb.SaveChangesAsync();

        var escFutSub11  = new Escalao { Nome = "Sub-11", IdadeMinima = 9,  IdadeMaxima = 11 };
        var escFutSub13  = new Escalao { Nome = "Sub-13", IdadeMinima = 12, IdadeMaxima = 13 };
        var escFutSub15  = new Escalao { Nome = "Sub-15", IdadeMinima = 14, IdadeMaxima = 15 };
        var escFutSub17  = new Escalao { Nome = "Sub-17", IdadeMinima = 16, IdadeMaxima = 17 };
        var escBasSub14  = new Escalao { Nome = "Sub-14", IdadeMinima = 12, IdadeMaxima = 14 };
        var escBasSenior = new Escalao { Nome = "Sénior",  IdadeMinima = 18, IdadeMaxima = 99 };
        var escNatSub12  = new Escalao { Nome = "Sub-12", IdadeMinima = 10, IdadeMaxima = 12 };
        var escNatSub16  = new Escalao { Nome = "Sub-16", IdadeMinima = 14, IdadeMaxima = 16 };
        sportsDb.Set<Escalao>().AddRange(escFutSub11, escFutSub13, escFutSub15, escFutSub17, escBasSub14, escBasSenior, escNatSub12, escNatSub16);
        await sportsDb.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────────────
        // EQUIPAS
        // ─────────────────────────────────────────────────────────────────────
        var eqFutSub11  = new Equipa { Nome = "CAP Sub-11 Futebol",       ModalidadeId = futebol.Id,     EscalaoId = escFutSub11.Id,  TreinadorId = trFutSub11.Id };
        var eqFutSub13  = new Equipa { Nome = "CAP Sub-13 Futebol",       ModalidadeId = futebol.Id,     EscalaoId = escFutSub13.Id,  TreinadorId = trFutSub13.Id };
        var eqFutSub15  = new Equipa { Nome = "CAP Sub-15 Futebol",       ModalidadeId = futebol.Id,     EscalaoId = escFutSub15.Id,  TreinadorId = trFutSub15.Id };
        var eqFutSub17  = new Equipa { Nome = "CAP Sub-17 Futebol",       ModalidadeId = futebol.Id,     EscalaoId = escFutSub17.Id,  TreinadorId = trFutSub17.Id };
        var eqBasSub14M = new Equipa { Nome = "CAP Sub-14 Masculino Bas.", ModalidadeId = basquetebol.Id, EscalaoId = escBasSub14.Id,  TreinadorId = trBasSub14.Id };
        var eqBasSenF   = new Equipa { Nome = "CAP Sénior Feminino Bas.",  ModalidadeId = basquetebol.Id, EscalaoId = escBasSenior.Id, TreinadorId = trBasSen.Id };
        var eqNatSub12  = new Equipa { Nome = "CAP Sub-12 Natação",        ModalidadeId = natacao.Id,     EscalaoId = escNatSub12.Id,  TreinadorId = trNatSub12.Id };
        var eqNatSub16  = new Equipa { Nome = "CAP Sub-16 Natação",        ModalidadeId = natacao.Id,     EscalaoId = escNatSub16.Id,  TreinadorId = trNatSub16.Id };
        sportsDb.Set<Equipa>().AddRange(eqFutSub11, eqFutSub13, eqFutSub15, eqFutSub17, eqBasSub14M, eqBasSenF, eqNatSub12, eqNatSub16);
        await sportsDb.SaveChangesAsync();

        // Associar atletas às equipas
        AssociarAtletas(sportsDb, eqFutSub11,  futSub11);
        AssociarAtletas(sportsDb, eqFutSub13,  futSub13);
        AssociarAtletas(sportsDb, eqFutSub15,  futSub15);
        AssociarAtletas(sportsDb, eqFutSub17,  futSub17);
        AssociarAtletas(sportsDb, eqBasSub14M, basSub14M);
        AssociarAtletas(sportsDb, eqBasSenF,   basSenF);
        AssociarAtletas(sportsDb, eqNatSub12,  natSub12);
        AssociarAtletas(sportsDb, eqNatSub16,  natSub16);
        await sportsDb.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────────────
        // CONVOCATÓRIAS
        // ─────────────────────────────────────────────────────────────────────
        CriarConvocatoria(sportsDb, "Treino Semanal - Sub-15 Futebol",   now.AddDays(2),  "Campo Principal",              eqFutSub15.Id,  futSub15,  EstadoConvocatoria.Publicada);
        CriarConvocatoria(sportsDb, "Jogo vs SC Braga B",                now.AddDays(7),  "Campo Municipal de Polvoreira", eqFutSub15.Id,  futSub15,  EstadoConvocatoria.Publicada);
        CriarConvocatoria(sportsDb, "Treino Tático - Sub-13 Futebol",    now.AddDays(3),  "Campo B",                      eqFutSub13.Id,  futSub13,  EstadoConvocatoria.Publicada);
        CriarConvocatoria(sportsDb, "Jogo vs FC Famalicão Sub-17",       now.AddDays(5),  "Campo Principal",              eqFutSub17.Id,  futSub17,  EstadoConvocatoria.Publicada);
        CriarConvocatoria(sportsDb, "Treino Técnico - Basquetebol",      now.AddDays(1),  "Pavilhão Municipal",           eqBasSenF.Id,   basSenF,   EstadoConvocatoria.Publicada);
        CriarConvocatoria(sportsDb, "Torneio Distrital Natação",         now.AddDays(10), "Piscinas Municipais Braga",    eqNatSub16.Id,  natSub16,  EstadoConvocatoria.Publicada);
        CriarConvocatoria(sportsDb, "Treino Integração - Sub-11",        now.AddDays(4),  "Campo B",                      eqFutSub11.Id,  futSub11,  EstadoConvocatoria.Rascunho);
        await sportsDb.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────────────
        // TREINOS HISTÓRICOS (Para calcular assiduidade)
        // ─────────────────────────────────────────────────────────────────────
        var eqAtletasMap = new Dictionary<Equipa, Atleta[]> {
            { eqFutSub11, futSub11 }, { eqFutSub13, futSub13 }, { eqFutSub15, futSub15 }, { eqFutSub17, futSub17 },
            { eqBasSub14M, basSub14M }, { eqBasSenF, basSenF }, { eqNatSub12, natSub12 }, { eqNatSub16, natSub16 }
        };

        var rngSeeder = new Random(42);
        foreach (var kvp in eqAtletasMap)
        {
            var equipa = kvp.Key;
            var atletas = kvp.Value;

            // Criar 10 treinos passados para cada equipa
            for (int t = 1; t <= 10; t++)
            {
                var treino = new Treino
                {
                    EquipaId = equipa.Id,
                    DataInicio = now.AddDays(-t * 3).Date.AddHours(18), // Treinos a cada 3 dias
                    DataFim = now.AddDays(-t * 3).Date.AddHours(20),
                    EspacoId = Guid.NewGuid(),
                    Descricao = $"Treino Tático/Técnico #{t}"
                };
                sportsDb.Set<Treino>().Add(treino);

                // Presenças
                foreach (var atleta in atletas)
                {
                    // Alguns atletas vêm quase sempre (90-100%), outros faltam mais (50-70%)
                    var propensao = (atleta.Nome.Length % 5) * 10; // 0, 10, 20, 30, 40 -> penalty na assiduidade
                    var sorte = rngSeeder.Next(0, 100);
                    var faltou = sorte < propensao;
                    
                    var presenca = new PresencaTreino
                    {
                        TreinoId = treino.Id,
                        AtletaId = atleta.Id,
                        Estado = faltou ? EstadoPresencaTreino.FaltaInjustificada : EstadoPresencaTreino.Presente
                    };
                    sportsDb.Set<PresencaTreino>().Add(presenca);
                }
            }
        }
        await sportsDb.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────────────
        // ATESTADOS MÉDICOS
        // ─────────────────────────────────────────────────────────────────────
        var todosAtletas = futSub11.Concat(futSub13).Concat(futSub15).Concat(futSub17)
                                   .Concat(basSub14M).Concat(basSenF)
                                   .Concat(natSub12).Concat(natSub16).ToArray();

        var medicos = new[] { "Dr. Manuel Peixoto", "Dra. Ana Luísa Costa", "Dr. Jorge Campos", "Dra. Filipa Melo", "Dr. Nuno Saraiva" };

        // Distribuição: maioria válidos, alguns a expirar, 2 expirados
        for (int i = 0; i < todosAtletas.Length; i++)
        {
            DateTime expiracao;
            string? obs = null;
            if (i % 15 == 0)      { expiracao = now.AddDays(-45); obs = "Renovação urgente necessária"; }   // expirado
            else if (i % 7 == 0)  { expiracao = now.AddDays(18 + i % 5); obs = "Próximo da validade"; }     // a expirar
            else                   { expiracao = now.AddMonths(6 + i % 6); }                                  // válido

            clinicalDb.Set<AtestadoMedico>().Add(new AtestadoMedico
            {
                AtletaId          = todosAtletas[i].Id,
                DataEmissao       = expiracao.AddYears(-1),
                DataExpiracao     = expiracao,
                MedicoResponsavel = medicos[i % medicos.Length],
                Observacoes       = obs,
                CaminhoFicheiro   = "/uploads/atestado.pdf"
            });
        }
        await clinicalDb.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────────────
        // FINANCEIRO
        // ─────────────────────────────────────────────────────────────────────
        var defFormacao = new QuotaDefinicao { Nome = "Mensalidade Formação", Valor = 25.00m, Descricao = "Quota mensal para atletas de formação (Sub-11 a Sub-17)" };
        var defBas      = new QuotaDefinicao { Nome = "Mensalidade Desporto", Valor = 30.00m, Descricao = "Quota mensal para atletas basquetebol e natação" };
        var defSenior   = new QuotaDefinicao { Nome = "Mensalidade Sénior",   Valor = 20.00m, Descricao = "Quota mensal para atletas sénior" };
        financeDb.Set<QuotaDefinicao>().AddRange(defFormacao, defBas, defSenior);
        await financeDb.SaveChangesAsync();

        QuotaDefinicao DefPara(Atleta a)
        {
            if (basSenF.Contains(a)) return defSenior;
            if (basSub14M.Contains(a) || natSub12.Contains(a) || natSub16.Contains(a)) return defBas;
            return defFormacao;
        }

        var rng = new Random(42); // seed fixo para reprodutibilidade
        for (int i = 0; i < todosAtletas.Length; i++)
        {
            var def = DefPara(todosAtletas[i]);
            for (int mes = -4; mes <= 0; mes++)
            {
                var vencimento = new DateTime(now.Year, now.Month, 8, 0, 0, 0, DateTimeKind.Utc).AddMonths(mes);
                var pago = mes < -1 ? true : rng.Next(0, 4) != 0; // meses antigos 100% pagos, recentes 75%
                financeDb.Set<Quota>().Add(new Quota
                {
                    AtletaId         = todosAtletas[i].Id,
                    QuotaDefinicaoId = def.Id,
                    ValorTotal       = def.Valor,
                    ValorPago        = pago ? def.Valor : 0m,
                    DataVencimento   = vencimento,
                    Estado           = pago ? EstadoQuota.Paga : EstadoQuota.Pendente
                });
            }
        }
        await financeDb.SaveChangesAsync();

        // ─────────────────────────────────────────────────────────────────────
        // INSTALAÇÕES
        // ─────────────────────────────────────────────────────────────────────
        var campo     = new Espaco { Nome = "Campo Principal",   Tipo = TipoEspaco.CampoRelvado, Capacidade = 150, Ativo = true, Observacoes = "Relva sintética, iluminação noturna" };
        var campoB    = new Espaco { Nome = "Campo B (Treino)",  Tipo = TipoEspaco.CampoRelvado, Capacidade = 80,  Ativo = true, Observacoes = "Relva natural, sem iluminação" };
        var pavilhao  = new Espaco { Nome = "Pavilhão",          Tipo = TipoEspaco.Pavilhao,     Capacidade = 200, Ativo = true, Observacoes = "Piso sintético, tabelas ajustáveis" };
        var ginasio   = new Espaco { Nome = "Ginásio",           Tipo = TipoEspaco.Ginasio,      Capacidade = 30,  Ativo = true, Observacoes = "Equipamento musculação e cardio" };
        var balA      = new Espaco { Nome = "Balneário A",        Tipo = TipoEspaco.Balneario,     Capacidade = 20,  Ativo = true };
        var balB      = new Espaco { Nome = "Balneário B",        Tipo = TipoEspaco.Balneario,     Capacidade = 20,  Ativo = true };
        facilitiesDb.Set<Espaco>().AddRange(campo, campoB, pavilhao, ginasio, balA, balB);
        await facilitiesDb.SaveChangesAsync();

        var reservas = new[]
        {
            new Reserva { EspacoId = campo.Id,    RequisitanteId = trFutSub15.Id, Titulo = "Treino Sub-15 Futebol",      DataInicio = now.AddDays(1).Date.AddHours(17), DataFim = now.AddDays(1).Date.AddHours(19) },
            new Reserva { EspacoId = campoB.Id,   RequisitanteId = trFutSub11.Id, Titulo = "Treino Sub-11 Futebol",      DataInicio = now.AddDays(1).Date.AddHours(15), DataFim = now.AddDays(1).Date.AddHours(17) },
            new Reserva { EspacoId = pavilhao.Id, RequisitanteId = trBasSen.Id,   Titulo = "Treino Basquetebol Sénior F",DataInicio = now.AddDays(1).Date.AddHours(19), DataFim = now.AddDays(1).Date.AddHours(21) },
            new Reserva { EspacoId = campo.Id,    RequisitanteId = trFutSub17.Id, Titulo = "Jogo vs FC Famalicão Sub-17",DataInicio = now.AddDays(5).Date.AddHours(10), DataFim = now.AddDays(5).Date.AddHours(12) },
            new Reserva { EspacoId = campo.Id,    RequisitanteId = trFutSub15.Id, Titulo = "Jogo vs SC Braga B",         DataInicio = now.AddDays(7).Date.AddHours(10), DataFim = now.AddDays(7).Date.AddHours(12) },
            new Reserva { EspacoId = pavilhao.Id, RequisitanteId = trBasSub14.Id, Titulo = "Treino Sub-14 Masculino",    DataInicio = now.AddDays(3).Date.AddHours(16), DataFim = now.AddDays(3).Date.AddHours(18) },
            new Reserva { EspacoId = ginasio.Id,  RequisitanteId = trFutSub17.Id, Titulo = "Treino Físico Sub-17",       DataInicio = now.AddDays(2).Date.AddHours(16), DataFim = now.AddDays(2).Date.AddHours(17).AddMinutes(30) },
            new Reserva { EspacoId = campoB.Id,   RequisitanteId = trFutSub13.Id, Titulo = "Treino Sub-13 Futebol",      DataInicio = now.AddDays(3).Date.AddHours(18), DataFim = now.AddDays(3).Date.AddHours(20) },
        };
        facilitiesDb.Set<Reserva>().AddRange(reservas);
        await facilitiesDb.SaveChangesAsync();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
    private static DateTime Dt(int year, int month, int day = 1) =>
        new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);

    private static void AssociarAtletas(SportsDbContext db, Equipa equipa, IEnumerable<Atleta> atletas)
    {
        foreach (var a in atletas)
            equipa.Atletas.Add(new AtletaEquipa { AtletaId = a.Id, EquipaId = equipa.Id });
    }

    private static void CriarConvocatoria(SportsDbContext db, string titulo, DateTime data, string local, Guid equipaId, IEnumerable<Atleta> atletas, EstadoConvocatoria estado)
    {
        var conv = new Convocatoria { Titulo = titulo, DataEvento = data, Local = local, EquipaId = equipaId, Estado = estado };
        int i = 0;
        foreach (var a in atletas)
        {
            var presenca = i == 0 ? EstadoPresenca.Confirmada :
                           i == 1 && estado == EstadoConvocatoria.Publicada ? EstadoPresenca.Ausente :
                           EstadoPresenca.Pendente;
            conv.Convites.Add(new Convite { AtletaId = a.Id, Presenca = presenca });
            i++;
        }
        db.Set<Convocatoria>().Add(conv);
    }

    // Garante que as contas demo continuam a funcionar:
    // - Repõe password "123456" se o hash atual não validar
    // - Limpa lockouts e FailedLoginAttempts
    // Executa sempre que a API arranca (em desenvolvimento).
    public static async Task EnsureDemoAccountsWorkAsync(UsersDbContext usersDb)
    {
        var demoEmails = new[]
        {
            "secretaria@cap.pt",
            "gerencia@cap.pt",
            "treinador@cap.pt",
            "encarregado@cap.pt",
            "atleta@cap.pt",
        };

        var demoUsers = await usersDb.Utilizadores
            .Where(u => demoEmails.Contains(u.Email))
            .ToListAsync();

        var alterado = false;
        foreach (var user in demoUsers)
        {
            // Reset lockout/falhas para evitar bloqueios em desenvolvimento
            if (user.LockoutEnd.HasValue || user.FailedLoginAttempts > 0)
            {
                user.LockoutEnd = null;
                user.FailedLoginAttempts = 0;
                alterado = true;
            }

            // Garante password "123456" e estado ativo
            bool hashInvalido;
            try
            {
                hashInvalido = string.IsNullOrEmpty(user.PasswordHash)
                    || user.PasswordHash == "INVITED_PENDING_SETUP"
                    || !BCrypt.Net.BCrypt.Verify("123456", user.PasswordHash);
            }
            catch
            {
                hashInvalido = true;
            }

            if (hashInvalido)
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");
                user.MustChangePassword = false;
                user.InvitationToken = null;
                alterado = true;
            }

            if (user.Estado != "Ativo")
            {
                user.Estado = "Ativo";
                alterado = true;
            }
        }

        if (alterado)
            await usersDb.SaveChangesAsync();
    }
}
