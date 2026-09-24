// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const data = await apiRequest("/auth/login", "POST", { username, password });

        // Save session details
        localStorage.setItem("username", data.username);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("accountNumber", data.accountNumber || "");

        alert(`Login Successful! Welcome ${data.username}`);
        window.location.href = "dashboard.html"; // Redirect to dashboard
    } catch (error) {
        alert(error.message || "Invalid username or password!");
    }
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;
    const accountNumber = document.getElementById("accountNumber").value.trim();

    try {
        await apiRequest("/auth/register", "POST", { username, password, role, accountNumber });

        alert("Registration successful! Please login.");
        window.location.href = "index.html"; // Redirect to login page
    } catch (error) {
        alert(error.message || "Registration failed!");
    }
}