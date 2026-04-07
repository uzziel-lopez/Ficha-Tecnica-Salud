Object.assign(FichaTecnicaApp.prototype, {
  async exportInstitutionalPDFModern() {
    const unit = this.currentUnit;
    if (!unit) throw new Error("No hay unidad activa para exportar.");

    await this.ensurePdfMakeLibraries();

    const info = unit.informacion_general || {};
    const admin = info.datos_administrativos_completos || {};
    const recursos = unit.recursos_para_la_salud || {};
    const poblacion = unit.poblacion_adscrita || {};
    const asegurada = unit.poblacion_asegurada || {};
    const historial =
      unit.datos_historicos || unit.productividad_historica || {};
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    const mesesHead = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const pick = (...vals) => {
      for (const v of vals) {
        if (v !== undefined && v !== null && String(v).trim() !== "") return v;
      }
      return "No disponible";
    };

    const formatNumber = (value, decimals = 0) => {
      const n = Number(value);
      if (!Number.isFinite(n)) {
        return decimals > 0
          ? (0).toLocaleString("es-MX", {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })
          : "0";
      }
      return n.toLocaleString("es-MX", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    };

    const toLabel = (key) =>
      String(key || "")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (c) => c.toUpperCase());

    const scalarPairsFromObject = (obj, prefix = "") => {
      if (!obj || typeof obj !== "object") return [];
      const out = [];

      Object.entries(obj).forEach(([k, v]) => {
        const label = prefix ? `${prefix} / ${toLabel(k)}` : toLabel(k);
        if (Array.isArray(v)) {
          if (!v.length) return;
          if (v.every((it) => typeof it !== "object" || it === null)) {
            out.push([label, v.join(", ")]);
          } else {
            out.push([label, `${v.length} elementos`]);
          }
          return;
        }
        if (v && typeof v === "object") {
          out.push(...scalarPairsFromObject(v, label));
          return;
        }
        if (v === null || v === undefined || String(v).trim() === "") return;
        out.push([label, String(v)]);
      });

      return out;
    };

    const collectMonthlyRows = (node, path = [], rows = []) => {
      if (!node || typeof node !== "object") return rows;

      const hasMonthKeys = meses.some((m) =>
        Object.prototype.hasOwnProperty.call(node, m),
      );
      if (hasMonthKeys) {
        const values = meses.map((m) => {
          const value = node[m];
          if (value && typeof value === "object") {
            if (Number.isFinite(Number(value.total)))
              return Number(value.total);
            const numericChild = Object.values(value).find((x) =>
              Number.isFinite(Number(x)),
            );
            return Number(numericChild || 0);
          }
          return Number(value || 0);
        });
        const total = values.reduce((sum, n) => sum + n, 0);
        rows.push([path.join(" / ") || "Total", ...values, total]);
      }

      Object.entries(node).forEach(([k, v]) => {
        if (meses.includes(k)) return;
        if (v && typeof v === "object") {
          collectMonthlyRows(v, [...path, toLabel(k)], rows);
        }
      });

      return rows;
    };

    const kvTable = (title, pairs, cols = [110, "*", 110, "*"]) => {
      if (!pairs.length) return [];
      const rows = [];
      for (let i = 0; i < pairs.length; i += 2) {
        const a = pairs[i] || ["", ""];
        const b = pairs[i + 1] || ["", ""];
        rows.push([
          { text: a[0], style: "kvLabel" },
          { text: String(a[1]), style: "kvValue" },
          { text: b[0], style: "kvLabel" },
          { text: String(b[1]), style: "kvValue" },
        ]);
      }
      return [
        { text: title, style: "sectionSubtitle", margin: [0, 10, 0, 6] },
        {
          table: { widths: cols, body: rows },
          layout: {
            hLineColor: () => "#dde4de",
            vLineColor: () => "#dde4de",
            hLineWidth: () => 0.7,
            vLineWidth: () => 0.7,
            paddingTop: () => 6,
            paddingBottom: () => 6,
            paddingLeft: () => 8,
            paddingRight: () => 8,
          },
        },
      ];
    };

    const nombreUnidad = pick(info.nombre_unidad, "Unidad IMSS");
    const filename = `ficha_tecnica_${this.toSafeFilename(nombreUnidad)}_${new Date().toISOString().slice(0, 10)}.pdf`;

    const infoPairs = [
      ["Unidad", nombreUnidad],
      ["Tipo de Unidad", pick(info.tipo_unidad)],
      ["Responsable de Unidad", pick(info.responsable)],
      ["Cargo", pick(info.cargo)],
      ["CLUES", pick(info.clues)],
      ["Domicilio", pick(admin.domicilio, info.domicilio, info["Dirección"])],
      ["Jurisdiccion Sanitaria", pick(info.jurisdiccion)],
      ["Clave Personal", pick(info["Clave Personal"], admin["Clave Personal"])],
      [
        "Inicio de Productividad",
        pick(info["Inicio de Productividad"], admin["Inicio de Productividad"]),
      ],
      [
        "Unidad PREI",
        pick(info["Unidad de Información PREI"], info.unidad_prei),
      ],
      ["Zona / Turno", pick(info.zona, info.turno)],
      ["Delegacion", pick(info.delegacion, admin.delegacion, "Tabasco")],
      ["Nivel de Atencion", pick(info.nivel_atencion)],
      ["Estatus", pick(info.estatus, "ACTIVO")],
      ["Longitud", pick(info.Longitud, info.longitud, admin.longitud)],
      ["Latitud", pick(info.Latitud, info.latitud, admin.latitud)],
      [
        "Sup. Terreno",
        pick(
          info["Superficie total en metros cuadrados"],
          info.superficie_terreno,
        ),
      ],
      [
        "Sup. Construida",
        pick(
          info["Superficie construida en metros cuadrados"],
          info.superficie_construida,
        ),
      ],
      ["Clave Presupuestal", pick(info.clave_presupuestal)],
    ];

    const kpiRows = [
      ["Poblacion Total", formatNumber(poblacion.total)],
      ["Titulares", formatNumber(poblacion.titulares)],
      ["Beneficiarios", formatNumber(poblacion.beneficiarios)],
      ["Adscritos a MF", formatNumber(poblacion.medico_familiar)],
      ["Riesgos de Trabajo", formatNumber(asegurada.riesgos_trabajo)],
      ["Enf. y Maternidad", formatNumber(asegurada.enfermedad_maternidad)],
      ["Invalidez", formatNumber(asegurada.invalidez)],
      ["Trabajadores IMSS", formatNumber(asegurada.trabajadores_imss)],
    ];

    const piramide = this.preparePyramidData(unit.piramide_poblacional || []);
    const totalPiramide =
      piramide.reduce((sum, it) => sum + Number(it.total || 0), 0) || 1;
    const piramideBody = [
      [
        { text: "Grupo", style: "th" },
        { text: "Hombres", style: "th" },
        { text: "Mujeres", style: "th" },
        { text: "Total", style: "th" },
        { text: "%", style: "th" },
      ],
      ...piramide.map((it) => [
        { text: it.age || "No especificada", style: "td" },
        { text: formatNumber(it.male), style: "tdNum" },
        { text: formatNumber(it.female), style: "tdNum" },
        { text: formatNumber(it.total), style: "tdNum" },
        {
          text: `${formatNumber((Number(it.total || 0) / totalPiramide) * 100, 2)}%`,
          style: "tdNum",
        },
      ]),
    ];

    const equipos = recursos.equipos_diagnostico || {};
    const procedimientos = recursos.procedimientos_especiales || {};
    const hemodialisis = recursos.hemodialisis || {};
    const inventarioEquipos = [
      [
        "Lab. Clinico (Peines)",
        equipos.peine_laboratorio_clinico,
        "Diagnostico",
      ],
      ["Rayos X Fijo", equipos.rayos_x_fijos, "Diagnostico"],
      ["Rayos X Transportable", equipos.rayos_x_transportable, "Diagnostico"],
      ["Mastografo Digital", equipos.mastografo_digital, "Diagnostico"],
      ["Electrocardiografo", equipos.electrocardiografo, "Diagnostico"],
      ["Electromiografo", equipos.electromiografo, "Diagnostico"],
      ["Electroencefalografo", equipos.electroencefalografo, "Diagnostico"],
      ["Ecocardiografo", equipos.ecocardiografo, "Diagnostico"],
      ["Tomografo", equipos.tomografos, "Tomografia"],
      [
        "Proc. Quirurgicos",
        procedimientos.procedimientos_quirurgicos,
        "Sala Proc.",
      ],
      ["Endoscopia Altas", procedimientos.endoscopia_altas, "Sala Proc."],
      ["Endoscopia Bajas", procedimientos.endoscopia_bajas, "Sala Proc."],
      ["Radiodiagnostico", procedimientos.radiodiagnostico, "Sala Proc."],
      [
        "Maquinas Hemodialisis",
        hemodialisis.maquinas_hemodialisis,
        "Hemodialisis",
      ],
      [
        "Areas de Hemodialisis",
        hemodialisis.areas_hemodialisis,
        "Hemodialisis",
      ],
    ].filter(([, v]) => Number(v) > 0);

    const recursosFlat = scalarPairsFromObject(recursos);
    const monthlyRows = collectMonthlyRows(historial).slice(0, 140);

    const motivos = unit.motivos_atencion || {};
    const motivosCategorias = [
      ["Medicina Familiar", motivos.medicina_familiar || []],
      ["Urgencias", motivos.urgencias || []],
      ["Especialidades", motivos.especialidades || []],
      ["Egresos", motivos.egresos || []],
      ["Procedimientos Quirurgicos", motivos.procedimientos_quirurgicos || []],
    ].filter(([, list]) => Array.isArray(list) && list.length);

    const content = [
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                stack: [
                  {
                    text: "Instituto Mexicano del Seguro Social",
                    style: "coverEyebrow",
                  },
                  { text: "Ficha Tecnica Institucional", style: "coverTitle" },
                  {
                    text: `${nombreUnidad} · ${pick(info.tipo_unidad)}`,
                    style: "coverSubtitle",
                  },
                  {
                    columns: [
                      {
                        text: `Clave Presupuestal\n${pick(info.clave_presupuestal)}`,
                        style: "coverMeta",
                      },
                      {
                        text: `CLUES\n${pick(info.clues)}`,
                        style: "coverMeta",
                      },
                      {
                        text: `Municipio\n${pick(info.municipio, admin.municipio)}`,
                        style: "coverMeta",
                      },
                      {
                        text: `Generado\n${new Date().toLocaleString("es-MX")}`,
                        style: "coverMeta",
                      },
                    ],
                    columnGap: 8,
                    margin: [0, 12, 0, 0],
                  },
                ],
              },
            ],
          ],
        },
        layout: {
          fillColor: () => "#1C4D32",
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingTop: () => 18,
          paddingBottom: () => 18,
          paddingLeft: () => 18,
          paddingRight: () => 18,
        },
        margin: [0, 0, 0, 14],
      },
      { text: "Informacion General y Operativa", style: "sectionTitle" },
      ...kvTable("Datos clave de la unidad", infoPairs),
    ];

    content.push(
      {
        text: "Poblacion y Perfil Demografico",
        style: "sectionTitle",
        margin: [0, 14, 0, 6],
      },
      {
        table: {
          widths: ["*", "*", "*", "*"],
          body: [
            kpiRows.slice(0, 4).map(([k, v]) => ({
              stack: [
                { text: k, style: "kpiLabel" },
                { text: v, style: "kpiValue" },
              ],
              fillColor: "#eef4ef",
            })),
            kpiRows.slice(4, 8).map(([k, v]) => ({
              stack: [
                { text: k, style: "kpiLabel" },
                { text: v, style: "kpiValue" },
              ],
              fillColor: "#f8f1f1",
            })),
          ],
        },
        layout: {
          hLineColor: () => "#dde4de",
          vLineColor: () => "#dde4de",
          hLineWidth: () => 0.7,
          vLineWidth: () => 0.7,
          paddingTop: () => 10,
          paddingBottom: () => 10,
          paddingLeft: () => 10,
          paddingRight: () => 10,
        },
        margin: [0, 0, 0, 10],
      },
      {
        text: "Piramide poblacional (tabla completa)",
        style: "sectionSubtitle",
      },
      {
        table: {
          headerRows: 1,
          widths: [130, "*", "*", "*", 70],
          body: piramideBody,
        },
        layout: "lightHorizontalLines",
      },
    );

    content.push(
      {
        text: "Recursos para la Salud",
        style: "sectionTitle",
        margin: [0, 14, 0, 6],
        pageBreak: "before",
      },
      ...kvTable("Consolidado de recursos (sin truncar)", recursosFlat),
    );

    if (inventarioEquipos.length) {
      content.push(
        { text: "Equipamiento medico detallado", style: "sectionSubtitle" },
        {
          table: {
            headerRows: 1,
            widths: ["*", 70, 120],
            body: [
              [
                { text: "Equipo", style: "th" },
                { text: "Cantidad", style: "th" },
                { text: "Categoria", style: "th" },
              ],
              ...inventarioEquipos.map(([name, value, cat]) => [
                { text: name, style: "td" },
                { text: formatNumber(value), style: "tdNum" },
                { text: cat, style: "td" },
              ]),
            ],
          },
          layout: "lightHorizontalLines",
        },
      );
    }

    if (monthlyRows.length) {
      content.push(
        {
          text: "Productividad e indicadores mensuales",
          style: "sectionTitle",
          margin: [0, 14, 0, 6],
          pageBreak: "before",
        },
        {
          table: {
            headerRows: 1,
            widths: [170, ...new Array(12).fill(34), 45],
            body: [
              [
                { text: "Indicador", style: "th" },
                ...mesesHead.map((m) => ({ text: m, style: "th" })),
                { text: "Total", style: "th" },
              ],
              ...monthlyRows.map((row) => [
                { text: row[0], style: "td" },
                ...row
                  .slice(1, 13)
                  .map((v) => ({ text: formatNumber(v), style: "tdNum" })),
                { text: formatNumber(row[13]), style: "tdNumBold" },
              ]),
            ],
          },
          layout: "lightHorizontalLines",
        },
      );
    }

    if (motivosCategorias.length) {
      content.push({
        text: "Motivos de atencion",
        style: "sectionTitle",
        margin: [0, 14, 0, 6],
        pageBreak: "before",
      });
      motivosCategorias.forEach(([title, list]) => {
        content.push(
          { text: title, style: "sectionSubtitle" },
          {
            table: {
              headerRows: 1,
              widths: [30, "*", 80],
              body: [
                [
                  { text: "#", style: "th" },
                  { text: "Descripcion", style: "th" },
                  { text: "Total", style: "th" },
                ],
                ...list.slice(0, 25).map((item, idx) => [
                  { text: String(idx + 1), style: "tdNum" },
                  { text: item.descripcion || "Sin descripcion", style: "td" },
                  { text: formatNumber(item.total), style: "tdNumBold" },
                ]),
              ],
            },
            layout: "lightHorizontalLines",
            margin: [0, 0, 0, 8],
          },
        );
      });
    }

    const docDefinition = {
      pageSize: "A4",
      pageOrientation: "landscape",
      pageMargins: [18, 16, 18, 18],
      footer: (currentPage, pageCount) => ({
        columns: [
          { text: `IMSS OOAD Tabasco · ${nombreUnidad}`, alignment: "left" },
          { text: `Pagina ${currentPage} de ${pageCount}`, alignment: "right" },
        ],
        margin: [18, 4, 18, 0],
        color: "#5a635c",
        fontSize: 8,
      }),
      content,
      styles: {
        coverEyebrow: { fontSize: 9, color: "#d2e4d9", bold: true },
        coverTitle: {
          fontSize: 28,
          color: "#ffffff",
          bold: true,
          margin: [0, 6, 0, 0],
        },
        coverSubtitle: { fontSize: 12, color: "#eaf3ed", margin: [0, 4, 0, 0] },
        coverMeta: {
          fontSize: 10,
          color: "#ffffff",
          bold: true,
          lineHeight: 1.3,
        },
        sectionTitle: {
          fontSize: 17,
          bold: true,
          color: "#1C4D32",
          margin: [0, 0, 0, 4],
        },
        sectionSubtitle: { fontSize: 12, bold: true, color: "#2f3a33" },
        kvLabel: { fontSize: 9, color: "#5b665f", bold: true },
        kvValue: { fontSize: 10, color: "#191c1b" },
        kpiLabel: { fontSize: 9, color: "#5b665f", bold: true },
        kpiValue: {
          fontSize: 14,
          color: "#1C4D32",
          bold: true,
          margin: [0, 2, 0, 0],
        },
        th: { fontSize: 9, bold: true, color: "#1f2722" },
        td: { fontSize: 9, color: "#191c1b" },
        tdNum: { fontSize: 9, alignment: "right", color: "#191c1b" },
        tdNumBold: {
          fontSize: 9,
          alignment: "right",
          bold: true,
          color: "#1C4D32",
        },
      },
      defaultStyle: {
        fontSize: 9,
        color: "#191c1b",
      },
    };

    window.pdfMake.createPdf(docDefinition).download(filename);
  },
  async exportInstitutionalPDFServer() {
    const urlParams = new URLSearchParams(window.location.search);
    const unidad = urlParams.get("unidad") || "0";
    const pdfConfig = {
      scale: 0.6,
      page2Scale: 0.5,
      marginTopMm: 8,
      marginRightMm: 7,
      marginBottomMm: 10,
      marginLeftMm: 7,
      media: "print",
    };

    const endpointParams = new URLSearchParams({
      unidad: String(unidad),
      scale: String(pdfConfig.scale),
      marginTopMm: String(pdfConfig.marginTopMm),
      marginRightMm: String(pdfConfig.marginRightMm),
      marginBottomMm: String(pdfConfig.marginBottomMm),
      marginLeftMm: String(pdfConfig.marginLeftMm),
      media: String(pdfConfig.media || "print"),
    });

    if (
      pdfConfig.page2Scale !== undefined &&
      pdfConfig.page2Scale !== null &&
      pdfConfig.page2Scale !== ""
    ) {
      endpointParams.set("page2Scale", String(pdfConfig.page2Scale));
    }

    const endpoint = `api/export_ficha_pdf.php?${endpointParams.toString()}`;

    const ua = navigator.userAgent || "";
    const isIOS =
      /iPad|iPhone|iPod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const isCoarsePointer =
      window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const supportsDownloadAttr =
      typeof HTMLAnchorElement !== "undefined" &&
      "download" in HTMLAnchorElement.prototype;

    // En moviles (especialmente iOS Safari) el flujo fetch+blob+a[download]
    // suele bloquearse. Se usa navegacion directa para que el navegador
    // maneje el PDF nativamente (descargar/abrir/compartir).
    if (isIOS || isAndroid || isCoarsePointer || !supportsDownloadAttr) {
      window.location.assign(endpoint);
      return;
    }

    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      let details = "";
      try {
        const data = await response.json();
        details = data?.message || "";
      } catch (e) {
        details = await response.text();
      }
      throw new Error(
        details || `No fue posible generar el PDF (HTTP ${response.status}).`,
      );
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error("El servicio devolvio un PDF vacio.");
    }

    const cd = response.headers.get("Content-Disposition") || "";
    const match = cd.match(/filename="?([^";]+)"?/i);
    const fallbackName = `ficha_tecnica_${this.toSafeFilename(this.currentUnit?.informacion_general?.nombre_unidad || "unidad")}.pdf`;
    const filename = match?.[1] || fallbackName;

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
  },
  async ensurePdfMakeLibraries() {
    if (window.pdfMake && typeof window.pdfMake.createPdf === "function") {
      return;
    }

    await this.loadExternalScript([
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js",
      "https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/pdfmake.min.js",
      "https://unpkg.com/pdfmake@0.2.10/build/pdfmake.min.js",
    ]);

    await this.loadExternalScript([
      "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.min.js",
      "https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/vfs_fonts.min.js",
      "https://unpkg.com/pdfmake@0.2.10/build/vfs_fonts.min.js",
    ]);

    if (!window.pdfMake || typeof window.pdfMake.createPdf !== "function") {
      throw new Error("No se pudo inicializar pdfmake.");
    }
  },
  async exportInstitutionalPDFLegacy() {
    if (!this.currentUnit) return;
    if (this.isExportingPdf) return;

    this.isExportingPdf = true;
    const previousTitle = document.title;
    const overlay = document.getElementById("loadingOverlay");
    let cover = null;
    let shell = null;
    const patchedEllipsis = [];
    let restorePdfLayout = null;

    try {
      if (overlay) {
        overlay.style.display = "flex";
        overlay.innerHTML = `<div class="w-9 h-9 border-4 border-primary border-t-transparent rounded-full" style="animation:spin .9s linear infinite;"></div><p class="mt-3 text-sm font-medium text-on-muted">Generando PDF institucional...</p>`;
      }
      await new Promise((resolve) => setTimeout(resolve, 120));

      await this.ensurePdfLibraries();

      shell = document.querySelector(".ft-shell");
      if (!shell)
        throw new Error(
          "No se encontro el contenido de la ficha para exportar.",
        );
      if (typeof window.html2canvas !== "function") {
        throw new Error("No se pudo cargar html2canvas.");
      }
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error("No se pudo cargar jsPDF.");
      }

      cover = this.buildPdfInstitutionalCover();
      shell.prepend(cover);

      shell
        .querySelectorAll(".ft-section, .productividad-section, table, tr")
        .forEach((el) => {
          el.classList.add("pdf-avoid-break");
        });

      restorePdfLayout = this.preparePdfLayout(shell);

      shell.querySelectorAll(".ft-ellipsis-cell").forEach((cell) => {
        patchedEllipsis.push({
          el: cell,
          whiteSpace: cell.style.whiteSpace,
          overflow: cell.style.overflow,
          textOverflow: cell.style.textOverflow,
        });
        cell.style.whiteSpace = "normal";
        cell.style.overflow = "visible";
        cell.style.textOverflow = "clip";
      });

      await this.waitForImages(shell);
      await this.waitForFonts();

      const unitName =
        this.currentUnit?.informacion_general?.nombre_unidad || "ficha_tecnica";
      const safeName = this.toSafeFilename(unitName);
      const filename = `ficha_tecnica_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;

      document.title = `Ficha Tecnica - ${unitName}`;

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const footerHeight = 5;
      const contentWidth = pageWidth - margin * 2;
      const maxContentHeight = pageHeight - margin * 2 - footerHeight;
      let cursorY = margin;

      const blocks = this.getPdfBlocks(shell, cover);
      console.group("PDF Export Debug");
      console.log("html2canvas:", typeof window.html2canvas === "function");
      console.log("jsPDF:", !!window.jspdf?.jsPDF);
      console.log("shell size:", shell.offsetWidth, shell.offsetHeight);
      console.log("blocks:", blocks.length);

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const canvas = await this.captureCanvasForPdf(block);
        const result = this.drawCanvasInPdf(pdf, canvas, {
          pageWidth,
          pageHeight,
          margin,
          contentWidth,
          maxContentHeight,
          cursorY,
        });
        cursorY = result.cursorY;
      }

      const pageCount = pdf.internal.getNumberOfPages();
      console.log("pdf pages:", pageCount);
      console.groupEnd();

      for (let page = 1; page <= pageCount; page++) {
        pdf.setPage(page);
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(
          `IMSS OOAD Tabasco · Ficha Tecnica · Pagina ${page} de ${pageCount}`,
          10,
          290,
        );
      }

      pdf.save(filename);
    } catch (error) {
      console.error("Error exportando PDF:", error);
      alert(
        "No fue posible generar el PDF institucional. Verifique conexion y vuelva a intentar.",
      );
    } finally {
      if (cover && cover.parentNode) {
        cover.parentNode.removeChild(cover);
      }

      patchedEllipsis.forEach(({ el, whiteSpace, overflow, textOverflow }) => {
        el.style.whiteSpace = whiteSpace;
        el.style.overflow = overflow;
        el.style.textOverflow = textOverflow;
      });

      if (typeof restorePdfLayout === "function") {
        restorePdfLayout();
      }

      if (shell) {
        shell
          .querySelectorAll(".pdf-avoid-break")
          .forEach((el) => el.classList.remove("pdf-avoid-break"));
      }

      this.isExportingPdf = false;
      document.title = previousTitle;
      if (overlay) {
        overlay.style.display = "none";
        overlay.innerHTML = `<div class="w-9 h-9 border-4 border-primary border-t-transparent rounded-full" style="animation:spin .9s linear infinite;"></div><p class="mt-3 text-sm font-medium text-on-muted">Cargando ficha técnica...</p>`;
      }
    }
  },
  preparePdfLayout(shell) {
    const patched = [];

    const overflowSelectors = [
      ".productividad-table-container",
      ".demog-table-wrap",
      ".res-grid-mid",
      ".recurso-card .card-data",
      '[style*="overflow-y:auto"]',
      '[style*="overflow-y: auto"]',
      '[style*="overflow-x:auto"]',
      '[style*="overflow-x: auto"]',
      '[style*="overflow:auto"]',
      '[style*="overflow: auto"]',
    ];

    shell.querySelectorAll(overflowSelectors.join(",")).forEach((el) => {
      patched.push({
        el,
        overflow: el.style.overflow,
        overflowX: el.style.overflowX,
        overflowY: el.style.overflowY,
        width: el.style.width,
        maxWidth: el.style.maxWidth,
        height: el.style.height,
        maxHeight: el.style.maxHeight,
      });

      el.style.overflow = "visible";
      el.style.overflowX = "visible";
      el.style.overflowY = "visible";
      el.style.height = "auto";
      el.style.maxHeight = "none";

      const table = el.querySelector("table");
      if (table && table.scrollWidth > el.clientWidth) {
        el.style.width = table.scrollWidth + "px";
        el.style.maxWidth = table.scrollWidth + "px";
      }
    });

    shell.querySelectorAll("table").forEach((table) => {
      patched.push({
        el: table,
        tableLayout: table.style.tableLayout,
        width: table.style.width,
      });
      table.style.width = "100%";
      if (!table.style.tableLayout) {
        table.style.tableLayout = "auto";
      }
    });

    return () => {
      patched.forEach((item) => {
        const { el } = item;
        if ("overflow" in item) {
          el.style.overflow = item.overflow;
          el.style.overflowX = item.overflowX;
          el.style.overflowY = item.overflowY;
          el.style.width = item.width;
          el.style.maxWidth = item.maxWidth;
          el.style.height = item.height;
          el.style.maxHeight = item.maxHeight;
        }
        if ("tableLayout" in item) {
          el.style.tableLayout = item.tableLayout;
          el.style.width = item.width;
        }
      });
    };
  },
  async ensurePdfLibraries() {
    if (typeof window.html2canvas !== "function") {
      await this.loadExternalScript([
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
        "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
        "https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js",
      ]);
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
      await this.loadExternalScript([
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
        "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
        "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js",
      ]);
    }
  },
  async loadExternalScript(urls) {
    let lastError = null;

    for (const url of urls) {
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = url;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = (err) =>
            reject(err || new Error(`No se pudo cargar: ${url}`));
          document.head.appendChild(script);
        });
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("No fue posible cargar las librerias de PDF.");
  },
  getPdfBlocks(shell, cover) {
    const blocks = [];
    if (cover) blocks.push(cover);

    Array.from(shell.children).forEach((child) => {
      if (child === cover) return;
      if (child.tagName === "SCRIPT") return;
      blocks.push(child);
    });

    return blocks;
  },
  async captureCanvasForPdf(element) {
    const width = Math.max(element.scrollWidth, element.clientWidth, 900);
    const height = Math.max(element.scrollHeight, element.clientHeight, 500);
    return window.html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#f8faf8",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
    });
  },
  drawCanvasInPdf(pdf, canvas, metrics) {
    const { margin, contentWidth, maxContentHeight, cursorY } = metrics;

    const ratio = contentWidth / canvas.width;
    const fullHeightMm = canvas.height * ratio;
    let y = cursorY;

    if (fullHeightMm <= maxContentHeight - (y - margin)) {
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        y,
        contentWidth,
        fullHeightMm,
        undefined,
        "FAST",
      );
      return {
        cursorY: y + fullHeightMm + 2,
      };
    }

    const availableHeightMm = maxContentHeight;
    const sliceHeightPx = Math.max(600, Math.floor(availableHeightMm / ratio));
    let sourceY = 0;
    let firstSlice = true;

    while (sourceY < canvas.height) {
      const remaining = canvas.height - sourceY;
      const currentSlicePx = Math.min(sliceHeightPx, remaining);

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = currentSlicePx;
      const ctx = sliceCanvas.getContext("2d");
      if (!ctx) {
        return { cursorY: margin };
      }
      ctx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        currentSlicePx,
        0,
        0,
        canvas.width,
        currentSlicePx,
      );

      const sliceHeightMm = currentSlicePx * ratio;
      if (!firstSlice) {
        pdf.addPage();
        y = margin;
      } else if (y !== margin) {
        pdf.addPage();
        y = margin;
      }

      const imgData = sliceCanvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        y,
        contentWidth,
        sliceHeightMm,
        undefined,
        "FAST",
      );

      sourceY += currentSlicePx;
      firstSlice = false;
    }

    return {
      cursorY: margin,
    };
  },
  async waitForImages(rootElement) {
    const images = Array.from(rootElement.querySelectorAll("img"));
    if (!images.length) return;

    const waits = images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
        setTimeout(done, 2500);
      });
    });

    await Promise.all(waits);
  },
  async waitForFonts() {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        // noop
      }
    }
  },
  buildPdfInstitutionalCover() {
    const info = this.currentUnit?.informacion_general || {};
    const now = new Date();
    const dateText = now.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const timeText = now.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const cover = document.createElement("section");
    cover.className = "pdf-export-cover";
    cover.innerHTML = `
          <h1>Ficha Tecnica Institucional</h1>
          <p>Instituto Mexicano del Seguro Social · OOAD Tabasco</p>
          <div class="pdf-export-meta">
              <div class="item">
                  <span class="label">Unidad</span>
                  <span class="value">${info.nombre_unidad || "No disponible"}</span>
              </div>
              <div class="item">
                  <span class="label">Tipo</span>
                  <span class="value">${info.tipo_unidad || "No disponible"}</span>
              </div>
              <div class="item">
                  <span class="label">Clave Presupuestal</span>
                  <span class="value">${info.clave_presupuestal || "No disponible"}</span>
              </div>
              <div class="item">
                  <span class="label">Generado</span>
                  <span class="value">${dateText} ${timeText}</span>
              </div>
          </div>
      `;
    return cover;
  },
  async exportInstitutionalPDF() {
    if (!this.currentUnit) return;
    if (this.isExportingPdf) return;
    this.isExportingPdf = true;

    const pdfButtons = document.querySelectorAll(
      '[onclick*="exportInstitutionalPDF"]',
    );
    const buttonLabels = [];
    pdfButtons.forEach((btn, idx) => {
      buttonLabels[idx] = btn.innerHTML;
      btn.disabled = true;
      btn.style.opacity = "0.65";
      btn.style.cursor = "not-allowed";
      btn.innerHTML =
        '<span class="material-symbols-outlined" style="font-size:16px;">hourglass_top</span> Generando...';
    });

    try {
      await this.exportInstitutionalPDFServer();
      return;
    } catch (error) {
      console.warn(
        "[PDF] Export server-side fallo, se usa fallback legado:",
        error,
      );
      this.isExportingPdf = false;
      await this.exportInstitutionalPDFLegacy();
      return;
    } finally {
      this.isExportingPdf = false;
      pdfButtons.forEach((btn, idx) => {
        btn.disabled = false;
        btn.style.opacity = "";
        btn.style.cursor = "";
        btn.innerHTML = buttonLabels[idx];
      });
    }
  },
});
