using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Reports.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "reports");

            migrationBuilder.CreateTable(
                name: "ResumosDesportivos",
                schema: "reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EquipaId = table.Column<Guid>(type: "uuid", nullable: false),
                    EquipaNome = table.Column<string>(type: "text", nullable: false),
                    NumeroAtletas = table.Column<int>(type: "integer", nullable: false),
                    NumeroConvocatorias = table.Column<int>(type: "integer", nullable: false),
                    MediaPresencas = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResumosDesportivos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ResumosFinanceiros",
                schema: "reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Mes = table.Column<int>(type: "integer", nullable: false),
                    Ano = table.Column<int>(type: "integer", nullable: false),
                    TotalRecebido = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalPendente = table.Column<decimal>(type: "numeric", nullable: false),
                    NumeroPagamentos = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResumosFinanceiros", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResumosDesportivos",
                schema: "reports");

            migrationBuilder.DropTable(
                name: "ResumosFinanceiros",
                schema: "reports");
        }
    }
}
