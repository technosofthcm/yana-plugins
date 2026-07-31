// ============================================
// YanaEditableGrid - DEPRECATED delegating shim
// ============================================
//
// Since YanaGrid v1.5.0 the SDK ships inside the control bundle: the control self-publishes
// `window.top.YanaEditableGrid` on init, so consumers no longer need this web resource as a form
// library. This file remains only for backward compatibility with forms that still register it —
// it is a thin shim that waits for the bundled namespace and delegates to it.
//
// Same public contract as the legacy library:
//   - `getEditableGrid(context, gridId)` signature (the first argument is an echo token handed
//     back to every handler as its first parameter);
//   - wait-for-ready with the same 60-second timeout semantics (resolves null and logs on
//     timeout, like the legacy polling client).
//
// Version guard: the shim and the bundle load in unguaranteed order; whichever loads
// second must not clobber the other. The shim never overwrites a bundled namespace; the bundle
// always replaces the shim.
//
// This shim requires YanaGrid control >= 1.5.0 on the form. Removal planned for the next major
// version.

(function () {
  'use strict';

  var DELEGATE_TIMEOUT_MS = 60000;
  var POLL_INTERVAL_MS = 500;

  // `window.top` resolves even when it is cross-origin (Teams tab, portal/iframe embed), but every
  // named-property read on it then throws SecurityError. Probe with a real read and stay in this
  // frame when the read is blocked.
  var topWindow = window;
  try {
    if (window.top && window.top !== window) {
      void window.top.YanaEditableGrid;
      topWindow = window.top;
    }
  } catch (e) {
    topWindow = window;
  }

  function isBundled(namespace) {
    return !!namespace && namespace.__bundled === true;
  }

  // Waits for the bundled SDK to publish itself (it replaces this shim on the shared namespace).
  function waitForBundledSdk() {
    return new Promise(function (resolve) {
      if (isBundled(topWindow.YanaEditableGrid)) {
        resolve(topWindow.YanaEditableGrid);
        return;
      }

      var elapsed = 0;
      var interval = setInterval(function () {
        if (isBundled(topWindow.YanaEditableGrid)) {
          clearInterval(interval);
          resolve(topWindow.YanaEditableGrid);
          return;
        }

        elapsed += POLL_INTERVAL_MS;
        if (elapsed >= DELEGATE_TIMEOUT_MS) {
          clearInterval(interval);
          resolve(null);
        }
      }, POLL_INTERVAL_MS);
    });
  }

  var deprecationWarned = false;

  var shim = {
    __shim: true,

    // Legacy entry point — same signature and timeout semantics as the v1.4.x library.
    getEditableGrid: function (instance, gridId) {
      if (!deprecationWarned) {
        deprecationWarned = true;
        console.warn(
          '[YanaGrid] Technosoft.Yana.Grid.js is deprecated. The SDK is bundled with the ' +
            'YanaGrid control (v1.5.0+): remove this form library and use ' +
            'formContext.getControl(name).addOnOutputChange(...) with window.top.YanaEditableGrid.getEditableGrid(name). ' +
            'This shim will be removed in a future major version.',
        );
      }

      return waitForBundledSdk().then(function (bundled) {
        if (!bundled) {
          console.error(
            'Editable grid request timed out. The operation exceeded the 60-second limit. ' +
              '(Bundled YanaGrid SDK not found — is a YanaGrid control v1.5.0+ on this form?)',
          );
          return null;
        }
        return bundled.getEditableGrid(instance, gridId);
      });
    },
  };

  // Publish only when the bundle has not already claimed the namespace.
  if (!isBundled(topWindow.YanaEditableGrid)) {
    topWindow.YanaEditableGrid = shim;
  }

  // Also expose the namespace on THIS frame's global, so a form library loaded alongside this web
  // resource can call `YanaEditableGrid.getEditableGrid(...)` without the `window.top.` prefix (a
  // bare identifier resolves against the running frame's window, not window.top). Mirror whatever
  // owns the top namespace — the bundle if it has claimed it, otherwise this shim; the shim still
  // delegates to window.top at call time, so a late-arriving bundle is picked up either way. When
  // the form isn't framed (window === topWindow) the publish above already exposed it locally.
  if (window !== topWindow && !isBundled(window.YanaEditableGrid)) {
    window.YanaEditableGrid = topWindow.YanaEditableGrid;
  }

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { YanaEditableGrid: topWindow.YanaEditableGrid };
  }
})();
