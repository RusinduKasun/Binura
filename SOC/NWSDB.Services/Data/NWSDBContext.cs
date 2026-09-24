using Microsoft.EntityFrameworkCore;
using NWSDB.Services.Models;

namespace NWSDB.Services.Data
{
    public class NWSDBContext : DbContext
    {
        public NWSDBContext(DbContextOptions<NWSDBContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<WaterAccount> WaterAccounts { get; set; }
    }
}