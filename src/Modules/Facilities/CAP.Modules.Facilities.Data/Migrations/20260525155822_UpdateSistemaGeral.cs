using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Facilities.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSistemaGeral : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Encomendas",
                schema: "facilities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UtilizadorId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataEncomenda = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    Total = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Encomendas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Produtos",
                schema: "facilities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    Preco = table.Column<decimal>(type: "numeric", nullable: false),
                    StockAtual = table.Column<int>(type: "integer", nullable: false),
                    ImagemUrl = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Produtos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LinhasEncomenda",
                schema: "facilities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EncomendaId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    PrecoUnitario = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinhasEncomenda", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LinhasEncomenda_Encomendas_EncomendaId",
                        column: x => x.EncomendaId,
                        principalSchema: "facilities",
                        principalTable: "Encomendas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LinhasEncomenda_Produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalSchema: "facilities",
                        principalTable: "Produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LinhasEncomenda_EncomendaId",
                schema: "facilities",
                table: "LinhasEncomenda",
                column: "EncomendaId");

            migrationBuilder.CreateIndex(
                name: "IX_LinhasEncomenda_ProdutoId",
                schema: "facilities",
                table: "LinhasEncomenda",
                column: "ProdutoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LinhasEncomenda",
                schema: "facilities");

            migrationBuilder.DropTable(
                name: "Encomendas",
                schema: "facilities");

            migrationBuilder.DropTable(
                name: "Produtos",
                schema: "facilities");
        }
    }
}
