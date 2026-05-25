using CAP.Shared.Domain;

namespace CAP.Modules.Facilities.Core.Domain;

public class Produto : Entity
{
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public int StockAtual { get; set; }
    public string ImagemUrl { get; set; } = string.Empty;
}

public class Encomenda : Entity
{
    public Guid UtilizadorId { get; set; }
    public DateTime DataEncomenda { get; set; } = DateTime.UtcNow;
    public EstadoEncomenda Estado { get; set; } = EstadoEncomenda.Pendente;
    public decimal Total { get; set; }
    
    public List<LinhaEncomenda> Linhas { get; set; } = new();
}

public class LinhaEncomenda : Entity
{
    public Guid EncomendaId { get; set; }
    public Guid ProdutoId { get; set; }
    public Produto? Produto { get; set; }
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
}

public enum EstadoEncomenda
{
    Pendente,
    Paga,
    EmPreparacao,
    Enviada,
    Entregue,
    Cancelada
}
