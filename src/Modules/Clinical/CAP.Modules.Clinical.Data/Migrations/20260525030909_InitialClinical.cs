using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Clinical.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialClinical : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "clinical");

            migrationBuilder.CreateTable(
                name: "Atestados",
                schema: "clinical",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AtletaId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataEmissao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataExpiracao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MedicoResponsavel = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Atestados", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Lesoes",
                schema: "clinical",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AtletaId = table.Column<Guid>(type: "uuid", nullable: false),
                    TipoLesao = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DataOcorrencia = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataRecuperacaoPrevista = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lesoes", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Atestados",
                schema: "clinical");

            migrationBuilder.DropTable(
                name: "Lesoes",
                schema: "clinical");
        }
    }
}
