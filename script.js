document.getElementById("enquiryForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = document.getElementById("enquiryForm");
  const formData = new FormData(form);

  fetch("https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec", {
    method: "POST",
    body: formData
    // ⛔ Do NOT set Content-Type manually — browser sets it for FormData
  })
  .then(response => response.text())
  .then(data => {
    alert("Thank you! Your enquiry has been submitted.");
    form.reset();
  })
  .catch(error => {
    alert("There was an error. Please try again later.");
    console.error("Error:", error);
  });
});
