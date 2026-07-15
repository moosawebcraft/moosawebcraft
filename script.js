/* =========================================================
   MoosaWebCraft — Interactions
   Vanilla JS, no dependencies
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Sticky header ---------- */
  const header = document.getElementById("siteHeader");
  const setHeaderState = () => {
    if (window.scrollY > 12) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  /* ---------- Light / dark theme toggle ---------- */
  const THEME_KEY = "mwc-theme";
  const root = document.documentElement;
  const themeColorMeta = document.getElementById("themeColorMeta");
  const themeToggles = [
    document.getElementById("themeToggle"),
    document.getElementById("themeToggleFooter")
  ].filter(Boolean);

  const getStoredTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  };

  const storeTheme = (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  };

  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", isDark ? "#0B0B0C" : "#FAFAFA");
    }
    themeToggles.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    });
  };

  const currentTheme = () => root.getAttribute("data-theme") === "dark" ? "dark" : "light";

  // Sync toggle UI with whatever theme the inline head script already applied.
  applyTheme(currentTheme());

  themeToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      storeTheme(next);
    });
  });

  // If the person never explicitly chose a theme, keep following the OS setting live.
  if (window.matchMedia) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleOSChange = (e) => {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? "dark" : "light");
      }
    };
    if (mql.addEventListener) {
      mql.addEventListener("change", handleOSChange);
    } else if (mql.addListener) {
      mql.addListener(handleOSChange);
    }
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  const closeNav = () => {
    mainNav.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };

  const toggleNav = () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  navToggle.addEventListener("click", toggleNav);

  mainNav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (e) => {
    if (
      mainNav.classList.contains("open") &&
      !mainNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mainNav.classList.contains("open")) {
      closeNav();
      navToggle.focus();
    }
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const delay = Math.min(index % 4, 3) * 70;
            setTimeout(() => entry.target.classList.add("in-view"), delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------- Services filter tabs ---------- */
  const tabButtons = document.querySelectorAll(".tab-btn");
  const serviceCards = document.querySelectorAll("#servicesGrid .service-card");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");

      tabButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      serviceCards.forEach((card) => {
        const matches = filter === "all" || card.getAttribute("data-category") === filter;
        if (matches) {
          card.classList.remove("filtered-out");
        } else {
          card.classList.add("filtered-out");
        }
      });
    });
  });

  /* ---------- FAQ accordion ---------- */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        }
      });

      item.classList.toggle("open", !isOpen);
      question.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !message) {
        formNote.textContent = "Please fill in your name, email, and project details.";
        formNote.style.color = "#B3261E";
        return;
      }

      if (!emailPattern.test(email)) {
        formNote.textContent = "Please enter a valid email address.";
        formNote.style.color = "#B3261E";
        return;
      }

      // No backend wired up yet — replace this block with a real submission
      // (e.g. fetch() to your endpoint, or a form service like Formspree).
      formNote.textContent = "Thanks! Your message has been noted — we'll be in touch within one business day.";
      formNote.style.color = "";
      form.reset();
    });
  }

  /* ---------- Project details modal ---------- */
  const projectModal = document.getElementById("projectModal");

  if (projectModal) {
    const detailButtons = document.querySelectorAll("[data-project-details]");
    const entries = projectModal.querySelectorAll("[data-entry]");
    let lastFocused = null;

    const openModal = (key) => {
      let activeEntry = null;
      entries.forEach((entry) => {
        const isMatch = entry.getAttribute("data-entry") === key;
        entry.style.display = isMatch ? "" : "none";
        if (isMatch) activeEntry = entry;
      });

      const titleEl = activeEntry && activeEntry.querySelector(".project-modal-title");
      projectModal.setAttribute("aria-label", titleEl ? `${titleEl.textContent} project details` : "Project details");

      lastFocused = document.activeElement;
      projectModal.hidden = false;
      document.body.style.overflow = "hidden";

      projectModal.scrollTop = 0;

      projectModal.querySelector(".project-modal-close").focus();
    };

    const closeModal = () => {
      projectModal.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    };

    detailButtons.forEach((btn) => {
      btn.addEventListener("click", () => openModal(btn.getAttribute("data-project-details")));
    });

    projectModal.querySelectorAll("[data-modal-close]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !projectModal.hidden) closeModal();
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
