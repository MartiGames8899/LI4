using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Users.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "users");

            migrationBuilder.CreateTable(
                name: "Utilizadores",
                schema: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    UserType = table.Column<string>(type: "text", nullable: false),
                    Posicao = table.Column<string>(type: "text", nullable: true),
                    NumeroCamisola = table.Column<int>(type: "integer", nullable: true),
                    DataNascimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EncarregadoEducacaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    Telefone = table.Column<string>(type: "text", nullable: true),
                    Especialidade = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Utilizadores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Utilizadores_Utilizadores_EncarregadoEducacaoId",
                        column: x => x.EncarregadoEducacaoId,
                        principalSchema: "users",
                        principalTable: "Utilizadores",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Utilizadores_EncarregadoEducacaoId",
                schema: "users",
                table: "Utilizadores",
                column: "EncarregadoEducacaoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Utilizadores",
                schema: "users");
        }
    }
}
