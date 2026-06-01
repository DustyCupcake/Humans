using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;

#nullable disable

namespace Humans.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class StoreOrderPricesLastRefreshedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Instant>(
                name: "PricesLastRefreshedAt",
                table: "store_orders",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PricesLastRefreshedAt",
                table: "store_orders");
        }
    }
}
