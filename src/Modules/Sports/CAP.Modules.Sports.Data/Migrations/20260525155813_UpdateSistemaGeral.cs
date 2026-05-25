using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Sports.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSistemaGeral : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AvaliacoesQualitativas",
                schema: "sports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AtletaId = table.Column<Guid>(type: "uuid", nullable: false),
                    TreinadorId = table.Column<Guid>(type: "uuid", nullable: false),
                    TreinoId = table.Column<Guid>(type: "uuid", nullable: true),
                    DataAvaliacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Empenho = table.Column<int>(type: "integer", nullable: false),
                    Tecnica = table.Column<int>(type: "integer", nullable: false),
                    Tatica = table.Column<int>(type: "integer", nullable: false),
                    Notas = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AvaliacoesQualitativas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OcorrenciasJogo",
                schema: "sports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JogoId = table.Column<Guid>(type: "uuid", nullable: false),
                    AtletaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Minuto = table.Column<int>(type: "integer", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OcorrenciasJogo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Treinos",
                schema: "sports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EquipaId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataFim = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EspacoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Treinos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Treinos_Equipas_EquipaId",
                        column: x => x.EquipaId,
                        principalSchema: "sports",
                        principalTable: "Equipas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PresencasTreino",
                schema: "sports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TreinoId = table.Column<Guid>(type: "uuid", nullable: false),
                    AtletaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false),
                    Justificacao = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PresencasTreino", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PresencasTreino_Treinos_TreinoId",
                        column: x => x.TreinoId,
                        principalSchema: "sports",
                        principalTable: "Treinos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PresencasTreino_TreinoId",
                schema: "sports",
                table: "PresencasTreino",
                column: "TreinoId");

            migrationBuilder.CreateIndex(
                name: "IX_Treinos_EquipaId",
                schema: "sports",
                table: "Treinos",
                column: "EquipaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AvaliacoesQualitativas",
                schema: "sports");

            migrationBuilder.DropTable(
                name: "OcorrenciasJogo",
                schema: "sports");

            migrationBuilder.DropTable(
                name: "PresencasTreino",
                schema: "sports");

            migrationBuilder.DropTable(
                name: "Treinos",
                schema: "sports");
        }
    }
}
