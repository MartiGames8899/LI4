namespace CAP.Modules.Users.Core.Domain;

public class EncarregadoEducacao : Utilizador
{
    public string Telefone { get; set; } = string.Empty;
    public ICollection<Atleta> AtletasDependentes { get; set; } = new List<Atleta>();
}
