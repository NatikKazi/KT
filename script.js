// script.js - Updated with proper validation and debugging

// Configuration - UPDATE THIS WITH YOUR ACTUAL GOOGLE APPS SCRIPT URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec";

// Debug functions
function toggleDebug() {
  const debugPanel = document.getElementById('debugPanel');
  if (debugPanel) {
    debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
  }
}

function addDebugInfo(message) {
  const debugDiv = document.getElementById('debugInfo');
  if (debugDiv) {
    const timestamp = new Date().toLocaleTimeString();
    debugDiv.textContent += `[${timestamp}] ${message}\n`;
    debugDiv.scrollTop = debugDiv.scrollHeight;
  }
  console.log(message); // Also log to console
}

// Main form submission handler
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById("enquiryForm");
  if (!form) {
    console.error('Form with id "enquiryForm" not found');
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addDebugInfo("=== Form submission started ===");

    const submitButton = form.querySelector('button[type="submit"]');
    
    // Get form values directly from inputs (more reliable than FormData in some cases)
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const messageInput = document.getElementById('message');
    
    // Check if inputs exist
    if (!nameInput || !emailInput) {
      addDebugInfo("ERROR: Required input elements not found");
      showErrorMessage('Form elements not found. Please refresh the page.');
      return;
    }
    
    // Get values and trim whitespace
    const name = nameInput.value ? nameInput.value.trim() : '';
    const email = emailInput.value ? emailInput.value.trim() : '';
    const phone = phoneInput ? (phoneInput.value ? phoneInput.value.trim() : '') : '';
    const message = messageInput ? (messageInput.value ? messageInput.value.trim() : '') : '';
    
    addDebugInfo("Form values extracted:");
    addDebugInfo(`  Name: "${name}" (length: ${name.length})`);
    addDebugInfo(`  Email: "${email}" (length: ${email.length})`);
    addDebugInfo(`  Phone: "${phone}" (length: ${phone.length})`);
    addDebugInfo(`  Message: "${message}" (length: ${message.length})`);
    
    // Validation
    if (!name || name.length === 0) {
      addDebugInfo("VALIDATION ERROR: Name is empty");
      showErrorMessage('Please enter your name.');
      return;
    }
    
    if (!email || email.length === 0) {
      addDebugInfo("VALIDATION ERROR: Email is empty");
      showErrorMessage('Please enter your email address.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addDebugInfo("VALIDATION ERROR: Invalid email format");
      showErrorMessage('Please enter a valid email address.');
      return;
    }
    
    addDebugInfo("✓ Validation passed - proceeding with submission");
    
    // Show loading state
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
      submitButton.classList.add('disabled');
    }

    // Create FormData for submission
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('message', message);
    
    // Method 1: Try POST first
    addDebugInfo("Attempting POST request to: " + SCRIPT_URL);
    
    fetch(SCRIPT_URL, {
      method: "POST",
      body: formData
    })
    .then(response => {
      addDebugInfo(`POST Response status: ${response.status}`);
      addDebugInfo(`POST Response ok: ${response.ok}`);
      return response.text();
    })
    .then(text => {
      addDebugInfo(`POST Response text: ${text.substring(0, 200)}...`);
      try {
        const data = JSON.parse(text);
        addDebugInfo('POST Success - Parsed data: ' + JSON.stringify(data));
        if (data.status === 'success') {
          handleFormSuccess();
        } else {
          throw new Error(data.message || 'Server returned error status');
        }
      } catch (parseError) {
        addDebugInfo('POST response not JSON, trying GET method. Parse error: ' + parseError.message);
        submitFormAsGet(name, email, phone, message);
      }
    })
    .catch(error => {
      addDebugInfo('POST failed: ' + error.message);
      submitFormAsGet(name, email, phone, message);
    })
    .finally(() => {
      resetSubmitButton();
    });
  });
});

// GET method fallback
function submitFormAsGet(name, email, phone, message) {
  const params = new URLSearchParams();
  params.append('name', name);
  params.append('email', email);
  params.append('phone', phone);
  params.append('message', message);
  
  const url = SCRIPT_URL + "?" + params.toString();
  addDebugInfo("Attempting GET request to: " + url.substring(0, 150) + "...");
  
  fetch(url, { method: "GET" })
  .then(response => {
    addDebugInfo(`GET Response status: ${response.status}`);
    addDebugInfo(`GET Response ok: ${response.ok}`);
    return response.text();
  })
  .then(text => {
    addDebugInfo(`GET Response text: ${text.substring(0, 200)}...`);
    try {
      const data = JSON.parse(text);
      addDebugInfo('GET Success - Parsed data: ' + JSON.stringify(data));
      if (data.status === 'success') {
        handleFormSuccess();
      } else {
        showErrorMessage('Server error: ' + (data.message || 'Unknown error'));
      }
    } catch (parseError) {
      addDebugInfo('GET response not JSON, using no-cors fallback. Parse error: ' + parseError.message);
      submitWithNoCors(url);
    }
  })
  .catch(error => {
    addDebugInfo('GET failed: ' + error.message);
    submitWithNoCors(url);
  });
}

// Final fallback: no-cors mode
function submitWithNoCors(url) {
  addDebugInfo("Using no-cors fallback method");
  
  fetch(url, { 
    method: "GET", 
    mode: 'no-cors' 
  })
  .then(() => {
    addDebugInfo('Request sent with no-cors mode (cannot verify response)');
    handleFormSuccess("Your message has been sent! We'll get back to you soon.");
  })
  .catch(error => {
    addDebugInfo("All methods failed: " + error.message);
    showErrorMessage("Unable to send message. Please try again or contact us directly.");
  });
}

// Helper functions
function resetSubmitButton() {
  const submitButton = document.querySelector('#enquiryForm button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = 'Submit';
    submitButton.classList.remove('disabled');
  }
}

function handleFormSuccess(customMessage) {
  const form = document.getElementById("enquiryForm");
  if (form) {
    form.reset();
  }
  addDebugInfo("✓ Form submission successful - form reset");
  showSuccessMessage(customMessage);
}

function showSuccessMessage(customMessage) {
  const message = customMessage || "Thank you! Your enquiry has been submitted successfully. We'll get back to you soon.";
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
  notification.className = `form-notification alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible`;
  notification.innerHTML = `
    <div class="d-flex align-items-start">
      <span class="flex-grow-1">${message}</span>
      <button type="button" class="btn-close" onclick="this.closest('.form-notification').remove()"></button>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    right: 20px;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
  
  // Auto-remove after 7 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideUp 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }
  }, 7000);
}

// Add CSS for animations if not already present
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