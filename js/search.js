/**
 * Google Search Integration Form Controller
 */
export function initSearch() {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');

  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    // Check if input is a direct URL
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (urlPattern.test(query)) {
      const dest = query.startsWith('http') ? query : `https://${query}`;
      window.location.href = dest;
    } else {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.location.href = searchUrl;
    }
  });

  // Hotkey focus: press '/' to immediately focus search query
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== input && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });
}