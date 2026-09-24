/* =====================================================
   WECIA Contábil — interações
   ===================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- ano no rodapé ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- menu mobile ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      mobileNav.hidden = !open;
    };
    toggle.addEventListener("click", () =>
      setOpen(toggle.getAttribute("aria-expanded") !== "true")
    );
    mobileNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setOpen(false))
    );
  }

  /* ---------- reveal ao rolar ---------- */
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    // atraso escalonado dentro de um mesmo grupo (mesmo pai)
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const siblings = Array.from(el.parentElement.querySelectorAll(":scope > [data-reveal]"));
          const idx = siblings.indexOf(el);
          el.style.setProperty("--d", Math.min(idx, 6) * 0.08 + "s");
          el.classList.add("is-visible");
          obs.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- contagem dos números ---------- */
  const counters = Array.from(document.querySelectorAll(".count"));
  const runCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (prefersReduced) { el.textContent = target; return; }
    const dur = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(runCount);
  } else {
    const cio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- formulário de contato -> WhatsApp ---------- */
  const WHATSAPP_NUMBER = "5562984234042";
  const form = document.getElementById("form-contato");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nomeEl = document.getElementById("campo-nome");
      const telEl = document.getElementById("campo-telefone");
      const msgEl = document.getElementById("campo-mensagem");

      const nome = nomeEl.value.trim();
      const telefone = telEl.value.trim();
      const mensagem = msgEl.value.trim();

      if (!nome || !telefone || !mensagem) {
        form.reportValidity();
        return;
      }

      const texto =
        `Olá! Meu nome é ${nome}.\n` +
        `Meu WhatsApp: ${telefone}\n\n` +
        `${mensagem}`;

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;

      const btn = form.querySelector("button[type=submit]");
      const originalHTML = btn ? btn.innerHTML : null;
      if (btn) {
        btn.innerHTML = "Abrindo o WhatsApp…";
        btn.disabled = true;
      }

      window.open(url, "_blank", "noopener");

      if (btn) {
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.disabled = false;
        }, 2200);
      }

      form.reset();
    });
  }
})();
