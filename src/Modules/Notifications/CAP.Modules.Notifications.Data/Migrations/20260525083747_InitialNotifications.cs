using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Notifications.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "notifications");

            migrationBuilder.CreateTable(
                name: "Notificacoes",
                schema: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UtilizadorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Titulo = table.Column<string>(type: "text", nullable: false),
                    Mensagem = table.Column<string>(type: "text", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Lida = table.Column<bool>(type: "boolean", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notificacoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Preferencias",
                schema: "notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UtilizadorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Canal = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Preferencias", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notificacoes",
                schema: "notifications");

            migrationBuilder.DropTable(
                name: "Preferencias",
                schema: "notifications");
        }
    }
}
