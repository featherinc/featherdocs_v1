/* Version-switcher dropdown for the Feather SDK docs.
 *
 * Reads window.__FEATHER_DOCS (set by feather_docs_meta.js, which is
 * generated at build time from conf.py) and populates the <select> placed
 * into Furo's announcement bar. See conf.py:html_theme_options.announcement
 * for where the placeholder element lives.
 *
 * versions.json lives at the site root and is fetched same-origin so custom
 * domains (docs.feather.dev) work. Fetching the github.io URL 301s onto the
 * custom domain without CORS headers and the browser blocks it.
 */
(function () {
  function docsRoot(meta) {
    var origin = window.location.origin;
    try {
      if (meta.baseUrl) {
        var baked = new URL(meta.baseUrl);
        if (baked.origin === origin) {
          return baked.href.replace(/\/$/, '');
        }
      }
    } catch (e) {}
    return origin;
  }

  function populate(select, root, meta, versions) {
    select.innerHTML = '';

    var latestOpt = document.createElement('option');
    latestOpt.value = root + '/';
    latestOpt.textContent = 'latest';
    select.appendChild(latestOpt);

    versions.forEach(function (v) {
      var opt = document.createElement('option');
      opt.value = root + '/' + v.version + '/';
      opt.textContent = v.version + (v.version === meta.currentVersion ? ' (current)' : '');
      if (v.version === meta.currentVersion) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', function () {
      if (select.value) window.location.href = select.value;
    });
  }

  function init() {
    var meta = window.__FEATHER_DOCS || {};
    var select = document.getElementById('doc-version-select');
    if (!select) return;

    var root = docsRoot(meta);
    fetch(root + '/versions.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        populate(select, root, meta, (data && data.versions) || []);
      })
      .catch(function (err) {
        select.innerHTML = '<option>versions unavailable</option>';
        if (window.console) console.warn('Feather docs: failed to load versions.json:', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
