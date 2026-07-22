/* =========================================================
   MoosaWebCraft — Interactions
   Vanilla JS, no dependencies
   ========================================================= */

/* =========================================================
   SITE CONFIG — update these values for your business.
   Nothing else in this file needs to change.
   ========================================================= */
const SITE_CONFIG = {
  // EmailJS (https://www.emailjs.com/) — create a free account, an email
  // service, and a template, then paste the three IDs it gives you below.
  // The contact form will not send until these are filled in.
  emailJsServiceId: "service_lq9n329",
  emailJsTemplateId: "template_3j6x17b",
  emailJsPublicKey: "SyIRHZW2T1mtLBccR",

  // WhatsApp number in international format, digits only (no "+", spaces,
  // or dashes) — e.g. "923001234567" for a Pakistani number that starts
  // with 03001234567. Every "WhatsApp" / "Book a Call" link on the site
  // reads from this single value.
  whatsappNumber: "10000000000"
};

(function () {
  "use strict";

  /* ---------- EmailJS init ---------- */
  if (window.emailjs && SITE_CONFIG.emailJsPublicKey !== "YOUR_EMAILJS_PUBLIC_KEY") {
    emailjs.init({ publicKey: SITE_CONFIG.emailJsPublicKey });
  }

  /* ---------- WhatsApp links: single source of truth ---------- */
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
    link.href = `https://wa.me/${SITE_CONFIG.whatsappNumber}`;
  });

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

  /* ---------- Animated stat counters ---------- */
  const statEls = document.querySelectorAll(".stat-num");

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  if (statEls.length) {
    if ("IntersectionObserver" in window && !prefersReducedMotionMQ()) {
      const statObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      statEls.forEach((el) => statObserver.observe(el));
    } else {
      statEls.forEach((el) => {
        const target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
        const suffix = el.getAttribute("data-suffix") || "";
        el.textContent = target + suffix;
      });
    }
  }

  function prefersReducedMotionMQ() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  /* ---------- "Our Work" filter tabs (Websites / Branding / Social Media) ---------- */
  const workTabButtons = document.querySelectorAll(".work-tab-btn");
  const workPanels = document.querySelectorAll(".work-panel");

  workTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-work-filter");

      workTabButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      workPanels.forEach((panel) => {
        const matches = panel.getAttribute("data-work-panel") === filter;
        panel.hidden = !matches;
        panel.classList.toggle("active", matches);
        if (matches) {
          // Panels start hidden, so their .reveal cards never intersect the
          // scroll observer until switched to — reveal them immediately here.
          panel.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
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

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const subject = document.getElementById("service").value.trim();
      const message = document.getElementById("message").value.trim();
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

      const isConfigured =
        window.emailjs &&
        SITE_CONFIG.emailJsServiceId !== "YOUR_EMAILJS_SERVICE_ID" &&
        SITE_CONFIG.emailJsTemplateId !== "YOUR_EMAILJS_TEMPLATE_ID" &&
        SITE_CONFIG.emailJsPublicKey !== "YOUR_EMAILJS_PUBLIC_KEY";

      if (!isConfigured) {
        formNote.textContent =
          "Form isn't connected yet — add your EmailJS IDs in script.js (SITE_CONFIG) to enable sending.";
        formNote.style.color = "#B3261E";
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }
      formNote.textContent = "Sending your message…";
      formNote.style.color = "";

      // Keys below must match the {{variables}} used inside the EmailJS
      // template exactly — this is what actually populates the email.
      const templateParams = {
        from_name: name,
        reply_to: email,
        subject: subject || "New website inquiry",
        message: message
      };

      emailjs
        .send(SITE_CONFIG.emailJsServiceId, SITE_CONFIG.emailJsTemplateId, templateParams)
        .then(() => {
          formNote.textContent = "✓ Message Sent Successfully";
          formNote.style.color = "#1E7A34";
          form.reset();
        })
        .catch(() => {
          formNote.textContent =
            "We couldn't send your message right now. Please try again in a moment, or email us directly.";
          formNote.style.color = "#B3261E";
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        });
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

    // Focus-trap helper: keeps Tab / Shift+Tab cycling within the modal
    // instead of escaping to the page behind it.
    const FOCUSABLE_SELECTOR =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const trapFocus = (e) => {
      if (e.key !== "Tab" || projectModal.hidden) return;

      const focusable = Array.from(
        projectModal.querySelectorAll(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null); // skip hidden/display:none entries

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
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

    projectModal.addEventListener("keydown", trapFocus);
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Button ripple micro-interaction ---------- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    document.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement("span");
      ripple.className = "btn-ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  }
})();
