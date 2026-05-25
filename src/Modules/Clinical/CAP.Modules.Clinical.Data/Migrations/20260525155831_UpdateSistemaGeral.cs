using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Clinical.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSistemaGeral : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CaminhoFicheiro",
                schema: "clinical",
                table: "Atestados",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaminhoFicheiro",
                schema: "clinical",
                table: "Atestados");
        }
    }
}
