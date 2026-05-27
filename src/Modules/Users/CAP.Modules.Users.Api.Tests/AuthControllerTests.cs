using CAP.Modules.Users.Api.Controllers;
using CAP.Modules.Users.Core.DTOs;
using CAP.Modules.Users.Core.Domain;
using CAP.Modules.Users.Core.Services;
using CAP.Modules.Users.Data.Context;
using CAP.Modules.Users.Data.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace CAP.Modules.Users.Api.Tests;

public class AuthControllerTests
{
    private readonly DbContextOptions<UsersDbContext> _options;

    public AuthControllerTests()
    {
        _options = new DbContextOptionsBuilder<UsersDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task Register_ValidUser_ReturnsOkAndHashesPassword()
    {
        // Arrange
        using var context = new UsersDbContext(_options);
        var repo = new UserRepository(context);
        var jwtMock = new Mock<IJwtService>();
        var controller = new AuthController(repo, jwtMock.Object);

        var request = new RegisterRequest("Test User", "test@cap.pt", "password123", "Socio");

        // Act
        var result = await controller.Register(request);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        var dbUser = await context.Utilizadores.FirstOrDefaultAsync(u => u.Email == "test@cap.pt");
        Assert.NotNull(dbUser);
        Assert.True(BCrypt.Net.BCrypt.Verify("password123", dbUser.PasswordHash));
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsToken()
    {
        // Arrange
        using var context = new UsersDbContext(_options);
        var repo = new UserRepository(context);
        
        var user = new Utilizador
        {
            Nome = "Login Test",
            Email = "login@cap.pt",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("securepass"),
            Role = "Socio"
        };
        context.Utilizadores.Add(user);
        await context.SaveChangesAsync();

        var jwtMock = new Mock<IJwtService>();
        jwtMock.Setup(j => j.GenerateToken(It.IsAny<Utilizador>())).Returns("fake-jwt-token");

        var controller = new AuthController(repo, jwtMock.Object);
        var request = new LoginRequest("login@cap.pt", "securepass");

        // Act
        var result = await controller.Login(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<LoginResponse>(okResult.Value);
        Assert.Equal("fake-jwt-token", response.Token);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        using var context = new UsersDbContext(_options);
        var repo = new UserRepository(context);
        
        var user = new Utilizador
        {
            Nome = "Invalid Test",
            Email = "invalid@cap.pt",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("securepass"),
            Role = "Socio"
        };
        context.Utilizadores.Add(user);
        await context.SaveChangesAsync();

        var jwtMock = new Mock<IJwtService>();
        var controller = new AuthController(repo, jwtMock.Object);
        
        var request = new LoginRequest("invalid@cap.pt", "wrongpassword");

        // Act
        var result = await controller.Login(request);

        // Assert
        var unauthResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("Credenciais inválidas", unauthResult.Value);
    }
}
