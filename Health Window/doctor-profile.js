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

    let clinicName = data.clinic_name || "";
    let clinicAddr  = data.address || "";

    if (!clinicName && !clinicAddr) {
      // Adjust this URL if your GET route is different (use whatever your specialists page uses)
      const docRes = await fetch(`http://localhost:5000/api/auth/doctor/profile/${user.userId}`);
      if (docRes.ok) {
        const docJson = await docRes.json();
        const doc = Array.isArray(docJson) ? (docJson[0] || {}) : docJson;
        clinicName = doc.clinic_name || clinicName;
        clinicAddr  = doc.address || clinicAddr;
      }
    }

    // 3) Update clinic UI + toggle edit mode
    const clinicNameDisplay   = document.getElementById("clinicNameDisplay");
    const clinicAddressDisplay= document.getElementById("clinicAddressDisplay");
    const editBtn             = document.getElementById("editClinicBtn");
    const editForm            = document.getElementById("clinicEditForm");
    const clinicNameInput     = document.getElementById("clinicName");
    const addressInput        = document.getElementById("address");
    const cancelBtn           = document.getElementById("cancelEditBtn");

    clinicNameDisplay.textContent    = clinicName || "Not set";
    clinicAddressDisplay.textContent = clinicAddr  || "Not set";
    clinicNameInput.value = clinicName || "";
    addressInput.value    = clinicAddr  || "";

    const hasClinicInfo = Boolean(clinicName || clinicAddr);

    // show Change only if there is saved info; otherwise show the form
    editBtn.style.display  = hasClinicInfo ? "inline-block" : "none";
    editForm.style.display = hasClinicInfo ? "none" : "block";
    if (cancelBtn) cancelBtn.style.display = "none";

    // open edit mode
    editBtn.addEventListener("click", () => {
      clinicNameInput.value = clinicName || "";
      addressInput.value    = clinicAddr  || "";
      editForm.style.display = "block";
      editBtn.style.display  = "none";
      if (cancelBtn) cancelBtn.style.display = "inline-block";
    });

    // cancel edit
    cancelBtn?.addEventListener("click", () => {
      if (hasClinicInfo) {
        editForm.style.display = "none";
        editBtn.style.display  = "inline-block";
      }
      cancelBtn.style.display = "none";
    });



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



document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveProfileBtn");
  if (!saveBtn) return;

  saveBtn.addEventListener("click", async () => {
    const clinic_name = document.getElementById("clinicName").value.trim();
    const address = document.getElementById("address").value.trim();
    const user = JSON.parse(sessionStorage.getItem("user"));
    const userId = user?.userId; // keep your existing session shape

    if (!user || !userId || user.role !== "doctor") {
      alert("Access denied or session expired.");
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/doctor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, clinic_name, address }), // backend expects snake_case
      });

      const result = await response.json();

      if (response.ok) {
        // reflect changes immediately on this page
        document.getElementById("clinicNameDisplay").textContent =
          clinic_name || "Unknown · Clinic Name";
        document.getElementById("clinicAddressDisplay").textContent =
          address || "Unknown · Address";

        // hide form and show Change after save
        document.getElementById("clinicEditForm").style.display = "none";
        document.getElementById("editClinicBtn").style.display = "inline-block";
        document.getElementById("cancelEditBtn").style.display = "none";

        alert("Profile updated successfully!");
      } else {
        alert(result.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      alert("Server error");
    }
  });
});



window.addEventListener("DOMContentLoaded", loadDoctorAppointments);





// Logout handler
function logout() {
  sessionStorage.clear();
  window.location.href = "login.html";
}
