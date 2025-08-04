document.getElementById("doctor-register-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Collect form values
  const formData = {
    firstName: document.querySelector("#first-name").value.trim(),
    lastName: document.querySelector("#last-name").value.trim(),
    email: document.querySelector("#email").value.trim(),
    phone: document.querySelector("#phone").value.trim(),
    dob: document.querySelector("#dob").value,
    password: document.querySelector("#password").value,
    confirmPassword: document.querySelector("#confirm-password").value,
    license: document.querySelector("#licenseNumber").value.trim(),
    qualification: document.querySelector("#qualification").value.trim(),
    specialty: document.querySelector("#specialties").value,
    experience: document.querySelector("#experience_years").value,
    bio: document.querySelector("#bio").value.trim(),
  };

  // Basic validation
  if (!formData.specialty) {
    alert("Please select a specialty.");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/register-doctor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Doctor registered successfully!");
      window.location.href = "/login.html";
    } else {
      alert(data.message || "Registration failed.");
    }
  } catch (err) {
    console.error("Registration error:", err);
    alert("Network error. Please try again.");
  }
});
