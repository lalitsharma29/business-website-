// ================================================================
// api.js – Mohan Mehandi Art
// Central API layer – all calls to the MongoDB backend go here.
// Automatically falls back to localStorage if backend is offline.
// ================================================================

const API_BASE = (() => {
  // In production this will be your Render/Railway URL
  // In development it falls back to localhost:3000
  const envUrl = window.MMA_API_URL; // set in index page <script>
  if (envUrl) return envUrl;
  // Auto-detect: if serving from a live domain (not local and not file://), point to backend host
  if (location.hostname && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    // ⚠️ REPLACE with your actual Render backend URL after deployment
    return 'https://mohan-mehandi-backend.onrender.com';
  }
  return 'http://localhost:3000';
})();

// ── Fetch helper ─────────────────────────────────────────────────
async function apiCall(method, path, body = null, isFormData = false) {
  const opts = {
    method,
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);

  try {
    const res  = await fetch(API_BASE + path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    console.warn(`API ${method} ${path} failed:`, err.message);
    throw err;
  }
}

// ── Backend status check ──────────────────────────────────────────
let _backendOnline = null;
async function isBackendOnline() {
  if (_backendOnline !== null) return _backendOnline;
  try {
    const res = await fetch(API_BASE + '/api/status', { signal: AbortSignal.timeout(4000) });
    _backendOnline = res.ok;
  } catch {
    _backendOnline = false;
  }
  return _backendOnline;
}

// ── DESIGNS ──────────────────────────────────────────────────────

async function getDesigns() {
  try {
    const online = await isBackendOnline();
    if (!online) throw new Error('offline');

    const data = await apiCall('GET', '/api/designs');
    // Prefix relative image paths with API base
    return data.designs.map(d => ({
      ...d,
      image: d.image
        ? (d.image.startsWith('http') ? d.image : API_BASE + d.image)
        : ''
    }));
  } catch {
    // Fallback: localStorage / default designs
    console.warn('⚠️ Using localStorage fallback for designs');
    try {
      const raw = localStorage.getItem('mma_designs');
      const stored = raw ? JSON.parse(raw) : null;
      if (!stored || stored.length === 0) {
        localStorage.setItem('mma_designs', JSON.stringify(DEFAULT_DESIGNS));
        return DEFAULT_DESIGNS;
      }
      return stored;
    } catch {
      return DEFAULT_DESIGNS;
    }
  }
}

async function addDesign(design, imageFile = null) {
  try {
    const online = await isBackendOnline();
    if (!online) throw new Error('offline');

    const fd = new FormData();
    fd.append('name',     design.name);
    fd.append('category', design.category);
    fd.append('price',    design.price);
    fd.append('desc',     design.desc || '');
    if (design.serial)   fd.append('serial',   design.serial);
    if (design.imageUrl) fd.append('imageUrl', design.imageUrl);
    if (imageFile)       fd.append('image', imageFile);

    const data = await apiCall('POST', '/api/designs', fd, true);
    _backendOnline = true;
    return data.design;
  } catch {
    // Fallback to localStorage
    const designs = await _lsGetDesigns();
    const maxSerial = designs.filter(d => !d.isPinterest).length + 1;
    const newD = {
      ...design,
      id: Date.now(),
      serial: design.serial || ('M' + String(maxSerial).padStart(3, '0')),
      createdAt: new Date().toISOString()
    };
    designs.push(newD);
    _lsSaveDesigns(designs);
    return newD;
  }
}

async function updateDesign(id, updates, imageFile = null) {
  try {
    const online = await isBackendOnline();
    if (!online) throw new Error('offline');

    const fd = new FormData();
    Object.keys(updates).forEach(k => updates[k] !== undefined && fd.append(k, updates[k]));
    if (imageFile) fd.append('image', imageFile);

    const data = await apiCall('PUT', `/api/designs/${id}`, fd, true);
    return data.design;
  } catch {
    const designs = _lsGetDesignsSync();
    const idx = designs.findIndex(d => String(d.id) === String(id) || String(d._id) === String(id));
    if (idx >= 0) {
      designs[idx] = { ...designs[idx], ...updates };
      _lsSaveDesigns(designs);
      return designs[idx];
    }
  }
}

async function updateDesignPrice(id, price) {
  try {
    const online = await isBackendOnline();
    if (!online) throw new Error('offline');
    await apiCall('PATCH', `/api/designs/${id}/price`, { price });
  } catch {
    const designs = _lsGetDesignsSync();
    const idx = designs.findIndex(d => String(d.id) === String(id) || String(d._id) === String(id));
    if (idx >= 0) { designs[idx].price = price; _lsSaveDesigns(designs); }
  }
}

async function deleteDesign(id) {
  try {
    const online = await isBackendOnline();
    if (!online) throw new Error('offline');
    await apiCall('DELETE', `/api/designs/${id}`);
  } catch {
    _lsSaveDesigns(_lsGetDesignsSync().filter(d =>
      String(d.id) !== String(id) && String(d._id) !== String(id)
    ));
  }
}

// ── BOOKINGS ────────────────────────────────────────────────────

async function getBookings() {
  try {
    if (!(await isBackendOnline())) throw new Error('offline');
    const data = await apiCall('GET', '/api/bookings');
    return data.bookings;
  } catch {
    return lsGet('mma_bookings', []);
  }
}

async function addBooking(booking) {
  try {
    if (!(await isBackendOnline())) throw new Error('offline');
    const data = await apiCall('POST', '/api/bookings', booking);
    return data.booking;
  } catch {
    const bookings = lsGet('mma_bookings', []);
    const newB = { ...booking, id: Date.now(), status: 'pending', createdAt: new Date().toISOString() };
    bookings.push(newB);
    lsSet('mma_bookings', bookings);
    return newB;
  }
}

async function updateBookingStatus(id, status) {
  try {
    if (!(await isBackendOnline())) throw new Error('offline');
    await apiCall('PATCH', `/api/bookings/${id}/status`, { status });
  } catch {
    const bookings = lsGet('mma_bookings', []);
    const item = bookings.find(b => String(b.id) === String(id) || String(b._id) === String(id));
    if (item) { item.status = status; lsSet('mma_bookings', bookings); }
  }
}

async function deleteBooking(id) {
  try {
    if (!(await isBackendOnline())) throw new Error('offline');
    await apiCall('DELETE', `/api/bookings/${id}`);
  } catch {
    lsSet('mma_bookings', lsGet('mma_bookings', []).filter(b =>
      String(b.id) !== String(id) && String(b._id) !== String(id)
    ));
  }
}

// ── USERS / AUTH ─────────────────────────────────────────────────

async function apiLogin(phone, password) {
  try {
    if (!(await isBackendOnline())) throw new Error('offline');
    const data = await apiCall('POST', '/api/auth/login', { phone, password });
    return data.user;
  } catch (err) {
    if (err.message === 'offline') {
      // Local admin check
      const users = lsGet('mma_users', []);
      const u = users.find(u => u.phone === phone && u.password === password);
      if (u) return u;
      // Hardcoded admin fallback
      if (phone === '9818246792' && password === 'Mohan@2025')
        return { id: 'admin', name: 'Mohan', phone, role: 'admin' };
      throw new Error('Invalid credentials');
    }
    throw err;
  }
}

async function apiRegister(name, phone, password) {
  try {
    if (!(await isBackendOnline())) throw new Error('offline');
    const data = await apiCall('POST', '/api/auth/register', { name, phone, password });
    return data.user;
  } catch (err) {
    if (err.message === 'offline') {
      const users = lsGet('mma_users', []);
      if (users.find(u => u.phone === phone)) throw new Error('Phone already registered');
      const u = { id: Date.now(), name, phone, password, role: 'visitor', createdAt: new Date().toISOString() };
      users.push(u);
      lsSet('mma_users', users);
      return u;
    }
    throw err;
  }
}

async function getUsers() {
  try {
    if (!(await isBackendOnline())) throw new Error('offline');
    const data = await apiCall('GET', '/api/users');
    return data.users;
  } catch {
    return lsGet('mma_users', []);
  }
}

async function getStats() {
  try {
    if (!(await isBackendOnline())) throw new Error('offline');
    const data = await apiCall('GET', '/api/stats');
    return data.stats;
  } catch {
    const designs  = _lsGetDesignsSync();
    const bookings = lsGet('mma_bookings', []);
    const users    = lsGet('mma_users', []);
    return {
      totalDesigns:   designs.length,
      totalBookings:  bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      totalUsers:     users.length
    };
  }
}

// ── LOCAL STORAGE HELPERS (fallback) ─────────────────────────────
function lsGet(key, def = null) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function _lsGetDesignsSync() {
  return lsGet('mma_designs', []);
}
async function _lsGetDesigns() {
  const d = lsGet('mma_designs', null);
  if (!d || d.length === 0) {
    lsSet('mma_designs', DEFAULT_DESIGNS);
    return [...DEFAULT_DESIGNS];
  }
  return d;
}
function _lsSaveDesigns(designs) {
  lsSet('mma_designs', designs);
}

// ── SEED backend on first visit ───────────────────────────────────
(async () => {
  if (await isBackendOnline()) {
    try { await apiCall('POST', '/api/seed'); } catch {}
  }
})();
