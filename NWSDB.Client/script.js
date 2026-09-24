const API_BASE_URL = "http://localhost:5067/api";

// Handle Login (Updated to nwsdbservice route)
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/nwsdbservice/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("username", data.username);
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("accountNumber", data.accountNumber || "");

            alert(`Login Successful! Welcome ${data.username}`);

            if (data.role === "Staff" || data.username === "admin") {
                window.location.href = "admin_dashboard.html";
            } else {
                window.location.href = "customer_portal.html";
            }
        } else {
            alert(data.message || "Invalid credentials!");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Could not connect to the backend server.");
    }
}

// Handle Register (Updated to nwsdbservice route)
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const role = document.getElementById("regRole").value;
    const accountNumber = document.getElementById("regAccountNumber").value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/nwsdbservice/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role, accountNumber })
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = { message: "Registered successfully!" };
        }

        if (response.ok) {
            alert("Registration successful! Please login.");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registration failed!");
        }
    } catch (error) {
        console.error("Register error:", error);
        alert("Could not connect to the server.");
    }
}

// Load Admin Dashboard Data (Matching nwsdbservice route)
async function fetchWaterAccounts() {
    try {
        const response = await fetch(`${API_BASE_URL}/nwsdbservice/accounts`);
        if (!response.ok) throw new Error("Failed to fetch data from server");
        const accounts = await response.json();

        const tbody = document.getElementById("accountTableBody");
        tbody.innerHTML = "";

        if (accounts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-gray-500">No accounts found.</td></tr>`;
            return;
        }

        // Helper function for case-insensitive property lookup
        const getProp = (obj, possibleNames) => {
            const foundKey = Object.keys(obj).find(k => 
                possibleNames.some(name => name.toLowerCase() === k.toLowerCase())
            );
            return foundKey ? obj[foundKey] : undefined;
        };

        accounts.forEach(acc => {
            const accountNoVal = getProp(acc, ['accountNo', 'accountNumber', 'accNo', 'id']) || "N/A";
            const customerNameVal = getProp(acc, ['customerName', 'name', 'customer_name']) || "N/A";
            
            const usageUnitsVal = getProp(acc, ['currentUsageUnits', 'usageUnits', 'units']) ?? 0;
            const totalDueVal = getProp(acc, ['totalDueAmount', 'totalDue', 'due']) ?? 0;
            const statusVal = getProp(acc, ['paymentStatus', 'status']) || "Unpaid";

            const statusClass = statusVal === "Paid" ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
            const actionBtn = statusVal === "Paid" ? `<span class="text-gray-400">Completed</span>` : `<button onclick="payBill('${accountNoVal}')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs">Pay Now</button>`;

            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 border-b">
                    <td class="p-3 font-medium text-gray-800">${accountNoVal}</td>
                    <td class="p-3 text-gray-600">${customerNameVal}</td>
                    <td class="p-3 text-gray-600">${usageUnitsVal}</td>
                    <td class="p-3 text-gray-600">Rs. ${Number(totalDueVal).toFixed(2)}</td>
                    <td class="p-3 ${statusClass}">${statusVal}</td>
                    <td class="p-3 text-center">${actionBtn}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Fetch Error:", error);
        document.getElementById("accountTableBody").innerHTML = `<tr><td colspan="6" class="text-center p-4 text-red-500">Error connecting to backend server. Make sure API is running!</td></tr>`;
    }
}

// Pay Bill Simulation
function payBill(accountNo) {
    alert(`Payment gateway simulated successfully for Account: ${accountNo}`);
    location.reload();
}

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// Auto-run on page load depending on which page is open
window.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("userRole") || "User";
    const username = localStorage.getItem("username") || "Guest";

    if (document.getElementById("userRoleDisplay")) {
        document.getElementById("userRoleDisplay").innerText = `Logged in as: ${username} (${role})`;
        fetchWaterAccounts();
    }

    if (document.getElementById("customerWelcome")) {
        document.getElementById("customerWelcome").innerText = `Welcome, ${username}! Account: ${localStorage.getItem("accountNumber") || "N/A"}`;
    }
});