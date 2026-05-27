using System.Security.Claims;
using CAP.Modules.Notifications.Api.Controllers;
using CAP.Modules.Notifications.Core.Domain;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace CAP.Modules.Notifications.Api.Tests;

public class NotificationsControllerTests
{
    [Fact]
    public async Task GetInbox_ReturnsOk()
    {
        // Arrange
        var mockRepo = new Mock<IRepository<Notificacao>>();
        var mockPrefRepo = new Mock<IRepository<NotificacaoPreferencia>>();
        
        var fakeUserId = Guid.NewGuid();
        var fakeList = new List<Notificacao>
        {
            new Notificacao { UtilizadorId = fakeUserId, Mensagem = "Nova Convocatória" }
        };
        mockRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(fakeList);
        
        var controller = new NotificationsController(mockRepo.Object, mockPrefRepo.Object);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.NameIdentifier, fakeUserId.ToString())
        }, "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };

        // Act
        var result = await controller.GetInbox();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var returnList = Assert.IsAssignableFrom<IEnumerable<CAP.Modules.Notifications.Core.DTOs.NotificationResponse>>(okResult.Value);
        Assert.Single(returnList);
    }
}
