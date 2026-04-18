/* ═══════════════════════════════════════
   FIXLY Hub — endpoints/iqc.js
   IQC Generator
   Endpoint: GET /faa/iqc?text=
═══════════════════════════════════════ */

window.FIXLY_IQC = (function () {

  function init(root) {

    root.innerHTML = `
      <div class="sec-header">
        <div class="sec-icon amber">🔳</div>
        <div class="sec-meta">
          <div class="sec-title">IQC Generator</div>
          <div class="sec-sub">Generate QR Code dari teks atau URL apapun</div>
        </div>
      </div>

      <div class="tool-card">

        <div class="ep-badge">
          <span class="ep-method">GET</span>api-faa.my.id/faa/iqc
        </div>

        <label class="input-label">Teks / URL</label>
        <textarea
          class="input-field"
          id="iqc-input"
          placeholder="Masukkan teks, URL, atau konten apapun..."
          rows="3"
        ></textarea>

        <button class="btn btn-primary" id="iqc-submit">
          <div class="spinner" id="iqc-spin" style="display:none"></div>
          <span id="iqc-lbl">🔳 Generate</span>
        </button>

        <div id="iqc-result"></div>
      </div>
    `;

    const input  = document.getElementById('iqc-input');
    const submit = document.getElementById('iqc-submit');
    const spin   = document.getElementById('iqc-spin');
    const lbl    = document.getElementById('iqc-lbl');
    const result = document.getElementById('iqc-result');

    // Ctrl+Enter / Cmd+Enter to submit
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) run();
    });
    submit.addEventListener('click', run);

    async function run() {
      const text = input.value.trim();
      if (!text) { U.toast('⚠ Masukkan teks dulu!', 'warn'); return; }

      U.setLoading(submit, spin, lbl, true, '🔳 Generate');
      result.innerHTML = '<div class="upload-status">🔳 Generating...</div>';

      try {
        const data = await U.callAPI('iqc', { text });
        result.innerHTML = renderResult(data, text);
      } catch (e) {
        result.innerHTML = U.errorBox(e.message);
      } finally {
        U.setLoading(submit, spin, lbl, false, '🔳 Generate');
      }
    }
  }

  function renderResult(data, inputText) {
    const imgUrl = U.findImgUrl(data);
    let body = '';

    if (imgUrl) {
      body = `
        <div class="iqc-wrap">
          <img src="${imgUrl}" alt="IQC Code" class="iqc-img" onerror="this.style.opacity='.3'">
          <div style="text-align:center;font-size:.78rem;color:var(--text-muted);max-width:220px;">${inputText}</div>
          <div class="btn-row">
            <a href="${imgUrl}" target="_blank" download class="btn btn-success btn-sm">⬇ Download</a>
            <button class="btn btn-ghost btn-sm" onclick="U.copy('${imgUrl}')">Salin URL</button>
          </div>
        </div>`;
    } else {
      body = U.renderRaw(data);
    }

    return U.resultBox(true, body);
  }

  return { init };

})();
