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
}

function configureFaq() {
  document.querySelectorAll(".faq-list button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest("article");
      const willOpen = !item.classList.contains("open");
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

function initialize() {
  configureNavigation();
  configureFaq();
  phoneInput.addEventListener("input", () => { phoneInput.value = formatPhone(phoneInput.value); });
  form.addEventListener("submit", handleSubmit);
  document.querySelector("#year").textContent = new Date().getFullYear();
}

initialize();
