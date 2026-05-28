using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Notifications.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Grupos",
                schema: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CriadorId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Grupos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GrupoMembros",
                schema: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GrupoId = table.Column<Guid>(type: "uuid", nullable: false),
                    UtilizadorId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataAdicao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GrupoMembros", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GrupoMembros_Grupos_GrupoId",
                        column: x => x.GrupoId,
                        principalSchema: "notifications",
                        principalTable: "Grupos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GrupoMembros_GrupoId_UtilizadorId",
                schema: "notifications",
                table: "GrupoMembros",
                columns: new[] { "GrupoId", "UtilizadorId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GrupoMembros",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "Grupos",
                schema: "notifications");
        }
    }
}
