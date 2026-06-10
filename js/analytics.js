(function () {
  const analytics = window.TramattoAnalytics || {};
  window.dataLayer = window.dataLayer || [];

  function track(eventName, payload = {}) {
    window.dataLayer.push({ event: eventName, ...payload });
  }

  document.addEventListener('DOMContentLoaded', () => {
    track('page_view', {
      page_title: document.title,
      page_path: window.location.pathname
    });
  });

  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button');
    if (!target) return;

    const label = target.textContent?.trim() || target.getAttribute('aria-label') || 'cta';
    track('click', { label });
  });

  window.TramattoAnalytics = {
    track
  };
})();
