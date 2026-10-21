import { animate, hover, inView, press, stagger } from "motion";

/**
 * Subtle motion layer for the landing page.
 *
 * Elements opt in through data attributes (see the Astro components):
 *   data-hero / data-hero-media / data-hero-chip  → hero entrance on load
 *   data-reveal                                   → fade-up when scrolled into view
 *   data-reveal-group + data-reveal-item          → staggered fade-up of the children
 *   data-float                                    → very slow idle drift while visible
 *   data-press                                    → tiny press-down feedback
 *   data-arrow-link                               → arrow nudges forward on hover
 *
 * The initial hidden state lives in global.css under `.motion-ok`, which the inline
 * script in BaseLayout only adds when the user has not asked for reduced motion.
 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const root = document.documentElement;
const enabled = root.classList.contains("motion-ok");

// Tell the failsafe timer in BaseLayout that this module booted.
(window as unknown as { __motionReady?: boolean }).__motionReady = true;

const all = <T extends HTMLElement = HTMLElement>(
  selector: string,
  scope: ParentNode = document,
) => Array.from(scope.querySelectorAll<T>(selector));

function initHeaderShadow() {
  const header = document.querySelector<HTMLElement>("header[data-header]");
  if (!header) return;
  const update = () =>
    header.toggleAttribute("data-scrolled", window.scrollY > 8);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

async function initHero() {
  const plate = document.querySelector<HTMLElement>("[data-hero-plate]");
  const media = document.querySelector<HTMLElement>("[data-hero-media]");
  const copy = all("[data-hero]");
  const chips = all("[data-hero-chip]");

  animate(
    copy,
    { opacity: [0, 1], y: [18, 0] },
    { duration: 0.7, ease: EASE_OUT, delay: stagger(0.08) },
  );

  if (plate) {
    animate(
      plate,
      { opacity: [0, 1], scale: [0.96, 1] },
      { duration: 0.9, ease: EASE_OUT, delay: 0.25 },
    );
  }
  if (media) {
    animate(
      media,
      { opacity: [0, 1], scale: [1.03, 1] },
      { duration: 1, ease: EASE_OUT, delay: 0.15 },
    );
  }

  // Chips pop in after the photo has settled, then start their idle drift.
  const chipEntrance = animate(
    chips,
    { opacity: [0, 1], y: [12, 0], scale: [0.94, 1] },
    {
      duration: 0.6,
      ease: EASE_OUT,
      delay: stagger(0.15, { startDelay: 0.7 }),
    },
  );
  await chipEntrance;
  chips.forEach(startFloat);
}

/** Slow vertical drift; stops when the element leaves the viewport. */
function startFloat(el: HTMLElement, index = 0) {
  inView(el, () => {
    const controls = animate(
      el,
      { y: [0, -5, 0] },
      {
        duration: 6 + index * 1.2,
        ease: "easeInOut",
        repeat: Infinity,
      },
    );
    return () => controls.cancel();
  });
}

function initReveals() {
  inView(
    all("[data-reveal]"),
    (el) => {
      animate(
        el,
        { opacity: [0, 1], y: [22, 0] },
        { duration: 0.7, ease: EASE_OUT },
      );
    },
    { margin: "0px 0px -12% 0px" },
  );

  inView(
    all("[data-reveal-group]"),
    (group) => {
      const items = all("[data-reveal-item]", group);
      animate(
        items,
        { opacity: [0, 1], y: [18, 0] },
        { duration: 0.6, ease: EASE_OUT, delay: stagger(0.07) },
      );
    },
    { margin: "0px 0px -10% 0px" },
  );
}

function initInteractions() {
  press("[data-press]", (el) => {
    animate(el, { scale: 0.97 }, { duration: 0.12 });
    return () => animate(el, { scale: 1 }, { duration: 0.25, ease: EASE_OUT });
  });

  hover("[data-arrow-link]", (el) => {
    const arrow = el.querySelector("svg:last-of-type");
    if (!arrow) return;
    animate(arrow, { x: 4 }, { duration: 0.25, ease: EASE_OUT });
    return () => animate(arrow, { x: 0 }, { duration: 0.3, ease: EASE_OUT });
  });
}

initHeaderShadow();

if (enabled) {
  initHero();
  initReveals();
  all("[data-float]").forEach(startFloat);
  initInteractions();
}
