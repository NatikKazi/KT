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

  // Method 1: Using fetch (your current approach)
  fetch("https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec", {
    method: "POST",
    body: formData,
    // Add mode to handle CORS better
    mode: 'no-cors' // This bypasses CORS but limits response access
  })
  .then(response => {
    // With no-cors mode, we can't read the response
    // But if we reach here, the request likely succeeded
    console.log('Request sent successfully');
    showSuccessMessage();
    form.reset();
  })
  .catch(error => {
    console.error("Error:", error);
    showErrorMessage();
  })
  .finally(() => {
    // Reset button state
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
    }
  });
});

// Method 2: Alternative approach using URLSearchParams (GET request)
function submitFormAsGet() {
  const form = document.getElementById("enquiryForm");
  const formData = new FormData(form);
  const params = new URLSearchParams();
  
  // Convert FormData to URLSearchParams
  for (let [key, value] of formData.entries()) {
    params.append(key, value);
  }
  
  const url = "https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec?" + params.toString();
  
  fetch(url, {
    method: "GET",
    mode: 'no-cors'
  })
  .then(() => {
    showSuccessMessage();
    form.reset();
  })
  .catch(error => {
    console.error("Error:", error);
    showErrorMessage();
  });
}

// Method 3: Using XMLHttpRequest (sometimes works better with Google Scripts)
function submitWithXHR() {
  const form = document.getElementById("enquiryForm");
  const formData = new FormData(form);
  
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec");
  
  xhr.onload = function() {
    if (xhr.status === 200 || xhr.status === 302) {
      showSuccessMessage();
      form.reset();
    } else {
      showErrorMessage();
    }
  };
  
  xhr.onerror = function() {
    showErrorMessage();
  };
  
  xhr.send(formData);
}

// Method 4: JSONP approach (if your Google Script supports it)
function submitWithJSONP() {
  const form = document.getElementById("enquiryForm");
  const formData = new FormData(form);
  const params = new URLSearchParams();
  
  for (let [key, value] of formData.entries()) {
    params.append(key, value);
  }
  
  // Add callback parameter
  params.append('callback', 'handleFormResponse');
  
  const script = document.createElement('script');
  script.src = "https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec?" + params.toString();
  
  document.head.appendChild(script);
  
  // Clean up after response
  script.onload = () => document.head.removeChild(script);
}

// JSONP callback function
window.handleFormResponse = function(response) {
  if (response.status === 'success') {
    showSuccessMessage();
    document.getElementById("enquiryForm").reset();
  } else {
    showErrorMessage();
  }
};

// Helper functions for user feedback
function showSuccessMessage() {
  // Option 1: Simple alert
  alert("Thank you! Your enquiry has been submitted.");
  
  // Option 2: Better UX with custom notification
  // showNotification("Thank you! Your enquiry has been submitted.", "success");
}

function showErrorMessage() {
  // Option 1: Simple alert
  alert("There was an error. Please try again later.");
  
  // Option 2: Better UX with custom notification
  // showNotification("There was an error. Please try again later.", "error");
}

// Optional: Custom notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    ${type === 'success' ? 'background: #4CAF50;' : 'background: #f44336;'}
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

// CSS for animations (add to your stylesheet)
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);