// ============ Deteksi perangkat sentuh (dipakai di banyak bagian bawah) ============
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

// ============ Efek suara hover (disintesis, bukan file audio) ============
let audioCtx;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playHoverTick(freq = 780) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) { /* audio tidak tersedia, abaikan */ }
}

function playClickTick() { playHoverTick(520); }

const hoverSoundSelectors = [
  '.nav-links a', '.btn-primary', '.topbar a', '.footer-social a',
  '.glow-card', '.format-card', '.music-toggle', '.music-nav',
  '.lightbox-close', '.brand', '.logo-luxe'
].join(', ');

document.addEventListener('mouseover', (e) => {
  const target = e.target.closest(hoverSoundSelectors);
  if (target) playHoverTick();
}, { passive: true });

// ============ Musik latar (YouTube, playlist, bisa dijeda) ============
// Tambahkan lagu lain dengan menambah baris baru di array PLAYLIST ini.
// "id" diambil dari URL YouTube: https://youtu.be/ID_DI_SINI
const PLAYLIST = [
  { title: 'ORCHESTRA LASKAR PELANGI', id: '4UEtEuI_iko' },
   { title: 'KU AMAN ADA BERSAMAMU', id: '9CHAP_Sdc9A' },
   { title: 'TERBUANG DALAM WAKTU', id: 'xCchJ0ujd0o' },
   { title: 'BOOM PA', id: 'QuUpPZ0w_eY' },
   { title: 'ASTAGA BERCANDA', id: 'wPb_miODtDI' },
   { title: 'ORCHESTRA THE WINNERS TAKES IT ALL', id: 'CGmdlQA_RZ4' },
];

const musicPlayerEl = document.getElementById('musicPlayer');
const musicToggle = document.getElementById('musicToggle');
const musicTitle = document.getElementById('musicTitle');
const musicPrev = document.getElementById('musicPrev');
const musicNext = document.getElementById('musicNext');

let ytPlayer = null;
let ytReady = false;
let trackIndex = 0;
let isPlaying = false;
let isMuted = true;

function updateMusicUI() {
  musicToggle.classList.toggle('is-playing', isPlaying);
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicToggle.setAttribute('aria-label', isPlaying ? 'Jeda musik latar' : 'Putar musik latar');
  if (musicTitle) musicTitle.textContent = PLAYLIST[trackIndex].title;
}

function loadTrack(index, autoplay) {
  trackIndex = (index + PLAYLIST.length) % PLAYLIST.length;
  if (ytReady && ytPlayer) {
    if (autoplay) {
      ytPlayer.loadVideoById(PLAYLIST[trackIndex].id);
    } else {
      ytPlayer.cueVideoById(PLAYLIST[trackIndex].id);
    }
  }
  updateMusicUI();
}

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player', {
    height: '1',
    width: '1',
    videoId: PLAYLIST[trackIndex].id,
    playerVars: { autoplay: 1, controls: 0, loop: 1, playlist: PLAYLIST[trackIndex].id },
    events: {
      onReady: (e) => {
        ytReady = true;
        // coba autoplay dalam keadaan mute (diizinkan semua browser)
        e.target.mute();
        e.target.playVideo();
      },
      onStateChange: (e) => {
        isPlaying = e.data === YT.PlayerState.PLAYING;
        updateMusicUI();
      }
    }
  });
};

(function loadYouTubeAPI() {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
})();

// Begitu pengguna berinteraksi pertama kali (klik/sentuh/tombol apa saja),
// nyalakan suaranya — ini trik terdekat untuk "autoplay" karena semua
// browser memblokir autoplay bersuara tanpa interaksi pengguna.
function unmuteOnFirstInteraction() {
  if (ytReady && ytPlayer && isMuted) {
    ytPlayer.unMute();
    ytPlayer.setVolume(60);
    isMuted = false;
  }
}
['click', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
  window.addEventListener(evt, unmuteOnFirstInteraction, { once: true, passive: true });
});

if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    if (!ytReady || !ytPlayer) return;
    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
    playClickTick();
  });
}

if (musicNext) {
  musicNext.addEventListener('click', () => {
    loadTrack(trackIndex + 1, true);
    playClickTick();
  });
}

if (musicPrev) {
  musicPrev.addEventListener('click', () => {
    loadTrack(trackIndex - 1, true);
    playClickTick();
  });
}

// sembunyikan navigasi playlist kalau cuma ada 1 lagu
if (PLAYLIST.length <= 1 && musicPlayerEl) {
  musicPlayerEl.classList.add('music-player--single');
}

updateMusicUI();

// ============ Lightbox foto (klik kartu format & rangkaian acara) ============
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = caption || '';
  lightboxCaption.textContent = caption || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-loading');
  playClickTick();
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-loading');
}

document.querySelectorAll('.format-card[data-photo]').forEach(card => {
  card.addEventListener('click', () => {
    openLightbox(card.dataset.photo, card.dataset.caption);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(card.dataset.photo, card.dataset.caption);
    }
  });
});

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox && lightbox.classList.contains('is-open')) closeLightbox();
});

// ============ Preloader ============
const preloader = document.getElementById('preloader');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (preloader) {
  if (prefersReducedMotion) {
    preloader.remove();
  } else {
    document.body.classList.add('is-loading');
    window.addEventListener('load', () => {
      // beri jeda singkat supaya animasi logo sempat terlihat
      setTimeout(() => {
        preloader.classList.add('preloader--done');
        document.body.classList.remove('is-loading');
        setTimeout(() => preloader.remove(), 950);
      }, 650);
    });
  }
}

// ============ Parallax tilt lembut pada konten hero ============
const heroSection = document.querySelector('.hero');
const heroContentEl = document.querySelector('.hero-content');
if (heroSection && heroContentEl && !isTouchDevice) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    heroContentEl.style.transform = `translate(${px * 14}px, ${py * 10}px)`;
  });
  heroSection.addEventListener('mouseleave', () => {
    heroContentEl.style.transform = '';
  });
}

// ============ Cursor glow mengikuti mouse (hero & footer) ============
if (!isTouchDevice) {
  document.querySelectorAll('[data-cursor-glow]').forEach(glow => {
    const parent = glow.closest('.hero, .footer');
    if (!parent) return;
    parent.addEventListener('mousemove', (e) => {
      const rect = parent.getBoundingClientRect();
      glow.style.transform = `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%, -50%)`;
      glow.classList.add('is-active');
    });
    parent.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
  });
}

// ============ Kartu: spotlight + tilt mengikuti kursor ============
const glowCardSelectors = '.stat-card, .misi-card, .format-card, .panitia-card, .paket-card';
document.querySelectorAll(glowCardSelectors).forEach(card => {
  card.classList.add('glow-card');

  if (isTouchDevice) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--my', `${(y / rect.height) * 100}%`);

    const rotateX = ((y / rect.height) - 0.5) * -7;
    const rotateY = ((x / rect.width) - 0.5) * 7;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ============ Tombol CTA: efek magnetic ringan ============
const magneticBtn = document.querySelector('.btn-primary');
if (magneticBtn && !isTouchDevice) {
  magneticBtn.addEventListener('mousemove', (e) => {
    const rect = magneticBtn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    magneticBtn.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
  });
  magneticBtn.addEventListener('mouseleave', () => {
    magneticBtn.style.transform = '';
  });
}

// ============ Parallax halus pada glow hero saat discroll ============
const heroGlow = document.querySelector('.hero-glow');
if (heroGlow && !isTouchDevice) {
  window.addEventListener('scroll', () => {
    const y = Math.min(window.scrollY, 600);
    heroGlow.style.transform = `translate(-50%, ${y * 0.18}px)`;
  });
}

// ============ Navbar berubah saat discroll ============
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('is-scrolled', window.scrollY > 40);
});

// ============ Menu mobile ============
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('is-open');
  navToggle.classList.toggle('is-open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('is-open'));
});

// ============ Animasi reveal saat scroll ============
const revealTargets = document.querySelectorAll(
  '.section-title, .profil-grid, .visi-box, .misi-card, .format-card, .panitia-card, .paket-card, .rekening-box, .anggaran-box'
);
revealTargets.forEach(el => {
  el.classList.add('reveal');
  const siblings = Array.from(el.parentElement.children);
  const index = siblings.indexOf(el);
  el.style.transitionDelay = `${(index % 4) * 90}ms`;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealTargets.forEach(el => observer.observe(el));

// ============ Galeri Acara: swipe / drag carousel ============
(function () {
  const track = document.getElementById('galleryTrack');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const dotsWrap = document.getElementById('galleryDots');
  if (!track) return;

  const items = Array.from(track.querySelectorAll('.gallery-item'));

  // buat dot indicator sejumlah foto
  items.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'gallery-dot';
    dot.setAttribute('aria-label', `Ke foto ${i + 1}`);
    dot.addEventListener('click', () => {
      items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function updateActiveDot() {
    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;
    let closestIndex = 0;
    let closestDist = Infinity;
    items.forEach((item, i) => {
      const r = item.getBoundingClientRect();
      const dist = Math.abs((r.left + r.width / 2) - center);
      if (dist < closestDist) { closestDist = dist; closestIndex = i; }
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === closestIndex));
  }

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveDot, 80);
  }, { passive: true });

  // tombol panah: geser sejumlah 1 item
  function scrollByItem(dir) {
    const item = items[0];
    const gap = 20;
    const distance = (item ? item.getBoundingClientRect().width : 300) + gap;
    track.scrollBy({ left: dir * distance, behavior: 'smooth' });
  }
  if (prevBtn) prevBtn.addEventListener('click', () => scrollByItem(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByItem(1));

  // drag / swipe manual pakai pointer events (mouse & touch sekaligus)
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let moved = false;

  track.addEventListener('pointerdown', (e) => {
    isDown = true;
    moved = false;
    track.classList.add('is-dragging');
    startX = e.clientX;
    scrollStart = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    track.scrollLeft = scrollStart - dx;
  });

  function endDrag(e) {
    if (!isDown) return;
    isDown = false;
    track.classList.remove('is-dragging');
    updateActiveDot();
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('pointerleave', endDrag);

  // klik foto buka lightbox (pakai lightbox yang sudah ada), tapi
  // diabaikan kalau user barusan drag/swipe
  items.forEach((item) => {
    item.addEventListener('click', () => {
      if (moved) return;
      if (typeof openLightbox === 'function') {
        openLightbox(item.dataset.photo, item.dataset.caption);
      }
    });
    item.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && typeof openLightbox === 'function') {
        e.preventDefault();
        openLightbox(item.dataset.photo, item.dataset.caption);
      }
    });
  });

  updateActiveDot();
})();