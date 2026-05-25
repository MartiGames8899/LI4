using CAP.Modules.Facilities.Core.Domain;
using CAP.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CAP.Modules.Facilities.Api.Controllers;

[ApiController]
[Route("api/facilities/store")]
public class LojaController : ControllerBase
{
    private readonly IRepository<Produto> _produtoRepository;
    private readonly IRepository<Encomenda> _encomendaRepository;

    public LojaController(IRepository<Produto> produtoRepository, IRepository<Encomenda> encomendaRepository)
    {
        _produtoRepository = produtoRepository;
        _encomendaRepository = encomendaRepository;
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts()
    {
        var produtos = await _produtoRepository.GetAllAsync();
        return Ok(produtos);
    }

    [HttpPost("orders")]
    [Authorize]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId)) return Unauthorized();

        var encomenda = new Encomenda
        {
            UtilizadorId = userId,
            Estado = EstadoEncomenda.Pendente
        };

        decimal total = 0;
        foreach (var item in request.Items)
        {
            var produto = await _produtoRepository.GetByIdAsync(item.ProdutoId);
            if (produto == null || produto.StockAtual < item.Quantidade)
                return BadRequest($"Produto {item.ProdutoId} inexistente ou sem stock suficiente.");

            produto.StockAtual -= item.Quantidade;
            await _produtoRepository.UpdateAsync(produto);

            encomenda.Linhas.Add(new LinhaEncomenda
            {
                ProdutoId = item.ProdutoId,
                Quantidade = item.Quantidade,
                PrecoUnitario = produto.Preco
            });

            total += produto.Preco * item.Quantidade;
        }

        encomenda.Total = total;

        await _encomendaRepository.AddAsync(encomenda);
        await _encomendaRepository.SaveChangesAsync();

        return Ok(encomenda);
    }
}

public record CreateOrderRequest(List<OrderItemRequest> Items);
public record OrderItemRequest(Guid ProdutoId, int Quantidade);
