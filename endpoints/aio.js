/* ═══════════════════════════════════════
   FIXLY Hub — endpoints/aio.js
   All-in-One Downloader
   Endpoint: GET /faa/aio?url=
═══════════════════════════════════════ */

window.FIXLY_AIO = (function () {

  function init(root) {

    root.innerHTML = `
      <div class="sec-header">
        <div class="sec-icon violet">⬇️</div>
        <div class="sec-meta">
          <div class="sec-title">All-in-One Downloader</div>
          <div class="sec-sub">TikTok · Instagram · YouTube · Twitter · &amp; lainnya</div>
        </div>
      </div>

      <div class="tool-card">
        <div class="ep-badge"><span class="ep-method">GET</span>api-faa.my.id/faa/aio</div>

        <label class="input-label">URL Media Sosial</label>
        <input
          class="input-field"
          id="aio-input"
          type="url"
          inputmode="url"
          placeholder="Paste link TikTok, IG, YouTube..."
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
        />

        <button class="btn btn-primary" id="aio-submit">
          <div class="spinner" id="aio-spin" style="display:none"></div>
          <span id="aio-lbl">⬇ Download</span>
        </button>

        <div id="aio-result"></div>
      </div>
    `;

    const input  = document.getElementById('aio-input');
    const submit = document.getElementById('aio-submit');
    const spin   = document.getElementById('aio-spin');
    const lbl    = document.getElementById('aio-lbl');
    const result = document.getElementById('aio-result');

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
    submit.addEventListener('click', run);

    async function run() {
      const url = input.value.trim();
      if (!url) { U.toast('⚠ Paste URL dulu!', 'warn'); return; }

      U.setLoading(submit, spin, lbl, true, '⬇ Download');
      result.innerHTML = '';

      try {
        const data = await U.callAPI('aio', { url });
        result.innerHTML = renderResult(data);
      } catch (e) {
        result.innerHTML = U.errorBox(e.message);
      } finally {
        U.setLoading(submit, spin, lbl, false, '⬇ Download');
      }
    }
  }

  function renderResult(data) {
    const title  = data?.result?.title  || data?.title  || data?.data?.title  || '';
    const thumb  = data?.result?.thumbnail || data?.thumbnail || data?.data?.thumbnail || '';
    const author = data?.result?.author || data?.author || '';
    const medias = (
      data?.result?.medias || data?.medias || data?.data?.medias ||
      data?.result?.links  || data?.links  || data?.data?.links  || []
    );

    let body = '';

    // Thumbnail + info
    if (thumb || title) {
      body += '<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">';
      if (thumb) {
        body += '<img src="' + thumb + '" alt="thumb" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--border);flex-shrink:0;">';
      }
      body += '<div>';
      if (title)  body += '<div style="font-size:.82rem;font-weight:600;color:var(--text);margin-bottom:3px;">' + title  + '</div>';
      if (author) body += '<div style="font-size:.72rem;color:var(--text-muted);">by ' + author + '</div>';
      body += '</div></div>';
    }

    // Download links
    if (Array.isArray(medias) && medias.length > 0) {
      body += '<div class="dl-links">';
      medias.forEach((m, i) => {
        const u = m?.url || m?.link || m?.download_url || (typeof m === 'string' ? m : '');
        const q = m?.quality || m?.label || m?.type || ('File ' + (i + 1));
        if (u) body += '<a href="' + u + '" target="_blank" rel="noopener" class="dl-link">⬇ ' + q + '</a>';
      });
      body += '</div>';
    } else {
      // Fallback: raw JSON
      body += U.renderRaw(data);
    }

    return U.resultBox(true, body);
  }

  return { init };

})();
