document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user || user.role !== "doctor") {
    alert("Access denied or session expired.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/auth/user/${user.userId}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    document.getElementById("doctorName").textContent = "Dr. " + (data.name || "N/A");
    document.getElementById("doctorEmail").textContent = data.email || "N/A";
    document.getElementById("doctorPhone").textContent = data.phone || "N/A";
    document.getElementById("doctorRole").textContent = data.role || "N/A";
    document.getElementById("qualification").textContent = data.qualification || "N/A";
    document.getElementById("specialty").textContent = data.specialty || "N/A";
    document.getElementById("experience").textContent = `Experience: ${data.experience_years || 0} years`;
    document.getElementById("bio").textContent = data.bio || "Short doctor bio goes here.";
  } catch (err) {
    console.error("Error loading doctor profile:", err);
    alert("Something went wrong while loading the profile.");
  }
});

// Appointments booked

async function loadDoctorAppointments() {
  const container = document.getElementById("appointmentsContainer");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const doctorId = user?.userId;

  try {
    const res = await fetch(`http://localhost:5000/api/appointment/user/${doctorId}`);
    const appointments = await res.json();

    //  Log the entire response
console.log("Fetched appointments:", appointments);

//  Also log the current doctor ID
console.log("Doctor ID from session:", doctorId);

    if (!appointments.length) {
      container.innerHTML = "<p style='margin-top:20px;'>No appointments yet.</p>";
      return;
    }

    const title = document.createElement("h3");
    title.textContent = "📅 Booked Appointments";
    title.style.marginTop = "25px";
    container.appendChild(title);

    appointments
  .filter(app => app.status?.toLowerCase().startsWith("booked"))
  .forEach(app => {
      console.log("Checking appointment:", app);

      if (parseInt(app.doctor_id) !== parseInt(doctorId)) return;


      const card = document.createElement("div");
      card.style.marginTop = "12px";
      card.style.padding = "10px";
      card.style.border = "1px solid #ddd";
      card.style.borderRadius = "8px";
      card.style.backgroundColor = "#f9f9f9";

      const formattedDate = new Date(app.appointment_date).toISOString().split("T")[0];

      card.innerHTML = `
        <strong>Patient:</strong> ${app.patient_name || "Unknown"}<br>
        <strong>Date:</strong> ${formattedDate}<br>
        <strong>Time:</strong> ${app.appointment_time}<br>
        <strong>Status:</strong> ${app.status}
      `;

      // Cancel appointment button starts

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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: user.role }) // user = parsed session user
    });

    alert("Appointment cancelled.");
    window.location.reload(); // reload to refresh list
  } catch (err) {
    console.error("Failed to cancel:", err);
    alert("Failed to cancel appointment.");
  }
});

card.appendChild(cancelBtn);
// Cancel appointment button finished

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load doctor appointments:", err);
    container.innerHTML = "<p style='color:red; margin-top:20px;'>Failed to load appointments.</p>";
  }
}

window.addEventListener("DOMContentLoaded", loadDoctorAppointments);





// Logout handler
function logout() {
  sessionStorage.clear();
  window.location.href = "login.html";
}
