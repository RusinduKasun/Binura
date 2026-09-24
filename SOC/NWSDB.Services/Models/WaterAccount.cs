using System.ComponentModel.DataAnnotations;

namespace NWSDB.Services.Models
{
    public class WaterAccount
    {
        [Key]
        public string AccountNumber { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public double CurrentUsageUnits { get; set; }
        public double TotalDueAmount { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
    }
}
