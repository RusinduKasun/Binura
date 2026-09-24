const API_BASE_URL = "http://localhost:5067/api";

// Generic function for API requests
async function apiRequest(endpoint, method = "GET", data = null) {
    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Something went wrong!");
        }

        return result;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}