using CAP.Modules.Reports.Api.Controllers;
using CAP.Modules.Reports.Core.Domain;
using CAP.Modules.Reports.Core.Services;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Mvc;
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
        var mockExport = new Mock<IExportService>();
        var mockSaft = new Mock<ISaftService>();
        
        var fakeList = new List<ResumoFinanceiro>
        {
            new ResumoFinanceiro { TotalRecebido = 1000m }
        };
        mockFin.Setup(repo => repo.GetAllAsync()).ReturnsAsync(fakeList);
        
        var controller = new ReportsController(mockFin.Object, mockSports.Object, mockExport.Object, mockSaft.Object);

        // Act
        var result = await controller.GetFinancialSummary();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnList = Assert.IsType<List<ResumoFinanceiro>>(okResult.Value);
        Assert.Single(returnList);
        Assert.Equal(1000m, returnList[0].TotalRecebido);
    }
}
