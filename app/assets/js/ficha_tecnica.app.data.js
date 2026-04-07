class FichaTecnicaApp {
  constructor() {
    this.data = null;
    this.currentUnit = null;
    this.fichaContainer = document.getElementById("fichaContainer");
    this.sistemaImagenes = new SistemaImagenes32Unidades();
    this.datosHistoricosCache = null;
    this.isExportingPdf = false;
  }

  start() {
    return this.init();
  }
}

Object.assign(FichaTecnicaApp.prototype, {
  async init() {
    try {
      await this.loadData();
      await this.cargarDatosHistoricos();

      const urlParams = new URLSearchParams(window.location.search);
      const unidadIndex = urlParams.get("unidad");

      if (unidadIndex !== null && !isNaN(unidadIndex)) {
        const index = parseInt(unidadIndex);
        // Índice 36 es OOAD (JSON separado)
        if (index === 36 || (index >= 0 && index < this.data.unidades.length)) {
          this.loadUnit(index);
        } else {
          this.showError("Unidad no encontrada");
        }
      } else {
        // Si no hay parámetro, cargar la primera unidad
        if (this.data.unidades.length > 0) {
          this.loadUnit(0);
        } else {
          this.showError("No hay unidades disponibles");
        }
      }
    } catch (error) {
      this.showError("Error al cargar los datos: " + error.message);
    }
  },

  async loadData() {
    try {
      // Cargar el JSON generado por el script Python
      // Agregar timestamp para evitar caché del navegador
      const timestamp = new Date().getTime();
      const response = await fetch(
        `../../data/output/fichas_completas_con_recursos.json?v=${timestamp}`,
      );
      if (!response.ok) {
        throw new Error("No se pudo cargar el archivo de datos");
      }
      this.data = await response.json();
    } catch (error) {
      // Si no se puede cargar el JSON, mostrar mensaje de error
      throw new Error(
        "Archivo fichas_completas_con_recursos.json no encontrado. Ejecute primero el script de Python.",
      );
    }
  },
  async loadOOADData() {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(
        `../../data/output/ficha_ooad_tabasco.json?v=${timestamp}`,
      );
      if (!response.ok) {
        throw new Error("No se pudo cargar el archivo de datos OOAD");
      }
      return await response.json();
    } catch (error) {
      throw new Error("Archivo ficha_ooad_tabasco.json no encontrado.");
    }
  },
  setupEventListeners() {
    // Comentar o eliminar el código del select
    /*
      this.unitSelect.addEventListener('change', (e) => {
          const selectedIndex = parseInt(e.target.value);
          if (!isNaN(selectedIndex) && this.data.unidades[selectedIndex]) {
              this.loadUnit(selectedIndex);
          }
      });
      */

    // Ya no hay event listeners necesarios
    console.log("Ficha técnica cargada desde mapa");
  },
  populateUnitSelect() {
    // Ya no se usa el select, esta función puede quedar vacía
    // o comentarse completamente
  },
  loadFirstUnit() {
    if (this.data.unidades.length > 0) {
      this.loadUnit(0);
    }
  },

  async loadUnit(index) {
    this.showLoading();

    setTimeout(async () => {
      try {
        // Si es índice 36, cargar OOAD
        if (index === 36) {
          this.currentUnit = await this.loadOOADData();
        } else {
          this.currentUnit = this.data.unidades[index];
        }
        this.renderFicha();
        this.hideLoading();
      } catch (error) {
        this.showError("Error al cargar la unidad: " + error.message);
        this.hideLoading();
      }
    }, 300); // Simular un pequeño delay para mejor UX
  },
  exportData() {
    if (!this.currentUnit) return;

    const unit = this.currentUnit;
    let csvContent = "Información General\\n";
    csvContent += `Unidad,${unit.informacion_general.nombre_unidad}\\n`;
    csvContent += `Zona,${unit.informacion_general.zona}\\n`;
    csvContent += `Municipio,${unit.informacion_general.municipio}\\n`;
    csvContent += `Responsable,${unit.informacion_general.responsable || "No disponible"}\\n`;
    csvContent += `\\nDatos Poblacionales\\n`;
    csvContent += `Población Total,${unit.poblacion_adscrita.total}\\n`;
    csvContent += `Titulares,${unit.poblacion_adscrita.titulares}\\n`;
    csvContent += `Beneficiarios,${unit.poblacion_adscrita.beneficiarios}\\n`;

    if (unit.piramide_poblacional) {
      csvContent += "\\nGrupo de Edad,Hombres,Mujeres,Total\\n";
      const pyramidData = this.preparePyramidData(unit.piramide_poblacional);
      pyramidData.forEach((item) => {
        csvContent += `${item.age},${item.male},${item.female},${item.total}\\n`;
      });
    }

    const blob = new Blob([csvContent], {
      type: "text/csv",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha_${unit.informacion_general.nombre_unidad.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  createMap() {
    var root = am5.Root.new("chartdivmap");

    root.setThemes([am5themes_Animated.new(root)]);

    var chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        projection: am5map.geoMercator(),
        layout: root.horizontalLayout,
      }),
    );

    var polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_mexicoLow,
        include: ["MX-TAB"],
      }),
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x679436),
    });

    var pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

    pointSeries.bullets.push(() => {
      var circle = am5.Circle.new(root, {
        radius: 5,
        tooltipY: 0,
        fill: am5.color(0xff0000),
        tooltipText: "{title}",
      });

      circle.events.on("click", (ev) => {
        const selectedIndex = ev.target.dataItem.dataContext.index;
        this.unitSelect.value = selectedIndex;
        this.loadUnit(selectedIndex);
      });

      return am5.Bullet.new(root, {
        sprite: circle,
      });
    });

    this.data.unidades.forEach((unidad, index) => {
      const infoUnidad =
        unidad.informacion_general.datos_administrativos_completos;
      if (infoUnidad && infoUnidad.Longitud && infoUnidad.Latitud) {
        pointSeries.data.push({
          geometry: {
            type: "Point",
            coordinates: [infoUnidad.Longitud, infoUnidad.Latitud],
          },
          title: unidad.informacion_general.nombre_unidad,
          index: index,
        });
      }
    });

    chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
  },

  formatNumber(number) {
    if (number === null || number === undefined || number === "") return "0";
    return parseInt(number).toLocaleString();
  },
  escapeHtmlAttr(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  },
  showLoading() {
    const overlay = document.getElementById("loadingOverlay");
    const container = document.getElementById("fichaContainer");
    if (overlay) overlay.style.display = "flex";
    if (container) container.style.display = "none";
  },
  hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    const container = document.getElementById("fichaContainer");
    if (overlay) overlay.style.display = "none";
    if (container) container.style.display = "block";
  },
  showError(message) {
    this.hideLoading();
    this.fichaContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center p-12" style="min-height:60vh;">
              <div class="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg w-full text-center shadow-sm">
                  <span class="material-symbols-outlined text-red-400 ms-fill" style="font-size:48px;">error</span>
                  <h3 class="text-lg font-bold text-red-700 mt-3 mb-2">Error al cargar</h3>
                  <p class="text-sm text-red-600">${message}</p>
              </div>
          </div>
      `;
  },
  toSafeFilename(value) {
    return String(value || "ficha_tecnica")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase();
  },
});

document.addEventListener("DOMContentLoaded", () => {
  window.ftApp = new FichaTecnicaApp();
  window.ftApp.start();
});

const printStyles = document.createElement("style");
printStyles.innerHTML = `
    @media print {
        .navbar { display: none !important; }
        .action-buttons { display: none !important; }
        body { margin: 0; padding: 0; }
        .ficha-container { box-shadow: none; margin: 0; }
        .pyramid-bar { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        .header, .population-section, .table-total {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
        }
        @page { margin: 1cm; }
    }
`;
document.head.appendChild(printStyles);
