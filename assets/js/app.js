(() => {
  const $ = (s, root = document) =>
    root.querySelector(s);

  const $$ = (s, root = document) =>
    [...root.querySelectorAll(s)];

  window.$ = $;
  window.$$ = $$;

  const store = {
    get(key, fallback = null) {
      try {
        return (
          JSON.parse(
            localStorage.getItem(key)
          ) ?? fallback
        );
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    },

    remove(key) {
      localStorage.removeItem(key);
    }
  };

  window.Store = store;

  window.slug = s =>
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  window.escapeHtml = s =>
    String(s ?? "").replace(
      /[&<>"']/g,
      c =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        }[c])
    );

  function toast(
    message,
    type = "primary"
  ) {
    const wrap =
      $("#toastContainer");

    if (!wrap) return;

    const id =
      "t" + Date.now();

    const cls =
      type === "danger"
        ? "text-bg-danger"
        : type === "success"
          ? "text-bg-success"
          : type === "warning"
            ? "text-bg-warning"
            : "text-bg-dark";

    wrap.insertAdjacentHTML(
      "beforeend",
      `
        <div
          id="${id}"
          class="toast ${cls} border-0"
          role="status"
        >
          <div class="d-flex">

            <div class="toast-body">
              ${escapeHtml(message)}
            </div>

            <button
              class="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast"
            ></button>

          </div>
        </div>
      `
    );

    const el =
      $("#" + id);

    if (!el || !window.bootstrap) return;

    const t =
      new bootstrap.Toast(
        el,
        { delay: 2800 }
      );

    t.show();

    el.addEventListener(
      "hidden.bs.toast",
      () => el.remove()
    );
  }

  window.toast = toast;


  // =====================================================
  // THEME
  // =====================================================

  function themeInit() {
    const saved =
      store.get(
        "qr-theme",
        "system"
      );

    const mode =
      saved === "system"
        ? (
            matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches
              ? "dark"
              : "light"
          )
        : saved;

    document.documentElement.dataset.theme =
      mode;

    $$(
      "#themeToggle [data-theme-choice]"
    ).forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.themeChoice ===
          saved
      );
    });
  }

  window.setTheme = mode => {
    store.set(
      "qr-theme",
      mode
    );

    themeInit();

    toast(
      `Theme set to ${mode}.`,
      "success"
    );
  };


  // =====================================================
  // QR HISTORY
  // =====================================================

  function history() {
    const raw =
      store.get(
        "qr-projects",
        []
      );

    if (!Array.isArray(raw)) {
      return [];
    }

    let changed = false;

    const normalized =
      raw.map(project => {

        const p = {
          ...project
        };

        // Compatibility:
        // older projects used "data"
        // while dashboard uses "payload".
        if (
          !p.payload &&
          p.data
        ) {
          p.payload =
            p.data;

          changed = true;
        }

        if (
          !p.data &&
          p.payload
        ) {
          p.data =
            p.payload;

          changed = true;
        }

        if (
          !p.createdAt
        ) {
          p.createdAt =
            p.updatedAt ||
            new Date().toISOString();

          changed = true;
        }

        if (
          typeof p.favorite !==
          "boolean"
        ) {
          p.favorite =
            Boolean(
              p.favorite
            );

          changed = true;
        }

        return p;
      });

    if (changed) {
      store.set(
        "qr-projects",
        normalized
      );
    }

    return normalized;
  }


  function saveProject(project) {

    const all =
      history();

    const idx =
      all.findIndex(
        x =>
          x.id === project.id
      );

    const normalized = {
      ...project,

      payload:
        project.payload ||
        project.data ||
        "",

      data:
        project.data ||
        project.payload ||
        "",

      createdAt:
        project.createdAt ||
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),

      favorite:
        Boolean(
          project.favorite
        )
    };

    if (idx >= 0) {
      all[idx] =
        normalized;
    } else {
      all.unshift(
        normalized
      );
    }

    store.set(
      "qr-projects",
      all.slice(0, 250)
    );

    return normalized;
  }


  window.QRHistory = {

    all: history,

    save: saveProject,

    delete(id) {
      store.set(
        "qr-projects",
        history().filter(
          x => x.id !== id
        )
      );
    },

    get(id) {
      return history().find(
        x => x.id === id
      );
    }

  };


  // =====================================================
  // APP INIT
  // =====================================================

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      themeInit();

      $$(
        '[data-bs-toggle="tooltip"]'
      ).forEach(
        el => {
          if (window.bootstrap) {
            new bootstrap.Tooltip(
              el
            );
          }
        }
      );

      const year =
        $("#year");

      if (year) {
        year.textContent =
          new Date().getFullYear();
      }

      $$(
        "#themeToggle [data-theme-choice]"
      ).forEach(
        button => {
          button.addEventListener(
            "click",
            () =>
              setTheme(
                button.dataset
                  .themeChoice
              )
          );
        }
      );

      const globalSearch =
        $("#globalSearch");

      if (globalSearch) {
        globalSearch.addEventListener(
          "keydown",
          e => {

            if (
              e.key === "Enter"
            ) {

              location.href =
                "types.html?q=" +
                encodeURIComponent(
                  globalSearch.value.trim()
                );

            }

          }
        );
      }

      document.addEventListener(
        "keydown",
        e => {

          if (
            (e.ctrlKey ||
              e.metaKey) &&
            e.key.toLowerCase() ===
              "k"
          ) {

            e.preventDefault();

            $("#globalSearch")
              ?.focus();

          }

        }
      );

    }
  );
})();
