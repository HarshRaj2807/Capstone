using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        // Setup HttpClient
        using var client = new HttpClient();
        
        // Let's get the token for Harsh Raj. Wait, we don't know his email/password, but we can hit login endpoint if we know it or register a new one.
        // Actually, we can just login as Admin!
        var loginResponse = await client.PostAsJsonAsync("http://localhost:5104/api/auth/login", new { Email = "admin@fracto.com", Password = "AdminPassword123!" });
        var loginResult = await loginResponse.Content.ReadAsStringAsync();
        Console.WriteLine("Login: " + loginResult);
        
        // Extract token
        var token = System.Text.Json.JsonDocument.Parse(loginResult).RootElement.GetProperty("token").GetString();
        
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        
        var response = await client.GetAsync("http://localhost:5104/api/appointments?status=Booked");
        var result = await response.Content.ReadAsStringAsync();
        
        Console.WriteLine("Appointments: " + result);
    }
}
