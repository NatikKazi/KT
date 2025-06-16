const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec";

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


// Function to include HTML
async function includeHTML() {
  const includes = document.querySelectorAll('[data-include]');
  
  for (const element of includes) {
    const file = element.getAttribute('data-include');
    
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`${file} not found`);
      const data = await response.text();
      element.innerHTML = data;

      // Set active nav link
      if (file === 'header.html') {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = element.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
          const linkPage = link.getAttribute('href').split('/').pop();
          link.classList.toggle('active', currentPage === linkPage);
        });
      }
    } catch (error) {
      console.error('Error including HTML:', error);
      element.innerHTML = `Error loading ${file}`;
    }
  }
}

// Call when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', includeHTML);
} else {
  includeHTML();
}