using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Finance.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialFinance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "finance");

            migrationBuilder.CreateTable(
                name: "Pagamentos",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AtletaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    DataPagamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Metodo = table.Column<int>(type: "integer", nullable: false),
                    Referencia = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pagamentos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuotaDefinicoes",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuotaDefinicoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Recibos",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NumeroRecibo = table.Column<string>(type: "text", nullable: false),
                    PagamentoId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValorTotal = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recibos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recibos_Pagamentos_PagamentoId",
                        column: x => x.PagamentoId,
                        principalSchema: "finance",
                        principalTable: "Pagamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Quotas",
                schema: "finance",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AtletaId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotaDefinicaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValorTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quotas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quotas_QuotaDefinicoes_QuotaDefinicaoId",
                        column: x => x.QuotaDefinicaoId,
                        principalSchema: "finance",
                        principalTable: "QuotaDefinicoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PagamentoQuota",
                schema: "finance",
                columns: table => new
                {
                    PagamentoId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotasLiquidadasId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PagamentoQuota", x => new { x.PagamentoId, x.QuotasLiquidadasId });
                    table.ForeignKey(
                        name: "FK_PagamentoQuota_Pagamentos_PagamentoId",
                        column: x => x.PagamentoId,
                        principalSchema: "finance",
                        principalTable: "Pagamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PagamentoQuota_Quotas_QuotasLiquidadasId",
                        column: x => x.QuotasLiquidadasId,
                        principalSchema: "finance",
                        principalTable: "Quotas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PagamentoQuota_QuotasLiquidadasId",
                schema: "finance",
                table: "PagamentoQuota",
                column: "QuotasLiquidadasId");

            migrationBuilder.CreateIndex(
                name: "IX_Quotas_QuotaDefinicaoId",
                schema: "finance",
                table: "Quotas",
                column: "QuotaDefinicaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Recibos_NumeroRecibo",
                schema: "finance",
                table: "Recibos",
                column: "NumeroRecibo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recibos_PagamentoId",
                schema: "finance",
                table: "Recibos",
                column: "PagamentoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PagamentoQuota",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Recibos",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Quotas",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "Pagamentos",
                schema: "finance");

            migrationBuilder.DropTable(
                name: "QuotaDefinicoes",
                schema: "finance");
        }
    }
}
