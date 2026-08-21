document.addEventListener("DOMContentLoaded", () => {
  const typeSelect = $("#typeSelect");
  const typeSearch = $("#typeSearch");
  const form = $("#dynamicForm");
  const qrCanvas = $("#qrCanvas");

  const title = $("#projectTitle");
  const size = $("#qrSize");
  const fg = $("#fgColor");
  const bg = $("#bgColor");
  const margin = $("#qrMargin");

  const dots = $("#dotsStyle");
  const eyeStyle = $("#eyeStyle");
  const ec = $("#errorCorrection");

  const logo = $("#logoUpload");
  const logoSize = $("#logoSize");
  const logoPadding = $("#logoPadding");
  const logoPreview = $("#logoPreview");

  const typeInfo = $("#typeInfo");

  let selected = QR_TYPES[0];
  let logoData = null;
  let currentId = null;
  let viewMode = false;
  let timer = null;

  function fillTypes(filter = "", preferredId = null) {
    const q = filter.toLowerCase().trim();

    const list = QR_TYPES.filter(t =>
      `${t.name} ${t.category} ${(t.keywords || []).join(" ")}`
        .toLowerCase()
        .includes(q)
    );

    typeSelect.innerHTML = list.map(t =>
      `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)} — ${escapeHtml(t.category)}</option>`
    ).join("");

    if (!list.length) {
      selected = QR_TYPES[0];
      form.innerHTML = `<div class="empty py-4">No QR types found.</div>`;
      typeInfo.textContent = "No matching QR type";
      return;
    }

    const preferred = preferredId
      ? list.find(t => t.id === preferredId)
      : null;

    selected = preferred || list[0];
    typeSelect.value = selected.id;

    renderForm();
  }

  function renderForm() {
    selected =
      QR_TYPES.find(x => x.id === typeSelect.value) ||
      QR_TYPES[0];

    typeInfo.innerHTML = `
      <div class="d-flex gap-3 align-items-center">
        <div class="icon-box">
          <i class="bi ${escapeHtml(selected.icon || "bi-qr-code")}"></i>
        </div>

        <div>
          <strong>${escapeHtml(selected.name)}</strong>
          <div class="small muted">
            ${escapeHtml(selected.category)}
          </div>
        </div>
      </div>
    `;

    const c = selected.category;
    let fields = [];

    if (c === "Wi-Fi & Network" || selected.name.startsWith("Wi-Fi")) {
      fields = [
        ["ssid", "Network name", "text", "My Wi-Fi", true],
        ["password", "Password", "text", "••••••••", false],
        ["security", "Security", "select", "WPA", true, ["WPA", "WEP", "nopass"]],
        ["hidden", "Hidden network", "checkbox", "", false]
      ];
    } else if (
      selected.name === "Email" ||
      selected.name === "Email With Subject"
    ) {
      fields = [
        ["email", "Email address", "email", "hello@example.com", true],
        ["subject", "Subject", "text", "Hello", selected.name.includes("Subject")],
        ["body", "Message", "textarea", "Your message...", false]
      ];
    } else if (
      selected.name === "Phone Call" ||
      selected.name === "Phone Contact"
    ) {
      fields = [
        ["phone", "Phone number", "tel", "+91 9876543210", true]
      ];
    } else if (
      selected.name === "SMS" ||
      selected.name === "SMS With Message"
    ) {
      fields = [
        ["phone", "Phone number", "tel", "+91 9876543210", true],
        ["body", "Message", "textarea", "Your message...", selected.name.includes("Message")]
      ];
    } else if (
      selected.name === "vCard" ||
      selected.name.includes("Business Card") ||
      selected.name.includes("Contact")
    ) {
      fields = [
        ["name", "Full name", "text", "Your name", true],
        ["phone", "Phone", "tel", "+91 9876543210", false],
        ["email", "Email", "email", "hello@example.com", false],
        ["company", "Company", "text", "QR Studio", false],
        ["url", "Website", "url", "https://example.com", false],
        ["address", "Address", "text", "Your address", false]
      ];
    } else if (
      selected.name.includes("Calendar") ||
      selected.name === "Event"
    ) {
      fields = [
        ["title", "Event title", "text", "My Event", true],
        ["start", "Start date/time", "datetime-local", "", true],
        ["end", "End date/time", "datetime-local", "", false],
        ["location", "Location", "text", "Your location", false],
        ["description", "Description", "textarea", "Event details", false]
      ];
    } else if (
      selected.name.includes("GPS") ||
      selected.name === "Location"
    ) {
      fields = [
        ["lat", "Latitude", "number", "21.1458", true],
        ["lng", "Longitude", "number", "79.0882", true],
        ["label", "Location label", "text", "Location", false]
      ];
    } else if (
      selected.name === "UPI" ||
      selected.name === "UPI Payment" ||
      selected.name === "UPI ID"
    ) {
      fields = [
        ["upi", "UPI ID", "text", "name@upi", true],
        ["name", "Payee name", "text", "Your Name", false],
        ["amount", "Amount", "number", "100", false],
        ["note", "Note", "text", "Payment", false]
      ];
    } else {
      fields = [
        [
          "content",
          selected.category === "Social Media"
            ? "Profile / page URL"
            : "Content / URL",
          "textarea",
          selected.category === "Social Media"
            ? "https://instagram.com/username"
            : "https://example.com",
          true
        ],
        [
          "label",
          "Display title",
          "text",
          selected.name,
          false
        ]
      ];
    }

    form.innerHTML = fields.map(f => {
      const [name, label, inputType, placeholder, required, options] = f;

      if (inputType === "select") {
        return `
          <div class="mb-3">
            <label class="form-label">
              ${escapeHtml(label)}${required ? " *" : ""}
            </label>

            <select
              class="form-select"
              name="${escapeHtml(name)}"
              ${required ? "required" : ""}
            >
              ${(options || []).map(x =>
                `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`
              ).join("")}
            </select>
          </div>
        `;
      }

      if (inputType === "checkbox") {
        return `
          <div class="form-check mb-3">
            <input
              class="form-check-input"
              type="checkbox"
              name="${escapeHtml(name)}"
              id="field-${escapeHtml(name)}"
            >

            <label
              class="form-check-label"
              for="field-${escapeHtml(name)}"
            >
              ${escapeHtml(label)}
            </label>
          </div>
        `;
      }

      if (inputType === "textarea") {
        return `
          <div class="mb-3">
            <label class="form-label">
              ${escapeHtml(label)}${required ? " *" : ""}
            </label>

            <textarea
              class="form-control"
              name="${escapeHtml(name)}"
              rows="3"
              placeholder="${escapeHtml(placeholder)}"
              ${required ? "required" : ""}
            ></textarea>
          </div>
        `;
      }

      return `
        <div class="mb-3">
          <label class="form-label">
            ${escapeHtml(label)}${required ? " *" : ""}
          </label>

          <input
            class="form-control"
            name="${escapeHtml(name)}"
            type="${escapeHtml(inputType)}"
            placeholder="${escapeHtml(placeholder)}"
            ${required ? "required" : ""}
          >
        </div>
      `;
    }).join("");

    $$("#dynamicForm input, #dynamicForm textarea, #dynamicForm select")
      .forEach(el => {
        el.addEventListener("input", scheduleGenerate);
        el.addEventListener("change", scheduleGenerate);
      });

    applyViewMode();
    scheduleGenerate();
  }

  function val(name) {
    const el = form.elements[name];

    if (!el) return "";

    return typeof el.value === "string"
      ? el.value.trim()
      : "";
  }

  function collectFormData() {
    const result = {};

    Array.from(form.elements).forEach(el => {
      if (!el.name) return;

      result[el.name] =
        el.type === "checkbox"
          ? Boolean(el.checked)
          : el.value;
    });

    return result;
  }

  function applyFormData(data = {}) {
    Object.entries(data || {}).forEach(([name, value]) => {
      const el = form.elements[name];

      if (!el) return;

      if (el.type === "checkbox") {
        el.checked = Boolean(value);
      } else {
        el.value = value ?? "";
      }
    });
  }

  function encode() {
    const n = selected.name;
    const c = selected.category;

    if (c === "Wi-Fi & Network" || n.startsWith("Wi-Fi")) {
      const ssid = val("ssid");
      const pass = val("password");
      const sec = val("security") || "WPA";
      const hidden =
        form.elements.hidden?.checked ? "true" : "false";

      return `WIFI:T:${sec};S:${ssid};P:${pass};H:${hidden};;`;
    }

    if (
      n === "Email" ||
      n === "Email With Subject"
    ) {
      const params = new URLSearchParams();

      if (val("subject")) {
        params.set("subject", val("subject"));
      }

      if (val("body")) {
        params.set("body", val("body"));
      }

      const query = params.toString();

      return `mailto:${val("email")}${query ? `?${query}` : ""}`;
    }

    if (
      n === "Phone Call" ||
      n === "Phone Contact"
    ) {
      return `tel:${val("phone")}`;
    }

    if (
      n === "SMS" ||
      n === "SMS With Message"
    ) {
      return `SMSTO:${val("phone")}:${val("body")}`;
    }

    if (
      n === "vCard" ||
      n.includes("Business Card") ||
      n.includes("Contact")
    ) {
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${val("name")}`,
        `TEL:${val("phone")}`,
        `EMAIL:${val("email")}`,
        `ORG:${val("company")}`,
        `URL:${val("url")}`,
        `ADR:${val("address")}`,
        "END:VCARD"
      ].join("\n");
    }

    if (
      n === "UPI" ||
      n === "UPI Payment" ||
      n === "UPI ID"
    ) {
      const p = new URLSearchParams({
        pa: val("upi"),
        pn: val("name")
      });

      if (val("amount")) {
        p.set("am", val("amount"));
      }

      if (val("note")) {
        p.set("tn", val("note"));
      }

      return `upi://pay?${p.toString()}`;
    }

    if (
      n.includes("GPS") ||
      n === "Location"
    ) {
      return `geo:${val("lat")},${val("lng")}${
        val("label")
          ? `?q=${encodeURIComponent(val("label"))}`
          : ""
      }`;
    }

    if (
      n.includes("Calendar") ||
      n === "Event"
    ) {
      const start = val("start")
        .replace(/[-:]/g, "")
        .replace("T", "");

      const end = val("end")
        .replace(/[-:]/g, "")
        .replace("T", "");

      return [
        "BEGIN:VEVENT",
        `SUMMARY:${val("title")}`,
        `DTSTART:${start}`,
        end ? `DTEND:${end}` : "",
        `LOCATION:${val("location")}`,
        `DESCRIPTION:${val("description")}`,
        "END:VEVENT"
      ].filter(Boolean).join("\n");
    }

    if (n === "WhatsApp") {
      return `https://wa.me/?text=${encodeURIComponent(
        val("content")
      )}`;
    }

    if (n === "Telegram") {
      return `https://t.me/${encodeURIComponent(
        val("content").replace(/^@/, "")
      )}`;
    }

    if (
      n === "YouTube" ||
      n === "YouTube Video"
    ) {
      return val("content") || "https://youtube.com";
    }

    return (
      val("content") ||
      "https://example.com"
    );
  }

  function getStyle() {
    return {
      size: Number(size.value || 330),
      fg: fg.value || "#111827",
      bg: bg.value || "#ffffff",
      margin: Number(margin.value || 10),
      dots: dots.value || "rounded",
      eyeStyle: eyeStyle.value || "extra-rounded",
      eye: fg.value || "#111827",
      eyeDot: "dot",
      ec: ec.value || "M",
      logo: logoData || null,
      logoSize: Number(logoSize.value || 0.25),
      logoPadding: Number(logoPadding.value || 6)
    };
  }

  function scheduleGenerate() {
    clearTimeout(timer);
    timer = setTimeout(generate, 120);
  }

  function generate() {
    try {
      if (!form.checkValidity()) {
        return;
      }

      const data = encode();
      const style = getStyle();

      QREngine.render(
        qrCanvas,
        data,
        style
      );

      $("#encodedData").textContent = data;

      $("#previewTitle").textContent =
        title.value.trim() ||
        selected.name;

      $("#previewType").textContent =
        selected.category;

    } catch (error) {
      console.error(error);

      toast(
        "QR generation failed. Check the selected data.",
        "danger"
      );
    }
  }

  function saveProject() {
    try {
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        toast(
          "Please complete the required fields.",
          "warning"
        );
        return;
      }

      generate();

      const state =
        QREngine.getState();

      const project = {
        id:
          currentId ||
          crypto.randomUUID(),

        title:
          title.value.trim() ||
          selected.name,

        type:
          selected.id,

        typeName:
          selected.name,

        category:
          selected.category,

        // IMPORTANT:
        // Store BOTH names for compatibility.
        payload:
          state.data,

        data:
          state.data,

        // Store the original form values.
        formData:
          collectFormData(),

        // Store all visual settings.
        style:
          state.style,

        foreground:
          state.style.fg,

        background:
          state.style.bg,

        errorCorrection:
          state.style.ec,

        icon:
          selected.icon ||
          "bi-qr-code",

        favorite:
          currentId
            ? Boolean(
                QRHistory.get(currentId)?.favorite
              )
            : false,

        createdAt:
          currentId
            ? (
                QRHistory.get(currentId)?.createdAt ||
                new Date().toISOString()
              )
            : new Date().toISOString()
      };

      QRHistory.save(project);

      currentId =
        project.id;

      renderSavedLink();

      toast(
        "QR project saved locally.",
        "success"
      );

    } catch (error) {
      console.error(error);

      toast(
        "Could not save this QR project.",
        "danger"
      );
    }
  }

  function renderSavedLink() {
    const s = $("#saveStatus");

    if (!s) return;

    s.textContent =
      "Saved locally";

    s.className =
      "small text-success fw-semibold";
  }

  async function download(extension) {
    try {
      if (!QREngine.getData()) {
        generate();
      }

      await QREngine.download(
        extension,
        slug(
          title.value ||
          selected.name
        )
      );

      toast(
        `Downloaded ${extension.toUpperCase()}.`,
        "success"
      );

    } catch (error) {
      console.error(error);

      toast(
        "Download failed.",
        "danger"
      );
    }
  }

  function loadProject(id, readOnly = false) {
    const project =
      QRHistory.get(id);

    if (!project) {
      toast(
        "Saved QR project was not found.",
        "danger"
      );
      return;
    }

    currentId =
      project.id;

    viewMode =
      Boolean(readOnly);

    const projectType =
      project.type ||
      QR_TYPES.find(
        x => x.name === project.typeName
      )?.id ||
      "url";

    typeSelect.value =
      projectType;

    renderForm();

    title.value =
      project.title ||
      project.typeName ||
      "QR Code";

    const st =
      project.style || {};

    if (st.fg) fg.value = st.fg;
    if (st.bg) bg.value = st.bg;
    if (st.size) size.value = st.size;
    if (st.margin != null) margin.value = st.margin;
    if (st.dots) dots.value = st.dots;
    if (st.eyeStyle) eyeStyle.value = st.eyeStyle;
    if (st.ec) ec.value = st.ec;
    if (st.logo) {
      logoData = st.logo;
      logoPreview.src = st.logo;
      logoPreview.classList.remove("d-none");
    }

    // Restore exact input values saved by the generator.
    if (project.formData) {
      applyFormData(
        project.formData
      );
    } else {
      // Backward compatibility with old projects.
      const payload =
        project.payload ||
        project.data ||
        "";

      const content =
        form.elements.content;

      if (content && payload) {
        content.value =
          payload;
      }
    }

    generate();

    renderSavedLink();

    applyViewMode();
  }

  function applyViewMode() {
    const controls =
      [
        typeSelect,
        typeSearch,
        title,
        size,
        fg,
        bg,
        margin,
        dots,
        eyeStyle,
        ec,
        logo,
        logoSize,
        logoPadding
      ].filter(Boolean);

    const dynamic =
      $$(
        "#dynamicForm input, #dynamicForm textarea, #dynamicForm select"
      );

    controls
      .concat(dynamic)
      .forEach(el => {
        el.disabled =
          viewMode;
      });

    const generateBtn =
      $("#generateBtn");

    const saveBtn =
      $("#saveBtn");

    const duplicateBtn =
      $("#duplicateBtn");

    if (generateBtn) {
      generateBtn.disabled =
        viewMode;
    }

    if (saveBtn) {
      saveBtn.classList.toggle(
        "d-none",
        viewMode
      );
    }

    if (duplicateBtn) {
      duplicateBtn.classList.toggle(
        "d-none",
        viewMode
      );
    }

    if (viewMode) {
      $("#previewTitle").textContent =
        `${title.value || selected.name} — View`;

      $("#saveStatus").textContent =
        "Read-only view";
    }
  }

  // -----------------------------------------------------
  // Logo
  // -----------------------------------------------------

  logo.addEventListener(
    "change",
    () => {
      const file =
        logo.files?.[0];

      if (!file) return;

      if (
        file.size >
        2 * 1024 * 1024
      ) {
        toast(
          "Logo must be under 2 MB.",
          "warning"
        );

        logo.value = "";

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        logoData =
          reader.result;

        logoPreview.src =
          logoData;

        logoPreview.classList.remove(
          "d-none"
        );

        generate();
      };

      reader.readAsDataURL(file);
    }
  );

  // -----------------------------------------------------
  // Events
  // -----------------------------------------------------

  $$("#customControls input, #customControls select")
    .forEach(el => {
      el.addEventListener(
        "input",
        scheduleGenerate
      );

      el.addEventListener(
        "change",
        scheduleGenerate
      );
    });

  typeSelect.addEventListener(
    "change",
    renderForm
  );

  typeSearch.addEventListener(
    "input",
    () => fillTypes(typeSearch.value)
  );

  $("#generateBtn")
    .addEventListener(
      "click",
      generate
    );

  $("#saveBtn")
    .addEventListener(
      "click",
      saveProject
    );

  $("#downloadPng")
    .addEventListener(
      "click",
      () => download("png")
    );

  $("#downloadJpg")
    .addEventListener(
      "click",
      () => download("jpeg")
    );

  $("#downloadWebp")
    .addEventListener(
      "click",
      () => download("webp")
    );

  $("#printBtn")
    .addEventListener(
      "click",
      () => window.print()
    );

  $("#copyBtn")
    .addEventListener(
      "click",
      async () => {
        try {
          await navigator.clipboard.writeText(
            encode()
          );

          toast(
            "Encoded data copied.",
            "success"
          );
        } catch {
          toast(
            "Could not copy the encoded data.",
            "danger"
          );
        }
      }
    );

  $("#shareBtn")
    .addEventListener(
      "click",
      async () => {
        const data = encode();

        if (navigator.share) {
          await navigator.share({
            title:
              title.value ||
              selected.name,
            text: data
          }).catch(() => {});
        } else {
          try {
            await navigator.clipboard.writeText(data);

            toast(
              "Share unavailable; data copied.",
              "warning"
            );
          } catch {
            toast(
              "Sharing is unavailable.",
              "warning"
            );
          }
        }
      }
    );

  $("#duplicateBtn")
    .addEventListener(
      "click",
      () => {
        currentId = null;
        viewMode = false;

        title.value =
          `${title.value || selected.name} Copy`;

        applyViewMode();

        toast(
          "Ready as a new duplicate.",
          "success"
        );
      }
    );

  // -----------------------------------------------------
  // Initial page
  // -----------------------------------------------------

  fillTypes("");

  const params =
    new URLSearchParams(
      window.location.search
    );

  const requestedType =
    params.get("type");

  const editId =
    params.get("edit");

  const viewId =
    params.get("view");

  if (requestedType) {
    setTimeout(() => {
      if (
        QR_TYPES.some(
          x => x.id === requestedType
        )
      ) {
        fillTypes(
          "",
          requestedType
        );
      }
    }, 50);
  }

  if (editId) {
    setTimeout(
      () => loadProject(editId, false),
      120
    );
  }

  if (viewId) {
    setTimeout(
      () => loadProject(viewId, true),
      120
    );
  }
});
