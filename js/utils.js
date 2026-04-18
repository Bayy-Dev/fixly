/* ═══════════════════════════════════════
   FIXLY Hub — js/utils.js
   Shared utilities (global window.U)
═══════════════════════════════════════ */

window.U = (function () {

  const BASE = 'https://api-faa.my.id/faa';

  /* ── Toast ── */
  function toast(msg, type = 'ok') {
    const c = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = 'toast';
    if (type === 'warn') el.style.borderColor = 'rgba(245,158,11,.4)';
    if (type === 'err')  el.style.borderColor = 'rgba(248,113,113,.4)';
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  /* ── Loading state ── */
  function setLoading(btnEl, spinEl, txtEl, on, label) {
    btnEl.disabled = on;
    spinEl.style.display = on ? 'block' : 'none';
    if (txtEl) txtEl.textContent = on ? 'Memproses...' : label;
  }

  /* ── API call ── */
  async function callAPI(endpoint, params) {
    const url = new URL(BASE + '/' + endpoint);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const r = await fetch(url.toString());
    if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + r.statusText);
    return r.json();
  }

  /* ── Upload file to Catbox for public URL ── */
  async function uploadFile(file) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', file);
    try {
      const r = await fetch('https://catbox.moe/user.php', { method: 'POST', body: form });
      const text = await r.text();
      if (text && text.startsWith('http')) return text.trim();
    } catch (_) { /* fall through */ }
    // Fallback: base64 data URL
    return fileToDataURL(file);
  }

  /* ── File → Data URL ── */
  function fileToDataURL(file) {
    return new Promise((res) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  /* ── Bytes formatter ── */
  function fmtBytes(b) {
    if (b < 1024)   return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  /* ── Find first image URL in API response ── */
  function findImgUrl(data) {
    const c = [
      data?.result?.image, data?.result?.url, data?.result?.img,
      data?.result?.result, data?.result?.output,
      data?.image, data?.url, data?.img, data?.output,
      data?.data?.image, data?.data?.url, data?.data?.img, data?.data?.output,
    ];
    return c.find(v => typeof v === 'string' && v.startsWith('http')) || null;
  }

  /* ── Find first video URL in API response ── */
  function findVidUrl(data) {
    const c = [
      data?.result?.video, data?.result?.url, data?.result?.link, data?.result?.output,
      data?.video, data?.url, data?.link, data?.output,
      data?.data?.video, data?.data?.url, data?.data?.link, data?.data?.output,
    ];
    return c.find(v => typeof v === 'string' && v.startsWith('http')) || null;
  }

  /* ── Render raw JSON ── */
  function renderRaw(data) {
    return '<pre class="json-raw">' + JSON.stringify(data, null, 2) + '</pre>';
  }

  /* ── Result wrapper ── */
  function resultBox(ok, body) {
    const cls = ok ? 'r-ok' : 'r-err';
    const lbl = ok ? 'Berhasil' : 'Gagal';
    return `<div class="result-box">
      <div class="result-head">
        <div class="r-status ${cls}"><div class="r-dot"></div>${lbl}</div>
      </div>
      <div class="result-body">${body}</div>
    </div>`;
  }

  /* ── Error box ── */
  function errorBox(msg) {
    return '<div class="error-box">❌ ' + msg + '</div>';
  }

  /* ── Copy text ── */
  function copy(txt) {
    navigator.clipboard.writeText(txt).then(() => toast('✓ Disalin!'));
  }

  /* ── Setup file drop area ── */
  function setupFileDrop(dropEl, inputEl, previewEl, accept, onFile) {
    dropEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropEl.classList.add('dragover');
    });
    dropEl.addEventListener('dragleave', () => dropEl.classList.remove('dragover'));
    dropEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dropEl.classList.remove('dragover');
      const file = e.dataTransfer?.files[0];
      if (file) onFile(file);
    });
    if (inputEl) {
      inputEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) onFile(file);
      });
    }
  }

  /* ── Show file preview ── */
  function showPreview(previewEl, dropEl, file, type) {
    const objUrl = URL.createObjectURL(file);
    const tag = type === 'video' ? 'video' : 'img';
    const extra = type === 'video' ? 'controls' : '';
    previewEl.style.display = 'block';
    previewEl.innerHTML =
      '<' + tag + ' src="' + objUrl + '" ' + extra + ' style="width:100%;max-height:220px;object-fit:contain;border-radius:10px;border:1px solid var(--border);background:#000"></' + tag + '>' +
      '<div class="file-meta"><span class="file-name">' + file.name + '</span>' +
      '<span class="file-size">' + fmtBytes(file.size) + '</span></div>';
    if (dropEl) dropEl.style.display = 'none';
  }

  return {
    toast, setLoading, callAPI, uploadFile, fileToDataURL,
    fmtBytes, findImgUrl, findVidUrl, renderRaw, resultBox, errorBox, copy,
    setupFileDrop, showPreview,
  };

})();
