using CAP.Modules.Finance.Core.Domain;
using CAP.Modules.Reports.Api.Controllers;
using CAP.Modules.Reports.Core.Domain;
using CAP.Modules.Reports.Core.Services;
using CAP.Modules.Users.Data.Context;
using CAP.Modules.Users.Data.Repositories;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace CAP.Modules.Reports.Api.Tests;

public class ReportsControllerTests
{
    [Fact]
    public async Task GetFinancialSummary_ReturnsOk()
    {
        // Arrange
        var mockFin = new Mock<IRepository<ResumoFinanceiro>>();
        var mockSports = new Mock<IRepository<ResumoDesportivo>>();
        var mockQuota = new Mock<IRepository<Quota>>();
        var mockPagamento = new Mock<IRepository<Pagamento>>();
        var mockExport = new Mock<IExportService>();
        var mockSaft = new Mock<ISaftService>();

        var dbOptions = new DbContextOptionsBuilder<UsersDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var userRepo = new UserRepository(new UsersDbContext(dbOptions));

        var fakeList = new List<ResumoFinanceiro>
        {
            new ResumoFinanceiro { TotalRecebido = 1000m }
        };
        mockFin.Setup(repo => repo.GetAllAsync()).ReturnsAsync(fakeList);

        var controller = new ReportsController(
            mockFin.Object,
            mockSports.Object,
            mockQuota.Object,
            mockPagamento.Object,
            userRepo,
            mockExport.Object,
            mockSaft.Object);

        // Act
        var result = await controller.GetFinancialSummary();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnList = Assert.IsType<List<ResumoFinanceiro>>(okResult.Value);
        Assert.Single(returnList);
        Assert.Equal(1000m, returnList[0].TotalRecebido);
    }
}
