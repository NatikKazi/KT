document.getElementById("enquiryForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    message: document.getElementById("message").value
  };

  fetch("https://script.google.com/macros/s/AKfycbzJp5BF2KezSLm4LQkaegcRQtyRwf0bcrm4fgFS-iQ6lQXmIXQe-fet7yIUJiO5ZNc4/exec", {
    method: "POST",
    body: JSON.stringify(formData),
    headers: { "Content-Type": "application/json" }
  })
  .then(response => response.text())
  .then(data => {
    alert("Thank you! Your enquiry has been submitted.");
    document.getElementById("enquiryForm").reset();
  })
  .catch(error => {
    alert("There was an error. Please try again later.");
    console.error(error);
  });
});
