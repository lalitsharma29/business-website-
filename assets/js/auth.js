// ====== AUTH.JS – Mohan Mehandi Art ======
// Shared auth helpers used by all pages.

/* ------------------------------------------------------------------
   getCurrentUser  – reads session from localStorage
------------------------------------------------------------------ */
function getCurrentUser() {
  return lsGet('mma_user', null);
}

/* ------------------------------------------------------------------
   logoutUser  – clears ALL auth keys (user + admin token)
------------------------------------------------------------------ */
function logoutUser() {
  localStorage.removeItem('mma_user');
  localStorage.removeItem('mma_admin_token');
}

/* ------------------------------------------------------------------
   requireAdmin  – redirect to login if not a verified admin.
   Cross-checks the session token to prevent direct-URL bypasses.
------------------------------------------------------------------ */
function requireAdmin() {
  const u = getCurrentUser();
  if (!u || u.role !== 'admin') {
    window.location.href = 'login.html';
    return false;
  }
  // Token cross-check: both keys must exist and match
  const storedToken = localStorage.getItem('mma_admin_token');
  if (!storedToken || storedToken !== u.token) {
    localStorage.removeItem('mma_user');
    localStorage.removeItem('mma_admin_token');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/* ------------------------------------------------------------------
   requireLogin  – redirect to login if not logged in at all
------------------------------------------------------------------ */
function requireLogin() {
  const u = getCurrentUser();
  if (!u) {
    showToast('Please login to continue.', 'error');
    setTimeout(() => window.location.href = 'login.html', 900);
    return null;
  }
  return u;
}

/* ------------------------------------------------------------------
   doSignup  – visitor account creation (used by login.html inline)
   Kept here as a shared helper; login.html also calls it directly.
------------------------------------------------------------------ */
async function doSignup(e) {
  e.preventDefault();
  const name  = document.getElementById('sName').value.trim();
  const phone = document.getElementById('sPhone').value.trim();
  const pass  = document.getElementById('sPass').value;
  const btn   = e.target.querySelector('button[type="submit"]');

  if (phone.length !== 10 || !/^\d+$/.test(phone)) {
    showToast('Please enter a valid 10-digit phone number.', 'error');
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }

  try {
    // Try MongoDB backend first, fall back to localStorage
    let newUser;
    if (typeof apiRegister === 'function') {
      newUser = await apiRegister(name, phone, pass);
    } else {
      // localStorage fallback
      const users = lsGet('mma_users', []);
      if (users.find(u => u.phone === phone)) throw new Error('This phone number is already registered.');
      newUser = { name, phone, password: pass, createdAt: new Date().toISOString() };
      users.push(newUser);
      lsSet('mma_users', users);
      newUser = { role: 'visitor', name, phone };
    }
    lsSet('mma_user', newUser);
    showToast(`Account created! Welcome, ${name}! 🌸`, 'success');
    setTimeout(() => window.location.href = 'gallery.html', 900);
  } catch (err) {
    showToast(err.message || 'Could not create account. Try again.', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
  }
}
