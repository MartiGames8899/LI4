namespace CAP.Modules.Users.Core.Domain;

public class EncarregadoEducacao : Utilizador
{
    public ICollection<Atleta> AtletasDependentes { get; set; } = new List<Atleta>();
}
