using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("--- NWSDB Client Application ---");
        
        using HttpClient client = new HttpClient();
        // Backend API eke URL eka (Oya run karaddi apu localhost link eka ma mekata denna)
        client.BaseAddress = new Uri("http://localhost:5067/");

        string accountNumber = "NWS-1001";
        Console.WriteLine($"Fetching usage details for account: {accountNumber}...\n");

        try
        {
            HttpResponseMessage response = await client.GetAsync($"api/NWSDBService/usage/{accountNumber}");
            
            if (response.IsSuccessStatusCode)
            {
                var account = await response.Content.ReadFromJsonAsync<WaterAccountDto>();
                if (account != null)
                {
                    Console.WriteLine("=== Account Details Received ===");
                    Console.WriteLine($"Account Number : {account.AccountNumber}");
                    Console.WriteLine($"Customer Name  : {account.CustomerName}");
                    Console.WriteLine($"Usage Units    : {account.CurrentUsageUnits}");
                    Console.WriteLine($"Total Due (Rs.): {account.TotalDueAmount}");
                    Console.WriteLine($"Payment Status : {account.PaymentStatus}");
                }
            }
            else
            {
                Console.WriteLine($"Error: Account not found or API returned status code {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Connection failed: {ex.Message}");
        }
    }
}

public class WaterAccountDto
{
    public string AccountNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public double CurrentUsageUnits { get; set; }
    public decimal TotalDueAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
}