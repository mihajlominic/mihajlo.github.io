document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Scroll Fade-In Animation (Intersection Observer) ---
    const faders = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0,
        rootMargin: "0px 0px 100px 0px" // Start fade-in 100px before reaching viewport bottom
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

const blobContainer = document.querySelector('.blob-container');
const blobs = document.querySelectorAll('.blob');
const parallaxIntensity = 0.05;

let containerRect;

// Update container size
function updateContainer() {
    containerRect = blobContainer.getBoundingClientRect();
}
updateContainer();
window.addEventListener('resize', updateContainer);

// SCROLL PARALLAX
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    blobContainer.style.transform = `translateY(${scrollY * -parallaxIntensity}px)`;

    blobs.forEach((blob, index) => {
        blob.dataset.parallaxY = scrollY * (index + 1) * 0.05;
    });
});

// FREE FLOATING BLOB POSITIONS
const blobData = Array.from(blobs).map((blob, i) => ({
    x: Math.random() * 300,
    y: Math.random() * 300,
    angle: Math.random() * Math.PI * 2,
    speed: 1 + Math.random() * 10005.5, // FASTER
    turnSpeed: 0.02 + Math.random() * 0.03, // smooth turning
    amplitude: 40 + Math.random() * 60 // how far it swings each curve
}));

function animate() {
    blobData.forEach((data, i) => {
        const blob = blobs[i];

        // Move forward
        data.x += Math.cos(data.angle) * data.speed;
        data.y += Math.sin(data.angle) * data.speed;

        // Smooth direction change
        data.angle += (Math.random() - 0.5) * data.turnSpeed;

        // Keep blobs inside the container
        if (data.x < 0 || data.x > containerRect.width - blob.offsetWidth) {
            data.angle = Math.PI - data.angle;
        }
        if (data.y < 0 || data.y > containerRect.height - blob.offsetHeight) {
            data.angle = -data.angle;
        }

        // Apply movement + parallax
        blob.style.transform = `
            translate(
                ${data.x}px,
                ${data.y + (parseFloat(blob.dataset.parallaxY) || 0)}px
            )
        `;
    });

    requestAnimationFrame(animate);
}

animate();



});

// ------------------------------
// JS: artificial width animation
// ------------------------------
const cards = Array.from(document.querySelectorAll('.project-card'));
const DURATION = 600; // ms

// easing (easeOutCubic)
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// animate width from currentPx -> targetPx over duration ms
function animateWidthTo(card, targetPx, duration = DURATION) {
  // cancel previous anim if exists
  if (card._widthAnim) {
    cancelAnimationFrame(card._widthAnim.raf);
    card._widthAnim = null;
  }

  const parent = card.parentElement || document.body;
  const startRect = card.getBoundingClientRect();
  const startPx = startRect.width;
  const delta = targetPx - startPx;
  const startTime = performance.now();

  function step(now) {
    const elapsed = Math.min(now - startTime, duration);
    const t = elapsed / duration;
    const eased = easeOutCubic(t);
    const current = startPx + delta * eased;

    // Use px for stable animation (avoids flex-basis fight)
    card.style.width = `${current}px`;

    if (elapsed < duration) {
      card._widthAnim.raf = requestAnimationFrame(step);
    } else {
      // final snap to exact target
      card.style.width = `${targetPx}px`;
      card._widthAnim = null;
    }
  }

  card._widthAnim = { raf: requestAnimationFrame(step) };
}

// convert percent to pixels relative to container width
function pxFromPercent(container, percent) {
  return Math.round(container.clientWidth * (percent / 100));
}

// check center line and trigger animation
function checkCardCenterLineJS() {
  const centerY = window.innerHeight / 2;

  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    // target percent depends on whether intersects center line
    const intersectsCenter = rect.top < centerY && rect.bottom > centerY;

    // choose target percent (80% -> 100%)
    const targetPercent = intersectsCenter ? 100 : 80;

    // convert to pixels relative to the card's flex container (.project-grid)
    // fall back to document.body if parent can't be used
    const container = card.parentElement || document.body;
    const targetPx = pxFromPercent(container, targetPercent);

    // Kick off animation only if target differs significantly
    const currentPx = rect.width;
    if (Math.abs(currentPx - targetPx) > 1) { // tolerance to avoid micro animations
      animateWidthTo(card, targetPx, DURATION);
    }
  });
}

// throttle with rAF
let ticking = false;
function onScrollOrResize() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      checkCardCenterLineJS();
      ticking = false;
    });
    ticking = true;
  }
}

// Run initially (after load) and on scroll/resize
window.addEventListener('load', () => {
  // ensure box-sizing (helps consistent sizing)
  document.documentElement.style.boxSizing = 'border-box';
  document.body.style.boxSizing = 'border-box';
  checkCardCenterLineJS();
});
window.addEventListener('scroll', onScrollOrResize, { passive: true });
window.addEventListener('resize', onScrollOrResize);


