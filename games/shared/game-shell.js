(function () {
  const root = document.getElementById('gameRoot');
  if (!root) return;

  const status = document.getElementById('gameStatus');
  if (!status) return;

  const text = String(status.textContent || '').trim().toLowerCase();
  const isScaffoldBanner = text.includes('scaffold ready')
    || text.includes('global leaderboard enabled')
    || text.includes('loading scaffold')
    || /^loading\b/.test(text);

  // Keep game-defined runtime status messaging, but remove static scaffold overlays.
  if (isScaffoldBanner) {
    status.textContent = '';
  }
})();
