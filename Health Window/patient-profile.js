// patient-profile.js
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user || user.role !== "patient") {
    alert("Access denied or session expired.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/auth/user/${user.userId}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);
    const dob = data.dob ? new Date(data.dob).toISOString().split("T")[0] : "N/A";

    document.getElementById("patient-name").textContent = data.name || "N/A";
    document.getElementById("patient-email").textContent = data.email || "N/A";
    document.getElementById("patient-phone").textContent = data.phone || "N/A";
    document.getElementById("patient-dob").textContent = dob;
    document.getElementById("patient-role").textContent = data.role || "N/A";
  } catch (err) {
    console.error("Error loading patient profile:", err);
    alert("Something went wrong while loading the profile.");
  }
});



// Appointment booking functionality


async function loadAppointments() {
  const container = document.getElementById("appointmentsContainer");

  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user || !user.userId) {
    console.error("User not found or invalid session.");
    return;
  }

  const userId = user.userId;

  try {
    const res = await fetch(`http://localhost:5000/api/appointment/user/${userId}`);
    const appointments = await res.json();

    if (!appointments.length) {
      container.innerHTML = "<p style='margin-top:20px;'>You have no booked appointments.</p>";
      return;
    }

    const title = document.createElement("h3");
    title.textContent = "🗓️ Your Appointments";
    title.style.marginTop = "25px";
    container.appendChild(title);

    appointments
      .filter(app => app.status?.toLowerCase().startsWith("booked"))
      .forEach(app => {
        const card = document.createElement("div");
        card.style.marginTop = "12px";
        card.style.padding = "10px";
        card.style.border = "1px solid #ddd";
        card.style.borderRadius = "8px";
        card.style.backgroundColor = "#f9f9f9";

        const formattedDate = new Date(app.appointment_date).toISOString().split("T")[0];

        card.innerHTML = `
          <strong>Doctor:</strong> ${app.doctor_name || "Doctor"}<br>
          <strong>Date:</strong> ${formattedDate}<br>
          <strong>Time:</strong> ${app.appointment_time}<br>
          <strong>Status:</strong> ${app.status}
        `;

        // Cancel button
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.style.marginTop = "8px";
        cancelBtn.style.backgroundColor = "#ff4d4d";
        cancelBtn.style.color = "#fff";
        cancelBtn.style.border = "none";
        cancelBtn.style.padding = "5px 10px";
        cancelBtn.style.cursor = "pointer";

        cancelBtn.addEventListener("click", async () => {
          if (!confirm("Are you sure you want to cancel this appointment?")) return;

          try {
            await fetch(`http://localhost:5000/api/appointment/cancel/${app.appointment_id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: user.role })
            });

            alert("Appointment cancelled.");
            window.location.reload();
          } catch (err) {
            console.error("Failed to cancel:", err);
            alert("Failed to cancel appointment.");
          }
        });

        card.appendChild(cancelBtn);
        container.appendChild(card);
      });

  } catch (err) {
    console.error("Failed to load appointments:", err);
    container.innerHTML = "<p style='margin-top:20px; color:red;'>Failed to load appointments.</p>";
  }
}
window.addEventListener("DOMContentLoaded", loadAppointments);



// Logout handler
document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "login.html";
});
