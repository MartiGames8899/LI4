using CAP.Modules.Facilities.Api.Controllers;
using CAP.Modules.Facilities.Core.Domain;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace CAP.Modules.Facilities.Api.Tests;

public class EspacosControllerTests
{
    [Fact]
    public async Task GetSpaces_ReturnsOk()
    {
        // Arrange
        var mockRepo = new Mock<IRepository<Espaco>>();
        var mockReservaRepo = new Mock<IRepository<Reserva>>();
        var mockService = new Mock<CAP.Modules.Facilities.Core.Services.IFacilityService>();
        var fakeList = new List<Espaco>
        {
            new Espaco { Nome = "Pavilhão Principal" }
        };
        mockRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(fakeList);
        
        var controller = new FacilitiesController(mockRepo.Object, mockReservaRepo.Object, mockService.Object);

        // Act
        var result = await controller.GetSpaces();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnList = Assert.IsType<List<Espaco>>(okResult.Value);
        Assert.Single(returnList);
        Assert.Equal("Pavilhão Principal", returnList[0].Nome);
    }
}
