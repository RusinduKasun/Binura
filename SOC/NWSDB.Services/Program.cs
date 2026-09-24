using Microsoft.EntityFrameworkCore;
using NWSDB.Services.Data;
using NWSDB.Services.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<NWSDBContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<NWSDBContext>();
    db.Database.EnsureCreated();

    if (!db.Users.Any())
    {
        db.Users.AddRange(
            new User { Username = "admin", Password = "admin123", Role = "Staff", AccountNumber = "" },
            new User { Username = "customer1", Password = "1234", Role = "Customer", AccountNumber = "NWS-1001" });
    }

    if (!db.WaterAccounts.Any())
    {
        db.WaterAccounts.AddRange(
            new WaterAccount { AccountNumber = "NWS-1001", CustomerName = "Kasun Perera", CurrentUsageUnits = 25, TotalDueAmount = 2500.00, PaymentStatus = "Unpaid" },
            new WaterAccount { AccountNumber = "NWS-1002", CustomerName = "Nimali Silva", CurrentUsageUnits = 18, TotalDueAmount = 1800.00, PaymentStatus = "Paid" },
            new WaterAccount { AccountNumber = "NWS-1003", CustomerName = "Sunil Fernando", CurrentUsageUnits = 40, TotalDueAmount = 4200.50, PaymentStatus = "Unpaid" });
    }

    db.SaveChanges();
}

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
