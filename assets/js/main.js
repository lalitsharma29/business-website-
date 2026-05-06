// ====== MAIN.JS – Mohan Mehandi Art ======

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile menu toggle
function toggleMenu() {
  const links = document.getElementById('navLinks');
  const ham = document.getElementById('hamburger');
  let overlay = document.getElementById('menuOverlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'menuOverlay';
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => {
      links?.classList.remove('open');
      ham?.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  if (links) links.classList.toggle('open');
  if (ham) ham.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}
// Close menu on link click
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('navLinks')?.classList.remove('open');
      document.getElementById('hamburger')?.classList.remove('open');
      document.getElementById('menuOverlay')?.classList.remove('open');
    });
  });

  // Update nav login btn based on auth
  updateNavUser();

  // Scroll reveal animation
  observeAnimations();
});

// Toast notifications
function showToast(msg, type = '') {
  let t = document.getElementById('globalToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'globalToast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// Scroll reveal
function observeAnimations() {
  const els = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card, .gallery-card, .milestone, .service-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }, i * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// Update nav login/logout button
function updateNavUser() {
  const btn = document.getElementById('loginNavBtn');
  if (!btn) return;
  const u = getCurrentUser();
  if (u) {
    btn.innerHTML = `<i class="fa fa-user-circle"></i> ${u.role === 'admin' ? 'Admin' : u.name.split(' ')[0]}`;
    btn.href = u.role === 'admin' ? 'admin.html' : '#';
    // Add logout on click for visitor
    if (u.role !== 'admin') {
      btn.onclick = (e) => {
        e.preventDefault();
        if (confirm('Logout?')) { logoutUser(); window.location.reload(); }
      };
    }
  }
}

// Counter animation for stats
function animateCounters() {
  document.querySelectorAll('.hero-stat .num, .milestone .num').forEach(el => {
    const text = el.textContent;
    const num = parseInt(text.replace(/\D/g, ''));
    const suffix = text.replace(/[0-9]/g, '');
    if (isNaN(num)) return;
    let current = 0;
    const step = num / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, num);
      el.textContent = Math.floor(current) + suffix;
      if (current >= num) clearInterval(timer);
    }, 25);
  });
}
window.addEventListener('load', () => setTimeout(animateCounters, 600));

// Utility: Get/Set localStorage
function lsGet(key, def = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
}
function lsSet(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Auth helpers (proxy for auth.js)
function getCurrentUser() {
  return lsGet('mma_user');
}
function logoutUser() {
  localStorage.removeItem('mma_user');
  localStorage.removeItem('mma_admin_token');
  showToast('Logged out successfully.');
}
