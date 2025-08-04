// specialty cards
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const location = params.get("location");
  const specialty = params.get("specialty");

  const cards = document.querySelectorAll(".doctor-card");

  if (specialty) {
    cards.forEach(card => {
      const cardLocation = card.dataset.location?.toLowerCase();
      const cardSpecialty = card.dataset.specialty?.toLowerCase();

      const matchesSpecialty = cardSpecialty === specialty.toLowerCase();
      const matchesLocation = !location || cardLocation === location.toLowerCase();

      if (matchesSpecialty && matchesLocation) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  } else {
    cards.forEach(card => card.style.display = "block");
  }
});

// ========== NEW: search bar logic inside specialists.html ==========
document.addEventListener("DOMContentLoaded", () => {
  const locationSelect = document.getElementById('location-select');
  const specialtiesSelect = document.getElementById('specialties');
  const dateInput = document.querySelector('input[type="date"]');
  const searchBtn = document.querySelector('.search-btn');

  // Autofill select values from URL if available
  const params = new URLSearchParams(window.location.search);
  const selectedLocation = params.get("location");
  const selectedSpecialty = params.get("specialty");
  const selectedDate = params.get("date");

  if (selectedLocation) locationSelect.value = selectedLocation;
  if (selectedSpecialty) specialtiesSelect.value = selectedSpecialty;
  if (selectedDate) dateInput.value = selectedDate;

  // Set today’s date as min
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;
  if (!dateInput.value) dateInput.value = today;

  // Search button click handler
  searchBtn.addEventListener("click", () => {
    const location = locationSelect.value.trim();
    const specialty = specialtiesSelect.value.trim();
    const date = dateInput.value;

    if (!location || !specialty || !date) {
      alert("Please select location, specialty, and date.");
      return;
    }

    window.location.href = `specialists.html?location=${encodeURIComponent(location)}&specialty=${encodeURIComponent(specialty)}&date=${encodeURIComponent(date)}`;
  });
});




// Sticky navbar
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".head-container");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("sticky", window.scrollY > 100);
  });
});





// ========== NEW: appointment booking logic inside specialists.html ==========

// ========== Appointment booking logic inside specialists.html ==========

document.addEventListener("DOMContentLoaded", () => {
  const doctorList = document.getElementById("doctorList");
  const modal = document.getElementById("appointmentModal");
  const slotContainer = document.getElementById("slotContainer");
  const closeBtn = document.querySelector(".close-btn");
  const confirmBtn = document.getElementById("confirmBooking");
  const dateInput = document.getElementById("modalAppointmentDate");

  // Fetch doctors and display them
  fetch("http://localhost:5000/api/auth/doctors")
    .then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then((doctors) => {
      if (!Array.isArray(doctors)) throw new Error("Invalid doctors data");

      doctorList.innerHTML = "";

      doctors.forEach((doctor) => {
        const card = document.createElement("div");
        card.classList.add("doctor-card");
        card.setAttribute("data-doctor-id", doctor.user_id);
        card.setAttribute("data-slots", doctor.slots || "10:00 AM, 11:00 AM, 2:00 PM, 4:00 PM");

        card.innerHTML = `
          <div class="doctor-left">
            <img src="img/male doctor image.jpg" alt="${doctor.name}" class="doctor-img" />
            <div class="doctor-info">
              <h3 class="doctor-name">${doctor.name}</h3>
              <p class="specialty">${doctor.specialty || "Not specified"}</p>
              <p class="experience">${doctor.experience || 1} years experience overall</p>
              <p class="location"><strong>${doctor.location || "Unknown"}</strong> · ${doctor.clinic || "Clinic Name"}</p>
              <div class="reviews">
                <div class="star-rating">
                  <span data-value="1">&#9733;</span>
                  <span data-value="2">&#9733;</span>
                  <span data-value="3">&#9733;</span>
                  <span data-value="4">&#9733;</span>
                  <span data-value="5">&#9733;</span>
                </div>
                <span id="review-score">0% | 0 Reviews</span>
              </div>
            </div>
          </div>
          <div class="doctor-right">
            <div class="doctor-actions">
              <button class="btn primary book-btn">Book Appointment</button>
              <button class="btn secondary"><i class="fa-solid fa-phone"></i> Contact</button>
            </div>
          </div>
        `;

        doctorList.appendChild(card);
      });

      attachBookEvents();
    })
    .catch((err) => {
      console.error("Error fetching doctors:", err);
      doctorList.innerHTML = "<p>Could not load doctors. Please try again.</p>";
    });

  // Attach modal and slot logic to book buttons
  function attachBookEvents() {
    const bookButtons = document.querySelectorAll(".book-btn");

    bookButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const doctorCard = btn.closest(".doctor-card");
        const doctorId = doctorCard.getAttribute("data-doctor-id");
        const slots = doctorCard.getAttribute("data-slots").split(",").map(s => s.trim());

        modal.style.display = "flex";
        modal.dataset.doctorId = doctorId;
        modal.dataset.selectedSlot = "";

        slotContainer.innerHTML = "";

        slots.forEach((slot) => {
          const slotBtn = document.createElement("button");
          slotBtn.classList.add("slot-btn");
          slotBtn.textContent = slot;

          slotBtn.addEventListener("click", () => {
            document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
            slotBtn.classList.add("selected");
            modal.dataset.selectedSlot = slot;
          });

          slotContainer.appendChild(slotBtn);
        });
      });
    });
  }

  // Close modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    modal.dataset.selectedSlot = "";
    modal.dataset.doctorId = "";
    slotContainer.innerHTML = "";
    if (dateInput) dateInput.value = "";
  });

  // Confirm booking
  confirmBtn.addEventListener("click", async () => {
    const selectedSlot = modal.dataset.selectedSlot;
    const doctor_id = modal.dataset.doctorId;
    const appointment_date = dateInput?.value?.trim();

    if (!selectedSlot) return alert("Please select a time slot.");
    if (!appointment_date) return alert("Please select a date.");

    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user || !user.userId) return alert("Please log in to book an appointment.");

    try {
      const response = await fetch("http://localhost:5000/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.userId,
          doctor_id,
          appointment_date,
          appointment_time: selectedSlot,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(" Appointment booked successfully!");
        modal.style.display = "none";
      } else {
        alert(result.message || "Booking failed.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong. Try again.");
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  const profileLink = document.getElementById("profileLink");
  const logoutLink = document.getElementById("logoutLink");

  if (user) {
    profileLink.style.display = "inline-block";
    logoutLink.style.display = "inline-block";

    // Redirect to the correct profile based on role
    if (user.role === "doctor") {
      profileLink.querySelector("a").href = "doctor-profile.html";
    } else if (user.role === "patient") {
      profileLink.querySelector("a").href = "patient-profile.html";
    }
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }
});
