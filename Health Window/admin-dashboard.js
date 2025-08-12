document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is logged in and is admin
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    window.location.href = "admin-login.html";
    return;
  }

  // Optional: Display admin name
  const adminNameElem = document.querySelector(".admin-name");
  if (adminNameElem && user.name) {
    adminNameElem.textContent = user.name;
  }

  // Fetch dashboard stats from backend
  try {
    const res = await fetch("http://localhost:5000/api/admin/stats");
    const data = await res.json();

    if (res.ok) {
      document.getElementById("doctorCount").textContent = data.doctors;
      document.getElementById("patientCount").textContent = data.patients;
      document.getElementById("appointmentCount").textContent = data.appointments;
    } else {
      console.error("Failed to load dashboard data", data);
    }
  } catch (err) {
    console.error("Error fetching admin stats:", err);
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    try { localStorage.removeItem('hw_admin'); sessionStorage.clear(); } catch {}
    location.replace('admin-login.html'); // adjust if file is elsewhere
  });
}

});
