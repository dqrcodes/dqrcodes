window.QREngine = (() => {

  let instance = null;

  let last = {
    data: "",
    style: {}
  };


  // =====================================================
  // DEFAULT QR OPTIONS
  // =====================================================

  const defaultOptions = {

    width: 330,

    height: 330,

    type: "canvas",

    data: "https://example.com",

    margin: 10,

    dotsOptions: {
      color: "#111827",
      type: "rounded"
    },

    backgroundOptions: {
      color: "#ffffff"
    },

    cornersSquareOptions: {
      color: "#111827",
      type: "extra-rounded"
    },

    cornersDotOptions: {
      color: "#111827",
      type: "dot"
    },

    qrOptions: {
      errorCorrectionLevel: "M"
    }

  };


  // =====================================================
  // BUILD QR OPTIONS
  // =====================================================

  function makeOptions(data, style = {}) {

    const o =
        structuredClone(defaultOptions);


    o.data =
        data || "https://example.com";


    o.width =
        Number(style.size || 330);


    o.height =
        Number(style.size || 330);


    o.margin =
        Number(
            style.margin ?? 10
        );


    // -----------------------------------------------
    // DOTS
    // -----------------------------------------------

    o.dotsOptions.color =
        style.fg || "#111827";


    o.dotsOptions.type =
        style.dots || "rounded";


    // -----------------------------------------------
    // BACKGROUND
    // -----------------------------------------------

    o.backgroundOptions.color =
        style.bg || "#ffffff";


    // -----------------------------------------------
    // CORNERS
    // -----------------------------------------------

    o.cornersSquareOptions.color =
        style.eye ||
        o.dotsOptions.color;


    o.cornersSquareOptions.type =
        style.eyeStyle ||
        "extra-rounded";


    o.cornersDotOptions.color =
        style.eye ||
        o.dotsOptions.color;


    o.cornersDotOptions.type =
        style.eyeDot ||
        "dot";


    // -----------------------------------------------
    // ERROR CORRECTION
    // -----------------------------------------------

    o.qrOptions.errorCorrectionLevel =
        style.ec || "M";


    // -----------------------------------------------
    // LOGO
    // -----------------------------------------------

    if (style.logo) {

      o.image =
          style.logo;

    }


    o.imageOptions = {

      crossOrigin: "anonymous",

      margin:
          Number(
              style.logoPadding || 6
          ),

      imageSize:
          Number(
              style.logoSize || 0.25
          ),

      hideBackgroundDots: true

    };


    return o;

  }


  // =====================================================
  // RENDER
  // =====================================================

  function render(
      el,
      data,
      style = {}
  ) {

    if (
        !window.QRCodeStyling
    ) {

      throw new Error(
          "QR library not loaded"
      );

    }


    if (!el) {

      throw new Error(
          "QR preview element not found"
      );

    }


    // Clear old QR

    el.innerHTML = "";


    // Create new QR

    instance =
        new QRCodeStyling(
            makeOptions(
                data,
                style
            )
        );


    instance.append(el);


    // -----------------------------------------------
    // IMPORTANT
    // Store the complete QR state
    // -----------------------------------------------

    last = {

      data:
          String(
              data || ""
          ),

      style:
          structuredClone(
              style || {}
          )

    };


    return instance;

  }


  // =====================================================
  // DOWNLOAD
  // =====================================================

  async function download(
      extension = "png",
      name = "qr-studio"
  ) {

    if (!instance) {

      throw new Error(
          "Generate a QR first"
      );

    }


    await instance.download({

      name,

      extension

    });

  }


  // =====================================================
  // GET CURRENT STATE
  // =====================================================

  function getState() {

    return {

      data:
      last.data,

      style:
          structuredClone(
              last.style || {}
          )

    };

  }


  // =====================================================
  // GET RAW PAYLOAD
  // =====================================================

  function getData() {

    return last.data || "";

  }


  // =====================================================
  // GET STYLE
  // =====================================================

  function getStyle() {

    return structuredClone(
        last.style || {}
    );

  }


  // =====================================================
  // RESTORE EXISTING QR
  // =====================================================

  function restore(
      el,
      project
  ) {

    if (!project) {

      throw new Error(
          "QR project not found"
      );

    }


    const payload =
        project.payload ||
        project.data ||
        "";


    const style =
        project.style ||
        {};


    return render(
        el,
        payload,
        style
    );

  }


  // =====================================================
  // PUBLIC API
  // =====================================================

  return {

    render,

    download,

    getState,

    getData,

    getStyle,

    restore

  };

})();