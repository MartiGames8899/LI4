using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CAP.Modules.Reports.Core.Services;

public interface IExportService
{
    byte[] GeneratePdfReport(string title, string content);
    byte[] GeneratePdfReport(string title, IReadOnlyList<(string Label, string Value)> stats, IReadOnlyList<string[]>? tableRows = null, string[]? tableHeaders = null);
    byte[] GenerateExcelReport<T>(string sheetName, IEnumerable<T> data);
}

public class ExportService : IExportService
{
    public ExportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GeneratePdfReport(string title, string content)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(12));

                page.Header().Text(title).SemiBold().FontSize(20).FontColor(Colors.Blue.Darken2);

                page.Content().PaddingVertical(1, Unit.Centimetre).Text(content);

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Página ");
                    x.CurrentPageNumber();
                    x.Span(" de ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GeneratePdfReport(string title, IReadOnlyList<(string Label, string Value)> stats, IReadOnlyList<string[]>? tableRows = null, string[]? tableHeaders = null)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header().Column(col =>
                {
                    col.Item().Text(title).SemiBold().FontSize(20).FontColor(Colors.Blue.Darken2);
                    col.Item().Text($"CAP - Clube Amigos de Polvoreira").FontSize(10).FontColor(Colors.Grey.Darken1);
                    col.Item().Text($"Gerado em {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(9).FontColor(Colors.Grey.Medium);
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Column(content =>
                {
                    if (stats.Count > 0)
                    {
                        content.Item().PaddingBottom(10).Text("Resumo").SemiBold().FontSize(14).FontColor(Colors.Blue.Darken2);
                        content.Item().PaddingBottom(20).Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn();
                                c.RelativeColumn();
                            });
                            foreach (var (label, value) in stats)
                            {
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(label).SemiBold();
                                table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(value);
                            }
                        });
                    }

                    if (tableRows != null && tableRows.Count > 0 && tableHeaders != null)
                    {
                        content.Item().PaddingBottom(10).Text("Detalhe").SemiBold().FontSize(14).FontColor(Colors.Blue.Darken2);
                        content.Item().Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                foreach (var _ in tableHeaders) c.RelativeColumn();
                            });
                            table.Header(header =>
                            {
                                foreach (var h in tableHeaders)
                                {
                                    header.Cell().Background(Colors.Blue.Lighten4).Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(5).Text(h).SemiBold();
                                }
                            });
                            foreach (var row in tableRows)
                            {
                                foreach (var cell in row)
                                {
                                    table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(cell ?? "");
                                }
                            }
                        });
                    }
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Página ");
                    x.CurrentPageNumber();
                    x.Span(" de ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GenerateExcelReport<T>(string sheetName, IEnumerable<T> data)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(sheetName);
        
        var properties = typeof(T).GetProperties();
        
        // Header
        for (int i = 0; i < properties.Length; i++)
        {
            worksheet.Cell(1, i + 1).Value = properties[i].Name;
            worksheet.Cell(1, i + 1).Style.Font.Bold = true;
        }

        // Data
        var rowIndex = 2;
        foreach (var item in data)
        {
            for (int i = 0; i < properties.Length; i++)
            {
                var val = properties[i].GetValue(item);
                worksheet.Cell(rowIndex, i + 1).Value = val?.ToString() ?? string.Empty;
            }
            rowIndex++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
