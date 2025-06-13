document.getElementById("enquiryForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = document.getElementById("enquiryForm");
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Show loading state
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }

  // Primary method: Try POST with CORS first (sometimes works)
  fetch("https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec", {
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('POST Success:', data);
    handleFormSuccess();
  })
  .catch(error => {
    console.log('POST failed (likely CORS), trying GET method:', error.message);
    // If POST fails due to CORS, try GET method
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

// GET method fallback (works better with CORS)
function submitFormAsGet() {
  const form = document.getElementById("enquiryForm");
  const formData = new FormData(form);
  const params = new URLSearchParams();
  
  // Convert FormData to URLSearchParams
  for (let [key, value] of formData.entries()) {
    params.append(key, value);
  }
  
  const url = "https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec?" + params.toString();
  
  // Try GET with CORS first
  fetch(url, { method: "GET" })
  .then(response => response.json())
  .then(data => {
    console.log('GET Success:', data);
    if (data.status === 'success') {
      showSuccessMessage();
      form.reset();
    } else {
      showErrorMessage('Server responded with error: ' + data.message);
    }
  })
  .catch(error => {
    console.log('GET with CORS failed, using no-cors mode:', error.message);
    // Final fallback: no-cors mode (fire and forget)
    submitWithNoCors(url);
  });
}

// Final fallback: no-cors mode
function submitWithNoCors(url) {
  fetch(url, { 
    method: "GET", 
    mode: 'no-cors' 
  })
  .then(() => {
    console.log('Request sent with no-cors mode (cannot verify response)');
    // Since we can't read the response with no-cors, we assume success
    showSuccessMessage("Your message has been sent! (Please note: we cannot verify delivery due to browser security restrictions)");
    document.getElementById("enquiryForm").reset();
  })
  .catch(error => {
    console.error("Final fallback failed:", error);
    showErrorMessage("Unable to send message. Please try again or contact us directly.");
  });
}

// Alternative: Image ping method (most reliable for cross-origin)
function submitWithImagePing() {
  const form = document.getElementById("enquiryForm");
  const formData = new FormData(form);
  const params = new URLSearchParams();
  
  for (let [key, value] of formData.entries()) {
    params.append(key, value);
  }
  
  const url = "https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec?" + params.toString();
  
  // Create an image element to trigger the request
  const img = new Image();
  
  img.onload = function() {
    console.log('Image ping successful');
    showSuccessMessage();
    form.reset();
  };
  
  img.onerror = function() {
    console.log('Image ping completed (may still be successful)');
    // Even on "error", the request might have succeeded
    showSuccessMessage("Your message has been sent!");
    form.reset();
  };
  
  // Trigger the request
  img.src = url + "&_=" + Date.now(); // Add timestamp to prevent caching
}

// JSONP method (if your Google Script supports it)
function submitWithJSONP() {
  const form = document.getElementById("enquiryForm");
  const formData = new FormData(form);
  const params = new URLSearchParams();
  
  for (let [key, value] of formData.entries()) {
    params.append(key, value);
  }
  
  // Create unique callback name
  const callbackName = 'formCallback_' + Date.now();
  params.append('callback', callbackName);
  
  // Create global callback function
  window[callbackName] = function(response) {
    console.log('JSONP Response:', response);
    if (response.status === 'success') {
      showSuccessMessage();
      form.reset();
    } else {
      showErrorMessage('Error: ' + response.message);
    }
    
    // Cleanup
    delete window[callbackName];
    document.head.removeChild(script);
  };
  
  const script = document.createElement('script');
  script.src = "https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec?" + params.toString();
  
  script.onerror = function() {
    console.error('JSONP failed');
    showErrorMessage();
    delete window[callbackName];
    document.head.removeChild(script);
  };
  
  document.head.appendChild(script);
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
  
  // For larger screens, position from right
  if (window.innerWidth > 768) {
    notification.style.left = 'auto';
    notification.style.right = '20px';
    notification.style.width = '400px';
  }
  
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
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

// Optional: Manual trigger functions for testing different methods
function testImagePing() {
  submitWithImagePing();
}

function testJSONP() {
  submitWithJSONP();
}