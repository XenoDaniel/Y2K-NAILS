const SERVICE_NAMES = Object.freeze({
  shorties: "The Shorties Tier",
  "mid-length": "The Mid-Length Baddie",
  xl: "The Extendas (XL Sets)",
});
const DEMO_TIMES = Object.freeze(["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"]);

export function isDemoDateAvailable(date, today = new Date()) {
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dateStart >= todayStart && ![0, 1].includes(date.getDay());
}

export function getDemoTimes(date, today = new Date()) {
  return isDemoDateAvailable(date, today) ? [...DEMO_TIMES] : [];
}

function formatDate(date, options = { weekday: "long", month: "long", day: "numeric", year: "numeric" }) {
  return new Intl.DateTimeFormat("en", options).format(date);
}

function initializeDemoBooking() {
  const serviceButtons = [...document.querySelectorAll("[data-service]")];
  const calendarDays = document.querySelector("#calendar-days");
  const calendarTitle = document.querySelector("#calendar-month");
  const calendarStatus = document.querySelector("#calendar-status");
  const previousMonthButton = document.querySelector("#previous-month");
  const nextMonthButton = document.querySelector("#next-month");
  const timeStep = document.querySelector("#time-step");
  const selectedDateLabel = document.querySelector("#selected-date-label");
  const timeOptions = document.querySelector("#time-options");
  const previewButton = document.querySelector("#preview-booking");
  const startOverButton = document.querySelector("#start-over");
  const flow = document.querySelector("#demo-flow");
  const confirmation = document.querySelector("#demo-confirmation");
  const status = document.querySelector("#demo-status");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
  let displayedMonth = new Date(firstMonth);
  let selectedService = null;
  let selectedDate = null;
  let selectedTime = null;

  function updateSummary() {
    document.querySelector("#summary-service").textContent =
      selectedService ? SERVICE_NAMES[selectedService] : "Choose a service";
    document.querySelector("#summary-date").textContent =
      selectedDate ? formatDate(selectedDate, { month: "short", day: "numeric" }) : "Choose a date";
    document.querySelector("#summary-time").textContent = selectedTime || "Choose a time";
    previewButton.disabled = !(selectedService && selectedDate && selectedTime);
  }

  function renderTimes() {
    timeOptions.replaceChildren();
    if (!selectedDate) {
      timeStep.hidden = true;
      return;
    }

    selectedDateLabel.textContent = formatDate(selectedDate);
    timeStep.hidden = false;
    for (const time of getDemoTimes(selectedDate, today)) {
      const button = document.createElement("button");
      button.className = "time-option";
      button.type = "button";
      button.textContent = time;
      button.setAttribute("aria-pressed", String(time === selectedTime));
      button.addEventListener("click", () => {
        selectedTime = time;
        renderTimes();
        updateSummary();
        status.textContent = "Demo time selected. Continue to preview the confirmation.";
      });
      timeOptions.append(button);
    }
  }

  function renderCalendar() {
    calendarTitle.textContent = formatDate(displayedMonth, { month: "long", year: "numeric" });
    previousMonthButton.disabled =
      displayedMonth.getFullYear() === firstMonth.getFullYear() &&
      displayedMonth.getMonth() === firstMonth.getMonth();
    nextMonthButton.disabled =
      displayedMonth.getFullYear() === lastMonth.getFullYear() &&
      displayedMonth.getMonth() === lastMonth.getMonth();
    calendarDays.replaceChildren();

    const firstWeekday = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
    for (let blank = 0; blank < firstWeekday; blank += 1) {
      const spacer = document.createElement("span");
      spacer.setAttribute("aria-hidden", "true");
      calendarDays.append(spacer);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), day);
      const available = isDemoDateAvailable(date, today);
      const button = document.createElement("button");
      button.className = `calendar-day${available ? " calendar-day--available" : ""}`;
      button.type = "button";
      button.textContent = String(day);
      button.disabled = !selectedService || !available;
      button.setAttribute("aria-pressed", String(Boolean(selectedDate && date.getTime() === selectedDate.getTime())));
      button.setAttribute("aria-label", `${formatDate(date)}${available ? ", example opening" : ", unavailable"}`);
      button.addEventListener("click", () => {
        selectedDate = date;
        selectedTime = null;
        calendarStatus.textContent = `Example times for ${formatDate(date)}.`;
        renderCalendar();
        renderTimes();
        updateSummary();
        status.textContent = "Demo date selected. Now choose an example time.";
      });
      calendarDays.append(button);
    }

    calendarStatus.textContent = selectedDate
      ? `Example times for ${formatDate(selectedDate)}.`
      : selectedService
        ? "Dates with a dot are example openings only."
        : "Select a service before choosing a date.";
  }

  serviceButtons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      selectedService = button.dataset.service;
      selectedDate = null;
      selectedTime = null;
      serviceButtons.forEach((option) => option.setAttribute("aria-pressed", String(option === button)));
      renderCalendar();
      renderTimes();
      updateSummary();
      status.textContent = `${SERVICE_NAMES[selectedService]} selected. Choose an example date.`;
    });
  });

  const requestedService = new URLSearchParams(window.location.search).get("service");
  const initialService = serviceButtons.find((button) => button.dataset.service === requestedService);
  if (initialService) initialService.click();

  previousMonthButton.addEventListener("click", () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  nextMonthButton.addEventListener("click", () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  previewButton.addEventListener("click", () => {
    if (!(selectedService && selectedDate && selectedTime)) return;
    document.querySelector("#confirmation-service").textContent = SERVICE_NAMES[selectedService];
    document.querySelector("#confirmation-date").textContent = formatDate(selectedDate);
    document.querySelector("#confirmation-time").textContent = selectedTime;
    flow.hidden = true;
    confirmation.hidden = false;
    status.textContent = "Demo confirmation preview. No appointment has been booked.";
    document.querySelector("#confirmation-title").focus();
  });

  startOverButton.addEventListener("click", () => {
    flow.hidden = false;
    confirmation.hidden = true;
    selectedService = null;
    selectedDate = null;
    selectedTime = null;
    serviceButtons.forEach((button) => button.setAttribute("aria-pressed", "false"));
    renderCalendar();
    renderTimes();
    updateSummary();
    status.textContent = "Choose a service to get started.";
    serviceButtons[0]?.focus();
  });

  renderCalendar();
  renderTimes();
  updateSummary();
}

if (typeof document !== "undefined") initializeDemoBooking();
