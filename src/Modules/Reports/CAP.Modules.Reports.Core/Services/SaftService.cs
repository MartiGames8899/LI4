using System.Xml.Linq;
using CAP.Modules.Finance.Core.Domain;
using CAP.Shared.Domain;

namespace CAP.Modules.Reports.Core.Services;

public interface ISaftService
{
    string GenerateSaftXml(int ano, int mes);
}

public class SaftService : ISaftService
{
    private readonly IRepository<Recibo> _reciboRepository;

    public SaftService(IRepository<Recibo> reciboRepository)
    {
        _reciboRepository = reciboRepository;
    }

    public string GenerateSaftXml(int ano, int mes)
    {
        var recibos = _reciboRepository.GetAllAsync().GetAwaiter().GetResult()
            .Where(r => r.DataEmissao.Year == ano && r.DataEmissao.Month == mes)
            .ToList();

        var totalDebit = 0m;
        var totalCredit = recibos.Sum(r => r.ValorTotal);

        var doc = new XDocument(
            new XElement("AuditFile",
                new XAttribute("xmlns", "urn:OECD:StandardAuditFile-Tax:PT_1.04_01"),
                new XElement("Header",
                    new XElement("AuditFileVersion", "1.04_01"),
                    new XElement("CompanyID", "CAP-CLUBE-AMIGOS-POLVOREIRA"),
                    new XElement("TaxRegistrationNumber", "500000000"),
                    new XElement("TaxAccountingBasis", "P"),
                    new XElement("CompanyName", "Clube Amigos de Polvoreira"),
                    new XElement("BusinessName", "CAP"),
                    new XElement("FiscalYear", ano)
                ),
                new XElement("MasterFiles",
                    new XElement("GeneralLedgerAccounts", "...")
                ),
                new XElement("SourceDocuments",
                    new XElement("SalesInvoices",
                        new XElement("NumberOfEntries", recibos.Count),
                        new XElement("TotalDebit", totalDebit.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)),
                        new XElement("TotalCredit", totalCredit.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)),
                        recibos.Select(r => new XElement("Invoice",
                            new XElement("InvoiceNo", r.NumeroRecibo),
                            new XElement("InvoiceDate", r.DataEmissao.ToString("yyyy-MM-dd")),
                            new XElement("DocumentTotals",
                                new XElement("TaxPayable", "0.00"),
                                new XElement("NetTotal", r.ValorTotal.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)),
                                new XElement("GrossTotal", r.ValorTotal.ToString("F2", System.Globalization.CultureInfo.InvariantCulture))
                            )
                        ))
                    )
                )
            )
        );

        return doc.ToString();
    }
}
