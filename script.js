const SCRIPT_URL = "YOUR_SCRIPT_URL";

async function submitForm(data) {
  try {
    // Convert data to URL-encoded format (like form submission)
    const formData = new URLSearchParams();
    for (const key in data) {
      formData.append(key, data[key]);
    }

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: formData,
      redirect: "follow", // Important for Google Apps Script
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Handle the redirected response
    const result = await response.text();
    console.log("Raw response:", result);
    
    try {
      return JSON.parse(result); // Try to parse as JSON
    } catch {
      return result; // Return as text if not JSON
    }
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

// Usage example:
document.getElementById("enquiryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    message: document.getElementById("message").value
  };

  try {
    const result = await submitForm(formData);
    console.log("Success:", result);
    alert("Form submitted successfully!");
  } catch (error) {
    console.error("Error:", error);
    alert("Error submitting form");
  }
});