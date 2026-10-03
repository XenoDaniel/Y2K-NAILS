(() => {
  const savedTheme = localStorage.getItem("set-studio-theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    document.documentElement.dataset.theme = savedTheme;
  }

  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = themeToggle?.querySelector("i");
  if (themeToggle && themeIcon) {
    themeToggle.setAttribute(
      "aria-label",
      `Switch to ${document.documentElement.dataset.theme === "dark" ? "light" : "dark"} theme`,
    );
    themeIcon.className = document.documentElement.dataset.theme === "dark" ? "ri-sun-line" : "ri-moon-line";

    themeToggle.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("set-studio-theme", nextTheme);
      themeToggle.setAttribute("aria-label", `Switch to ${nextTheme === "dark" ? "light" : "dark"} theme`);
      themeIcon.className = nextTheme === "dark" ? "ri-sun-line" : "ri-moon-line";
    });
  }

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  const parallaxLayers = [...document.querySelectorAll("[data-parallax-layer]")];
  if (
    !parallaxLayers.length ||
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) return;

  const activeCards = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) activeCards.add(target);
      else activeCards.delete(target);
    });
    requestUpdate();
  }, { rootMargin: "120px 0px" });

  document.querySelectorAll(".parallax-card").forEach((card) => observer.observe(card));

  let frame = 0;
  const update = () => {
    frame = 0;
    const viewportHeight = window.innerHeight;
    const updates = [];

    activeCards.forEach((card) => {
      const bounds = card.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > viewportHeight) return;
      const progress = (viewportHeight / 2 - (bounds.top + bounds.height / 2)) /
        (viewportHeight / 2 + bounds.height / 2);
      card.querySelectorAll("[data-parallax-layer]").forEach((layer) => {
        const speed = Number(layer.dataset.parallaxSpeed);
        if (!Number.isFinite(speed)) return;
        const offset = Math.max(-46, Math.min(46, progress * speed * viewportHeight));
        updates.push([layer, offset]);
      });
    });

    updates.forEach(([layer, offset]) => {
      layer.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
    });
  };
  const requestUpdate = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  requestUpdate();
})();
