// Toggle visible form
function showForm(type) {
  const patientTab = document.querySelector(".tab:nth-child(1)");
  const doctorTab = document.querySelector(".tab:nth-child(2)");
  const patientForm = document.getElementById("patient-form");
  const doctorForm = document.getElementById("doctor-form");

  if (type === "patient") {
    patientTab.classList.add("active");
    doctorTab.classList.remove("active");
    patientForm.classList.remove("hidden");
    doctorForm.classList.add("hidden");
  } else {
    doctorTab.classList.add("active");
    patientTab.classList.remove("active");
    doctorForm.classList.remove("hidden");
    patientForm.classList.add("hidden");
  }
}

// Toggle password visibility
function togglePassword(inputId, eyeIcon) {
  const input = document.getElementById(inputId);
  const icon = eyeIcon.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

// Handle both logins
document.addEventListener("DOMContentLoaded", () => {
  const patientLoginBtn = document.querySelector("#patient-form .login-btn");
  const doctorLoginBtn = document.querySelector("#doctor-form .login-btn");

  patientLoginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("patient-email").value.trim();
    const password = document.getElementById("patient-password").value;
    await handleLogin(email, password, "patient");
  });

  doctorLoginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("doctor-email").value.trim();
    const password = document.getElementById("doctor-password").value;
    await handleLogin(email, password, "doctor");
  });
});



// Handle login for both patient and doctor
async function handleLogin(email, password) {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed.");

    // Store logged in user details
    sessionStorage.setItem("user", JSON.stringify({
      userId: data.user_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role
    }));

    // Redirect to correct profile page based on role
    if (data.role === "doctor") {
      window.location.href = "doctor-profile.html";
    } else if (data.role === "patient") {
      window.location.href = "patient-profile.html";
    } else {
      alert("Unknown user role.");
    }

  } catch (err) {
    console.error("Login Error:", err);
    alert("Something went wrong during login.");
  }
}

