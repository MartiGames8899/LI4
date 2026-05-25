using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Users.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSistemaGeral : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FailedLoginAttempts",
                schema: "users",
                table: "Utilizadores",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LockoutEnd",
                schema: "users",
                table: "Utilizadores",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FailedLoginAttempts",
                schema: "users",
                table: "Utilizadores");

            migrationBuilder.DropColumn(
                name: "LockoutEnd",
                schema: "users",
                table: "Utilizadores");
        }
    }
}
