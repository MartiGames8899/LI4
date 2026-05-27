using CAP.Modules.Sports.Api.Controllers;
using CAP.Modules.Sports.Core.Domain;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace CAP.Modules.Sports.Api.Tests;

public class ConvocationsControllerTests
{
    [Fact]
    public async Task Get_ReturnsOk_WithConvocations()
    {
        // Arrange
        var mockRepo = new Mock<IRepository<Convocatoria>>();
        var mockClinicalService = new Mock<CAP.Modules.Clinical.Core.Services.IClinicalService>();
        var fakeList = new List<Convocatoria>
        {
            new Convocatoria { Titulo = "Jogo Fim de Semana" }
        };
        mockRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(fakeList);
        
        var controller = new ConvocatoriasController(mockRepo.Object, mockClinicalService.Object);

        // Act
        var result = await controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }
}
