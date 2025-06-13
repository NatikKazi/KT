# 📚 Coaching Classes Website

A simple, static website for a coaching institute built using HTML, CSS, and JavaScript. Includes an enquiry form that uses Google Sheets (via Google Apps Script) to store submissions — without using any traditional backend or database.

---

## 🚀 Features

- Home, About Us, Services, Contact Us (static pages)
- Enquiry form with **CRUD via Google Sheets**
- Hosted free using **GitHub Pages**
- No database or paid hosting required

---

## 🖼️ Pages

| Page         | Description                         |
|--------------|-------------------------------------|
| `index.html` | Home page with institute intro      |
| `about.html` | About the institute and faculty     |
| `services.html` | Coaching programs offered      |
| `contact.html` | Contact details and enquiry form  |

---

## 📩 Enquiry Form

- Form fields: Name, Email, Phone, Message
- Data is submitted using `fetch()` to a deployed Google Apps Script
- Submitted data is appended to a **Google Sheet**

### 🔧 Google Apps Script (Backend)
```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.name,
    data.email,
    data.phone,
    data.message
  ]);
  return ContentService.createTextOutput("Success");
}
