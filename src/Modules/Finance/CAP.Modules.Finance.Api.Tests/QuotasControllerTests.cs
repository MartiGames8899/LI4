using CAP.Modules.Finance.Api.Controllers;
using CAP.Modules.Finance.Core.Domain;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace CAP.Modules.Finance.Api.Tests;

public class QuotasControllerTests
{
    [Fact]
    public async Task GetQuotas_ReturnsOk_WithQuotas()
    {
        // Arrange
        var mockRepo = new Mock<IRepository<Quota>>();
        var mockDefRepo = new Mock<IRepository<QuotaDefinicao>>();
        var fakeList = new List<Quota>
        {
            new Quota { ValorTotal = 20m }
        };
        mockRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(fakeList);
        
        var controller = new QuotasController(mockDefRepo.Object, mockRepo.Object);

        // Act
        var result = await controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnList = Assert.IsType<List<Quota>>(okResult.Value);
        Assert.Single(returnList);
        Assert.Equal(20m, returnList[0].ValorTotal);
    }
}
