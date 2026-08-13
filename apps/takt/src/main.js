import "./styles.css";

const cycle = document.querySelector("[data-cycle]");
const steps = [...document.querySelectorAll("[data-cycle-step-index]")];
const numberTrack = document.querySelector("[data-number-track]");
const word = document.querySelector("[data-cycle-word]");
const caption = document.querySelector("[data-cycle-caption]");
const stepLabel = document.querySelector("[data-cycle-step]");
const code = document.querySelector("[data-cycle-code]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const states = [
  ["ТОЧНОСТЬ", "Каждое движение имеет своё время и своё место."],
  ["РИТМ", "Тысячи циклов складываются в уверенную последовательность."],
  ["ДВИЖЕНИЕ", "Вертикальный транспорт становится естественной частью здания."],
  ["СИСТЕМА", "Каждый элемент работает как часть общего цикла."],
];
const floors = [7, 6, 5, 4];

let activeIndex = 0;
let settlingTimer;

function renderState(index, moving = true) {
  activeIndex = index;
  cycle.dataset.ready = "true";
  cycle.dataset.state = moving ? "moving" : "fixed";
  cycle.style.setProperty("--state", index);
  numberTrack.style.transform = `translateY(${-index * 25}%)`;
  word.textContent = states[index][0];
  caption.textContent = states[index][1];
  stepLabel.textContent = `0${floors[index]} / ЭТАЖ`;
  code.textContent = `FLOOR 0${floors[index]} / ${moving ? "MOVING" : "FIXED"}`;
  steps.forEach((step, stepIndex) =>
    step.classList.toggle("is-active", stepIndex === index),
  );
}

function setState(index) {
  if (index === activeIndex && cycle.dataset.ready) return;
  window.clearTimeout(settlingTimer);

  if (reducedMotion.matches) {
    renderState(index, false);
    return;
  }

  renderState(index);
  settlingTimer = window.setTimeout(() => {
    cycle.dataset.state = "fixed";
    code.textContent = `FLOOR 0${floors[activeIndex]} / FIXED`;
  }, 480);
}

renderState(0, false);
reducedMotion.addEventListener("change", () => renderState(activeIndex, false));

let scrollFrame;

function syncTargetToScroll() {
  scrollFrame = undefined;
  const cycleTop = cycle.offsetTop;
  const cycleTravel = Math.max(cycle.offsetHeight - window.innerHeight, 1);
  const progress = Math.min(
    1,
    Math.max(0, (window.scrollY - cycleTop) / cycleTravel),
  );
  setState(Math.round(progress * (steps.length - 1)));
}

function requestScrollSync() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(syncTargetToScroll);
}

window.addEventListener("scroll", requestScrollSync, { passive: true });
window.addEventListener("resize", requestScrollSync);
syncTargetToScroll();

const viewportStops = [
  document.querySelector(".hero"),
  ...steps,
  document.querySelector(".identity"),
  document.querySelector(".models"),
  document.querySelector(".finish"),
].filter(Boolean);

let viewportAnimationFrame;
let isViewportAnimating = false;
let wheelCooldownUntil = 0;
let touchStartY;

function getViewportOffsets() {
  return viewportStops.map(
    (stop) => stop.getBoundingClientRect().top + window.scrollY,
  );
}

function animateToViewport(index) {
  const offsets = getViewportOffsets();
  const target = offsets[Math.max(0, Math.min(index, offsets.length - 1))];
  const start = window.scrollY;

  if (Math.abs(target - start) < 2) return;

  window.cancelAnimationFrame(viewportAnimationFrame);

  if (reducedMotion.matches) {
    window.scrollTo(0, target);
    return;
  }

  const startedAt = window.performance.now();
  const duration = 760;
  isViewportAnimating = true;

  const move = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased =
      progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

    window.scrollTo(0, start + (target - start) * eased);

    if (progress < 1) {
      viewportAnimationFrame = window.requestAnimationFrame(move);
      return;
    }

    window.scrollTo(0, target);
    window.clearTimeout(settlingTimer);
    cycle.dataset.state = "fixed";
    code.textContent = `FLOOR 0${floors[activeIndex]} / FIXED`;
    isViewportAnimating = false;
    wheelCooldownUntil = now + 220;
  };

  viewportAnimationFrame = window.requestAnimationFrame(move);
}

function restartRoute() {
  if (isViewportAnimating) return;

  window.cancelAnimationFrame(viewportAnimationFrame);
  isViewportAnimating = true;
  window.scrollTo(0, 0);
  renderState(0, false);
  wheelCooldownUntil = window.performance.now() + 420;

  window.requestAnimationFrame(() => {
    isViewportAnimating = false;
    document.querySelector(".hero")?.focus({ preventScroll: true });
  });
}

function getDirectionalViewportIndex(direction) {
  const offsets = getViewportOffsets();
  if (direction > 0) {
    const next = offsets.findIndex((offset) => offset > window.scrollY + 2);
    return next === -1 ? offsets.length - 1 : next;
  }

  for (let index = offsets.length - 1; index >= 0; index -= 1) {
    if (offsets[index] < window.scrollY - 2) return index;
  }

  return 0;
}

function isAtLastViewport() {
  const offsets = getViewportOffsets();
  return window.scrollY >= offsets[offsets.length - 1] - 2;
}

function handleViewportWheel(event) {
  if (event.ctrlKey || Math.abs(event.deltaY) < 8) return;
  event.preventDefault();

  if (isViewportAnimating || window.performance.now() < wheelCooldownUntil) {
    return;
  }

  if (event.deltaY > 0 && isAtLastViewport()) {
    restartRoute();
    return;
  }

  animateToViewport(getDirectionalViewportIndex(Math.sign(event.deltaY)));
}

function handleViewportKey(event) {
  if (event.target.closest("button, a, input, textarea, select")) return;

  const downKeys = ["ArrowDown", "PageDown", " "];
  const upKeys = ["ArrowUp", "PageUp"];
  if (!downKeys.includes(event.key) && !upKeys.includes(event.key)) return;

  event.preventDefault();
  if (isViewportAnimating) return;
  const direction = downKeys.includes(event.key) ? 1 : -1;

  if (direction > 0 && isAtLastViewport()) {
    restartRoute();
    return;
  }

  animateToViewport(getDirectionalViewportIndex(direction));
}

function handleTouchStart(event) {
  touchStartY = event.touches[0]?.clientY;
}

function handleTouchMove(event) {
  const currentY = event.touches[0]?.clientY;
  if (
    touchStartY === undefined ||
    currentY === undefined ||
    touchStartY - currentY < 48 ||
    !isAtLastViewport()
  ) {
    return;
  }

  event.preventDefault();
  touchStartY = undefined;
  restartRoute();
}

function resetTouch() {
  touchStartY = undefined;
}

window.addEventListener("wheel", handleViewportWheel, { passive: false });
window.addEventListener("keydown", handleViewportKey);
window.addEventListener("touchstart", handleTouchStart, { passive: true });
window.addEventListener("touchmove", handleTouchMove, { passive: false });
window.addEventListener("touchend", resetTouch, { passive: true });
window.addEventListener("touchcancel", resetTouch, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.hash);
    const index = viewportStops.indexOf(target);
    if (index < 0) return;
    event.preventDefault();
    animateToViewport(index);
  });
});

const modelStage = document.querySelector("[data-model-stage]");
const modelButtons = [...document.querySelectorAll("[data-model-index]")];
const modelTrack = document.querySelector("[data-model-track]");
const modelCode = document.querySelector("[data-model-code]");
const modelCopy = document.querySelector("[data-model-copy]");
const modelPosition = document.querySelector("[data-model-position]");
const modelData = [
  ["400", "Точка отсчёта модельного ряда"],
  ["630", "Следующий шаг в развитии системы"],
  ["1000", "Система выходит на новый масштаб"],
];

function selectModel(index) {
  modelStage.dataset.model = index;
  modelStage.style.setProperty("--model-index", index);
  modelTrack.style.setProperty("--model-index", index);
  modelCode.textContent = `TKT—${modelData[index][0]}`;
  modelCopy.textContent = modelData[index][1];
  modelPosition.textContent = `0${index + 1} / 03`;
  modelButtons.forEach((button, buttonIndex) =>
    button.setAttribute("aria-pressed", String(buttonIndex === index)),
  );
}

modelButtons.forEach((button) => {
  const index = Number(button.dataset.modelIndex);
  button.addEventListener("pointerenter", () => selectModel(index));
  button.addEventListener("click", () => selectModel(index));
});

selectModel(0);

const identity = document.querySelector(".identity");

if (identity) {
  const identityMarker = identity.querySelector(".section-scale--identity b");
  const identityItems = [...identity.querySelectorAll(".identity-field__item")];
  let identityMotionFrame;

  const syncIdentityHighlights = (startedAt) => {
    const markerRect = identityMarker.getBoundingClientRect();
    const markerY = markerRect.top + markerRect.height / 2;

    identityItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      item.classList.toggle(
        "is-crossed",
        markerY >= itemRect.top && markerY <= itemRect.bottom,
      );
    });

    if (window.performance.now() - startedAt < 4300) {
      identityMotionFrame = window.requestAnimationFrame(() =>
        syncIdentityHighlights(startedAt),
      );
    } else {
      identityItems.forEach((item) => item.classList.remove("is-crossed"));
    }
  };

  const restartIdentityMotion = () => {
    window.cancelAnimationFrame(identityMotionFrame);
    identityItems.forEach((item) => item.classList.remove("is-crossed"));
    identity.classList.remove("is-running");
    void identity.offsetWidth;
    identity.classList.add("is-running");
    identityMotionFrame = window.requestAnimationFrame(() =>
      syncIdentityHighlights(window.performance.now()),
    );
  };

  const identityObserver = new window.IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !reducedMotion.matches) {
        restartIdentityMotion();
      }
    },
    { threshold: 0.62 },
  );

  identityObserver.observe(identity);
}
