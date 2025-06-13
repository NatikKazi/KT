document.getElementById("enquiryForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = new FormData(document.getElementById("enquiryForm"));

  fetch("https://script.google.com/macros/s/AKfycbyIYOw2olDsEARGQ_QOh3QVyuxxDKTZdbk1PDDdqULSiqUqhOOKzCPS5HqTE-5opE5p/exec", {
    method: "POST",
    body: form,
    // Don't set Content-Type → browser will automatically use multipart/form-data
  })
  .then(response => response.text())
  .then(data => {
    alert("Thank you! Your enquiry has been submitted.");
    document.getElementById("enquiryForm").reset();
  })
  .catch(error => {
    alert("There was an error. Please try again later.");
    console.error("Fetch error:", error);
  });
});
