const user = JSON.parse(sessionStorage.getItem("user"));

if (!user || user.role !== "admin") {
  alert("Access denied. Please log in as admin.");
  window.location.href = "admin-login.html";
}



async function loadAdminSummary() {
  try {
    const res = await fetch('http://localhost:5000/api/admin/summary');
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Failed to load summary");

    // Set values in the cards
    document.getElementById('newUsersCount').textContent = data.newUsers;
    document.getElementById('totalAppointmentsCount').textContent = data.totalAppointments;
    document.getElementById('activeDoctorsCount').textContent = data.activeDoctors;
    document.getElementById('activePatientsCount').textContent = data.activePatients;

  } catch (err) {
    console.error("Error loading admin summary:", err);
  }
}





async function loadCharts() {
  try {
    const [userRes, appointmentRes] = await Promise.all([
      fetch("/api/admin/stats/monthly-users"),
      fetch("/api/admin/stats/appointments-trend")
    ]);

    const usersData = await userRes.json();

console.log("usersData", usersData); // 

// Just for debugging fallback
if (usersData.length === 0) {
  usersData.push({ month: "Jan", count: 5 }, { month: "Feb", count: 10 });
}

    const apptData = await appointmentRes.json();

    if (apptData.length === 0) {
  apptData.push({ month: "Jan", count: 3 }, { month: "Feb", count: 7 });
}

    console.log(" usersData:", usersData); 
    console.log(" apptData:", apptData);

    const userChartEl = document.getElementById("userChart");
    const appointmentChartEl = document.getElementById("appointmentChart");

    if (!userChartEl || !appointmentChartEl) {
      console.error("Canvas elements not found");
      return;
    }

    const userMonths = usersData.map(item => item.month);
    const userCounts = usersData.map(item => item.count);

    const apptMonths = apptData.map(item => item.month);
    const apptCounts = apptData.map(item => item.count);

    new Chart(userChartEl, {
      type: "line",
      data: {
        labels: userMonths,
        datasets: [{
          label: "Monthly Users",
          data: userCounts,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          fill: true
        }]
      }
    });

    new Chart(appointmentChartEl, {
      type: "bar",
      data: {
        labels: apptMonths,
        datasets: [{
          label: "Appointments",
          data: apptCounts,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderWidth: 1
        }]
      }
    });
  } catch (err) {
    console.error("Error loading charts:", err);
  }
}




window.addEventListener("DOMContentLoaded", () => {
  loadAdminSummary();
  console.log("loadCharts will now run");
  loadCharts();
});


// LogOut
document.getElementById("adminLogout").addEventListener("click", () => {
  if (confirm("Are you sure you want to logout?")) {
    sessionStorage.clear();
    window.location.href = "admin-login.html";
  }
});
