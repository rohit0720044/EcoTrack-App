const emissionFactors = {
  transport: {
    car: { factor: 0.192, label: "Private car" },
    carpool: { factor: 0.096, label: "Carpool" },
    bus: { factor: 0.082, label: "Public transport" },
    train: { factor: 0.041, label: "Metro or train" },
    cycle: { factor: 0, label: "Walk or cycle" }
  },
  diet: {
    meatHeavy: { kg: 310, label: "Meat-heavy" },
    mixed: { kg: 220, label: "Mixed diet" },
    lowMeat: { kg: 160, label: "Low meat" },
    vegetarian: { kg: 125, label: "Vegetarian" },
    vegan: { kg: 95, label: "Plant-based" }
  },
  shopping: {
    low: { kg: 45, label: "Low shopping" },
    moderate: { kg: 92, label: "Moderate shopping" },
    high: { kg: 170, label: "High shopping" }
  }
};

const challenges = [
  { id: "transit", title: "Use public transport 3 times", points: 80 },
  { id: "power", title: "Reduce electricity by 10%", points: 90 },
  { id: "plastic", title: "Avoid plastic bags for 7 days", points: 60 },
  { id: "tree", title: "Plant or sponsor a tree", points: 100 },
  { id: "cycle", title: "Walk or cycle short trips", points: 75 }
];

const defaultState = {
  transportMode: "car",
  distance: 120,
  electricity: 180,
  diet: "mixed",
  shopping: "moderate",
  waste: 8,
  flights: 0,
  goal: 12,
  completed: []
};

const numericLimits = {
  distance: 1000,
  electricity: 3000,
  waste: 200,
  flights: 80
};

const averageMonthlyKg = 1250;
const storageKey = "ecotrack-state-v1";
const themeKey = "ecotrack-theme-v1";
const formIds = ["transportMode", "distance", "electricity", "diet", "shopping", "waste", "flights"];
const hasDom = typeof document !== "undefined";
const state = hasDom ? loadState() : { ...defaultState };

const elements = hasDom ? {
  total: document.querySelector("#totalFootprint"),
  comparison: document.querySelector("#comparisonText"),
  goalRange: document.querySelector("#goalRange"),
  goalValue: document.querySelector("#goalValue"),
  sidebarTarget: document.querySelector("#sidebarTarget"),
  chart: document.querySelector("#sourceChart"),
  insightList: document.querySelector("#insightList"),
  challengeList: document.querySelector("#challengeList"),
  progressText: document.querySelector("#progressText"),
  progressBar: document.querySelector("#progressBar"),
  transportMetric: document.querySelector("#transportMetric"),
  electricityMetric: document.querySelector("#electricityMetric"),
  foodMetric: document.querySelector("#foodMetric"),
  shoppingMetric: document.querySelector("#shoppingMetric"),
  transportNote: document.querySelector("#transportNote"),
  electricityNote: document.querySelector("#electricityNote"),
  foodNote: document.querySelector("#foodNote"),
  shoppingNote: document.querySelector("#shoppingNote"),
  themeToggle: document.querySelector("#themeToggle"),
  themeIcon: document.querySelector("#themeIcon"),
  introScreen: document.querySelector("#introScreen")
} : {};

function loadState() {
  try {
    if (typeof localStorage === "undefined") {
      return { ...defaultState };
    }
    return { ...defaultState, ...JSON.parse(localStorage.getItem(storageKey)) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }
}

function loadTheme() {
  return typeof localStorage === "undefined" ? "day" : localStorage.getItem(themeKey) || "day";
}

function saveTheme(theme) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(themeKey, theme);
  }
}

function clampNumber(value) {
  return Math.max(0, Number(value) || 0);
}

function normalizeNumber(value, max = Number.MAX_SAFE_INTEGER) {
  return Math.min(max, clampNumber(value));
}

function normalizeChoice(value, allowedValues, fallback) {
  return allowedValues.includes(value) ? value : fallback;
}

function normalizeState(nextState = {}) {
  return {
    ...defaultState,
    ...nextState,
    transportMode: normalizeChoice(nextState.transportMode, Object.keys(emissionFactors.transport), defaultState.transportMode),
    distance: normalizeNumber(nextState.distance, numericLimits.distance),
    electricity: normalizeNumber(nextState.electricity, numericLimits.electricity),
    diet: normalizeChoice(nextState.diet, Object.keys(emissionFactors.diet), defaultState.diet),
    shopping: normalizeChoice(nextState.shopping, Object.keys(emissionFactors.shopping), defaultState.shopping),
    waste: normalizeNumber(nextState.waste, numericLimits.waste),
    flights: normalizeNumber(nextState.flights, numericLimits.flights),
    goal: normalizeNumber(nextState.goal, 40),
    completed: Array.isArray(nextState.completed)
      ? nextState.completed.filter((id) => challenges.some((challenge) => challenge.id === id))
      : []
  };
}

function calculateFootprint(inputState = {}) {
  const safeState = normalizeState(inputState);
  const transport = safeState.distance * 4.33 * emissionFactors.transport[safeState.transportMode].factor;
  const electricity = safeState.electricity * 0.72;
  const food = emissionFactors.diet[safeState.diet].kg;
  const shopping = emissionFactors.shopping[safeState.shopping].kg + safeState.waste * 4.33 * 0.57;
  const travel = safeState.flights * 90;
  const total = transport + electricity + food + shopping + travel;

  return {
    transport,
    electricity,
    food,
    shopping,
    travel,
    total
  };
}

function calculate() {
  Object.assign(state, normalizeState(state));
  return calculateFootprint(state);
}

function formatKg(value) {
  return `${Math.round(value).toLocaleString()} kg`;
}

function hydrateInputs() {
  formIds.forEach((id) => {
    const input = document.querySelector(`#${id}`);
    input.value = state[id];
    input.addEventListener("input", () => {
      const rawValue = input.type === "number" ? normalizeNumber(input.value, numericLimits[id]) : input.value;
      state[id] = rawValue;
      input.value = rawValue;
      saveState();
      render();
    });
  });

  elements.goalRange.value = state.goal;
  elements.goalRange.addEventListener("input", () => {
    state.goal = Number(elements.goalRange.value);
    saveState();
    render();
  });

  document.querySelector("#resetButton").addEventListener("click", () => {
    Object.assign(state, defaultState);
    saveState();
    hydrateValuesOnly();
    render();
  });

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("night") ? "day" : "night";
    applyTheme(nextTheme);
    saveTheme(nextTheme);
    drawChart(calculate());
  });
}

function hydrateValuesOnly() {
  formIds.forEach((id) => {
    document.querySelector(`#${id}`).value = state[id];
  });
  elements.goalRange.value = state.goal;
}

function render() {
  const data = calculate();
  const reductionKg = data.total * (state.goal / 100);
  const completedPoints = challenges
    .filter((challenge) => state.completed.includes(challenge.id))
    .reduce((sum, challenge) => sum + challenge.points, 0);
  const progressKg = completedPoints * 1.8;

  elements.total.textContent = (data.total / 1000).toFixed(2);
  elements.goalValue.textContent = `${state.goal}%`;
  elements.sidebarTarget.textContent = `Reduce ${state.goal}%`;
  elements.comparison.textContent = comparisonCopy(data.total, reductionKg);
  elements.transportMetric.textContent = formatKg(data.transport + data.travel);
  elements.electricityMetric.textContent = formatKg(data.electricity);
  elements.foodMetric.textContent = formatKg(data.food);
  elements.shoppingMetric.textContent = formatKg(data.shopping);
  elements.transportNote.textContent = `${emissionFactors.transport[state.transportMode].label}, ${state.distance} km weekly`;
  elements.electricityNote.textContent = `${state.electricity} kWh monthly`;
  elements.foodNote.textContent = emissionFactors.diet[state.diet].label;
  elements.shoppingNote.textContent = `${emissionFactors.shopping[state.shopping].label}, ${state.waste} kg waste weekly`;
  elements.progressText.textContent = `${formatKg(progressKg)} saved through completed goals`;
  elements.progressBar.style.width = `${Math.min(100, (progressKg / Math.max(1, reductionKg)) * 100)}%`;

  renderInsights(data);
  renderChallenges();
  drawChart(data);
}

function comparisonCopy(total, reductionKg) {
  const diff = total - averageMonthlyKg;
  const direction = diff > 0 ? "above" : "below";
  const percent = Math.abs((diff / averageMonthlyKg) * 100).toFixed(0);
  return `You are ${percent}% ${direction} the sample average. Hitting your goal would save about ${formatKg(reductionKg)} this month.`;
}

function renderInsights(data) {
  const ranked = [
    {
      key: data.transport + data.travel,
      title: "Shift one regular trip",
      copy: state.transportMode === "cycle"
        ? "Your travel footprint is already low. Keep nearby trips active and avoid unnecessary flights."
        : "Try public transport, carpooling, walking, or cycling for one repeated route each week."
    },
    {
      key: data.electricity,
      title: "Trim home energy demand",
      copy: "Switch off unused appliances, use efficient lighting, and set a weekly electricity target."
    },
    {
      key: data.food,
      title: "Choose more plant-based meals",
      copy: "Replacing a few meat-heavy meals with plant-based options can lower your food footprint."
    },
    {
      key: data.shopping,
      title: "Buy less, reuse more",
      copy: "Avoid single-use plastic, reuse items, repair what you can, and prefer local products."
    }
  ].sort((a, b) => b.key - a.key).slice(0, 3);

  elements.insightList.replaceChildren(...ranked.map((item) => {
    const article = document.createElement("article");
    const title = document.createElement("strong");
    const copy = document.createElement("p");

    article.className = "insight";
    title.textContent = item.title;
    copy.textContent = item.copy;
    article.append(title, copy);
    return article;
  }));
}

function renderChallenges() {
  elements.challengeList.replaceChildren(...challenges.map((challenge) => {
    const complete = state.completed.includes(challenge.id);
    const article = document.createElement("article");
    const badge = document.createElement("span");
    const title = document.createElement("strong");
    const button = document.createElement("button");

    article.className = `challenge ${complete ? "complete" : ""}`.trim();
    badge.className = "badge";
    badge.textContent = `${challenge.points} points`;
    title.textContent = challenge.title;
    button.type = "button";
    button.dataset.id = challenge.id;
    button.textContent = complete ? "Completed" : "Mark done";
    article.append(badge, title, button);
    return article;
  }));

  elements.challengeList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      state.completed = state.completed.includes(id)
        ? state.completed.filter((item) => item !== id)
        : [...state.completed, id];
      saveState();
      render();
    });
  });
}

function applyTheme(theme) {
  const night = theme === "night";
  document.body.classList.toggle("night", night);
  elements.themeIcon.textContent = night ? "N" : "D";
  elements.themeToggle.setAttribute("aria-label", night ? "Switch to bright mode" : "Switch to night mode");
  elements.themeToggle.title = night ? "Switch to bright mode" : "Switch to night mode";
}

function showIntro() {
  window.setTimeout(() => {
    elements.introScreen.classList.add("hide");
    document.body.classList.add("ready");
  }, 5600);
}

function setupRevealAnimations() {
  const panels = document.querySelectorAll(".reveal-panel");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  }, { threshold: 0.16 });

  panels.forEach((panel) => observer.observe(panel));
}

function setupActiveTabs() {
  const links = [...document.querySelectorAll("nav a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) {
      return;
    }

    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  }, { rootMargin: "-20% 0px -55% 0px", threshold: [0.12, 0.35, 0.65] });

  sections.forEach((section) => observer.observe(section));
}

function setupRipples() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("button, nav a");
    if (!target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    target.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
}

function setupTiltGestures() {
  const cards = document.querySelectorAll(".tilt-card");

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (window.matchMedia("(max-width: 760px)").matches) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) - 0.5;
      const y = ((event.clientY - rect.top) / rect.height) - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-3px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function getThemeColor(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function drawChart(data) {
  const ctx = elements.chart.getContext("2d");
  const pixelRatio = window.devicePixelRatio || 1;
  const rect = elements.chart.getBoundingClientRect();
  elements.chart.width = rect.width * pixelRatio;
  elements.chart.height = rect.height * pixelRatio;
  ctx.scale(pixelRatio, pixelRatio);

  const values = [
    ["Transport", data.transport + data.travel, "#2f8f9d"],
    ["Electricity", data.electricity, "#f4b942"],
    ["Food", data.food, "#1f7a52"],
    ["Shopping", data.shopping, "#c96b45"]
  ];

  const width = rect.width;
  const height = rect.height;
  const padding = 34;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...values.map((item) => item[1]), 1);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = getThemeColor("--chart-ink") || "#17201b";
  ctx.font = "700 14px Inter, system-ui, sans-serif";
  ctx.fillText("Major emission sources", padding, 26);

  values.forEach(([label, value, color], index) => {
    const barWidth = (width - padding * 2) / values.length - 18;
    const x = padding + index * (barWidth + 18);
    const barHeight = (value / maxValue) * (chartHeight - 34);
    const y = height - padding - barHeight;

    roundRect(ctx, x, y, barWidth, barHeight, 7, color);
    ctx.fillStyle = getThemeColor("--chart-ink") || "#17201b";
    ctx.font = "700 12px Inter, system-ui, sans-serif";
    ctx.fillText(`${Math.round(value)} kg`, x, y - 8);
    ctx.fillStyle = getThemeColor("--chart-muted") || "#66736b";
    ctx.font = "600 12px Inter, system-ui, sans-serif";
    wrapLabel(ctx, label, x, height - 14, barWidth);
  });
}

function roundRect(ctx, x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.fill();
}

function wrapLabel(ctx, label, x, y, maxWidth) {
  if (ctx.measureText(label).width <= maxWidth) {
    ctx.fillText(label, x, y);
    return;
  }
  const words = label.split(" ");
  ctx.fillText(words[0], x, y - 14);
  ctx.fillText(words.slice(1).join(" "), x, y);
}

if (hasDom) {
  applyTheme(loadTheme());
  hydrateInputs();
  setupRevealAnimations();
  setupActiveTabs();
  setupRipples();
  setupTiltGestures();
  showIntro();
  render();
  window.addEventListener("resize", render);
}

if (typeof module !== "undefined") {
  module.exports = {
    calculateFootprint,
    normalizeState,
    formatKg,
    emissionFactors,
    challenges,
    defaultState,
    numericLimits
  };
}
