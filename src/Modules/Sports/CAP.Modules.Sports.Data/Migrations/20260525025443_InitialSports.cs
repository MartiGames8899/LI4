using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Sports.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialSports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "sports");

            migrationBuilder.CreateTable(
                name: "Escaloes",
                schema: "sports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    IdadeMinima = table.Column<int>(type: "integer", nullable: false),
                    IdadeMaxima = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Escaloes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Modalidades",
                schema: "sports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Modalidades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Equipas",
                schema: "sports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    ModalidadeId = table.Column<Guid>(type: "uuid", nullable: false),
                    EscalaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    TreinadorId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Equipas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Equipas_Escaloes_EscalaoId",
                        column: x => x.EscalaoId,
                        principalSchema: "sports",
                        principalTable: "Escaloes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Equipas_Modalidades_ModalidadeId",
                        column: x => x.ModalidadeId,
                        principalSchema: "sports",
                        principalTable: "Modalidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AtletaEquipas",
                schema: "sports",
                columns: table => new
                {
                    AtletaId = table.Column<Guid>(type: "uuid", nullable: false),
                    EquipaId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataInscricao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AtletaEquipas", x => new { x.AtletaId, x.EquipaId });
                    table.ForeignKey(
                        name: "FK_AtletaEquipas_Equipas_EquipaId",
                        column: x => x.EquipaId,
                        principalSchema: "sports",
                        principalTable: "Equipas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Convocatorias",
                schema: "sports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Titulo = table.Column<string>(type: "text", nullable: false),
                    DataEvento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Local = table.Column<string>(type: "text", nullable: false),
                    EquipaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Estado = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Convocatorias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Convocatorias_Equipas_EquipaId",
                        column: x => x.EquipaId,
                        principalSchema: "sports",
                        principalTable: "Equipas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Convites",
                schema: "sports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConvocatoriaId = table.Column<Guid>(type: "uuid", nullable: false),
                    AtletaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Presenca = table.Column<int>(type: "integer", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Convites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Convites_Convocatorias_ConvocatoriaId",
                        column: x => x.ConvocatoriaId,
                        principalSchema: "sports",
                        principalTable: "Convocatorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AtletaEquipas_EquipaId",
                schema: "sports",
                table: "AtletaEquipas",
                column: "EquipaId");

            migrationBuilder.CreateIndex(
                name: "IX_Convites_ConvocatoriaId",
                schema: "sports",
                table: "Convites",
                column: "ConvocatoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Convocatorias_EquipaId",
                schema: "sports",
                table: "Convocatorias",
                column: "EquipaId");

            migrationBuilder.CreateIndex(
                name: "IX_Equipas_EscalaoId",
                schema: "sports",
                table: "Equipas",
                column: "EscalaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Equipas_ModalidadeId",
                schema: "sports",
                table: "Equipas",
                column: "ModalidadeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AtletaEquipas",
                schema: "sports");

            migrationBuilder.DropTable(
                name: "Convites",
                schema: "sports");

            migrationBuilder.DropTable(
                name: "Convocatorias",
                schema: "sports");

            migrationBuilder.DropTable(
                name: "Equipas",
                schema: "sports");

            migrationBuilder.DropTable(
                name: "Escaloes",
                schema: "sports");

            migrationBuilder.DropTable(
                name: "Modalidades",
                schema: "sports");
        }
    }
}
