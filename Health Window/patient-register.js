console.log("JS file loaded");

document.addEventListener("DOMContentLoaded", function () {
  console.log(" DOM fully loaded");

  const form = document.getElementById("patientForm");
  if (!form) {
    console.error(" Form not found");
    return;
  }

  console.log(" Form found");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    console.log(" Form submitted");

    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const dob = document.getElementById("dob").value;
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      alert(" Passwords do not match!");
      return;
    }

    const fullName = `${firstName} ${lastName}`;

   try {
  const res = await fetch("http://localhost:5000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: fullName,
      email,
      phone,
      password,
      role: "patient",
      dob
    })
  });

  const data = await res.json();
  console.log("✅ Backend response:", data);

  if (res.ok) {
    alert(" Registration successful!");
    window.location.href = "login.html";
  } else {
    alert(data.message || " Registration failed");
  }
} catch (err) {
  console.error(" Error:", err);
  alert("Something went wrong");
}

  });
});

