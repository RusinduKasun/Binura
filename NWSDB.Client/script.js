const API_BASE_URL = "http://localhost:5067/api/nwsdbservice";

// ---------- helpers ----------
function toast(message, type = "info") {
    let box = document.getElementById("toasts");
    if (!box) {
        box = document.createElement("div");
        box.id = "toasts";
        document.body.appendChild(box);
    }
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

async function api(path, method = "GET", body = null) {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new Error("Cannot reach the server. Start the API (dotnet run) and try again.");
    }

    let data = null;
    try { data = await response.json(); } catch { /* empty body */ }

    if (!response.ok) throw new Error((data && data.message) || `Request failed (${response.status})`);
    return data;
}

function esc(value) {
    const d = document.createElement("div");
    d.textContent = value ?? "";
    return d.innerHTML;
}

function money(n) {
    return "Rs. " + Number(n || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function badge(status) {
    const paid = status === "Paid";
    return `<span class="badge ${paid ? "paid" : "unpaid"}">${paid ? "Paid" : "Unpaid"}</span>`;
}

function togglePassword(id, btn) {
    const input = document.getElementById(id);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.textContent = show ? "Hide" : "Show";
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function requireLogin(allowedRole) {
    const role = localStorage.getItem("userRole");
    if (!role || (allowedRole && role !== allowedRole)) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// ---------- login / register ----------
async function handleLogin(event) {
    event.preventDefault();
    const btn = event.target.querySelector("button[type=submit]");
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    btn.disabled = true;
    try {
        const data = await api("/login", "POST", { username, password });
        localStorage.setItem("username", data.username);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("accountNumber", data.accountNumber || "");

        toast(`Welcome back, ${data.username}!`, "success");
        setTimeout(() => {
            window.location.href = data.role === "Staff" ? "admin_dashboard.html" : "customer_portal.html";
        }, 600);
    } catch (e) {
        toast(e.message, "error");
        btn.disabled = false;
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const btn = event.target.querySelector("button[type=submit]");
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value;
    const role = document.querySelector("input[name=regRole]:checked").value;
    const accountNumber = document.getElementById("regAccountNumber").value.trim().toUpperCase();

    btn.disabled = true;
    try {
        await api("/register", "POST", { username, password, role, accountNumber });
        toast("Account created! Redirecting to login...", "success");
        setTimeout(() => (window.location.href = "login.html"), 1200);
    } catch (e) {
        toast(e.message, "error");
        btn.disabled = false;
    }
}

// ---------- admin dashboard ----------
let allAccounts = [];

async function loadAdmin() {
    if (!requireLogin("Staff")) return;
    document.getElementById("userRoleDisplay").textContent =
        `Signed in as ${localStorage.getItem("username")} (Staff)`;

    try {
        allAccounts = await api("/accounts");
        renderStats();
        renderTable();
    } catch (e) {
        document.getElementById("accountTableBody").innerHTML =
            `<tr><td colspan="6" class="center-msg">${esc(e.message)}</td></tr>`;
    }
}

function renderStats() {
    const unpaid = allAccounts.filter(a => a.paymentStatus !== "Paid");
    document.getElementById("statTotal").textContent = allAccounts.length;
    document.getElementById("statPaid").textContent = allAccounts.length - unpaid.length;
    document.getElementById("statUnpaid").textContent = unpaid.length;
    document.getElementById("statDue").textContent = money(unpaid.reduce((s, a) => s + a.totalDueAmount, 0));
}

function renderTable() {
    const q = document.getElementById("searchBox").value.trim().toLowerCase();
    const f = document.getElementById("statusFilter").value;

    const rows = allAccounts.filter(a =>
        (f === "All" || a.paymentStatus === f) &&
        (a.accountNumber.toLowerCase().includes(q) || a.customerName.toLowerCase().includes(q)));

    const tbody = document.getElementById("accountTableBody");
    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="center-msg">No accounts match your search.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(a => `
        <tr>
            <td class="acc-no">${esc(a.accountNumber)}</td>
            <td>${esc(a.customerName)}</td>
            <td>${a.currentUsageUnits} units</td>
            <td>${money(a.totalDueAmount)}</td>
            <td>${badge(a.paymentStatus)}</td>
            <td class="text-right">${a.paymentStatus === "Paid"
                ? `<span style="color:var(--muted)">Completed</span>`
                : `<button class="btn btn-pay btn-sm" onclick="payBill('${esc(a.accountNumber)}', true)">Mark as Paid</button>`}</td>
        </tr>`).join("");
}

// ---------- customer portal ----------
async function loadCustomer() {
    if (!requireLogin()) return;
    const username = localStorage.getItem("username");
    const accountNumber = localStorage.getItem("accountNumber");
    document.getElementById("welcomeMessage").textContent = `Hello, ${username}!`;

    const box = document.getElementById("billContainer");
    if (!accountNumber) {
        box.innerHTML = `<div class="center-msg">No account number is linked to your login.</div>`;
        return;
    }

    try {
        const a = await api(`/usage/${encodeURIComponent(accountNumber)}`);
        const paid = a.paymentStatus === "Paid";
        const pct = Math.min(100, Math.round((a.currentUsageUnits / 50) * 100));

        box.innerHTML = `
            <div class="bill">
                <div class="bill-top">
                    <small>Amount due</small>
                    <div class="amount">${money(a.totalDueAmount)}</div>
                    <small>Account ${esc(a.accountNumber)}</small>
                    ${badge(a.paymentStatus)}
                </div>
                <div class="bill-rows">
                    <div class="bill-row"><span>Customer</span><span>${esc(a.customerName)}</span></div>
                    <div class="bill-row"><span>Units used</span><span>${a.currentUsageUnits} units</span></div>
                    <div class="bill-row"><span>Status</span><span>${paid ? "Paid" : "Pending payment"}</span></div>
                </div>
                <div class="meter">
                    <div class="bar"><div class="fill" style="width:${pct}%"></div></div>
                    <small>${pct}% of a 50-unit monthly band</small>
                </div>
                <div class="bill-foot">
                    ${paid
                        ? `<div class="paid-msg">Thank you. Your bill is fully paid.</div>`
                        : `<button class="btn btn-pay" onclick="payBill('${esc(a.accountNumber)}', false)">Pay ${money(a.totalDueAmount)}</button>`}
                </div>
            </div>`;
    } catch (e) {
        box.innerHTML = `<div class="center-msg">${esc(e.message)}</div>`;
    }
}

// ---------- shared: pay ----------
async function payBill(accountNumber, isAdmin) {
    try {
        await api(`/pay/${encodeURIComponent(accountNumber)}`, "POST");
        toast(`Payment recorded for ${accountNumber}`, "success");
        if (isAdmin) loadAdmin(); else loadCustomer();
    } catch (e) {
        toast(e.message, "error");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    if (page === "admin") loadAdmin();
    if (page === "customer") loadCustomer();
});
