/* ── PRELOADER ── */
window.addEventListener('load', () => {
  const pre = document.getElementById('preloader');
  if (pre) {
    pre.classList.add('hidden');
    setTimeout(() => pre.remove(), 600);
  }
});

/* ── SCROLL HELPER ── */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  
  // ✅ FIX: Null check untuk navbar
  const navbar = document.getElementById('navbar');
  const offset = navbar ? navbar.offsetHeight + 8 : 8;
  
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  
  // ✅ FIX: Null checks untuk mobile menu elements
  const mob = document.getElementById('nav-mobile');
  const btn = document.getElementById('hamburger-btn');
  
  if (mob && btn) {
    mob.classList.remove('open');
    btn.textContent = '[=]';
    btn.setAttribute('aria-expanded', 'false');
  }
}

/* ── MOBILE MENU ── */
function toggleMenu() {
  const m = document.getElementById('nav-mobile');
  const b = document.getElementById('hamburger-btn');
  const isOpen = m.classList.toggle('open');
  b.textContent = isOpen ? '[X]' : '[=]';
  b.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

/* ── Close menu on outside click ── */
function setupMenuCloseListener() {
  const handleClickOutside = (e) => {
    const nav = document.getElementById('navbar');
    if (!nav) return; // ✅ Safety check
    
    if (!nav.contains(e.target)) {
      const m = document.getElementById('nav-mobile');
      const b = document.getElementById('hamburger-btn');
      
      // ✅ Null checks
      if (m && b && m.classList.contains('open')) {
        m.classList.remove('open');
        b.textContent = '[=]';
        b.setAttribute('aria-expanded', 'false');
      }
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  
  // ✅ Return cleanup function untuk future use
  return () => document.removeEventListener('click', handleClickOutside);
}

/* ── ANIMATION CONSTANTS ── */
const ANIMATION_CONFIG = {
  // Stars & Icons
  STAR_SPACING_X: 37,
  STAR_VARIANCE_X: 13,
  STAR_SPACING_Y: 47,
  STAR_VARIANCE_Y: 7,
  
  // Rain
  RAIN_COLUMN_MOBILE: 60,
  RAIN_COLUMN_DESKTOP: 40,
  RAIN_MAX_COLUMNS: 20,
  
  // Invaders
  INVADER_SPACING_X: 11,
  INVADER_OFFSET_X: 4,
  INVADER_SPACING_Y: 17,
  INVADER_OFFSET_Y: 8,
  INVADER_MAX_X: 96,
  INVADER_MAX_Y: 90,
  
  // Neon Streaks
  STREAK_SPACING: 13,
  STREAK_OFFSET: 6,
  STREAK_SPACING_X: 9,
  STREAK_MAX_X: 60,
};

/* ── STARS & FLOATING ICONS (Optimized for Mobile/Desktop) ── */
function createStars() {
  const layer = document.getElementById('stars-layer');
  const colors = ['#a855f7','#e879f9','#c77dff','#f5a623','#00d4ff'];
  const frag = document.createDocumentFragment();

  // Kurangi jumlah bintang 50% di HP agar tidak lag
  const starCount = window.innerWidth < 768 ? 60 : 120; 

  for (let i = 0; i < starCount; i++) { 
    const d = document.createElement('div');
    d.className = 'star';
    const size = (i % 3) + 1;
    const dur  = 1.5 + (i % 10) * 0.28;
    const del  = (i % 9) * 0.38;
    
    // ✅ Use constants instead of magic numbers
    const x = (i * ANIMATION_CONFIG.STAR_SPACING_X + i * ANIMATION_CONFIG.STAR_VARIANCE_X) % 100;
    const y = (i * ANIMATION_CONFIG.STAR_SPACING_Y + i * ANIMATION_CONFIG.STAR_VARIANCE_Y) % 100;
    
    const col  = colors[i % colors.length];
    d.style.cssText = `left:${x}%;top:${y}%;width:${size}px;height:${size}px;background:${col};--dur:${dur}s;--del:${del}s;`;
    frag.appendChild(d);
  }

  const retroIcons = ['★','✦','▲','■','◆','●','▶','◀','↑','↓','⬛','⬜','♦','♠','♣'];
  const iconColors = ['#a855f7','#e879f9','#c77dff','#9333ea','#f5a623'];
  const iconCount = window.innerWidth < 768 ? 12 : 25;

  for (let i = 0; i < iconCount; i++) { 
    const icon = document.createElement('div');
    icon.className = 'retro-icon';
    icon.setAttribute('aria-hidden', 'true');
    const x = (i * 7 + 3) % 100;
    const y = (i * 11 + 5) % 100;
    const fontSize = (0.4 + (i % 5) * 0.3) + 'rem';
    const col = iconColors[i % iconColors.length];
    icon.innerHTML = retroIcons[i % retroIcons.length];
    icon.style.cssText = `left:${x}%;top:${y}%;font-size:${fontSize};color:${col};text-shadow:0 0 12px ${col};animation-delay:${(i*0.25)}s;animation-duration:${3+i%4}s;`;
    frag.appendChild(icon);
  }
  layer.appendChild(frag);
}

/* ── PURPLE PARTICLES ── */
function createPurpleParticles() {
  const container = document.getElementById('purple-particles');
  if (!container) return;
  const frag = document.createDocumentFragment();
  const particleCount = window.innerWidth < 768 ? 8 : 18;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'purple-particle';
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = 4 + Math.random() * 6;
    const del = Math.random() * 5;
    const size = 2 + Math.random() * 3;
    p.style.cssText = `left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:-${del}s;`;
    frag.appendChild(p);
  }
  container.appendChild(frag);
}

/* ── PIXEL RAIN (Debounced & Viewport Aware) ── */
let rainTimer = null;
function buildPixelRain() {
  const rainColors = ['#a855f7','#e879f9','#c77dff','#f5a623','#00d4ff'];
  const rain = document.getElementById('pixel-rain');
  if (!rain) return;
  rain.innerHTML = '';
  
  const cols = Math.min(Math.floor(window.innerWidth / (window.innerWidth < 768 ? ANIMATION_CONFIG.RAIN_COLUMN_MOBILE : ANIMATION_CONFIG.RAIN_COLUMN_DESKTOP)), ANIMATION_CONFIG.RAIN_MAX_COLUMNS);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < cols; i++) {
    const col = document.createElement('div');
    col.className = 'pixel-col';
    const x = (i / cols * 100) + (Math.random() * 2 - 1);
    const dur = 3 + (i % 7) * 0.6;
    const del = (i * 0.35) % 4;
    const color = rainColors[i % rainColors.length];
    col.style.cssText = `left:${x}%;animation-duration:${dur}s;animation-delay:-${del}s;`;
    const cellCount = 3 + (i % 4);
    for (let j = 0; j < cellCount; j++) {
      const cell = document.createElement('div');
      cell.className = 'pixel-cell';
      cell.style.cssText = `background:${color};opacity:${0.3 + j/cellCount * 0.5};`;
      col.appendChild(cell);
    }
    frag.appendChild(col);
  }
  rain.appendChild(frag);
}

/* ── SPACE INVADER SPRITES ── */
function createInvaders() {
  const layer = document.getElementById('stars-layer');
  const inv = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 8" width="44" height="32" shape-rendering="crispEdges"><rect x="1" y="0" width="1" height="1" fill="${c}"/><rect x="9" y="0" width="1" height="1" fill="${c}"/><rect x="2" y="1" width="1" height="1" fill="${c}"/><rect x="8" y="1" width="1" height="1" fill="${c}"/><rect x="1" y="2" width="9" height="1" fill="${c}"/><rect x="0" y="3" width="3" height="1" fill="${c}"/><rect x="4" y="3" width="3" height="1" fill="${c}"/><rect x="8" y="3" width="3" height="1" fill="${c}"/><rect x="0" y="4" width="11" height="1" fill="${c}"/><rect x="0" y="5" width="1" height="1" fill="${c}"/><rect x="3" y="5" width="5" height="1" fill="${c}"/><rect x="10" y="5" width="1" height="1" fill="${c}"/><rect x="0" y="6" width="2" height="1" fill="${c}"/><rect x="9" y="6" width="2" height="1" fill="${c}"/><rect x="0" y="7" width="1" height="1" fill="${c}"/><rect x="2" y="7" width="1" height="1" fill="${c}"/><rect x="8" y="7" width="1" height="1" fill="${c}"/><rect x="10" y="7" width="1" height="1" fill="${c}"/></svg>`;
  const ghost = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 8" width="28" height="32" shape-rendering="crispEdges"><rect x="1" y="0" width="5" height="1" fill="${c}"/><rect x="0" y="1" width="7" height="5" fill="${c}"/><rect x="1" y="2" width="1" height="1" fill="#080b18"/><rect x="2" y="2" width="1" height="1" fill="white"/><rect x="4" y="2" width="1" height="1" fill="#080b18"/><rect x="5" y="2" width="1" height="1" fill="white"/><rect x="0" y="6" width="2" height="2" fill="${c}"/><rect x="2" y="6" width="1" height="1" fill="${c}"/><rect x="3" y="7" width="1" height="1" fill="${c}"/><rect x="4" y="6" width="1" height="1" fill="${c}"/><rect x="5" y="6" width="2" height="2" fill="${c}"/></svg>`;
  const ship = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" width="36" height="24" shape-rendering="crispEdges"><rect x="4" y="0" width="1" height="1" fill="${c}"/><rect x="3" y="1" width="3" height="1" fill="${c}"/><rect x="2" y="2" width="5" height="1" fill="${c}"/><rect x="0" y="3" width="9" height="1" fill="${c}"/><rect x="0" y="4" width="2" height="1" fill="${c}"/><rect x="3" y="4" width="3" height="1" fill="${c}"/><rect x="7" y="4" width="2" height="1" fill="${c}"/><rect x="0" y="5" width="1" height="1" fill="${c}"/><rect x="8" y="5" width="1" height="1" fill="${c}"/></svg>`;

  const sprites = [
    { fn: inv,   color: '#a855f7' }, { fn: inv,   color: '#e879f9' },
    { fn: inv,   color: '#c77dff' }, { fn: ghost, color: '#9333ea' },
    { fn: ghost, color: '#7c3aed' }, { fn: ship,  color: '#a855f7' },
    { fn: inv,   color: '#f5a623' }, { fn: ghost, color: '#00d4ff' },
    { fn: ship,  color: '#e879f9' }, { fn: inv,   color: '#c026d3' },
  ];
  const frag = document.createDocumentFragment();
  sprites.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = i % 3 === 2 ? 'ghost-sprite' : 'invader-sprite';
    el.setAttribute('aria-hidden', 'true');
    
    // ✅ Use constants
    const x = (i * ANIMATION_CONFIG.INVADER_SPACING_X + ANIMATION_CONFIG.INVADER_OFFSET_X) % ANIMATION_CONFIG.INVADER_MAX_X;
    const y = (i * ANIMATION_CONFIG.INVADER_SPACING_Y + ANIMATION_CONFIG.INVADER_OFFSET_Y) % ANIMATION_CONFIG.INVADER_MAX_Y;
    
    el.innerHTML = s.fn(s.color);
    el.style.cssText = `left:${x}%;top:${y}%;animation-delay:${i*0.6}s;animation-duration:${4+i%4}s;`;
    frag.appendChild(el);
  });
  layer.appendChild(frag);
}

/* ── NEON STREAKS ── */
function createNeonStreaks() {
  const layer = document.getElementById('stars-layer');
  const streakColors = ['#a855f7','#e879f9','#c77dff','#f5a623','#00d4ff'];
  const frag = document.createDocumentFragment();
  const streakCount = window.innerWidth < 768 ? 5 : 10;

  for (let i = 0; i < streakCount; i++) {
    const el = document.createElement('div');
    el.className = 'neon-streak';
    el.setAttribute('aria-hidden', 'true');
    
    // ✅ Use constants
    const y = (i * ANIMATION_CONFIG.STREAK_SPACING + ANIMATION_CONFIG.STREAK_OFFSET) % 95;
    const x = (i * ANIMATION_CONFIG.STREAK_SPACING_X) % ANIMATION_CONFIG.STREAK_MAX_X;
    
    const w = 60 + (i % 5) * 30;
    const dur = 5 + (i % 6) * 1.5;
    const del = (i * 0.9) % 8;
    const color = streakColors[i % streakColors.length];
    el.style.cssText = `left:${x}%;top:${y}%;width:${w}px;background:linear-gradient(90deg,${color},transparent);box-shadow:0 0 8px ${color};animation-duration:${dur}s;animation-delay:-${del}s;`;
    frag.appendChild(el);
  }
  layer.appendChild(frag);
}

/* ── AMBIENT TEXT ── */
function createAmbientText() {
  const layer = document.getElementById('stars-layer');
  if (!layer) return;
  
  const items = [
    { t:'GAME ON',    color:'rgba(168,85,247,0.1)',  x:5,  y:30, size:'0.35rem', rot:-90 },
    { t:'PLAYER 1',  color:'rgba(232,121,249,0.08)', x:88, y:55, size:'0.35rem', rot:90  },
    { t:'1UP',       color:'rgba(199,125,255,0.1)',  x:15, y:70, size:'0.5rem',  rot:0   },
    { t:'2UP',       color:'rgba(147,51,234,0.1)',   x:80, y:20, size:'0.5rem',  rot:0   },
    { t:'HIGH SCORE',color:'rgba(168,85,247,0.08)', x:40, y:85, size:'0.3rem',  rot:0   },
    { t:'POWER UP',  color:'rgba(232,121,249,0.06)', x:65, y:40, size:'0.25rem', rot:0  },
  ];
  const frag = document.createDocumentFragment();
  items.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'ambient-text';
    el.setAttribute('aria-hidden', 'true');
    el.innerText = item.t;
    el.style.cssText = `left:${item.x}%;top:${item.y}%;color:${item.color};font-size:${item.size};transform:rotate(${item.rot}deg);animation-delay:${i*0.8}s;animation-duration:${4+i}s;`;
    frag.appendChild(el);
  });
  layer.appendChild(frag);
}

/* ── COMPETITION LEVELS ── */
const LEVELS = [
  { n:1, name:'OLIMPIADE MATEMATIKA', short:'MATH OLYMPIAD',    icon:'&Sigma;',  color:'#f5a623', tag:'INDIVIDUAL', desc:'Kompetisi individual mengasah penalaran dan pemecahan masalah matematika. Dua babak: penyisihan & final.', target:'SMP/MTs sederajat' },
  { n:2, name:'OLIMPIADE IPA',         short:'SCIENCE OLYMPIAD', icon:'&#9879;', color:'#00d4ff', tag:'INDIVIDUAL', desc:'Kompetisi individual bidang sains: Biologi, Kimia, dan Fisika. Dua babak: penyisihan & final.', target:'SMP/MTs sederajat' },
  { n:3, name:'LOMBA CERDAS CERMAT',   short:'CERDAS CERMAT',    icon:'?',        color:'#39ff14', tag:'TIM',        desc:'Kompetisi kelompok menguji kecerdasan dalam matematika, sains, bahasa Inggris, dan pengetahuan umum.', target:'SMP/MTs sederajat' },
  { n:4, name:'ROBOSOCCER',            short:'ROBOSOCCER',       icon:'R',        color:'#ff6b6b', tag:'TIM',        desc:'Pertandingan sepak bola robot. Satu robot per tim, dikendalikan pilot dan penyusun strategi.', target:'SMP/Mts & SMA/MA' },
  { n:5, name:'MAZE SOLVING',          short:'MAZE SOLVING',     icon:'M',        color:'#c77dff', tag:'TIM',        desc:'Robot menyelesaikan lintasan dalam waktu tercepat. Uji kemampuan pemrograman dan strategi robot.', target:'SMP/MTs & SMA/MA' },
  { n:6, name:'PROJEK INOVASI',        short:'PROJEK INOVASI',   icon:'*',        color:'#ff9f1c', tag:'TIM',        desc:'Kembangkan teknologi robotik berbasis Arduino/Wemos/ESP sebagai solusi permasalahan sehari-hari.', target:'SMP/MTs & SMA/MA' },
  { n:7, name:'ESSAY',                 short:'ESSAY WRITING',    icon:'E',        color:'#4cc9f0', tag:'TIM',        desc:'Tuangkan gagasan kritis dan solusi inovatif terhadap isu aktual melalui karya tulis esai yang sistematis.', target:'SMA/MA sederajat' },
];

function renderLevels() {
  const grid = document.getElementById('levels-grid');
  if (!grid) return;
  
  const frag = document.createDocumentFragment();
  LEVELS.forEach(lv => {
    const c = lv.color;
    const card = document.createElement('div');
    card.className = 'level-card';
    card.style.cssText = `border:3px solid ${c}50;box-shadow:4px 4px 0 ${c}25,inset 0 0 20px ${c}06;`;
    card.innerHTML = `
      <div class="level-head">
        <div class="level-badge" style="background:${c};color:#0a0c1e">LEVEL ${lv.n}</div>
        <div class="level-tag" style="color:${c};border-color:${c}60">${lv.tag}</div>
      </div>
      <div class="level-icon" style="color:${c};border-color:${c};background:${c}18;box-shadow:0 0 12px ${c}40">${lv.icon}</div>
      <div class="level-name" style="color:${c}">${lv.short}</div>
      <p class="level-desc">${lv.desc}</p>
      <div class="level-target" style="color:${c};border-color:${c}40;background:${c}08">${lv.target}</div>
      <button class="level-btn" onclick="scrollToId('register')" style="color:${c};border-color:${c};background:${c}10;box-shadow:3px 3px 0 ${c}50" aria-label="Daftar ${lv.name}">SELECT &gt;</button>
    `;
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

/* ── SCHEDULE ── */
const JADWAL = [
  { t:'06.30 – 07.30', e:'Registrasi Ulang',                                                         h:false },
  { t:'07.30 – 09.00', e:'Pembukaan & Pengarahan Lomba',                                              h:false },
  { t:'09.00 – 12.00', e:'Penyisihan: Semua Cabang Lomba, Final Cabang Lomba Projek Inovasi & Essay', h:true  },
  { t:'12.00 – 13.00', e:'ISHOMA & Hiburan',                                                          h:false },
  { t:'13.20 – 16.00', e:'Babak Final Semua Cabang Lomba',                                            h:true  },
  { t:'16.00 – 16.45', e:'Pengumuman Juara & Penutupan',                                              h:true  },
];

function renderSchedule() {
  const list = document.getElementById('sched-list');
  if (!list) return;
  
  const frag = document.createDocumentFragment();
  JADWAL.forEach(item => {
    const row = document.createElement('div');
    row.className = 'sched-item ' + (item.h ? 'highlight' : 'normal');
    row.innerHTML = `<div class="sched-time">${item.t}</div><div class="sched-divider"></div><div class="sched-event">${item.e}</div>`;
    frag.appendChild(row);
  });
  list.appendChild(frag);
}

/* ── GALLERY ── */
const GALLERY_DATA = [
  { id:'PIC_01', img:'assets/foto1.webp', caption:'Suasana Kemeriahan Pembukaan CRESCENTA 2025 di MAN 1 Surakarta' },
  { id:'PIC_02', img:'assets/foto2.webp', caption:'Suasana Cabang Lomba Olimpiade' },
  { id:'PIC_03', img:'assets/foto3.webp', caption:'Cabang Lomba Robot Soccer dari Kategori SMP/MTs' },
  { id:'PIC_04', img:'assets/foto4.webp', caption:'Presentasi dari Tim Projek Inovasi Teknologi' },
  { id:'PIC_05', img:'assets/foto5.webp', caption:'Babak Final Cabang Lomba Cerdas Cermat' },
  { id:'PIC_06', img:'assets/foto6.webp', caption:'Cabang Lomba Robotik Maze Solving' },
  { id:'PIC_07', img:'assets/foto7.webp', caption:'Penyerahan Piala Juara Umum dan Apresiasi Pemenang' }
];

function renderGallery() {
  const track = document.getElementById('gallery-track');
  if (!track) return;
  
  let html = '';
  for (let k = 0; k < 2; k++) {
    GALLERY_DATA.forEach((item, idx) => {
      const ariaHidden = k > 0 ? 'aria-hidden="true"' : '';
      html += `<div class="gallery-item" role="button" tabindex="0" ${ariaHidden}
        onclick="openGalleryModal(${idx})"
        onkeydown="if(event.key==='Enter'||event.key===' ')openGalleryModal(${idx})"
        aria-label="Lihat foto: ${item.caption}">
        <img src="${item.img}" alt="${item.caption}" loading="lazy" width="260" height="180">
        <div class="gal-placeholder" aria-hidden="true">${item.id}</div>
      </div>`;
    });
  }
  track.innerHTML = html;
}

// ✅ FIX: Safe gallery modal with null checks and XSS prevention
function openGalleryModal(idx) {
  const modal = document.getElementById('gallery-modal');
  if (!modal) {
    console.warn('Gallery modal not found');
    return;
  }
  
  const item = GALLERY_DATA[idx];
  if (!item) {
    console.warn('Gallery item not found');
    return;
  }
  
  const img = document.getElementById('modal-img');
  const cap = document.getElementById('modal-caption');
  
  // ✅ Null checks
  if (!img || !cap) {
    console.warn('Gallery modal elements not found');
    return;
  }
  
  // ✅ XSS prevention - use safe DOM methods
  img.innerHTML = '';
  const imgEl = document.createElement('img');
  imgEl.src = item.img;
  imgEl.alt = item.caption;
  imgEl.style.cssText = 'width:100%;height:100%;object-fit:cover;';
  imgEl.loading = 'lazy';
  img.appendChild(imgEl);
  
  cap.textContent = item.caption;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  
  // ✅ Optional chaining untuk safety
  modal.querySelector('.modal-close')?.focus();
}

function closeGalleryModal() {
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;
  
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeGalleryModal();
});

/* ── FAQ ── */
const FAQS = [
  { q:'Siapa yang bisa mengikuti CRESCENTA 2026?', a:'Peserta terbuka untuk siswa-siswi MTs/SMP dan MA/SMA sederajat se-Jawa-Bali.' },
  { q:'Bagaimana cara mendaftar?', a:'Isi formulir pendaftaran melalui tombol Register pada halaman ini.' },
  { q:'Kapan dan di mana acara berlangsung?', a:'Sabtu, 5 September 2026 di MAN 1 Surakarta, Jawa Tengah.' },
];

function renderFAQ() {
  const list = document.getElementById('faq-list');
  if (!list) return;
  
  const frag = document.createDocumentFragment();
  FAQS.forEach((faq, i) => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.innerHTML = `
      <button class="faq-q" onclick="toggleFAQ(${i})" aria-expanded="false" aria-controls="faq-a-${i}" id="faq-q-${i}">
        <span>${faq.q}</span><span class="faq-arrow" aria-hidden="true">&#9658;</span>
      </button>
      <div class="faq-a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}">${faq.a}</div>
    `;
    frag.appendChild(item);
  });
  list.appendChild(frag);
}

function toggleFAQ(i) {
  document.querySelectorAll('.faq-item').forEach((el, j) => {
    const btn = el.querySelector('.faq-q');
    if (j === i) {
      const isOpen = el.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    } else {
      el.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── SCROLL-TO-TOP ── */
window.addEventListener('scroll', () => {
  document.getElementById('scroll-top').classList.toggle('show', window.scrollY > 400);
}, { passive: true });

/* ── INTERSECTION OBSERVER (entrance animations) ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'float-in 0.6s ease-out forwards';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

/* ── HELPER: Check prefers-reduced-motion ── */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ── CITYSCAPE WINDOW ANIMATION (Optimized) ── */
function initCityscapeWindows() {
  const allWins = Array.from(document.querySelectorAll('.city-win'));
  const purpleWins = Array.from(document.querySelectorAll('.city-win-purple'));
  const pinkWins = Array.from(document.querySelectorAll('.city-win-pink'));

  if (allWins.length === 0 && purpleWins.length === 0 && pinkWins.length === 0) {
    return null;
  }

  /* Initial state */
  allWins.forEach(el => { if (Math.random() < 0.4) el.classList.add('lit'); });
  purpleWins.forEach(el => { if (Math.random() < 0.35) el.classList.add('lit'); });
  pinkWins.forEach(el => { if (Math.random() < 0.3) el.classList.add('lit'); });

  /* Optimized logic: Only touch DOM for a small random fraction instead of iterating all arrays fully every interval */
  function toggleRandomWindow(arr, probability) {
      arr.forEach(el => { 
          if (Math.random() < probability) el.classList.toggle('lit'); 
      });
  }

  // ✅ FIX: Store interval IDs for cleanup
  const intervalIds = [
    setInterval(() => toggleRandomWindow(allWins, 0.05), 800),
    setInterval(() => toggleRandomWindow(purpleWins, 0.06), 1000),
    setInterval(() => toggleRandomWindow(pinkWins, 0.06), 1200)
  ];

  // ✅ FIX: Cleanup function untuk prevent memory leak
  const cleanup = () => {
    intervalIds.forEach(id => clearInterval(id));
  };

  return cleanup;
}

/* ── BACKGROUND INTERACTIONS (Optimized Parallax) ── */
function initBgInteractions() {
  const bgPac = document.querySelector('.bg-pac-row .pacman');
  if (bgPac) {
    let fast = false;
    const starsLayer = document.getElementById('stars-layer');
    
    if (starsLayer) {
      starsLayer.addEventListener('click', (e) => {
        const coin = document.createElement('div');
        coin.textContent = '$';
        coin.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;color:#a855f7;font-family:'Press Start 2P',monospace;font-size:18px;opacity:1;pointer-events:none;transform:translate3d(-50%,-50%,0);transition:opacity 1s ease-out,transform 1s ease-out;text-shadow:0 0 10px #a855f7;z-index:9999;`;
        document.body.appendChild(coin);
        requestAnimationFrame(() => {
          coin.style.opacity = '0';
          coin.style.transform = 'translate3d(-50%,-150px,0) scale(1.6)';
        });
        setTimeout(() => coin.remove(), 1100);
        fast = !fast;
        bgPac.style.animation = fast
          ? 'chomp 0.18s infinite alternate, movePac 5s linear infinite'
          : 'chomp 0.28s infinite alternate, movePac 10s linear infinite';
      });
    }
  }

  const moveEls = Array.from(document.querySelectorAll('.ghost-sprite, .invader-sprite, .neon-streak, .wizard-char, .dragon-char, .arcade-bot, .crystal-char, .energy-orb, .rocket-char'));
  let rafId = null;
  
  function updatePositions() {
    const now = Date.now() / 1000;
    moveEls.forEach((el, idx) => {
      const base = now * (0.05 + (idx % 3) * 0.02);
      const x = Math.sin(base * (0.6 + idx * 0.02)) * 6;
      const y = Math.cos(base * (0.8 + idx * 0.03)) * 10;
      // Gunakan translate3d untuk mem-bypass repaint CPU
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`; 
    });
    rafId = requestAnimationFrame(updatePositions);
  }
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(updatePositions);
    }
  });
  
  rafId = requestAnimationFrame(updatePositions);
}

/* ── WINDOW ANIMATION OBSERVER ── */
function initScrollAnimations() {
  document.querySelectorAll('.level-card, .stat-card, .about-card, .sched-item, .faq-item, .gallery-wrapper').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

/* ── MAIN INIT ── */
function init() {
  try {
    renderLevels();
    renderSchedule();
    renderGallery();
    renderFAQ();
    initScrollAnimations();
    
    // ✅ FIX: Setup menu listener dengan cleanup capability
    let removeMenuListener = setupMenuCloseListener();
    
    // ✅ FIX: Store cleanup function dari cityscapeWindows
    let cityscapeCleanup = initCityscapeWindows();

    if (!prefersReducedMotion()) {
      createStars();
      createPurpleParticles();
      buildPixelRain();
      createInvaders();
      createNeonStreaks();
      createAmbientText();
      initBgInteractions();

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildPixelRain, 300);
      }, { passive: true });
    }
    
    // ✅ FIX: Cleanup sebelum page unload untuk prevent memory leak
    window.addEventListener('beforeunload', () => {
      if (cityscapeCleanup) cityscapeCleanup();
      if (removeMenuListener) removeMenuListener();
    });
    
  } catch (error) {
    console.error('Error initializing CRESCENTA:', error);
    // Fallback: minimal functionality tetap berjalan
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}