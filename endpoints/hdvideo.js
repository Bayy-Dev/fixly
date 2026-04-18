/* ═══════════════════════════════════════
   FIXLY Hub — endpoints/hdvideo.js
   HD Video Enhancer
   Endpoint: GET /faa/hdvid?url=
═══════════════════════════════════════ */

window.FIXLY_HDVIDEO = (function () {

  let selectedFile = null;
  let inputMode    = 'file'; // 'file' | 'url'

  function init(root) {

    root.innerHTML = `
      <div class="sec-header">
        <div class="sec-icon green">🎬</div>
        <div class="sec-meta">
          <div class="sec-title">HD Video Enhancer</div>
          <div class="sec-sub">Tingkatkan kualitas video secara otomatis</div>
        </div>
      </div>

      <div class="tool-card">

        <div class="ep-badge">
          <span class="ep-method">GET</span>api-faa.my.id/faa/hdvid
        </div>

        <!-- Input toggle -->
        <div class="input-toggle">
          <button class="toggle-btn active" id="hdvid-toggle-file">📁 Pilih Video</button>
          <button class="toggle-btn" id="hdvid-toggle-url">🔗 URL Video</button>
        </div>

        <!-- File picker area -->
        <div id="hdvid-file-area">
          <div class="file-preview" id="hdvid-preview"></div>
          <div class="file-drop" id="hdvid-drop">
            <input type="file" id="hdvid-file-input" accept="video/*" />
            <span class="file-drop-icon">🎬</span>
            <div class="file-drop-lbl">Tap untuk pilih video</div>
            <div class="file-drop-hint">MP4 · MOV · AVI — maks. 50 MB</div>
          </div>
          <button class="btn btn-ghost btn-sm" id="hdvid-change-btn" style="display:none;margin-top:8px;">
            🔄 Ganti Video
          </button>
        </div>

        <!-- URL input area -->
        <div id="hdvid-url-area" style="display:none">
          <label class="input-label">URL Video</label>
          <input
            class="input-field"
            id="hdvid-url-input"
            type="url"
            inputmode="url"
            placeholder="https://example.com/video.mp4"
            autocomplete="off"
          />
        </div>

        <button class="btn btn-primary" id="hdvid-submit">
          <div class="spinner" id="hdvid-spin" style="display:none"></div>
          <span id="hdvid-lbl">🎬 Enhance Video</span>
        </button>

        <div id="hdvid-result"></div>
      </div>
    `;

    /* ── Cache DOM refs ── */
    const tglFile   = document.getElementById('hdvid-toggle-file');
    const tglUrl    = document.getElementById('hdvid-toggle-url');
    const fileArea  = document.getElementById('hdvid-file-area');
    const urlArea   = document.getElementById('hdvid-url-area');
    const drop      = document.getElementById('hdvid-drop');
    const fileInput = document.getElementById('hdvid-file-input');
    const preview   = document.getElementById('hdvid-preview');
    const changeBtn = document.getElementById('hdvid-change-btn');
    const urlInput  = document.getElementById('hdvid-url-input');
    const submit    = document.getElementById('hdvid-submit');
    const spin      = document.getElementById('hdvid-spin');
    const lbl       = document.getElementById('hdvid-lbl');
    const result    = document.getElementById('hdvid-result');

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
      if (!file.type.startsWith('video/')) {
        U.toast('⚠ Pilih file video!', 'warn');
        return;
      }
      selectedFile = file;
      U.showPreview(preview, drop, file, 'video');
      changeBtn.style.display = 'flex';
    }

    fileInput.addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) onFile(f);
    });

    U.setupFileDrop(drop, null, preview, 'video/*', onFile);

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
      let videoUrl = '';

      if (inputMode === 'url') {
        videoUrl = urlInput.value.trim();
        if (!videoUrl) { U.toast('⚠ Masukkan URL video!', 'warn'); return; }
      } else {
        if (!selectedFile) { U.toast('⚠ Pilih video dulu!', 'warn'); return; }
        U.setLoading(submit, spin, lbl, true, '🎬 Enhance Video');
        result.innerHTML = '<div class="upload-status">☁ Mengupload video...</div>';
        try {
          videoUrl = await U.uploadFile(selectedFile);
        } catch (e) {
          result.innerHTML = U.errorBox('Gagal upload: ' + e.message);
          U.setLoading(submit, spin, lbl, false, '🎬 Enhance Video');
          return;
        }
      }

      U.setLoading(submit, spin, lbl, true, '🎬 Enhance Video');
      result.innerHTML = '<div class="upload-status">🎬 Memproses video...</div>';

      try {
        const data = await U.callAPI('hdvid', { url: videoUrl });
        result.innerHTML = renderResult(data);
      } catch (e) {
        result.innerHTML = U.errorBox(e.message);
      } finally {
        U.setLoading(submit, spin, lbl, false, '🎬 Enhance Video');
      }
    }
  }

  function renderResult(data) {
    const vidUrl = U.findVidUrl(data);
    let body = '';

    if (vidUrl) {
      body = `
        <div class="img-result">
          <video controls style="width:100%;max-height:280px;border-radius:10px;border:1px solid var(--border);background:#000;display:block;margin-bottom:10px;">
            <source src="${vidUrl}">
            Browser kamu tidak support video.
          </video>
          <div class="btn-row">
            <a href="${vidUrl}" target="_blank" download class="btn btn-success btn-sm">⬇ Download</a>
            <button class="btn btn-ghost btn-sm" onclick="U.copy('${vidUrl}')">Salin URL</button>
          </div>
        </div>`;
    } else {
      body = U.renderRaw(data);
    }

    return U.resultBox(true, body);
  }

  return { init };

})();
