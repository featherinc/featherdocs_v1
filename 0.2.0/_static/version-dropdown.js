/* Version-switcher dropdown for the Feather SDK docs.
 *
 * Reads window.__FEATHER_DOCS (set by feather_docs_meta.js, which is
 * generated at build time from conf.py) and populates the <select> placed
 * into Furo's announcement bar. See conf.py:html_theme_options.announcement
 * for where the placeholder element lives.
 *
 * The dropdown fetches the *latest* versions.json from the docs base URL
 * on every page load, so old version snapshots automatically pick up new
 * releases without a rebuild.
 */
(function () {
  function init() {
    var meta = window.__FEATHER_DOCS || {};
    var select = document.getElementById('doc-version-select');
    if (!select || !meta.versionsUrl) return;

    fetch(meta.versionsUrl, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        var versions = (data && data.versions) || [];
        select.innerHTML = '';

        var latestOpt = document.createElement('option');
        latestOpt.value = meta.baseUrl + '/';
        latestOpt.textContent = 'latest';
        select.appendChild(latestOpt);

        versions.forEach(function (v) {
          var opt = document.createElement('option');
          opt.value = meta.baseUrl + '/' + v.version + '/';
          opt.textContent = v.version + (v.version === meta.currentVersion ? ' (current)' : '');
          if (v.version === meta.currentVersion) opt.selected = true;
          select.appendChild(opt);
        });

        select.addEventListener('change', function () {
          if (select.value) window.location.href = select.value;
        });
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
