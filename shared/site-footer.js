(function () {
  function ensureFooterStyles() {
    if (document.getElementById('playr-site-footer-style')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'playr-site-footer-style';
    style.textContent = [
      '.site-footer{width:min(calc(100% - 32px),1200px);margin:28px auto 36px;padding:18px 22px;background:rgba(8,13,25,.72);border:1px solid rgba(255,255,255,.09);border-radius:24px;box-shadow:0 24px 80px rgba(0,0,0,.35);backdrop-filter:blur(18px);}',
      '.site-footer-inner{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;}',
      '.site-footer-title{margin:0 0 6px;color:#ecf2ff;font-size:.86rem;letter-spacing:.16em;text-transform:uppercase;}',
      '.site-footer-copy{margin:0;max-width:620px;line-height:1.7;color:#a6b1cf;}',
      '.site-footer-links{display:flex;gap:14px;flex-wrap:wrap;}',
      '.site-footer-links a{color:#dfeaff;text-decoration:none;font-weight:600;}',
      '.site-footer-links a:hover,.site-footer-links a:focus-visible{color:#7cf0c5;}',
    ].join('');
    document.head.appendChild(style);
  }

  function injectSiteFooter() {
    if (!document.body || document.querySelector('[data-site-footer]')) {
      return;
    }

    ensureFooterStyles();

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.setAttribute('data-site-footer', 'true');
    footer.innerHTML = [
      '<div class="site-footer-inner">',
      '  <div>',
      '    <p class="site-footer-title">PlayR</p>',
      '    <p class="site-footer-copy">Quick browser games, clean competition, and clear site policies.</p>',
      '  </div>',
      '  <nav class="site-footer-links" aria-label="Site information">',
      '    <a href="/about.html">About</a>',
      '    <a href="/contact.html">Contact</a>',
      '    <a href="/privacy.html">Privacy Policy</a>',
      '  </nav>',
      '</div>',
    ].join('');
    document.body.appendChild(footer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSiteFooter, { once: true });
  } else {
    injectSiteFooter();
  }
})();
