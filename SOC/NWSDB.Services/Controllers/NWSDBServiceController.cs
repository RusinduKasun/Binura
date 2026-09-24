using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NWSDB.Services.Data;
using NWSDB.Services.Models;

namespace NWSDB.Services.Controllers
{
    [Route("api/nwsdbservice")]
    [ApiController]
    public class NWSDBServiceController : ControllerBase
    {
        private readonly NWSDBContext _context;

        public NWSDBServiceController(NWSDBContext context)
        {
            _context = context;
        }

        // GET: api/nwsdbservice/accounts
        [HttpGet("accounts")]
        public async Task<IActionResult> GetAccounts()
        {
            try
            {
                var accounts = await _context.WaterAccounts.ToListAsync();
                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }

        // GET: api/nwsdbservice/usage/NWS-1001
        [HttpGet("usage/{accountNumber}")]
        public async Task<IActionResult> GetUsage(string accountNumber)
        {
            try
            {
                var account = await _context.WaterAccounts
                    .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

                if (account == null)
                {
                    return NotFound(new { message = "Account not found." });
                }

                return Ok(account);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }

        // POST: api/nwsdbservice/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
                {
                    return BadRequest(new { message = "Invalid registration data." });
                }

                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == model.Username);
                if (existingUser != null)
                {
                    return BadRequest(new { message = "Username already exists." });
                }

                if (string.IsNullOrEmpty(model.Role))
                {
                    model.Role = "Customer";
                }

                _context.Users.Add(model);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Registration successful!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }

        // POST: api/nwsdbservice/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
                {
                    return BadRequest(new { message = "Invalid login data." });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == model.Username && u.Password == model.Password);
                
                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid username or password!" });
                }

                return Ok(new { 
                    username = user.Username, 
                    role = user.Role ?? "Customer", 
                    accountNumber = user.AccountNumber ?? "" 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }
    }
}