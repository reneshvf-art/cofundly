/* ============================================
   CoFundly — Reusable Spline 3D Integration
   --------------------------------------------
   Loads the official Spline web-component viewer
   (no bundler / no npm required), respects
   prefers-reduced-motion, skips on small / low-
   powered devices, and falls back to a static
   gradient + orbs if loading fails.

   Usage (in HTML):
     <div class="spline-stage"
          data-spline-scene="https://prod.spline.design/YOUR-SCENE/scene.splinecode"
          data-spline-mobile="off">
     </div>

   Replace the data-spline-scene URL with your own
   scene URL. See SETUP.md for step-by-step.
   ============================================ */

(function () {
  'use strict';

  // Official Spline viewer (ES module, CDN).
  // Pinned version so behavior is stable — bump when upgrading.
  const VIEWER_SRC = 'https://unpkg.com/@splinetool/viewer@1.9.48/build/spline-viewer.js';

  // Device heuristics
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  const isLowPowerDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const isDataSaver = !!(navigator.connection && navigator.connection.saveData);

  let viewerScriptPromise = null;
  function loadViewerScript() {
    if (viewerScriptPromise) return viewerScriptPromise;
    viewerScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-spline-loader]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const s = document.createElement('script');
      s.type = 'module';
      s.src = VIEWER_SRC;
      s.async = true;
      s.dataset.splineLoader = 'true';
      s.addEventListener('load', resolve, { once: true });
      s.addEventListener('error', reject, { once: true });
      document.head.appendChild(s);
    });
    return viewerScriptPromise;
  }

  function applyFallback(stage, reason) {
    stage.classList.add('spline-stage--fallback');
    stage.setAttribute('data-spline-fallback', reason || 'fallback');
  }

  function mountSpline(stage) {
    const scene = stage.getAttribute('data-spline-scene');
    const mobileBehavior = (stage.getAttribute('data-spline-mobile') || 'off').toLowerCase();

    // No scene URL → treat as fallback immediately (user hasn't pasted URL yet)
    if (!scene || scene.includes('YOUR-SCENE-URL') || scene.startsWith('PASTE_')) {
      applyFallback(stage, 'no-scene');
      return;
    }

    // Respect prefers-reduced-motion and data saver
    if (prefersReducedMotion) {
      applyFallback(stage, 'reduced-motion');
      return;
    }
    if (isDataSaver) {
      applyFallback(stage, 'data-saver');
      return;
    }

    // Mobile handling — by default we skip Spline on small screens for perf/readability
    if (isSmallScreen && mobileBehavior !== 'on') {
      applyFallback(stage, 'mobile-skip');
      return;
    }

    // Low-power hint — skip by default on phones/tablets with <=4 cores unless explicitly allowed
    if (isLowPowerDevice && isSmallScreen && mobileBehavior !== 'on') {
      applyFallback(stage, 'low-power');
      return;
    }

    loadViewerScript()
      .then(() => {
        const viewer = document.createElement('spline-viewer');
        viewer.setAttribute('url', scene);
        viewer.setAttribute('loading-anim', 'true');
        viewer.setAttribute('events-target', 'local');
        viewer.style.width = '100%';
        viewer.style.height = '100%';
        viewer.style.display = 'block';

        // Safety timeout — if the scene hasn't signaled readiness in 12s, fall back.
        const timeout = setTimeout(() => {
          if (!stage.classList.contains('spline-stage--ready')) {
            applyFallback(stage, 'timeout');
            viewer.remove();
          }
        }, 12000);

        viewer.addEventListener('load', () => {
          clearTimeout(timeout);
          stage.classList.add('spline-stage--ready');
        });

        viewer.addEventListener('error', () => {
          clearTimeout(timeout);
          applyFallback(stage, 'viewer-error');
          viewer.remove();
        });

        stage.appendChild(viewer);
      })
      .catch(() => applyFallback(stage, 'script-error'));
  }

  function initAll() {
    document.querySelectorAll('.spline-stage[data-spline-scene]').forEach(mountSpline);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Expose for manual remount if scene URL is updated at runtime
  window.CoFundlySpline = { mount: mountSpline, initAll };
})();
