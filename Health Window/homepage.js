document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".head-container");

  // Sticky navbar
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      nav.classList.add("sticky");
    } else {
      nav.classList.remove("sticky");
    }
  });

  // Elements
  const locationSelect = document.getElementById('location-select');
  const specialtiesSelect = document.getElementById('specialties');
  const dateInput = document.querySelector('input[type="date"]');
  const searchBtn = document.querySelector('.search-btn');

  // Set current date as default and minimum
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
  dateInput.min = today;

  // On Search button click
  searchBtn.addEventListener('click', () => {
    const location = locationSelect.value.trim();
    const doctor = specialtiesSelect.value.trim();
    const date = dateInput.value;

    if (!location || !doctor || !date) {
      alert("Please select location, specialty, and date.");
      return;
    }

    // Redirect to specialists page with query parameters
    window.location.href = `specialists.html?location=${encodeURIComponent(location)}&specialty=${encodeURIComponent(doctor)}&date=${date}`;
  });

  // Initialize Swiper for the card wrapper
  new Swiper('.card-wrapper', {
    loop: true,
    spaceBetween: 30,

    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },

    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },

    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 4,
      },
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const cardButtons = document.querySelectorAll(".card-search-btn");

  cardButtons.forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault(); // prevent default behavior
      const specialty = button.dataset.specialty;

      // Set a dummy location and today's date (or leave blank if optional)
      const location = "";
      const today = new Date().toISOString().split('T')[0];

      window.location.href = `specialists.html?location=${encodeURIComponent(location)}&specialty=${encodeURIComponent(specialty)}&date=${today}`;
    });
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const profileBtn = document.getElementById("profileBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";

    profileBtn.style.display = "inline-block";
    logoutBtn.style.display = "inline-block";

    profileBtn.href = user.role === "doctor" ? "doctor-profile.html" : "patient-profile.html";

    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.reload();
    });
  }
});
