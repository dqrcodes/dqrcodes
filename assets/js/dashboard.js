document.addEventListener("DOMContentLoaded", () => {

  const list = $("#projectList");
  const search = $("#projectSearch");
  const filter = $("#projectFilter");
  const sort = $("#projectSort");


  // =====================================================
  // HELPERS
  // =====================================================

  function projects() {
    return Array.isArray(QRHistory.all())
      ? QRHistory.all()
      : [];
  }

  function safe(value) {
    return escapeHtml(
      String(value ?? "")
    );
  }

  function payloadOf(project) {
    return (
      project.payload ||
      project.data ||
      ""
    );
  }

  function formatDate(value) {
    const date =
      new Date(value);

    if (
      !value ||
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown date";
    }

    return date.toLocaleString();
  }

  function fileName(value) {
    return (
      String(value || "qr-code")
        .replace(
          /[^a-z0-9_\- ]/gi,
          ""
        )
        .trim()
        .replace(/\s+/g, "-")
        .substring(0, 80) ||
      "qr-code"
    );
  }


  // =====================================================
  // FILTER / SORT
  // =====================================================

  function getVisibleProjects() {

    let arr =
      [...projects()];

    const q =
      (
        search?.value ||
        ""
      )
        .trim()
        .toLowerCase();

    if (q) {

      arr =
        arr.filter(
          project =>
            `
              ${project.title || ""}
              ${project.typeName || ""}
              ${project.category || ""}
              ${payloadOf(project)}
            `
              .toLowerCase()
              .includes(q)
        );

    }

    if (
      filter.value ===
      "favorites"
    ) {

      arr =
        arr.filter(
          p =>
            p.favorite === true
        );

    } else if (
      filter.value ===
      "recent"
    ) {

      arr.sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      );

      arr =
        arr.slice(0, 20);

    } else if (
      filter.value !==
      "all"
    ) {

      arr =
        arr.filter(
          p =>
            p.category ===
            filter.value
        );

    }

    if (
      sort.value ===
      "newest"
    ) {

      arr.sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      );

    }

    if (
      sort.value ===
      "oldest"
    ) {

      arr.sort(
        (a, b) =>
          new Date(
            a.createdAt || 0
          ) -
          new Date(
            b.createdAt || 0
          )
      );

    }

    if (
      sort.value ===
      "name"
    ) {

      arr.sort(
        (a, b) =>
          String(
            a.title || ""
          ).localeCompare(
            String(
              b.title || ""
            )
          )
      );

    }

    return arr;
  }


  // =====================================================
  // CARD
  // =====================================================

  function card(project) {

    const payload =
      payloadOf(project);

    const hasPayload =
      Boolean(payload);

    return `
      <div class="col-md-6 col-xl-4">

        <div
          class="card-pro project-card p-3 h-100"
        >

          <div class="d-flex gap-3 align-items-center">

            <div class="icon-box">
              <i class="bi ${
                safe(
                  project.icon ||
                  "bi-qr-code"
                )
              }"></i>
            </div>

            <div class="flex-grow-1 min-width-0">

              <strong
                class="project-title d-block text-truncate"
                title="${safe(
                  project.title ||
                  "Untitled QR"
                )}"
              >
                ${safe(
                  project.title ||
                  "Untitled QR"
                )}
              </strong>

              <div class="small muted">
                ${safe(
                  project.typeName ||
                  "QR Code"
                )}
              </div>

            </div>

            <button
              type="button"
              class="btn btn-sm favorite-btn favorite"
              data-id="${safe(
                project.id
              )}"
              title="Favorite"
            >
              <i class="bi ${
                project.favorite
                  ? "bi-heart-fill"
                  : "bi-heart"
              }"></i>
            </button>

          </div>


          <div class="small muted mt-3">

            <i class="bi bi-clock me-1"></i>

            ${formatDate(
              project.createdAt
            )}

          </div>


          ${
            project.category
              ? `
                <span class="category-chip mt-2">
                  ${safe(
                    project.category
                  )}
                </span>
              `
              : ""
          }


          <div class="payload-preview mt-3">

            <div class="small muted mb-1">
              QR content
            </div>

            ${
              hasPayload
                ? `
                  <div
                    class="small text-truncate"
                    title="${safe(payload)}"
                  >
                    ${safe(payload)}
                  </div>
                `
                : `
                  <div class="small text-warning">
                    <i class="bi bi-exclamation-triangle me-1"></i>
                    Legacy project — QR payload was not saved.
                  </div>
                `
            }

          </div>


          <div class="d-flex gap-2 mt-3">

            <button
              class="btn btn-sm btn-outline-primary flex-fill view"
              data-id="${safe(project.id)}"
            >
              <i class="bi bi-eye me-1"></i>
              View
            </button>

            <button
              class="btn btn-sm btn-primary flex-fill edit"
              data-id="${safe(project.id)}"
            >
              <i class="bi bi-pencil me-1"></i>
              Edit
            </button>

          </div>


          <div class="d-flex gap-2 mt-2">

            <button
              class="btn btn-sm btn-success flex-fill download"
              data-id="${safe(project.id)}"
              ${hasPayload ? "" : "disabled"}
            >
              <i class="bi bi-download me-1"></i>
              Download
            </button>

            <button
              class="btn btn-sm btn-outline-danger flex-fill delete"
              data-id="${safe(project.id)}"
            >
              <i class="bi bi-trash3 me-1"></i>
              Delete
            </button>

          </div>

        </div>

      </div>
    `;
  }


  // =====================================================
  // EMPTY
  // =====================================================

  function emptyState() {

    return `
      <div class="col-12">

        <div class="empty card-pro">

          <div class="empty-icon">
            <i class="bi bi-qr-code"></i>
          </div>

          <h5>No QR codes found</h5>

          <p>
            Create a QR code and save it locally.
          </p>

          <a
            class="btn btn-primary"
            href="generator.html"
          >
            <i class="bi bi-plus-lg me-1"></i>
            Create QR
          </a>

        </div>

      </div>
    `;

  }


  // =====================================================
  // RENDER
  // =====================================================

  function render() {

    const all =
      projects();

    const arr =
      getVisibleProjects();

    updateStats(all);

    list.innerHTML =
      arr.length
        ? arr.map(card).join("")
        : emptyState();

    bindActions();
  }


  // =====================================================
  // STATS
  // =====================================================

  function updateStats(all) {

    $("#totalCount").textContent =
      all.length;

    $("#favCount").textContent =
      all.filter(
        p => p.favorite === true
      ).length;

    $("#recentCount").textContent =
      Math.min(
        all.length,
        20
      );

    $("#categoryCount").textContent =
      new Set(
        all
          .map(
            p => p.category
          )
          .filter(Boolean)
      ).size;
  }


  // =====================================================
  // VIEW
  // =====================================================

  function viewProject(id) {

    const project =
      QRHistory.get(id);

    if (!project) {

      toast(
        "QR project not found.",
        "danger"
      );

      return;
    }

    if (!payloadOf(project)) {

      toast(
        "This old project has no saved QR payload. Create it again to enable View.",
        "warning"
      );

      return;
    }

    location.href =
      "generator.html?view=" +
      encodeURIComponent(id);
  }


  // =====================================================
  // EDIT
  // =====================================================

  function editProject(id) {

    const project =
      QRHistory.get(id);

    if (!project) {

      toast(
        "QR project not found.",
        "danger"
      );

      return;
    }

    if (!payloadOf(project)) {

      toast(
        "This old project has no saved QR data. It cannot be edited. Create a new QR.",
        "warning"
      );

      return;
    }

    location.href =
      "generator.html?edit=" +
      encodeURIComponent(id);
  }


  // =====================================================
  // DELETE
  // =====================================================

  function deleteProject(id) {

    const project =
      QRHistory.get(id);

    if (!project) return;

    const confirmed =
      confirm(
        `Delete "${project.title || "this QR code"}"?\n\nThis removes it from this browser.`
      );

    if (!confirmed) return;

    QRHistory.delete(id);

    render();

    toast(
      "QR deleted.",
      "success"
    );
  }


  // =====================================================
  // FAVORITE
  // =====================================================

  function toggleFavorite(id) {

    const project =
      QRHistory.get(id);

    if (!project) return;

    project.favorite =
      !Boolean(
        project.favorite
      );

    QRHistory.save(
      project
    );

    render();

    toast(
      project.favorite
        ? "Added to favorites."
        : "Removed from favorites.",
      "success"
    );
  }


  // =====================================================
  // DOWNLOAD
  // =====================================================

  async function downloadProject(id) {

    const project =
      QRHistory.get(id);

    if (!project) {

      toast(
        "QR project not found.",
        "danger"
      );

      return;
    }

    const payload =
      payloadOf(project);

    if (!payload) {

      toast(
        "This old project has no saved QR payload.",
        "warning"
      );

      return;
    }

    if (
      typeof QRCodeStyling ===
      "undefined"
    ) {

      toast(
        "QR library is not loaded.",
        "danger"
      );

      return;
    }

    const holder =
      document.createElement(
        "div"
      );

    holder.style.position =
      "fixed";

    holder.style.left =
      "-100000px";

    holder.style.top =
      "0";

    holder.style.width =
      "1024px";

    holder.style.height =
      "1024px";

    holder.style.background =
      "#ffffff";

    document.body.appendChild(
      holder
    );

    try {

      const style =
        project.style ||
        {};

      const qr =
        new QRCodeStyling({

          width:
            Number(
              style.size ||
              1024
            ),

          height:
            Number(
              style.size ||
              1024
            ),

          type:
            "canvas",

          data:
            payload,

          margin:
            Number(
              style.margin ??
              10
            ),

          dotsOptions: {
            color:
              style.fg ||
              project.foreground ||
              "#111827",

            type:
              style.dots ||
              "rounded"
          },

          backgroundOptions: {
            color:
              style.bg ||
              project.background ||
              "#ffffff"
          },

          cornersSquareOptions: {
            color:
              style.eye ||
              style.fg ||
              "#111827",

            type:
              style.eyeStyle ||
              "extra-rounded"
          },

          cornersDotOptions: {
            color:
              style.eye ||
              style.fg ||
              "#111827",

            type:
              style.eyeDot ||
              "dot"
          },

          qrOptions: {
            errorCorrectionLevel:
              style.ec ||
              project.errorCorrection ||
              "M"
          },

          ...(style.logo
            ? {
                image:
                  style.logo,

                imageOptions: {
                  crossOrigin:
                    "anonymous",

                  margin:
                    Number(
                      style.logoPadding ||
                      6
                    ),

                  imageSize:
                    Number(
                      style.logoSize ||
                      0.25
                    ),

                  hideBackgroundDots:
                    true
                }
              }
            : {})

        });

      qr.append(
        holder
      );

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            300
          )
      );

      await qr.download({
        name:
          fileName(
            project.title ||
            "qr-code"
          ),

        extension:
          "png"
      });

      toast(
        "QR downloaded successfully.",
        "success"
      );

    } catch (error) {

      console.error(error);

      toast(
        "QR download failed.",
        "danger"
      );

    } finally {

      holder.remove();

    }
  }


  // =====================================================
  // ACTION BINDING
  // =====================================================

  function bindActions() {

    $$(".view")
      .forEach(button => {

        button.onclick =
          () =>
            viewProject(
              button.dataset.id
            );

      });


    $$(".edit")
      .forEach(button => {

        button.onclick =
          () =>
            editProject(
              button.dataset.id
            );

      });


    $$(".delete")
      .forEach(button => {

        button.onclick =
          () =>
            deleteProject(
              button.dataset.id
            );

      });


    $$(".favorite")
      .forEach(button => {

        button.onclick =
          () =>
            toggleFavorite(
              button.dataset.id
            );

      });


    $$(".download")
      .forEach(button => {

        button.onclick =
          () =>
            downloadProject(
              button.dataset.id
            );

      });

  }


  // =====================================================
  // SEARCH / FILTER / SORT
  // =====================================================

  search?.addEventListener(
    "input",
    render
  );

  filter?.addEventListener(
    "change",
    render
  );

  sort?.addEventListener(
    "change",
    render
  );


  // =====================================================
  // INITIAL
  // =====================================================

  render();

});
