/* ═══════════════════════════════════════════════════════════════════
   No build step, no dependencies. Everything below reads its data
   out of index.html, so index.html stays the single source of truth.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const PLACEHOLDER = /your-link|555-?123-?4567|\(555\)/i;

  /* ── Current year in the footer ──────────────────────────────── */
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Scheduling embed ────────────────────────────────────────
     Real link  → inline iframe, no third-party script needed.
     Placeholder → a button, so the page never looks broken.       */
  const embed = $('.schedule__embed');
  if (embed) {
    const src = embed.dataset.embedSrc || '';
    if (src && !PLACEHOLDER.test(src)) {
      const url = new URL(src);
      if (url.hostname.endsWith('calendly.com')) {
        url.searchParams.set('embed_domain', location.hostname || 'localhost');
        url.searchParams.set('embed_type', 'Inline');
        url.searchParams.set('hide_gdpr_banner', '1');
      }
      const frame = document.createElement('iframe');
      frame.src = url.toString();
      frame.title = 'Scheduling calendar';
      frame.loading = 'lazy';
      embed.replaceChildren(frame);
    } else {
      embed.innerHTML =
        '<div class="schedule__fallback">' +
          '<p>Add your Calendly or Microsoft Bookings link in <code>index.html</code> ' +
          'to embed the calendar right here.</p>' +
          '<a class="btn btn--primary" href="mailto:' + (readEmail() || '') + '">Email me instead</a>' +
        '</div>';
    }
  }

  /* ── Read contact facts back out of the markup ───────────────── */
  function readEmail() {
    const el = $('[data-vc-email]');
    return el ? el.dataset.vcEmail.trim() : '';
  }
  function readPhone() {
    const el = $('[data-vc-phone]');
    return el ? el.dataset.vcPhone.trim() : '';
  }
  function profile() {
    const full  = ($('h1')?.textContent || '').replace(/[\s\u00a0]+/g, ' ').trim();
    return {
      full,
      title: ($('.role')?.textContent || '').trim(),
      org:   ($('.eyebrow')?.textContent || '').trim(),
      email: readEmail(),
      phone: readPhone(),
      url:   canonical()
    };
  }
  function canonical() {
    return $('link[rel="canonical"]')?.href || location.href.replace(/#.*$/, '');
  }

  /* ── Share / QR ──────────────────────────────────────────────── */
  const dlg = $('[data-qr-dialog]');

  const loadQrLib = () => new Promise((ok, no) => {
    if (window.qrcode) return ok(window.qrcode);
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
    s.onload  = () => (window.qrcode ? ok(window.qrcode) : no(new Error('no global')));
    s.onerror = () => no(new Error('offline'));
    document.head.appendChild(s);
  });

  $('[data-share]')?.addEventListener('click', async () => {
    const url = canonical();
    const p   = profile();

    // Phones get the real share sheet; everything else gets the QR.
    if (navigator.share && matchMedia('(max-width: 700px)').matches) {
      try {
        await navigator.share({ title: p.full, text: `${p.title} · ${p.org}`, url });
        return;
      } catch { /* cancelled — fall through to the dialog */ }
    }
    if (!dlg) return;

    $('[data-qr-name]').textContent = p.full;
    $('[data-qr-phone]').textContent = p.phone;
    $('[data-qr-email]').textContent = p.email;
    const target = $('[data-qr-target]');
    target.textContent = 'Loading…';
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    lockScroll();

    // Copy her contact card to the clipboard the moment the dialog opens —
    // no extra click needed, so a scanned QR isn't the only way to grab it.
    copyToClipboard([p.full, p.phone, p.email].filter(Boolean).join('\n'))
      .then((ok) => { if (ok) flashEyebrow('Contact copied to clipboard ✓'); })
      .catch(() => {});

    try {
      const qrcode = await loadQrLib();
      const qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      target.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 1, scalable: true });
    } catch {
      target.textContent = 'Use "Copy link" below instead.';
    }
  });

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  let eyebrowTimer = null;
  function flashEyebrow(message) {
    const el = $('[data-qr-eyebrow]');
    if (!el) return;
    if (!el.dataset.original) el.dataset.original = el.textContent;
    clearTimeout(eyebrowTimer);
    el.textContent = message;
    eyebrowTimer = setTimeout(() => { el.textContent = el.dataset.original; }, 2200);
  }

  // Freeze the page underneath while the dialog is open — a native <dialog>
  // stops pointer interaction with the rest of the page, but not scrolling,
  // and iOS Safari in particular will still let the background rubber-band.
  let savedScrollY = 0;
  function lockScroll() {
    savedScrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.paddingRight = '';
    window.scrollTo(0, savedScrollY);
  }
  // Covers every way the dialog can close (buttons, backdrop, Esc key).
  dlg?.addEventListener('close', unlockScroll);

  const closeDialog = () => {
    if (!dlg) return;
    if (typeof dlg.close === 'function') dlg.close(); else { dlg.removeAttribute('open'); unlockScroll(); }
  };
  dlg?.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-qr-close]')) closeDialog();
  });

  $('[data-copy-link]')?.addEventListener('click', async (e) => {
    const label = e.currentTarget.querySelector('[data-copy-label]');
    const ok = await copyToClipboard(canonical());
    if (!ok || !label) return;
    const was = label.textContent;
    label.textContent = 'Copied ✓';
    setTimeout(() => { label.textContent = was; }, 1800);
  });
})();
