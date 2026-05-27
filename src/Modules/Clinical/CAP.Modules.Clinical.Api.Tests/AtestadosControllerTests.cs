using CAP.Modules.Clinical.Api.Controllers;
using CAP.Modules.Clinical.Core.Domain;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace CAP.Modules.Clinical.Api.Tests;

public class AtestadosControllerTests
{
    [Fact]
    public async Task GetAtestados_ReturnsOk()
    {
        // Arrange
        var mockRepo = new Mock<IRepository<AtestadoMedico>>();
        var mockMediator = new Mock<MediatR.IMediator>();
        var fakeList = new List<AtestadoMedico>
        {
            new AtestadoMedico { DataExpiracao = DateTime.UtcNow.AddMonths(1) }
        };
        mockRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(fakeList);
        
        var controller = new AtestadosController(mockRepo.Object, mockMediator.Object);

        // Act
        var result = await controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnList = Assert.IsType<List<AtestadoMedico>>(okResult.Value);
        Assert.Single(returnList);
    }
}
