/* ═══════════════════════════════════════
   FIXLY Hub — js/main.js
   Navigation & section switching
═══════════════════════════════════════ */

(function () {

  const SECTIONS = ['aio', 'hdfoto', 'hdvideo', 'iqc'];

  function switchSection(id) {
    if (!SECTIONS.includes(id)) return;

    SECTIONS.forEach((s) => {
      const sec = document.getElementById('section-' + s);
      if (sec) sec.classList.toggle('active', s === id);
    });

    // Bottom nav active state
    document.querySelectorAll('.bnav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.section === id);
    });

    // Desktop nav active state
    document.querySelectorAll('.dnav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.section === id);
    });

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Bind all nav buttons (both bottom and desktop)
  document.querySelectorAll('[data-section]').forEach((btn) => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });

  // Initialize all endpoint modules
  if (window.FIXLY_AIO)     window.FIXLY_AIO.init(document.getElementById('aio-root'));
  if (window.FIXLY_HDFOTO)  window.FIXLY_HDFOTO.init(document.getElementById('hdfoto-root'));
  if (window.FIXLY_HDVIDEO) window.FIXLY_HDVIDEO.init(document.getElementById('hdvideo-root'));
  if (window.FIXLY_IQC)     window.FIXLY_IQC.init(document.getElementById('iqc-root'));

})();
