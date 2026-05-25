namespace CAP.Modules.Users.Core.Domain;

public class Atleta : Utilizador
{
    public string Posicao { get; set; } = string.Empty;
    public int NumeroCamisola { get; set; }
    public DateTime DataNascimento { get; set; }
    public Guid? EncarregadoEducacaoId { get; set; }
    public EncarregadoEducacao? EncarregadoEducacao { get; set; }
}
