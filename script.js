"use strict";

// PREENCHER: número completo com DDI e DDD, somente dígitos. Ex.: "55..."
const whatsappNumber = "PREENCHER_NUMERO";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const form = document.querySelector("#contact-form");
const phoneInput = document.querySelector("#phone");
const statusMessage = document.querySelector("#form-status");

function toggleMenu(forceClose = false) {
  const shouldOpen = forceClose ? false : !navigation.classList.contains("open");
  navigation.classList.toggle("open", shouldOpen);
  menuButton.setAttribute("aria-expanded", String(shouldOpen));
  document.body.classList.toggle("menu-open", shouldOpen);
}

function configureNavigation() {
  menuButton.addEventListener("click", () => toggleMenu());
  navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => toggleMenu(true)));
  document.addEventListener("click", (event) => {
    if (navigation.classList.contains("open") && !navigation.contains(event.target) && !menuButton.contains(event.target)) toggleMenu(true);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("open")) {
      toggleMenu(true);
      menuButton.focus();
    }
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches && navigation.classList.contains("open")) toggleMenu(true);
  });
}

function configureFaq() {
  document.querySelectorAll(".faq-list button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest("article");
      const willOpen = !item.classList.contains("open");
      document.querySelectorAll(".faq-list article.open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector("button").setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    });
  });
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function showError(field, message) {
  field.classList.toggle("field-error", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  const error = field.closest("label").querySelector(".error");
  error.textContent = message;
}

function validateForm() {
  let valid = true;
  const required = ["name", "company", "phone", "email", "segment", "challenge"];
  required.forEach((id) => {
    const field = document.getElementById(id);
    const empty = !field.value.trim();
    showError(field, empty ? "Preencha este campo." : "");
    if (empty) valid = false;
  });
  const email = document.getElementById("email");
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { showError(email, "Informe um e-mail válido."); valid = false; }
  if (phoneInput.value.replace(/\D/g, "").length < 10) { showError(phoneInput, "Informe um telefone com DDD."); valid = false; }
  const consent = document.getElementById("consent");
  showError(consent, consent.checked ? "" : "É necessário autorizar o contato.");
  if (!consent.checked) valid = false;
  return valid;
}

function buildMessage() {
  const get = (id) => document.getElementById(id).value.trim();
  return ["Olá, gostaria de solicitar um Diagnóstico Empresarial Gratuito.", "", `Nome: ${get("name")}`, `Empresa: ${get("company")}`, `WhatsApp: ${get("phone")}`, `E-mail: ${get("email")}`, `Segmento: ${get("segment")}`, `Funcionários (aprox.): ${get("employees") || "Não informado"}`, `Principal dificuldade: ${get("challenge")}`].join("\n");
}

function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.classList.add("visible");
}

function handleSubmit(event) {
  event.preventDefault();
  statusMessage.classList.remove("visible");
  if (!validateForm()) { showStatus("Revise os campos destacados antes de continuar."); form.querySelector(".field-error")?.focus(); return; }
  if (!/^\d{10,15}$/.test(whatsappNumber)) { showStatus("O número de WhatsApp ainda precisa ser cadastrado no início do arquivo script.js. Nenhum dado foi enviado."); return; }
  const submitButton = form.querySelector(".submit-button");
  submitButton.disabled = true;
  submitButton.textContent = "Abrindo WhatsApp...";
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildMessage())}`, "_blank", "noopener,noreferrer");
  window.setTimeout(() => { submitButton.disabled = false; submitButton.textContent = "Preparar mensagem no WhatsApp"; showStatus("A mensagem foi preparada no WhatsApp. Confirme o envio por lá."); }, 600);
}

function pauseCarouselVideos(except = null, reset = true) {
  document.querySelectorAll(".testimonial-carousel video").forEach((video) => {
    if (video !== except) {
      video.pause();
      if (reset) video.currentTime = 0;
    }
  });
}

function configureCarousel() {
  const carousel = document.querySelector("[data-carousel]");
  if (!carousel) return;
  const track = carousel.querySelector(".carousel-track");
  const cards = Array.from(carousel.querySelectorAll(".testimonial-card"));
  const prev = carousel.querySelector("[data-prev]");
  const next = carousel.querySelector("[data-next]");
  const dots = carousel.querySelector(".carousel-dots");
  let current = 0;
  let activePointer = null;
  let startX = 0;
  let deltaX = 0;

  cards.forEach((card) => {
    card.querySelector("video")?.addEventListener("play", (event) => pauseCarouselVideos(event.currentTarget, false));
  });

  function visibleCards() {
    if (window.matchMedia("(max-width: 560px)").matches) return 1;
    if (window.matchMedia("(max-width: 900px)").matches) return 2;
    return 3;
  }

  function maxIndex() { return Math.max(0, cards.length - visibleCards()); }

  function updateDots() {
    const positionCount = maxIndex() + 1;
    if (dots.children.length !== positionCount) {
      dots.replaceChildren();
      Array.from({ length: positionCount }, (_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Ir para posição ${index + 1} de ${positionCount}`);
        dot.addEventListener("click", () => goTo(index));
        dots.appendChild(dot);
      });
    }
  }

  function update() {
    current = Math.min(current, maxIndex());
    updateDots();
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const width = cards[0].getBoundingClientRect().width + gap;
    track.style.transform = `translateX(${-current * width}px)`;
    dots.querySelectorAll("button").forEach((dot, index) => dot.setAttribute("aria-selected", String(index === current)));
    prev.disabled = current === 0;
    next.disabled = current === maxIndex();
  }

  function goTo(index) {
    if (index === current) return;
    pauseCarouselVideos();
    current = Math.max(0, Math.min(index, maxIndex()));
    update();
  }

  prev.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); goTo(current - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); goTo(current + 1); }
  });
  track.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.target.closest("video, button, a, input, textarea")) return;
    activePointer = event.pointerId;
    startX = event.clientX;
    deltaX = 0;
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener("pointermove", (event) => {
    if (event.pointerId === activePointer) deltaX = event.clientX - startX;
  });
  function finishSwipe(event) {
    if (event.pointerId !== activePointer) return;
    if (Math.abs(deltaX) > 55) goTo(current + (deltaX < 0 ? 1 : -1));
    activePointer = null;
    startX = 0;
    deltaX = 0;
  }
  track.addEventListener("pointerup", finishSwipe);
  track.addEventListener("pointercancel", finishSwipe);
  window.addEventListener("resize", update);
  update();
}

function configureLightbox() {
  const lightbox = document.createElement("div");
  lightbox.className = "feedback-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Feedback ampliado");
  lightbox.innerHTML = '<button type="button" class="lightbox-close" aria-label="Fechar imagem ampliada">×</button><img alt="Feedback ampliado">';
  document.body.appendChild(lightbox);
  const image = lightbox.querySelector("img");
  const close = lightbox.querySelector("button");
  let lastFocus = null;
  function closeLightbox() { lightbox.classList.remove("open"); image.removeAttribute("src"); lastFocus?.focus(); }
  document.querySelectorAll(".lightbox-trigger").forEach((button) => button.addEventListener("click", () => { lastFocus = button; image.src = button.dataset.full; lightbox.classList.add("open"); close.focus(); }));
  close.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox(); });
}

function initialize() {
  configureNavigation();
  configureFaq();
  configureCarousel();
  configureLightbox();
  phoneInput.addEventListener("input", () => { phoneInput.value = formatPhone(phoneInput.value); });
  form.addEventListener("submit", handleSubmit);
  document.querySelector("#year").textContent = new Date().getFullYear();
}

initialize();
