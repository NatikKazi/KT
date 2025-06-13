// Improved script.js with better error handling and debugging

document.getElementById("enquiryForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = document.getElementById("enquiryForm");
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Validate form data
  const name = formData.get('name');
  const email = formData.get('email');
  
  if (!name || !email) {
    showErrorMessage('Please fill in all required fields.');
    return;
  }
  
  // Show loading state
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }

  // Your Google Apps Script URL - UPDATE THIS WITH YOUR ACTUAL URL
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec";

  // Method 1: Try POST first
  console.log('Attempting POST request...');
  fetch(SCRIPT_URL, {
    method: "POST",
    body: formData
  })
  .then(response => {
    console.log('POST Response status:', response.status);
    console.log('POST Response headers:', [...response.headers.entries()]);
    return response.text(); // Get as text first to see what we're receiving
  })
  .then(text => {
    console.log('POST Response text:', text);
    try {
      const data = JSON.parse(text);
      console.log('POST Success - Parsed data:', data);
      if (data.status === 'success') {
        handleFormSuccess();
      } else {
        throw new Error(data.message || 'Server returned error status');
      }
    } catch (parseError) {
      console.log('POST response not JSON, trying GET method');
      submitFormAsGet();
    }
  })
  .catch(error => {
    console.log('POST failed:', error.message);
    submitFormAsGet();
  })
  .finally(() => {
    resetSubmitButton();
  });

  function resetSubmitButton() {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
    }
  }

  function handleFormSuccess() {
    showSuccessMessage();
    form.reset();
  }
});

// GET method fallback
function submitFormAsGet() {
  const form = document.getElementById("enquiryForm");
  const formData = new FormData(form);
  const params = new URLSearchParams();
  
  // Convert FormData to URLSearchParams
  for (let [key, value] of formData.entries()) {
    params.append(key, value);
  }
  
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec";
  const url = SCRIPT_URL + "?" + params.toString();
  
  console.log('Attempting GET request to:', url);
  
  fetch(url, { method: "GET" })
  .then(response => {
    console.log('GET Response status:', response.status);
    console.log('GET Response headers:', [...response.headers.entries()]);
    return response.text();
  })
  .then(text => {
    console.log('GET Response text:', text);
    try {
      const data = JSON.parse(text);
      console.log('GET Success - Parsed data:', data);
      if (data.status === 'success') {
        showSuccessMessage();
        form.reset();
      } else {
        showErrorMessage('Server error: ' + (data.message || 'Unknown error'));
      }
    } catch (parseError) {
      console.log('GET response not JSON, using fallback method');
      submitWithNoCors(url);
    }
  })
  .catch(error => {
    console.log('GET failed:', error.message);
    submitWithNoCors(url);
  });
}

// Final fallback: no-cors mode
function submitWithNoCors(url) {
  console.log('Using no-cors fallback for:', url);
  
  fetch(url, { 
    method: "GET", 
    mode: 'no-cors' 
  })
  .then(() => {
    console.log('Request sent with no-cors mode');
    showSuccessMessage("Your message has been sent! We'll get back to you soon.");
    document.getElementById("enquiryForm").reset();
  })
  .catch(error => {
    console.error("All methods failed:", error);
    showErrorMessage("Unable to send message. Please try again or contact us directly.");
  });
}

// Helper functions
function showSuccessMessage(customMessage) {
  const message = customMessage || "Thank you! Your enquiry has been submitted successfully.";
  showNotification(message, "success");
}

function showErrorMessage(message = "There was an error submitting your form. Please try again later.") {
  showNotification(message, "error");
}

function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelectorAll('.form-notification');
  existing.forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `form-notification notification-${type}`;
  notification.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 10px;">
      <span style="flex: 1;">${message}</span>
      <button onclick="this.closest('.form-notification').remove()" 
              style="background: none; border: none; color: inherit; font-size: 20px; cursor: pointer; line-height: 1;">&times;</button>
    </div>
  `;
  
  const bgColor = type === 'success' ? '#4CAF50' : '#f44336';
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    right: 20px;
    padding: 16px 20px;
    background: ${bgColor};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.4;
    animation: slideDown 0.3s ease-out;
    max-width: 500px;
    margin: 0 auto;
  `;
  
  if (window.innerWidth > 768) {
    notification.style.left = 'auto';
    notification.style.right = '20px';
    notification.style.width = '400px';
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideUp 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Add CSS for animations
if (!document.getElementById('notification-styles')) {
  const style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = `
    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(0); opacity: 1; }
      to { transform: translateY(-100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}