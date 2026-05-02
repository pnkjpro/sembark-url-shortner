// ── API Module ──
const API = {
  base: '/api',
  token: localStorage.getItem('auth_token'),
  async request(method, path, body = null) {
    const opts = { method, headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } };
    if (this.token) opts.headers['Authorization'] = `Bearer ${this.token}`;
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(this.base + path, opts);
    const json = await res.json();
    if (res.status === 401 && path !== '/login') { Auth.logout(); }
    return json;
  },
  get(p) { return this.request('GET', p); },
  post(p, b) { return this.request('POST', p, b); },
  del(p) { return this.request('DELETE', p); }
};

// ── Auth Module ──
const Auth = {
  user: null,
  async login(email, password) {
    const r = await API.post('/login', { email, password });
    if (r.success) { API.token = r.data.token; localStorage.setItem('auth_token', r.data.token); this.user = r.data.user; }
    return r;
  },
  async fetchUser() {
    if (!API.token) return false;
    const r = await API.get('/user');
    if (r.success) { this.user = r.data; return true; }
    return false;
  },
  logout() { API.token = null; localStorage.removeItem('auth_token'); this.user = null; Router.go('login'); },
  is(role) { return this.user?.role === role; },
  canAccess(section) {
    const r = this.user?.role;
    const m = { overview: true, urls: true, invitations: r !== 'member', users: r !== 'member' };
    return m[section] || false;
  }
};

// ── Icons (inline SVG strings) ──
const Icons = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
};

// ── Router ──
const Router = {
  current: 'overview',
  go(page) { this.current = page; App.render(); },
};

// ── Rendering Helpers ──
const $ = (id) => document.getElementById(id);
function h(tag, attrs = {}, children = '') {
  const a = Object.entries(attrs).map(([k, v]) => v === true ? k : `${k}="${v}"`).join(' ');
  return `<${tag}${a ? ' ' + a : ''}>${children}</${tag}>`;
}
function roleBadge(role) {
  const m = { super_admin: 'badge-violet', admin: 'badge-cyan', member: 'badge-emerald' };
  return `<span class="badge ${m[role] || 'badge-cyan'}">${(role || '').replace('_', ' ')}</span>`;
}
function timeAgo(d) {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}
function showAlert(container, msg, type = 'error') {
  const el = document.querySelector(container);
  if (el) el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ''; }, 4000);
}
function copyToken(token, btnEl) {
  navigator.clipboard.writeText(token).then(() => {
    const prev = btnEl.textContent;
    btnEl.textContent = 'Copied!';
    btnEl.style.color = 'var(--accent-emerald)';
    setTimeout(() => { btnEl.textContent = prev; btnEl.style.color = ''; }, 1500);
  });
}

// ── App ──
const App = {
  stats: null,
  async init() {
    // Check if hash has #accept for invitation acceptance
    if (window.location.hash === '#accept') { Router.current = 'accept'; this.render(); return; }
    const ok = await Auth.fetchUser();
    if (!ok) { Router.current = 'login'; }
    this.render();
  },
  render() {
    const root = $('app');
    if (Router.current === 'accept') { root.innerHTML = Views.acceptInvitation(); this.bindAcceptForm(); return; }
    if (Router.current === 'login') { root.innerHTML = Views.login(); this.bindLogin(); return; }
    root.innerHTML = Views.shell();
    this.bindShell();
    this.loadPage();
  },
  bindLogin() {
    const form = $('login-form');
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      btn.disabled = true; btn.textContent = 'Signing in...';
      const r = await Auth.login($('login-email').value, $('login-password').value);
      if (r.success) { Router.go('overview'); }
      else { showAlert('#login-alert', r.message || 'Login failed'); btn.disabled = false; btn.textContent = 'Sign In'; }
    };
    const acceptLink = $('go-accept');
    if (acceptLink) acceptLink.onclick = (e) => { e.preventDefault(); Router.current = 'accept'; App.render(); };
  },
  bindAcceptForm() {
    const form = $('accept-form');
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Creating account...';
      const r = await API.post('/invitations/accept', {
        token: $('accept-token').value,
        name: $('accept-name').value,
        password: $('accept-password').value,
        password_confirmation: $('accept-password-confirm').value,
      });
      if (r.success) {
        API.token = r.data.token;
        localStorage.setItem('auth_token', r.data.token);
        Auth.user = r.data.user;
        window.location.hash = '';
        Router.go('overview');
      } else {
        showAlert('#accept-alert', r.message || 'Failed to accept invitation');
        btn.disabled = false; btn.textContent = 'Accept & Create Account';
      }
    };
    const backLink = $('go-login');
    if (backLink) backLink.onclick = (e) => { e.preventDefault(); window.location.hash = ''; Router.current = 'login'; App.render(); };
  },
  bindShell() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.onclick = () => { Router.current = el.dataset.nav; this.loadPage(); this.updateNav(); };
    });
    const logoutBtn = $('btn-logout');
    if (logoutBtn) logoutBtn.onclick = () => { API.post('/logout'); Auth.logout(); };
    const toggle = $('sidebar-toggle');
    if (toggle) toggle.onclick = () => document.querySelector('.sidebar').classList.toggle('open');
  },
  updateNav() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === Router.current);
    });
  },
  async loadPage() {
    this.updateNav();
    const main = $('main-content');
    main.innerHTML = '<div class="spinner"></div>';
    switch (Router.current) {
      case 'overview': await Pages.overview(main); break;
      case 'urls': await Pages.urls(main); break;
      case 'invitations': await Pages.invitations(main); break;
      case 'users': await Pages.users(main); break;
    }
  }
};

// ── Views ──
const Views = {
  login() {
    return `<div class="login-wrapper"><div class="login-card">
      <h1>Sembark Links</h1><p>Sign in to your dashboard</p>
      <div id="login-alert"></div>
      <form id="login-form">
        <div class="form-group"><label for="login-email">Email</label>
          <input class="form-input" id="login-email" type="email" placeholder="you@company.com" required></div>
        <div class="form-group"><label for="login-password">Password</label>
          <input class="form-input" id="login-password" type="password" placeholder="••••••••" required></div>
        <button class="btn btn-primary" type="submit">Sign In</button>
      </form>
      <p style="text-align:center;margin-top:20px;font-size:13px;color:var(--text-muted)">Have an invitation token? <a href="#" id="go-accept" style="color:var(--accent-cyan);text-decoration:none;font-weight:500">Accept Invitation</a></p>
      </div></div>`;
  },
  acceptInvitation() {
    return `<div class="login-wrapper"><div class="login-card" style="max-width:460px">
      <h1>Accept Invitation</h1><p>Create your account using the invitation token</p>
      <div id="accept-alert"></div>
      <form id="accept-form">
        <div class="form-group"><label for="accept-token">Invitation Token</label>
          <input class="form-input" id="accept-token" type="text" placeholder="Paste your invitation token" required></div>
        <div class="form-group"><label for="accept-name">Full Name</label>
          <input class="form-input" id="accept-name" type="text" placeholder="John Doe" required></div>
        <div class="form-group"><label for="accept-password">Password</label>
          <input class="form-input" id="accept-password" type="password" placeholder="Min 8 characters" required minlength="8"></div>
        <div class="form-group"><label for="accept-password-confirm">Confirm Password</label>
          <input class="form-input" id="accept-password-confirm" type="password" placeholder="Confirm password" required minlength="8"></div>
        <button class="btn btn-primary" type="submit">Accept & Create Account</button>
      </form>
      <p style="text-align:center;margin-top:20px;font-size:13px;color:var(--text-muted)"><a href="#" id="go-login" style="color:var(--accent-cyan);text-decoration:none;font-weight:500">← Back to Sign In</a></p>
      </div></div>`;
  },
  shell() {
    const u = Auth.user;
    const initial = u.name ? u.name[0].toUpperCase() : '?';
    const navItems = [
      { key: 'overview', icon: Icons.dashboard, label: 'Overview' },
      { key: 'urls', icon: Icons.link, label: 'Short URLs' },
      Auth.canAccess('invitations') && { key: 'invitations', icon: Icons.mail, label: 'Invitations' },
      Auth.canAccess('users') && { key: 'users', icon: Icons.users, label: 'Users' },
    ].filter(Boolean);

    return `<button class="sidebar-toggle" id="sidebar-toggle">${Icons.menu}</button>
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="sidebar-brand"><h2>Sembark Links</h2><small>${u.role.replace('_', ' ')}</small></div>
        <nav class="sidebar-nav">
          ${navItems.map(n => `<button class="nav-item ${Router.current === n.key ? 'active' : ''}" data-nav="${n.key}">${n.icon}<span>${n.label}</span></button>`).join('')}
          <div class="nav-spacer"></div>
          <button class="nav-item" id="btn-logout">${Icons.logout}<span>Sign Out</span></button>
        </nav>
        <div class="sidebar-user"><div class="user-avatar">${initial}</div>
          <div class="user-info"><div class="name">${u.name}</div><div class="role">${u.role.replace('_', ' ')}</div></div></div>
      </aside>
      <main class="main-content" id="main-content"></main>
    </div>`;
  }
};

// ── Pages ──
const Pages = {
  async overview(el) {
    const r = await API.get('/dashboard/stats');
    if (!r.success) { el.innerHTML = '<p>Failed to load stats.</p>'; return; }
    const s = r.data;
    const cards = [];
    cards.push({ icon: Icons.link, value: s.total_urls ?? 0, label: 'Total URLs' });
    if (s.total_companies !== undefined) cards.push({ icon: Icons.building, value: s.total_companies, label: 'Companies' });
    if (s.total_users !== undefined) cards.push({ icon: Icons.users, value: s.total_users, label: 'Users' });
    if (s.pending_invitations !== undefined) cards.push({ icon: Icons.clock, value: s.pending_invitations, label: 'Pending Invitations' });

    el.innerHTML = `<div class="page-header slide-up"><h1>Dashboard</h1><p>Welcome back, ${Auth.user.name}</p></div>
      <div class="stats-grid">${cards.map(c => `<div class="stat-card slide-up">
        <div class="stat-icon">${c.icon}</div>
        <div class="stat-value">${c.value}</div>
        <div class="stat-label">${c.label}</div></div>`).join('')}</div>`;
  },

  async urls(el) {
    const canCreate = Auth.user.role !== 'super_admin';
    el.innerHTML = `<div class="page-header slide-up"><h1>Short URLs</h1><p>Manage your shortened links</p></div>
      <div id="url-alert"></div>
      ${canCreate ? `<div class="card mb-4 slide-up"><div class="card-header"><h3>Create New URL</h3></div>
        <div style="padding:20px 24px"><form id="url-form" class="flex gap-3 items-center" style="flex-wrap:wrap">
          <input class="form-input" id="url-input" type="url" placeholder="https://example.com/very-long-url" required style="flex:1;min-width:260px">
          <button class="btn btn-primary btn-sm" type="submit">+ Shorten</button></form></div></div>` : ''}
      <div class="card slide-up"><div class="card-header"><h3>All URLs</h3></div>
        <div class="card-body" id="urls-table"><div class="spinner"></div></div></div>`;

    if (canCreate) {
      const form = $('url-form');
      form.onsubmit = async (e) => {
        e.preventDefault();
        const input = $('url-input');
        const r = await API.post('/short-urls', { original_url: input.value });
        if (r.success) { input.value = ''; showAlert('#url-alert', 'URL shortened successfully!', 'success'); this.loadUrls(); }
        else showAlert('#url-alert', r.message || 'Failed');
      };
    }
    this.loadUrls();
  },

  async loadUrls() {
    const container = $('urls-table');
    const r = await API.get('/short-urls');
    if (!r.success) { container.innerHTML = '<p style="padding:24px">Failed to load.</p>'; return; }
    const items = r.data?.data || [];
    if (!items.length) { container.innerHTML = `<div class="empty-state">${Icons.empty}<p>No URLs found</p></div>`; return; }
    const showCompany = Auth.is('super_admin');
    container.innerHTML = `<table class="data-table"><thead><tr>
      <th>Short Code</th><th>Original URL</th>${showCompany ? '<th>Company</th>' : ''}<th>Creator</th><th>Created</th>
      </tr></thead><tbody>${items.map(u => `<tr>
        <td class="code-cell">${u.short_code}</td>
        <td class="url-cell" title="${u.original_url}">${u.original_url}</td>
        ${showCompany ? `<td>${u.company?.name || '—'}</td>` : ''}
        <td>${u.creator?.name || '—'}</td>
        <td>${timeAgo(u.created_at)}</td>
      </tr>`).join('')}</tbody></table>`;
  },



  async invitations(el) {
    if (!Auth.canAccess('invitations')) { el.innerHTML = '<p>Access denied.</p>'; return; }
    const isSA = Auth.is('super_admin');
    el.innerHTML = `<div class="page-header slide-up"><h1>Invitations</h1><p>Manage team invitations</p></div>
      <div id="inv-alert"></div>
      <div class="card mb-4 slide-up"><div class="card-header"><h3>Send Invitation</h3></div>
        <div style="padding:20px 24px"><form id="inv-form">
          <div class="flex gap-3 items-center" style="flex-wrap:wrap">
            <input class="form-input" id="inv-email" type="email" placeholder="Email address" required style="flex:1;min-width:200px">
            ${isSA ? `<input class="form-input" id="inv-company" type="text" placeholder="Company name" required style="flex:1;min-width:200px">` :
              `<select class="form-input" id="inv-role" style="flex:0 0 150px"><option value="admin">Admin</option><option value="member">Member</option></select>`}
            <button class="btn btn-primary btn-sm" type="submit">✉ Send</button>
          </div></form></div></div>
      <div class="card slide-up"><div class="card-header"><h3>All Invitations</h3></div>
        <div class="card-body" id="inv-table"><div class="spinner"></div></div></div>`;

    $('inv-form').onsubmit = async (e) => {
      e.preventDefault();
      let body;
      if (isSA) body = { email: $('inv-email').value, company_name: $('inv-company').value };
      else body = { email: $('inv-email').value, role: $('inv-role').value };
      const r = await API.post('/invitations', body);
      if (r.success) { $('inv-email').value = ''; showAlert('#inv-alert', 'Invitation sent!', 'success'); this.loadInvitations(); }
      else showAlert('#inv-alert', r.message || 'Failed');
    };
    this.loadInvitations();
  },

  async loadInvitations() {
    const container = $('inv-table');
    const r = await API.get('/invitations');
    if (!r.success) { container.innerHTML = '<p style="padding:24px">Failed to load.</p>'; return; }
    const items = r.data?.data || [];
    if (!items.length) { container.innerHTML = `<div class="empty-state">${Icons.empty}<p>No invitations found</p></div>`; return; }
    const showCompany = Auth.is('super_admin');
    container.innerHTML = `<table class="data-table"><thead><tr>
      <th>Email</th><th>Role</th>${showCompany ? '<th>Company</th>' : ''}<th>Token</th><th>Status</th><th>Sent</th>
      </tr></thead><tbody>${items.map(i => {
        const accepted = !!i.accepted_at;
        const expired = !accepted && new Date(i.expires_at) < Date.now();
        const status = accepted ? '<span class="badge badge-emerald">Accepted</span>' : expired ? '<span class="badge badge-rose">Expired</span>' : '<span class="badge badge-amber">Pending</span>';
        const tokenCell = !accepted ? `<button class="btn btn-ghost btn-sm" onclick="copyToken('${i.token}', this)" title="${i.token}">📋 Copy</button>` : '<span style="color:var(--text-muted)">—</span>';
        return `<tr>
          <td>${i.email}</td><td>${roleBadge(i.role)}</td>
          ${showCompany ? `<td>${i.company?.name || '—'}</td>` : ''}
          <td>${tokenCell}</td>
          <td>${status}</td><td>${timeAgo(i.created_at)}</td></tr>`;
      }).join('')}</tbody></table>`;
  },



  async users(el) {
    if (!Auth.canAccess('users')) { el.innerHTML = '<p>Access denied.</p>'; return; }
    el.innerHTML = `<div class="page-header slide-up"><h1>Users</h1><p>Manage team members</p></div>
      <div class="card slide-up"><div class="card-header"><h3>All Users</h3></div>
        <div class="card-body" id="users-table"><div class="spinner"></div></div></div>`;
    const r = await API.get('/users');
    const container = $('users-table');
    if (!r.success) { container.innerHTML = '<p style="padding:24px">Failed to load.</p>'; return; }
    const items = r.data?.data || [];
    if (!items.length) { container.innerHTML = `<div class="empty-state">${Icons.empty}<p>No users found</p></div>`; return; }
    const showCompany = Auth.is('super_admin');
    container.innerHTML = `<table class="data-table"><thead><tr>
      <th>Name</th><th>Email</th><th>Role</th>${showCompany ? '<th>Company</th>' : ''}<th>Joined</th>
      </tr></thead><tbody>${items.map(u => `<tr>
        <td style="color:var(--text-primary);font-weight:500">${u.name}</td><td>${u.email}</td><td>${roleBadge(u.role)}</td>
        ${showCompany ? `<td>${u.company?.name || '—'}</td>` : ''}
        <td>${timeAgo(u.created_at)}</td></tr>`).join('')}</tbody></table>`;
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
window.copyToken = copyToken;
window.Pages = Pages;
