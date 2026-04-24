(function () {
  const noticeFeed = document.getElementById('noticeFeed');
  const fullLogViewer = document.getElementById('fullLogViewer');

  function formatDate(dateValue) {
    const stamp = new Date(dateValue || '');
    if (Number.isNaN(stamp.getTime())) return 'Recent';
    return stamp.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getPublicNotices() {
    const notices = Array.isArray(window.PlayrSiteNotices) ? window.PlayrSiteNotices : [];
    return notices
      .filter((notice) => notice && String(notice.audience || 'public') === 'public')
      .sort((left, right) => new Date(right.publishedAt || 0).getTime() - new Date(left.publishedAt || 0).getTime());
  }

  function renderNotices() {
    if (!noticeFeed) return;

    const notices = getPublicNotices();
    noticeFeed.innerHTML = '';

    if (!notices.length) {
      const empty = document.createElement('article');
      empty.className = 'info-card panel-card notice-page-card';
      const title = document.createElement('h2');
      title.textContent = 'No public notices right now';
      const body = document.createElement('p');
      body.textContent = 'New feature rollouts, maintenance updates, and public site warnings will appear here.';
      empty.append(title, body);
      noticeFeed.appendChild(empty);
      return;
    }

    notices.forEach((notice) => {
      const article = document.createElement('article');
      article.className = 'info-card panel-card notice-page-card';
      article.id = String(notice.id || '');

      const meta = document.createElement('div');
      meta.className = 'notification-meta';
      const tag = document.createElement('span');
      tag.className = 'notification-tag';
      tag.textContent = String(notice.category || 'Notice');
      const date = document.createElement('span');
      date.className = 'notification-date';
      date.textContent = formatDate(notice.publishedAt);
      meta.append(tag, date);

      const title = document.createElement('h2');
      title.textContent = String(notice.title || 'Site notice');

      const summary = document.createElement('p');
      summary.textContent = String(notice.summary || '');

      const list = document.createElement('ul');
      list.className = 'notice-detail-list';
      const detailItems = Array.isArray(notice.details) ? notice.details : [];
      detailItems.forEach((detail) => {
        const item = document.createElement('li');
        item.textContent = String(detail || '');
        list.appendChild(item);
      });

      article.append(meta, title, summary);
      if (detailItems.length) {
        article.appendChild(list);
      }
      noticeFeed.appendChild(article);
    });
  }

  async function renderFullLog() {
    if (!fullLogViewer) return;
    try {
      const response = await fetch('/updates/logs.md', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      fullLogViewer.textContent = text;
    } catch {
      fullLogViewer.textContent = 'Full update logs could not be loaded in this view. You can still open /updates/logs.md directly for the full changelog file.';
    }
  }

  renderNotices();
  void renderFullLog();
})();
