using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Users.Data.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(CAP.Modules.Users.Data.Context.UsersDbContext))]
    [Migration("20260526000000_AddMissingUserFields")]
    public partial class AddMissingUserFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NumeroSocio",
                schema: "users",
                table: "Utilizadores",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Tipo",
                schema: "users",
                table: "Utilizadores",
                type: "text",
                nullable: false,
                defaultValue: "Regular");

            migrationBuilder.AddColumn<string>(
                name: "Estado",
                schema: "users",
                table: "Utilizadores",
                type: "text",
                nullable: false,
                defaultValue: "Ativo");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataInscricao",
                schema: "users",
                table: "Utilizadores",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "NumeroSocio", schema: "users", table: "Utilizadores");
            migrationBuilder.DropColumn(name: "Tipo", schema: "users", table: "Utilizadores");
            migrationBuilder.DropColumn(name: "Estado", schema: "users", table: "Utilizadores");
            migrationBuilder.DropColumn(name: "DataInscricao", schema: "users", table: "Utilizadores");
        }
    }
}
