/* ═══════════════════════════════════════
   FIXLY Hub — endpoints/hdfoto.js
   HD Photo Enhancer (4 modes)
   Endpoints:
     GET /faa/superhd?url=
     GET /faa/hdv2?url=
     GET /faa/hdv3?url=
     GET /faa/hdv4?url=
═══════════════════════════════════════ */

window.FIXLY_HDFOTO = (function () {

  const MODES = [
    { key: 'superhd', label: '⚡ Super HD' },
    { key: 'hdv2',    label: 'HD v2' },
    { key: 'hdv3',    label: 'HD v3' },
    { key: 'hdv4',    label: 'HD v4' },
  ];

  let activeMode   = 'superhd';
  let selectedFile = null;
  let inputMode    = 'file'; // 'file' | 'url'

  function init(root) {

    root.innerHTML = `
      <div class="sec-header">
        <div class="sec-icon blue">🖼️</div>
        <div class="sec-meta">
          <div class="sec-title">HD Photo Enhancer</div>
          <div class="sec-sub">Tingkatkan kualitas foto — 4 mode tersedia</div>
        </div>
      </div>

      <div class="tool-card">

        <!-- Mode tabs -->
        <div class="hd-tabs" id="hdfoto-tabs">
          ${MODES.map((m, i) =>
            `<button class="hd-tab${i === 0 ? ' active' : ''}" data-mode="${m.key}">${m.label}</button>`
          ).join('')}
        </div>

        <!-- Endpoint badge -->
        <div class="ep-badge" id="hdfoto-ep">
          <span class="ep-method">GET</span>api-faa.my.id/faa/superhd
        </div>

        <!-- Input toggle -->
        <div class="input-toggle">
          <button class="toggle-btn active" id="hdfoto-toggle-file">📁 Pilih Foto</button>
          <button class="toggle-btn" id="hdfoto-toggle-url">🔗 URL Gambar</button>
        </div>

        <!-- File picker area -->
        <div id="hdfoto-file-area">
          <div class="file-preview" id="hdfoto-preview"></div>
          <div class="file-drop" id="hdfoto-drop">
            <input type="file" id="hdfoto-file-input" accept="image/*" capture="environment" />
            <span class="file-drop-icon">🖼️</span>
            <div class="file-drop-lbl">Tap untuk pilih foto</div>
            <div class="file-drop-hint">JPG · PNG · WEBP — maks. 10 MB</div>
          </div>
          <button class="btn btn-ghost btn-sm" id="hdfoto-change-btn" style="display:none;margin-top:8px;">
            🔄 Ganti Foto
          </button>
        </div>

        <!-- URL input area -->
        <div id="hdfoto-url-area" style="display:none">
          <label class="input-label">URL Gambar</label>
          <input
            class="input-field"
            id="hdfoto-url-input"
            type="url"
            inputmode="url"
            placeholder="https://example.com/foto.jpg"
            autocomplete="off"
          />
        </div>

        <button class="btn btn-primary" id="hdfoto-submit">
          <div class="spinner" id="hdfoto-spin" style="display:none"></div>
          <span id="hdfoto-lbl">✨ Enhance Foto</span>
        </button>

        <div id="hdfoto-result"></div>
      </div>
    `;

    /* ── Cache DOM refs ── */
    const tabs       = document.getElementById('hdfoto-tabs');
    const epBadge    = document.getElementById('hdfoto-ep');
    const tglFile    = document.getElementById('hdfoto-toggle-file');
    const tglUrl     = document.getElementById('hdfoto-toggle-url');
    const fileArea   = document.getElementById('hdfoto-file-area');
    const urlArea    = document.getElementById('hdfoto-url-area');
    const drop       = document.getElementById('hdfoto-drop');
    const fileInput  = document.getElementById('hdfoto-file-input');
    const preview    = document.getElementById('hdfoto-preview');
    const changeBtn  = document.getElementById('hdfoto-change-btn');
    const urlInput   = document.getElementById('hdfoto-url-input');
    const submit     = document.getElementById('hdfoto-submit');
    const spin       = document.getElementById('hdfoto-spin');
    const lbl        = document.getElementById('hdfoto-lbl');
    const result     = document.getElementById('hdfoto-result');

    /* ── Tab switching ── */
    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.hd-tab');
      if (!btn) return;
      activeMode = btn.dataset.mode;
      tabs.querySelectorAll('.hd-tab').forEach((t) =>
        t.classList.toggle('active', t.dataset.mode === activeMode)
      );
      epBadge.innerHTML = '<span class="ep-method">GET</span>api-faa.my.id/faa/' + activeMode;
    });

    /* ── Input mode toggle ── */
    function setInputMode(mode) {
      inputMode = mode;
      tglFile.classList.toggle('active', mode === 'file');
      tglUrl.classList.toggle('active',  mode === 'url');
      fileArea.style.display = mode === 'file' ? 'block' : 'none';
      urlArea.style.display  = mode === 'url'  ? 'block' : 'none';
    }
    tglFile.addEventListener('click', () => setInputMode('file'));
    tglUrl.addEventListener('click',  () => setInputMode('url'));

    /* ── File pick ── */
    function onFile(file) {
      if (!file.type.startsWith('image/')) {
        U.toast('⚠ Pilih file gambar (JPG/PNG/WEBP)', 'warn');
        return;
      }
      selectedFile = file;
      U.showPreview(preview, drop, file, 'image');
      changeBtn.style.display = 'flex';
    }

    fileInput.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) onFile(f);
    });

    U.setupFileDrop(drop, null, preview, 'image/*', onFile);

    changeBtn.addEventListener('click', () => {
      selectedFile = null;
      preview.style.display = 'none';
      drop.style.display = 'block';
      changeBtn.style.display = 'none';
      fileInput.value = '';
    });

    /* ── Submit ── */
    urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
    submit.addEventListener('click', run);

    async function run() {
      result.innerHTML = '';
      let imageUrl = '';

      if (inputMode === 'url') {
        imageUrl = urlInput.value.trim();
        if (!imageUrl) { U.toast('⚠ Masukkan URL gambar!', 'warn'); return; }
      } else {
        if (!selectedFile) { U.toast('⚠ Pilih foto dulu!', 'warn'); return; }
        U.setLoading(submit, spin, lbl, true, '✨ Enhance Foto');
        result.innerHTML = '<div class="upload-status">☁ Mengupload foto...</div>';
        try {
          imageUrl = await U.uploadFile(selectedFile);
        } catch (e) {
          result.innerHTML = U.errorBox('Gagal upload: ' + e.message);
          U.setLoading(submit, spin, lbl, false, '✨ Enhance Foto');
          return;
        }
      }

      U.setLoading(submit, spin, lbl, true, '✨ Enhance Foto');
      result.innerHTML = '<div class="upload-status">✨ Memproses gambar...</div>';

      try {
        const data = await U.callAPI(activeMode, { url: imageUrl });
        result.innerHTML = renderResult(data);
      } catch (e) {
        result.innerHTML = U.errorBox(e.message);
      } finally {
        U.setLoading(submit, spin, lbl, false, '✨ Enhance Foto');
      }
    }
  }

  function renderResult(data) {
    const imgUrl = U.findImgUrl(data);
    let body = '';

    if (imgUrl) {
      body = `
        <div class="img-result">
          <img src="${imgUrl}" alt="HD Result" onerror="this.style.opacity='.3'">
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
