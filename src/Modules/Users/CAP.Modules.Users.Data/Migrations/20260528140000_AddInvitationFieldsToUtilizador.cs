using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CAP.Modules.Users.Data.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(CAP.Modules.Users.Data.Context.UsersDbContext))]
    [Migration("20260528140000_AddInvitationFieldsToUtilizador")]
    public partial class AddInvitationFieldsToUtilizador : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotente: só adiciona se não existir.
            // Útil em DBs que já passaram por migrations parciais.
            migrationBuilder.Sql(@"
                ALTER TABLE users.""Utilizadores""
                ADD COLUMN IF NOT EXISTS ""InvitationToken"" text NULL;
            ");

            migrationBuilder.Sql(@"
                ALTER TABLE users.""Utilizadores""
                ADD COLUMN IF NOT EXISTS ""MustChangePassword"" boolean NOT NULL DEFAULT false;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER TABLE users.""Utilizadores"" DROP COLUMN IF EXISTS ""InvitationToken"";");
            migrationBuilder.Sql(@"ALTER TABLE users.""Utilizadores"" DROP COLUMN IF EXISTS ""MustChangePassword"";");
        }
    }
}
