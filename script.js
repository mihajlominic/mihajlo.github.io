document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Scroll Fade-In Animation (Intersection Observer) ---
    const faders = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0,
        rootMargin: "0px 0px -200px 0px" // Start fade-in 100px before reaching viewport bottom
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

    // --- 3. Parallax Movement for Background Blobs ---
    // Moves the background blobs slightly as the user scrolls
    const blobContainer = document.querySelector('.blob-container');
    const blobs = document.querySelectorAll('.blob');
    const parallaxIntensity = 0.05;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        blobContainer.style.transform = `translateY(${scrollY * -parallaxIntensity}px)`;

        blobs.forEach((blob, index) => {
            const depth = (index + 1) * 0.1; 
            blob.style.transform = `translateY(${scrollY * depth * 0.5}px)`;
        });
    });

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


