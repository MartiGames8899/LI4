using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace CAP.Modules.Reports.Core.Services;

public interface IExportService
{
    byte[] GeneratePdfReport(string title, string content);
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
