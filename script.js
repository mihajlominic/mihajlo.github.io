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

    const video = card.querySelector('.bg-video');
    if (Math.abs(currentPx - targetPx) > 1) { // tolerance to avoid micro animations
      animateWidthTo(card, targetPx, DURATION);
    }

    if (video) {
        if (intersectsCenter) {
            // Card is stretched → PLAY video
            video.style.opacity = "1";
            video.play();
        } else {
            // Card is collapsed → STOP video
            video.style.opacity = "0";
            video.pause();
            video.currentTime = 0;
        }
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





// const convertCard = document.querySelector('.project-card[data-project="convert"]');
// const convertVideo = convertCard.querySelector('.bg-video');

// convertCard.addEventListener('mouseenter', () => {
//     convertVideo.style.opacity = "1";
//     convertVideo.play();
//     convertCard.querySelector('.project-overlay').style.opacity = "0";
// });

// convertCard.addEventListener('mouseleave', () => {
//     convertVideo.style.opacity = "0";
//     convertVideo.pause();
//     convertVideo.currentTime = 0;
//     convertCard.querySelector('.project-overlay').style.opacity = "1";
// });

// const instanCard = document.querySelector('.project-card[data-project="instan"]');
// const instanVideo = instanCard.querySelector('.bg-video');

// instanCard.addEventListener('mouseenter', () => {
//     instanVideo.style.opacity = "1";
//     instanVideo.play();
// });

// instanCard.addEventListener('mouseleave', () => {
//     instanVideo.style.opacity = "0";
//     instanVideo.pause();
//     instanVideo.currentTime = 0;
// });

let words = ["experiences.", "platforms.", "solutions.", "interfaces.", "products."];
const wordElement = document.getElementById("dynamic-word");

let wordIndex = 0;
let charIndex = 0;
let typing = true;
let speed = 70;   // typing/deleting speed in ms
let pause = 2500;  // pause at full word

function typeWord() {
    const currentWord = words[wordIndex];

    if (document.documentElement.lang === 'en') {
        // English version
        words = ["experiences.", "platforms.", "solutions.", "interfaces.", "products."];
    } else {
        // Serbian version
        words = ["iskustva.", "platforme.", "rešenja.", "interfejse.", "proizvode."];
    }

    // remove blinking while typing/deleting
    wordElement.classList.remove('blink');

    if (typing) {
        wordElement.textContent = currentWord.slice(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentWord.length) {
            typing = false;
            // start blinking while paused
            wordElement.classList.add('blink');
            setTimeout(typeWord, pause);
            return;
        }
    } else {
        wordElement.textContent = currentWord.slice(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
            typing = true;
            wordIndex = (wordIndex + 1) % words.length;
            // optional: add short pause with blinking at empty
            wordElement.classList.add('blink');
            setTimeout(typeWord, 300);
            return;
        }
    }

    setTimeout(typeWord, speed);
}

typeWord();

document.querySelectorAll('.project-card').forEach(card => {
    const button = card.querySelector('.showVideoButton');
    const overlay = card.querySelector('.project-overlay');
    const video = card.querySelector('.bg-video');

    if (!button || !overlay || !video) return;

    let isVideoVisible = false;

    button.addEventListener('click', (e) => {
        e.stopPropagation();

        isVideoVisible = !isVideoVisible;

        if (isVideoVisible) {
            // SHOW VIDEO
            overlay.style.opacity = "0";
        } else {
            // SHOW OVERLAY
            overlay.style.opacity = "1";
        }
    });
});




