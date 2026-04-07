const MESES_ABREV = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

const MESES_COMPLETOS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const MESES_COMPLETOS_MAYUS = MESES_COMPLETOS.map((mes) =>
  mes.toLocaleUpperCase("es-MX"),
);

Object.assign(FichaTecnicaApp.prototype, {
  renderProductividadMedicinaFamiliarOOAD(unidad) {
    const productividad = unidad.productividad_medicina_familiar_consolidada;
    if (!productividad) {
      return "";
    }

    const indicadores = [
      "Total de Consultas de la Unidad",
      "Consultas de Medicina Familiar",
      "Consultas de M.F. fin de semana",
      "Consultas Aten 1ra. Vez",
      "Consultas de M.F. Subsecuentes",
    ];

    const mesesAbrev = MESES_ABREV;
    const mesesCompletos = MESES_COMPLETOS;

    let filasHTML = indicadores
      .map((indicador) => {
        const datos = productividad[indicador];
        if (!datos) {
          return `
                  <tr>
                      <td class="indicator-name">${indicador}</td>
                      ${mesesCompletos.map(() => '<td class="data-cell">0</td>').join("")}
                      <td class="total-cell">0</td>
                  </tr>
              `;
        }

        const celdasMeses = mesesCompletos
          .map((mes) => {
            const valor = datos.meses[mes] || 0;
            return `<td class="data-cell">${this.formatNumber(valor)}</td>`;
          })
          .join("");

        return `
              <tr>
                  <td class="indicator-name">${indicador}</td>
                  ${celdasMeses}
                  <td class="total-cell">${this.formatNumber(datos.total_acumulado || 0)}</td>
              </tr>
          `;
      })
      .join("");

    return `
              <div class="productividad-header">
                  <h2>PRODUCTIVIDAD DE MEDICINA FAMILIAR (CONSOLIDADA)</h2>
              </div>
              <div class="productividad-table-container">
                  <table class="productividad-table">
                      <thead>
                          <tr>
                              <th class="indicator-column">INDICADOR</th>
                              ${mesesAbrev.map((mes) => `<th>${mes}</th>`).join("")}
                              <th class="total-column">TOTAL ACUM.</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${filasHTML}
                      </tbody>
                  </table>
              </div>
      `;
  },

  renderProductividadServiciosOOAD(unidad) {
    const productividad = unidad.productividad_servicios_consolidada;
    if (!productividad) {
      return "";
    }

    const servicios = [
      "ESTOMATOLOGIA",
      "SALUD EN EL TRABAJO",
      "ATENCION MEDICA CONTINUA - URGENCIAS",
      "CENTRO DE ATENCION A LA DIABETES EN EL IMSS (CADIMSS)",
      "PLANIFICACION FAMILIAR",
      "NUTRICION Y DIETETICA",
      "TRABAJO SOCIAL",
      "MEDICINA PREVENTIVA",
      "ENFERMERA ESPECIALISTA EN MEDICINA FAMILIAR",
    ];

    const mesesAbrev = MESES_ABREV;
    const mesesCompletos = MESES_COMPLETOS;

    let filasHTML = servicios
      .map((servicio) => {
        const datos = productividad[servicio];
        if (!datos) {
          return `
                  <tr>
                      <td class="indicator-name">${servicio}</td>
                      ${mesesCompletos.map(() => '<td class="data-cell">0</td>').join("")}
                      <td class="total-cell">0</td>
                  </tr>
              `;
        }

        const celdasMeses = mesesCompletos
          .map((mes) => {
            const valor = datos.meses[mes] || 0;
            return `<td class="data-cell">${this.formatNumber(valor)}</td>`;
          })
          .join("");

        return `
              <tr>
                  <td class="indicator-name">${servicio}</td>
                  ${celdasMeses}
                  <td class="total-cell">${this.formatNumber(datos.total_acumulado || 0)}</td>
              </tr>
          `;
      })
      .join("");

    return `
              <div class="productividad-header">
                  <h2>PRODUCTIVIDAD DE LOS SERVICIOS (CONSOLIDADA)</h2>
              </div>
              <div class="productividad-table-container">
                  <table class="productividad-table">
                      <thead>
                          <tr>
                              <th class="indicator-column">SERVICIO</th>
                              ${mesesAbrev.map((mes) => `<th>${mes}</th>`).join("")}
                              <th class="total-column">TOTAL ACUM.</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${filasHTML}
                      </tbody>
                  </table>
              </div>
      `;
  },

  renderProductividadMedicinaFamiliar(unidad) {
    const tipoUnidad = unidad.informacion_general?.tipo_unidad || "";
    // OOAD usa datos consolidados pre-calculados
    if (tipoUnidad === "OOAD") {
      return this.renderProductividadMedicinaFamiliarOOAD(unidad);
    }
    if (
      tipoUnidad !== "Unidad de Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Subzona con Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Subzona"
    ) {
      return "";
    }

    // Obtener clave presupuestal: primero desde datos_administrativos_completos, sino desde clave_presupuestal
    let clavePresupuestal = unidad.informacion_general?.clave_presupuestal;
    if (
      unidad.informacion_general?.datos_administrativos_completos?.[
        "Clave Presupuestal"
      ]
    ) {
      clavePresupuestal = String(
        unidad.informacion_general.datos_administrativos_completos[
          "Clave Presupuestal"
        ],
      );
    }
    const datosHistoricos = this.obtenerDatosHistoricos();

    const indicadores = [
      "Total de Consultas de la Unidad",
      "Consultas de Medicina Familiar",
      "Consultas de M.F. fin de semana",
      "Consultas Aten 1ra. Vez",
      "Consultas de M.F. Subsecuentes",
    ];

    return `
      <div class="productividad-section">
          <div class="productividad-header">
              <span class="material-symbols-outlined" style="color:#1C4D32; font-size:26px;">medical_services</span>
              <h2>PRODUCTIVIDAD DE MEDICINA FAMILIAR</h2>
              <span style="margin-left:auto; padding:4px 12px; background:#e6e9e7; border-radius:99px; font-size:10px; font-weight:700; color:#414942; text-transform:uppercase; letter-spacing:.08em;">Ciclo ${new Date().getFullYear()}</span>
          </div>
          
          <div class="productividad-table-container">
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column">INDICADOR</th>
                          <th>ENE</th><th>FEB</th><th>MAR</th><th>ABR</th><th>MAY</th><th>JUN</th>
                          <th>JUL</th><th>AGO</th><th>SEP</th><th>OCT</th><th>NOV</th><th>DIC</th>
                          <th class="total-column">TOTAL ACUM.</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${indicadores.map((indicador) => this.renderFilaProductividad(indicador, datosHistoricos, clavePresupuestal)).join("")}
                  </tbody>
              </table>
          </div>
      </div>
  `;
  },

  renderProductividadServicios(unidad) {
    const tipoUnidad = unidad.informacion_general?.tipo_unidad || "";
    // OOAD usa datos consolidados pre-calculados
    if (tipoUnidad === "OOAD") {
      return this.renderProductividadServiciosOOAD(unidad);
    }
    if (
      tipoUnidad !== "Unidad de Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Subzona con Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Subzona"
    ) {
      return "";
    }

    // Obtener clave presupuestal: primero desde datos_administrativos_completos, sino desde clave_presupuestal
    let clavePresupuestal = unidad.informacion_general?.clave_presupuestal;
    if (
      unidad.informacion_general?.datos_administrativos_completos?.[
        "Clave Presupuestal"
      ]
    ) {
      clavePresupuestal = String(
        unidad.informacion_general.datos_administrativos_completos[
          "Clave Presupuestal"
        ],
      );
    }
    const datosHistoricos = this.obtenerDatosHistoricos();

    const servicios = [
      "ESTOMATOLOGIA",
      "SALUD EN EL TRABAJO",
      "ATENCION MEDICA CONTINUA - URGENCIAS",
      "CENTRO DE ATENCION A LA DIABETES EN EL IMSS (CADIMSS)",
      "PLANIFICACION FAMILIAR",
      "NUTRICION Y DIETETICA",
      "TRABAJO SOCIAL",
      "MEDICINA PREVENTIVA",
      "ENFERMERA ESPECIALISTA EN MEDICINA FAMILIAR",
    ];

    return `
      <div class="productividad-section">
          <div class="productividad-header">
              <span class="material-symbols-outlined" style="color:#1C4D32; font-size:26px;">biotech</span>
              <h2>PRODUCTIVIDAD DE LOS SERVICIOS</h2>
              <span style="margin-left:auto; padding:4px 12px; background:#e6e9e7; border-radius:99px; font-size:10px; font-weight:700; color:#414942; text-transform:uppercase; letter-spacing:.08em;">Estad&#237;stica Mensual</span>
          </div>
          
          <div class="productividad-table-container">
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column">SERVICIO</th>
                          <th>ENE</th><th>FEB</th><th>MAR</th><th>ABR</th><th>MAY</th><th>JUN</th>
                          <th>JUL</th><th>AGO</th><th>SEP</th><th>OCT</th><th>NOV</th><th>DIC</th>
                          <th class="total-column">TOTAL ACUM.</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${servicios.map((servicio) => this.renderFilaProductividad(servicio, datosHistoricos, clavePresupuestal)).join("")}
                  </tbody>
              </table>
          </div>
      </div>
  `;
  },

  renderFilaProductividad(indicador, datosHistoricos, clavePresupuestal) {
    const meses = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];
    const añoActual = new Date().getFullYear();

    let totalAcumulado = 0;

    const celdasMeses = meses
      .map((mes) => {
        const periodo = `${añoActual}${mes}`;
        const valor = this.obtenerValorIndicador(
          datosHistoricos,
          periodo,
          indicador,
          clavePresupuestal,
        );
        totalAcumulado += valor;

        return `<td class="data-cell">${this.formatNumber(valor)}</td>`;
      })
      .join("");

    return `
      <tr>
          <td class="indicator-name">${indicador}</td>
          ${celdasMeses}
          <td class="total-cell">${this.formatNumber(totalAcumulado)}</td>
      </tr>
  `;
  },

  renderProductividadServiciosAuxiliares(unidad) {
    const tipoUnidad = unidad.informacion_general?.tipo_unidad || "";
    if (
      tipoUnidad !== "OOAD" &&
      tipoUnidad !== "Unidad de Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Zona" &&
      tipoUnidad !== "Hospital General de Subzona" &&
      tipoUnidad !== "Hospital General de Subzona con Medicina Familiar"
    ) {
      return "";
    }

    const productividad = unidad.productividad_servicios_auxiliares;
    if (!productividad) {
      return "";
    }

    // Extraer TODOS los servicios disponibles dinámicamente del objeto productividad
    // en lugar de usar una lista fija
    const servicios = Object.keys(productividad).sort();

    const mesesAbrev = MESES_ABREV;
    const mesesCompletos = MESES_COMPLETOS;

    return `
      <div class="productividad-section" style="margin-top: 40px;">
          <div class="productividad-header">
              <span class="material-symbols-outlined" style="color:#1C4D32; font-size:26px;">lab_panel</span>
              <h2>PRODUCTIVIDAD DE LOS SERVICIOS AUXILIARES DE DIAGNÓSTICO Y DE TRATAMIENTO</h2>
          </div>
  
          <div class="productividad-table-container">
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column">SERVICIOS</th>
                          ${mesesAbrev.map((mes) => `<th>${mes}</th>`).join("")}
                          <th class="total-column">TOTAL ACUM.</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${servicios.map((servicio) => this.renderFilaProductividadAuxiliar(servicio, productividad[servicio], mesesCompletos)).join("")}
                  </tbody>
              </table>
          </div>
      </div>
  `;
  },

  renderDiaTypico(unidad) {
    const tipoUnidad = unidad.informacion_general?.tipo_unidad || "";
    // OOAD no usa día típico (datos consolidados, no históricos por clave presupuestal)
    if (tipoUnidad === "OOAD") {
      return "";
    }
    if (
      tipoUnidad !== "Unidad de Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Subzona con Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Subzona"
    ) {
      return "";
    }

    // Obtener clave presupuestal: primero desde datos_administrativos_completos, sino desde clave_presupuestal
    let clavePresupuestal = unidad.informacion_general?.clave_presupuestal;
    if (
      unidad.informacion_general?.datos_administrativos_completos?.[
        "Clave Presupuestal"
      ]
    ) {
      clavePresupuestal = String(
        unidad.informacion_general.datos_administrativos_completos[
          "Clave Presupuestal"
        ],
      );
    }
    const datosHistoricos = this.obtenerDatosHistoricos();
    const productividad = unidad.productividad_servicios_auxiliares;

    if (!productividad && !datosHistoricos) {
      return "";
    }

    // Servicios a mostrar en orden
    const serviciosMedicinaFamiliar = [
      "Total de Consultas de la Unidad",
      "Consultas de Medicina Familiar",
    ];

    const serviciosGenerales = [
      "ESTOMATOLOGIA",
      "ATENCION MEDICA CONTINUA - URGENCIAS",
      "MEDICINA PREVENTIVA",
      "ENFERMERA ESPECIALISTA EN MEDICINA FAMILIAR",
    ];

    // Extraer TODOS los servicios auxiliares disponibles dinámicamente
    const serviciosAuxiliares = productividad
      ? Object.keys(productividad).sort()
      : [];

    const mesesAbrev = MESES_ABREV;
    const mesesCompletos = MESES_COMPLETOS;

    return `
      <div class="productividad-section" style="margin-top: 40px;">
          <div class="productividad-header">
              <span class="material-symbols-outlined" style="color:#1C4D32; font-size:26px;">schedule</span>
              <h2>DÍA TÍPICO</h2>
              <span style="margin-left:auto; padding:4px 12px; background:#e6e9e7; border-radius:99px; font-size:10px; font-weight:700; color:#414942; text-transform:uppercase; letter-spacing:.08em;">Promedio Mensual</span>
          </div>
  
          <div class="productividad-table-container">
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column">SERVICIOS</th>
                          ${mesesAbrev.map((mes) => `<th>${mes}</th>`).join("")}
                          <th class="total-column">PROMEDIO</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${serviciosMedicinaFamiliar
                        .map((servicio) =>
                          this.renderFilaDiaTipicoSIAIS(
                            servicio,
                            datosHistoricos,
                            clavePresupuestal,
                            mesesCompletos,
                          ),
                        )
                        .join("")}
                      ${serviciosGenerales
                        .map((servicio) =>
                          this.renderFilaDiaTipicoSIAIS(
                            servicio,
                            datosHistoricos,
                            clavePresupuestal,
                            mesesCompletos,
                          ),
                        )
                        .join("")}
                      ${serviciosAuxiliares
                        .map((servicio) =>
                          this.renderFilaDiaTipicoProductividad(
                            servicio,
                            productividad,
                            mesesCompletos,
                          ),
                        )
                        .join("")}
                  </tbody>
              </table>
          </div>
      </div>
  `;
  },

  renderFilaDiaTipicoSIAIS(
    indicador,
    datosHistoricos,
    clavePresupuestal,
    mesesCompletos,
  ) {
    const mesesNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const añoActual = new Date().getFullYear();

    let totalDiasTipicos = 0;
    let mesesConDatos = 0;

    const celdasMeses = mesesCompletos
      .map((mes, index) => {
        const periodo = `${añoActual}${String(mesesNum[index]).padStart(2, "0")}`;
        const valor = this.obtenerValorIndicador(
          datosHistoricos,
          periodo,
          indicador,
          clavePresupuestal,
        );

        // Calcular días hábiles usando la misma lógica que Python
        const diasHabiles = this.calculateBusinessDaysForMonth(
          añoActual,
          mesesNum[index],
        );
        const diaTipico =
          diasHabiles > 0 && valor > 0 ? valor / diasHabiles : 0;

        if (valor > 0) {
          totalDiasTipicos += diaTipico;
          mesesConDatos++;
        }

        return `<td class="data-cell">${this.formatNumber(diaTipico)}</td>`;
      })
      .join("");

    const promedio = mesesConDatos > 0 ? totalDiasTipicos / mesesConDatos : 0;

    return `
      <tr>
          <td class="indicator-name">${indicador}</td>
          ${celdasMeses}
          <td class="total-cell">${this.formatNumber(promedio)}</td>
      </tr>
  `;
  },

  renderFilaDiaTipicoProductividad(
    nombreServicio,
    productividad,
    mesesCompletos,
  ) {
    if (!productividad || !productividad[nombreServicio]) {
      return `
          <tr>
              <td class="indicator-name">${nombreServicio}</td>
              ${mesesCompletos.map(() => '<td class="data-cell">0.00</td>').join("")}
              <td class="total-cell">0.00</td>
          </tr>
      `;
    }

    const datosServicio = productividad[nombreServicio];

    const celdasMeses = mesesCompletos
      .map((mes) => {
        const valor = datosServicio.dia_tipico?.[mes] || 0;
        return `<td class="data-cell">${this.formatNumber(valor)}</td>`;
      })
      .join("");

    const promedio = datosServicio.promedio_dia_tipico || 0;

    return `
      <tr>
          <td class="indicator-name">${nombreServicio}</td>
          ${celdasMeses}
          <td class="total-cell">${this.formatNumber(promedio)}</td>
      </tr>
  `;
  },

  calculateBusinessDaysForMonth(year, month) {
    const DIAS_FESTIVOS_POR_MES = {
      1: 1,
      2: 1,
      3: 1,
      4: 2,
      5: 2,
      6: 0,
      7: 0,
      8: 0,
      9: 2,
      10: 0,
      11: 1,
      12: 1,
    };

    // Determinar mes anterior
    const mesAnterior = month === 1 ? 12 : month - 1;
    const yearAnterior = month === 1 ? year - 1 : year;

    // Fecha inicio: 26 del mes anterior
    const startDate = new Date(yearAnterior, mesAnterior - 1, 26);

    // Fecha fin: 25 del mes actual
    const endDate = new Date(year, month - 1, 25);

    // Contar días hábiles
    let businessDays = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // 0=Domingo, 1=Lunes, ..., 6=Sábado
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        businessDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Restar días festivos
    const diasFestivos = DIAS_FESTIVOS_POR_MES[month] || 0;
    businessDays -= diasFestivos;

    return Math.max(businessDays, 1);
  },

  renderProductividadServiciosMedicos(unidad) {
    const tipoUnidad = unidad.informacion_general?.tipo_unidad || "";
    console.log(
      " renderProductividadServiciosMedicos:",
      unidad.informacion_general?.nombre_unidad,
    );
    console.log("   tipo_unidad:", tipoUnidad);

    // Solo para hospitales y OOAD
    if (
      tipoUnidad !== "OOAD" &&
      tipoUnidad !== "Hospital General de Zona" &&
      tipoUnidad !== "Hospital General de Subzona con Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Subzona"
    ) {
      console.log("    No es hospital ni OOAD, retornando vacío");
      return "";
    }

    const productividadServicios = unidad.productividad_servicios_medicos;
    console.log(
      "   productividad_servicios_medicos existe:",
      !!productividadServicios,
    );
    if (productividadServicios) {
      console.log("   Meses disponibles:", Object.keys(productividadServicios));
    }
    if (!productividadServicios) {
      console.log("    No hay productividad, retornando vacío");
      return "";
    }
    console.log("    Renderizando tabla de productividad servicios médicos");

    const indicadores = [
      {
        key: "total_consultas_unidad",
        label: "Total de Consultas de la Unidad",
      },
      { key: "consultas_especialidades", label: "Consultas de Especialidades" },
      { key: "consultas_primera_vez", label: "Consultas de 1ra. Vez" },
      { key: "consultas_subsecuentes", label: "Consultas Subsecuentes" },
      { key: "consultas_urgencias", label: "Consultas de Urgencias" },
      { key: "consultas_tococirrugia", label: "Consultas De Tococirugía" },
      { key: "servicios_profesionales", label: "Servicios Profesionales" },
    ];

    const mesesAbrev = MESES_ABREV;
    const mesesCompletos = MESES_COMPLETOS_MAYUS;

    return `
      <div class="productividad-section" style="margin-top: 40px;">
          <div class="productividad-header">
              <h2>PRODUCTIVIDAD EN LOS SERVICIOS MÉDICOS</h2>
          </div>
  
          <div class="productividad-table-container">
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column" style="width: 25%;">INDICADOR</th>
                          ${mesesAbrev.map((mes) => `<th style="width: 6%;">${mes}</th>`).join("")}
                          <th class="total-column" style="width: 7%;">TOTAL</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${indicadores
                        .map((indicador) => {
                          let totalAcumulado = 0;
                          const celdasMeses = mesesCompletos
                            .map((mes) => {
                              const valor =
                                productividadServicios[mes]?.[indicador.key] ||
                                0;
                              totalAcumulado += valor;
                              return `<td class="data-cell">${this.formatNumber(valor)}</td>`;
                            })
                            .join("");

                          return `
                              <tr>
                                  <td class="indicator-name">${indicador.label}</td>
                                  ${celdasMeses}
                                  <td class="total-cell">${this.formatNumber(totalAcumulado)}</td>
                              </tr>
                          `;
                        })
                        .join("")}
                  </tbody>
              </table>
          </div>
      </div>
  `;
  },

  renderHospitalizacion(unidad) {
    const tipoUnidad = unidad.informacion_general?.tipo_unidad || "";
    console.log(
      " renderHospitalizacion:",
      unidad.informacion_general?.nombre_unidad,
    );
    console.log("   tipo_unidad:", tipoUnidad);

    // Solo para hospitales y OOAD
    if (
      tipoUnidad !== "OOAD" &&
      tipoUnidad !== "Hospital General de Zona" &&
      tipoUnidad !== "Hospital General de Subzona con Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Subzona"
    ) {
      console.log("    No es hospital ni OOAD, retornando vacío");
      return "";
    }

    const hospitalizacion = unidad.hospitalizacion;
    console.log("   hospitalizacion existe:", !!hospitalizacion);
    if (!hospitalizacion) {
      console.log("    No hay datos de hospitalización, retornando vacío");
      return "";
    }
    console.log("    Renderizando tabla de hospitalización");

    const mesesAbrev = MESES_ABREV;
    const mesesCompletos = MESES_COMPLETOS_MAYUS;

    return `
      <section id="sec-hospitalizacion" class="ft-section productividad-section" style="margin-top: 40px;">
          <div class="productividad-header">
              <h2>HOSPITALIZACIÓN</h2>
          </div>
  
          <!-- TABLA DE EGRESOS -->
          <div class="productividad-table-container" style="margin-top: 20px;">
              <h3 style="background-color: #8B7355; color: white; padding: 10px; margin: 0; font-size: 14px;">EGRESOS</h3>
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column" style="width: 25%;">SERVICIOS</th>
                          ${mesesAbrev.map((mes) => `<th style="width: 6%;">${mes}</th>`).join("")}
                          <th class="total-column" style="width: 7%;">TOTAL ACUM.</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${this.renderFilaHospitalizacion("Total Egresos Hospitalarios", "egresos", "total", hospitalizacion, mesesCompletos)}
                      ${this.renderFilaHospitalizacion("   - Egreso Cirugía", "egresos", "cirugia", hospitalizacion, mesesCompletos, true)}
                      ${this.renderFilaHospitalizacion("   - Egreso Gíneco Obstetricia", "egresos", "gineco_obstetricia", hospitalizacion, mesesCompletos, true)}
                      ${this.renderFilaHospitalizacion("   - Egreso Medicina", "egresos", "medicina", hospitalizacion, mesesCompletos, true)}
                      ${this.renderFilaHospitalizacion("   - Egreso Pediatría", "egresos", "pediatria", hospitalizacion, mesesCompletos, true)}
                  </tbody>
              </table>
          </div>
  
          <!-- TABLA DE DÍAS PACIENTES -->
          <div class="productividad-table-container" style="margin-top: 20px;">
              <h3 style="background-color: #8B7355; color: white; padding: 10px; margin: 0; font-size: 14px;">DÍAS PACIENTES</h3>
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column" style="width: 25%;">SERVICIOS</th>
                          ${mesesAbrev.map((mes) => `<th style="width: 6%;">${mes}</th>`).join("")}
                          <th class="total-column" style="width: 7%;">TOTAL ACUM.</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${this.renderFilaHospitalizacion("Total Días Pacientes", "dias_paciente", "total", hospitalizacion, mesesCompletos)}
                      ${this.renderFilaHospitalizacion("   - Días Pac. Cirugía", "dias_paciente", "cirugia", hospitalizacion, mesesCompletos, true)}
                      ${this.renderFilaHospitalizacion("   - Días Pac. Gíneco Obstetricia", "dias_paciente", "gineco_obstetricia", hospitalizacion, mesesCompletos, true)}
                      ${this.renderFilaHospitalizacion("   - Días Pac. Medicina", "dias_paciente", "medicina", hospitalizacion, mesesCompletos, true)}
                      ${this.renderFilaHospitalizacion("   - Días Pac. Pediatría", "dias_paciente", "pediatria", hospitalizacion, mesesCompletos, true)}
                  </tbody>
              </table>
          </div>
  
          <!-- TABLA DE PORCENTAJE DE OCUPACIÓN -->
          <div class="productividad-table-container" style="margin-top: 20px;">
              <h3 style="background-color: #8B7355; color: white; padding: 10px; margin: 0; font-size: 14px;">PORCENTAJE DE OCUPACIÓN HOSPITALARIA</h3>
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column" style="width: 25%;">SERVICIOS</th>
                          ${mesesAbrev.map((mes) => `<th style="width: 6%;">${mes}</th>`).join("")}
                          <th class="total-column" style="width: 7%;">PROM.</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${this.renderFilaHospitalizacion("Porcentaje de Ocupación Hosp.", "porcentaje_ocupacion", "total", hospitalizacion, mesesCompletos, false, true, true)}
                      ${this.renderFilaHospitalizacion("   - Porc. de Ocup. Cirugía", "porcentaje_ocupacion", "cirugia", hospitalizacion, mesesCompletos, true, true, true)}
                      ${this.renderFilaHospitalizacion("   - Porc. de Ocup. Gineco Obst.", "porcentaje_ocupacion", "gineco_obstetricia", hospitalizacion, mesesCompletos, true, true, true)}
                      ${this.renderFilaHospitalizacion("   - Porc. de Ocup. Medicina", "porcentaje_ocupacion", "medicina", hospitalizacion, mesesCompletos, true, true, true)}
                      ${this.renderFilaHospitalizacion("   - Porc. de Ocup. Pediatría", "porcentaje_ocupacion", "pediatria", hospitalizacion, mesesCompletos, true, true, true)}
                  </tbody>
              </table>
          </div>
  
          <!-- TABLA DE PROMEDIO DE ESTANCIA -->
          <div class="productividad-table-container" style="margin-top: 20px;">
              <h3 style="background-color: #8B7355; color: white; padding: 10px; margin: 0; font-size: 14px;">PROMEDIO DE ESTANCIA</h3>
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column" style="width: 25%;">SERVICIOS</th>
                          ${mesesAbrev.map((mes) => `<th style="width: 6%;">${mes}</th>`).join("")}
                          <th class="total-column" style="width: 7%;">PROM.</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${this.renderFilaHospitalizacion("Promedio de Estancia", "promedio_estancia", "total", hospitalizacion, mesesCompletos, false, true, false)}
                      ${this.renderFilaHospitalizacion("   - Prom. de Est. Cirugía", "promedio_estancia", "cirugia", hospitalizacion, mesesCompletos, true, true, false)}
                      ${this.renderFilaHospitalizacion("   - Prom. de Est. Gíneco Obst.", "promedio_estancia", "gineco_obstetricia", hospitalizacion, mesesCompletos, true, true, false)}
                      ${this.renderFilaHospitalizacion("   - Prom. de Est. Medicina", "promedio_estancia", "medicina", hospitalizacion, mesesCompletos, true, true, false)}
                      ${this.renderFilaHospitalizacion("   - Prom. de Est. Pediatría", "promedio_estancia", "pediatria", hospitalizacion, mesesCompletos, true, true, false)}
                  </tbody>
              </table>
          </div>
  
          <!-- TABLA DE ÍNDICE DE ROTACIÓN -->
          <div class="productividad-table-container" style="margin-top: 20px;">
              <h3 style="background-color: #8B7355; color: white; padding: 10px; margin: 0; font-size: 14px;">ÍNDICE DE ROTACIÓN</h3>
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column" style="width: 25%;">SERVICIOS</th>
                          ${mesesAbrev.map((mes) => `<th style="width: 6%;">${mes}</th>`).join("")}
                          <th class="total-column" style="width: 7%;">PROM.</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${this.renderFilaHospitalizacion("Índice de Rotación", "indice_rotacion", "total", hospitalizacion, mesesCompletos, false, true, false)}
                      ${this.renderFilaHospitalizacion("   -Ind. Rotación Cirugía", "indice_rotacion", "cirugia", hospitalizacion, mesesCompletos, true, true, false)}
                      ${this.renderFilaHospitalizacion("   -Ind. Rotación Gíneco Obst.", "indice_rotacion", "gineco_obstetricia", hospitalizacion, mesesCompletos, true, true, false)}
                      ${this.renderFilaHospitalizacion("   -Ind. Rotación Medicina", "indice_rotacion", "medicina", hospitalizacion, mesesCompletos, true, true, false)}
                      ${this.renderFilaHospitalizacion("   -Ind. Rotación Pediatría", "indice_rotacion", "pediatria", hospitalizacion, mesesCompletos, true, true, false)}
                  </tbody>
              </table>
          </div>
  
          <!-- TABLA DE REGISTROS ESPECIALES -->
          <div class="productividad-table-container" style="margin-top: 20px;">
              <h3 style="background-color: #8B7355; color: white; padding: 10px; margin: 0; font-size: 14px;">REGISTROS ESPECIALES</h3>
              <table class="productividad-table">
                  <thead>
                      <tr>
                          <th class="indicator-column" style="width: 25%;">SERVICIOS</th>
                          ${mesesAbrev.map((mes) => `<th style="width: 6%;">${mes}</th>`).join("")}
                          <th class="total-column" style="width: 7%;">TOTAL ACUM.</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${this.renderFilaRegistrosEspeciales("Total de Cirugías Ambulatorias", "cirugias_ambulatorias", hospitalizacion, mesesCompletos)}
                      ${this.renderFilaRegistrosEspeciales("Egresos Urgencias Observación", "egresos_urgencias_observacion", hospitalizacion, mesesCompletos)}
                      ${this.renderFilaRegistrosEspeciales("Unidad Cuidados Intensivos", "uci", hospitalizacion, mesesCompletos)}
                      ${this.renderFilaRegistrosEspeciales("UCI Neonato", "uci_neonato", hospitalizacion, mesesCompletos)}
                      ${this.renderFilaRegistrosEspeciales("Urg. Area de Reanimación", "urg_reanimacion", hospitalizacion, mesesCompletos)}
                      ${this.renderFilaRegistrosEspeciales("Urg. Observación Intermedia", "urg_observacion_intermedia", hospitalizacion, mesesCompletos)}
                      ${this.renderFilaRegistrosEspeciales("Urg. Observación Pediatría", "urg_observacion_pediatria", hospitalizacion, mesesCompletos)}
                      ${this.renderFilaRegistrosEspeciales("Urgencias Tococirugía", "urgencias_tococirugia", hospitalizacion, mesesCompletos)}
                      ${this.renderFilaRegistrosEspeciales("ECAM", "ecam", hospitalizacion, mesesCompletos)}
                  </tbody>
              </table>
          </div>
      </section>
  `;
  },

  renderFilaHospitalizacion(
    label,
    categoria,
    subcategoria,
    hospitalizacion,
    mesesCompletos,
    esIndentado = false,
    esPromedio = false,
    esPorcentaje = false,
  ) {
    let totalAcumulado = 0;
    let mesesConDatos = 0;

    const celdasMeses = mesesCompletos
      .map((mes) => {
        let valor = hospitalizacion[mes]?.[categoria]?.[subcategoria] || 0;
        if (valor > 0) {
          mesesConDatos++;
        }
        totalAcumulado += valor;

        // Si es porcentaje, dividir entre 100 para convertir 2,313 → 23.13%
        const valorDisplay = esPorcentaje ? valor / 100 : valor;
        const valorFormateado = this.formatNumber(valorDisplay);
        return `<td class="data-cell">${valorFormateado}${esPorcentaje ? "%" : ""}</td>`;
      })
      .join("");

    // Calcular promedio o total
    let valorFinal =
      esPromedio && mesesConDatos > 0
        ? totalAcumulado / mesesConDatos
        : totalAcumulado;

    // Si es porcentaje, dividir entre 100
    if (esPorcentaje) {
      valorFinal = valorFinal / 100;
    }

    const valorFinalFormateado = this.formatNumber(valorFinal);
    const classIndentado = esIndentado
      ? ' style="padding-left: 20px; font-weight: normal;"'
      : "";

    return `
      <tr>
          <td class="indicator-name"${classIndentado}>${label}</td>
          ${celdasMeses}
          <td class="total-cell">${valorFinalFormateado}${esPorcentaje ? "%" : ""}</td>
      </tr>
  `;
  },

  renderFilaRegistrosEspeciales(label, campo, hospitalizacion, mesesCompletos) {
    let totalAcumulado = 0;

    const celdasMeses = mesesCompletos
      .map((mes) => {
        const valor = hospitalizacion[mes]?.registros_especiales?.[campo] || 0;
        totalAcumulado += valor;
        return `<td class="data-cell">${this.formatNumber(valor)}</td>`;
      })
      .join("");

    return `
      <tr>
          <td class="indicator-name">${label}</td>
          ${celdasMeses}
          <td class="total-cell">${this.formatNumber(totalAcumulado)}</td>
      </tr>
  `;
  },

  renderMotivosAtencion(unidad) {
    const tipoUnidad = unidad.informacion_general?.tipo_unidad || "";
    if (
      tipoUnidad !== "OOAD" &&
      tipoUnidad !== "Unidad de Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Subzona con Medicina Familiar" &&
      tipoUnidad !== "Hospital General de Subzona"
    ) {
      return "";
    }

    const motivos = unidad.motivos_atencion;
    if (!motivos) {
      return "";
    }

    const motivosMF = motivos.medicina_familiar || [];
    const motivosURG = motivos.urgencias || [];
    const maxFilas = Math.max(motivosMF.length, motivosURG.length, 1);

    const tableModule = (
      title,
      items,
      accentColor,
      badgeBg,
      badgeLabel,
      maxRows,
    ) => {
      let rowsHtml = "";
      for (let i = 0; i < maxRows; i++) {
        const rowBg = i % 2 === 0 ? "#ffffff" : "#f2f4f2";
        if (i < items.length) {
          const item = items[i];
          rowsHtml += `<tr style="background-color:${rowBg};height:42px;" onmouseover="this.style.backgroundColor='#e4ede9'" onmouseout="this.style.backgroundColor='${rowBg}'">
                              <td style="padding:10px 14px;font-size:12px;font-weight:700;color:#414942;width:42px;height:42px;">${String(i + 1).padStart(2, "0")}</td>
                              <td class="ft-ellipsis-cell" data-fulltext="${this.escapeHtmlAttr(item.descripcion || "")}" style="padding:10px 18px;font-size:12px;color:#191c1b;height:42px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.descripcion || ""}</td>
                              <td style="padding:10px 18px;font-size:12px;font-weight:700;color:${accentColor};text-align:right;white-space:nowrap;height:42px;">${this.formatNumber(item.total)}</td>
                          </tr>`;
        } else {
          rowsHtml += `<tr style="background-color:${rowBg};height:42px;">
                              <td style="padding:10px 14px;font-size:12px;font-weight:700;color:rgba(65,73,66,.4);width:42px;height:42px;">${String(i + 1).padStart(2, "0")}</td>
                              <td style="padding:10px 18px;font-size:12px;color:rgba(25,28,27,.4);height:42px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">-</td>
                              <td style="padding:10px 18px;font-size:12px;font-weight:700;color:rgba(65,73,66,.2);text-align:right;white-space:nowrap;height:42px;">-</td>
                          </tr>`;
        }
      }

      return `
                      <section style="display:flex;flex-direction:column;gap:16px;height:100%;">
                          <div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px;">
                              <div style="display:flex;align-items:center;gap:12px;">
                                  <div style="width:5px;height:32px;background:${accentColor};border-radius:99px;flex-shrink:0;"></div>
                                  <h3 style="font-size:15px;font-weight:700;font-family:'Noto Serif',serif;color:#191c1b;margin:0;line-height:1.3;">${title}</h3>
                              </div>
                              <span style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:${accentColor};background:${badgeBg};padding:4px 12px;border-radius:99px;white-space:nowrap;flex-shrink:0;margin-left:12px;">${badgeLabel}</span>
                          </div>
                          <div style="overflow:hidden;border-radius:12px;background:#fff;border:1px solid #e2e8e4;box-shadow:0 2px 12px rgba(25,28,27,.06);flex-grow:1;display:flex;flex-direction:column;">
                              <table style="width:100%;table-layout:fixed;border-collapse:collapse;text-align:left;">
                                  <thead>
                                      <tr style="background:${accentColor};">
                                          <th style="padding:12px 14px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#fff;width:42px;">#</th>
                                          <th style="padding:12px 18px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#fff;">Descripcion</th>
                                          <th style="padding:12px 18px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.7);text-align:right;width:80px;">Total</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      ${rowsHtml}
                                  </tbody>
                              </table>
                          </div>
                      </section>`;
    };

    return `
      <section id="sec-motivos" class="ft-section" style="margin-top:48px;">
          <div style="margin-bottom:28px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.2em;color:#414942;">Estadisticas Institucionales</span>
                  <div style="height:1px;width:48px;background:#c0c9c0;"></div>
              </div>
              <h2 style="font-size:28px;font-weight:700;font-family:'Noto Serif',serif;color:#1C4D32;margin:0 0 8px;">MOTIVOS DE ATENCIÓN</h2>
              <p style="font-size:13px;color:#414942;margin:0;">Análisis de los principales diagnósticos y causas de consulta externa y urgencias.</p>
          </div>
          <div class="motivos-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:24px;">
              ${tableModule("Motivos Consultas de Medicina Familiar", motivosMF, "#1C4D32", "#dcfce7", "Reporte Anual", maxFilas)}
              ${tableModule("Atención Médica Continua — Urgencias", motivosURG, "#ba1a1a", "#ffdad6", "Urgencias 5A", maxFilas)}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#f2f4f2;border-radius:10px;">
              <span style="font-size:12px;font-weight:600;color:#414942;">Periodo: ${motivos.periodo || "No especificado"}</span>
              <span style="font-size:9px;font-weight:800;color:#1C4D32;text-transform:uppercase;letter-spacing:.12em;">Fuente: ARIMAC</span>
          </div>
      </section>
  `;
  },

  renderFilasMotivosLadoALado(motivosMF, motivosURG, maxFilas) {
    const filas = [];

    for (let i = 0; i < maxFilas; i++) {
      let filaMF = "";
      let filaURG = "";

      // Columnas de Medicina Familiar
      if (i < motivosMF.length) {
        const motivo = motivosMF[i];
        filaMF = `
          <td style="text-align: center; font-weight: bold; background-color: #f0f0f0; padding: 5px; border: 1px solid #999;">${i + 1}</td>
          <td style="text-align: left; padding: 5px; border: 1px solid #999;">${motivo.descripcion}</td>
          <td style="text-align: right; padding: 5px; border: 1px solid #999;">${this.formatNumber(motivo.total)}</td>
      `;
      } else {
        filaMF = `
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">${i + 1}</td>
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">-</td>
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">-</td>
      `;
      }

      // Columnas de Urgencias
      if (i < motivosURG.length) {
        const motivo = motivosURG[i];
        filaURG = `
          <td style="text-align: center; font-weight: bold; background-color: #f0f0f0; padding: 5px; border: 1px solid #999;">${i + 1}</td>
          <td style="text-align: left; padding: 5px; border: 1px solid #999;">${motivo.descripcion}</td>
          <td style="text-align: right; padding: 5px; border: 1px solid #999;">${this.formatNumber(motivo.total)}</td>
      `;
      } else {
        filaURG = `
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">${i + 1}</td>
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">-</td>
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">-</td>
      `;
      }

      filas.push(`<tr>${filaMF}${filaURG}</tr>`);
    }

    return filas.join("");
  },

  renderMotivosAtencionHospital(unidad) {
    const tipoUnidad = unidad.informacion_general?.tipo_unidad || "";
    const nombre = unidad.informacion_general?.nombre_unidad || "";

    let esHospital = false;
    let esOOAD = false;

    if (
      tipoUnidad === "Hospital General de Zona" ||
      tipoUnidad === "Hospital General de Subzona" ||
      tipoUnidad === "Hospital General de Subzona con Medicina Familiar"
    ) {
      esHospital = true;
    } else if (nombre === "OOAD TABASCO" || tipoUnidad === "OOAD") {
      esOOAD = true;
    }

    if (!esHospital && !esOOAD) {
      return "";
    }

    const tableModule = (
      title,
      items,
      accentColor,
      badgeBg,
      badgeLabel,
      maxRows,
      showCode = false,
      codeField = "codigo",
    ) => {
      let rowsHtml = "";
      for (let i = 0; i < maxRows; i++) {
        const rowBg = i % 2 === 0 ? "#ffffff" : "#f2f4f2";
        if (i < items.length) {
          const item = items[i];
          const codeCell = showCode
            ? `<td style="padding:10px 14px;font-size:11px;color:#414942;font-weight:600;max-width:80px;height:42px;">${item[codeField] || ""}</td>`
            : "";
          rowsHtml += `<tr style="background-color:${rowBg};height:42px;" onmouseover="this.style.backgroundColor='#e4ede9'" onmouseout="this.style.backgroundColor='${rowBg}'">
                          <td style="padding:10px 14px;font-size:12px;font-weight:700;color:#414942;width:42px;height:42px;">${String(i + 1).padStart(2, "0")}</td>
                          ${codeCell}
                          <td class="ft-ellipsis-cell" data-fulltext="${this.escapeHtmlAttr(item.descripcion || "")}" style="padding:10px 18px;font-size:12px;color:#191c1b;height:42px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.descripcion || ""}</td>
                          <td style="padding:10px 18px;font-size:12px;font-weight:700;color:${accentColor};text-align:right;white-space:nowrap;height:42px;">${this.formatNumber(item.total)}</td>
                      </tr>`;
        } else {
          const codeCell = showCode
            ? `<td style="padding:10px 14px;font-size:11px;color:rgba(65,73,66,.4);font-weight:600;max-width:80px;height:42px;">-</td>`
            : "";
          rowsHtml += `<tr style="background-color:${rowBg};height:42px;">
                          <td style="padding:10px 14px;font-size:12px;font-weight:700;color:rgba(65,73,66,.4);width:42px;height:42px;">${String(i + 1).padStart(2, "0")}</td>
                          ${codeCell}
                          <td style="padding:10px 18px;font-size:12px;color:rgba(25,28,27,.4);height:42px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">-</td>
                          <td style="padding:10px 18px;font-size:12px;font-weight:700;color:rgba(65,73,66,.2);text-align:right;white-space:nowrap;height:42px;">-</td>
                      </tr>`;
        }
      }

      const codeHeader = showCode
        ? `<th style="padding:12px 14px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#fff;width:60px;">Codigo</th>`
        : "";
      return `
                  <section style="display:flex;flex-direction:column;gap:16px;height:100%;">
                      <div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px;">
                          <div style="display:flex;align-items:center;gap:12px;">
                              <div style="width:5px;height:32px;background:${accentColor};border-radius:99px;flex-shrink:0;"></div>
                              <h3 style="font-size:15px;font-weight:700;font-family:'Noto Serif',serif;color:#191c1b;margin:0;line-height:1.3;">${title}</h3>
                          </div>
                          <span style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:${accentColor};background:${badgeBg};padding:4px 12px;border-radius:99px;white-space:nowrap;flex-shrink:0;margin-left:12px;">${badgeLabel}</span>
                      </div>
                      <div style="overflow:hidden;border-radius:12px;background:#fff;border:1px solid #e2e8e4;box-shadow:0 2px 12px rgba(25,28,27,.06);flex-grow:1;display:flex;flex-direction:column;">
                          <table style="width:100%;table-layout:fixed;border-collapse:collapse;text-align:left;">
                              <thead>
                                  <tr style="background:${accentColor};">
                                      <th style="padding:12px 14px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#fff;width:42px;">#</th>
                                      ${codeHeader}
                                      <th style="padding:12px 18px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#fff;">Descripcion</th>
                                      <th style="padding:12px 18px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.7);text-align:right;width:80px;">Total</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  ${rowsHtml}
                              </tbody>
                          </table>
                      </div>
                  </section>`;
    };

    const sectionHeader = (title, subtitle) => `
              <div style="margin-bottom:28px;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                      <span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.2em;color:#414942;">Estadisticas Institucionales</span>
                      <div style="height:1px;width:48px;background:#c0c9c0;"></div>
                  </div>
                  <h2 style="font-size:28px;font-weight:700;font-family:'Noto Serif',serif;color:#1C4D32;margin:0 0 8px;">${title}</h2>
                  <p style="font-size:13px;color:#414942;margin:0;">${subtitle}</p>
              </div>`;

    let html = "";

    // BLOQUE 1: Especialidades + Urgencias
    let motivosParaConsulta = null;
    if (esHospital) {
      motivosParaConsulta = unidad.motivos_atencion_hospital;
    } else if (esOOAD) {
      motivosParaConsulta = unidad.motivos_atencion_hospital_consolidados;
    }

    if (
      motivosParaConsulta &&
      (motivosParaConsulta.especialidades_consulta ||
        motivosParaConsulta.urgencias_consulta)
    ) {
      const especialidades = motivosParaConsulta.especialidades_consulta || [];
      const urgencias = motivosParaConsulta.urgencias_consulta || [];
      const maxConsultas = Math.max(especialidades.length, urgencias.length, 1);

      html += `
  <section id="sec-motivos" class="ft-section" style="margin-top:48px;">
      ${sectionHeader("MOTIVOS DE ATENCIÓN" + (esOOAD ? "" : " — CONSULTA EXTERNA"), "Principales diagnósticos en consultas de especialidades y urgencias.")}
      <div class="motivos-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:24px;">
          ${tableModule(esOOAD ? "Principales Consultas de Especialidades" : "Motivos Consultas de Especialidades", especialidades, "#1C4D32", "#dcfce7", "Consulta Externa", maxConsultas)}
          ${tableModule(esOOAD ? "Principales Urgencias (Primer Contacto)" : "Motivo Urgencias (Primer Contacto)", urgencias, "#ba1a1a", "#ffdad6", "Urgencias", maxConsultas)}
      </div>
  </section>`;
    }

    // BLOQUE 2: Egresos + Intervenciones Quirúrgicas
    let motivosHospital = null;
    if (esHospital) {
      motivosHospital = unidad.motivos_atencion_hospital;
    } else if (esOOAD) {
      motivosHospital = unidad.motivos_atencion_hospital_consolidados;
    }

    if (
      motivosHospital &&
      (motivosHospital.diagnosticos_egreso ||
        motivosHospital.procedimientos_quirurgicos)
    ) {
      const diagnosticos = motivosHospital.diagnosticos_egreso || [];
      const procedimientos = motivosHospital.procedimientos_quirurgicos || [];
      const maxHospital = Math.max(
        diagnosticos.length,
        procedimientos.length,
        1,
      );

      html += `
  <section class="ft-section" style="margin-top:48px;">
      ${sectionHeader("MOTIVOS DE ATENCIÓN", "Principales egresos hospitalarios e intervenciones quirúrgicas del periodo.")}
      <div class="motivos-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:24px;">
          ${tableModule("Principales Egresos Hospitalarios", diagnosticos, "#1C4D32", "#dcfce7", "Egresos", maxHospital, true, "cie10")}
          ${tableModule("Principales Intervenciones Quirúrgicas", procedimientos, "#c4781c", "#fef3c7", "Quirúrgico", maxHospital, true, "cie9")}
      </div>
  </section>`;
    }

    return html;
  },

  renderFilasMotivosHospitalLadoALado(diagnosticos, procedimientos, maxFilas) {
    const filas = [];

    for (let i = 0; i < maxFilas; i++) {
      let filaDiag = "";
      let filaProc = "";

      // Columnas de Diagnósticos de Egreso
      if (i < diagnosticos.length) {
        const diag = diagnosticos[i];
        filaDiag = `
          <td style="text-align: center; font-weight: bold; background-color: #f0f0f0; padding: 5px; border: 1px solid #999;">${i + 1}</td>
          <td style="text-align: center; font-weight: bold; padding: 5px; border: 1px solid #999;">${diag.codigo || ""}</td>
          <td style="text-align: left; padding: 5px; border: 1px solid #999;">${diag.descripcion || "Sin descripción"}</td>
          <td style="text-align: right; padding: 5px; border: 1px solid #999;">${this.formatNumber(diag.total || 0)}</td>
      `;
      } else {
        filaDiag = `
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">${i + 1}</td>
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">-</td>
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">-</td>
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">-</td>
      `;
      }

      // Columnas de Procedimientos Quirúrgicos
      if (i < procedimientos.length) {
        const proc = procedimientos[i];
        filaProc = `
          <td style="text-align: center; font-weight: bold; background-color: #f0f0f0; padding: 5px; border: 1px solid #999;">${i + 1}</td>
          <td style="text-align: center; font-weight: bold; padding: 5px; border: 1px solid #999;">${proc.codigo || ""}</td>
          <td style="text-align: left; padding: 5px; border: 1px solid #999;">${proc.descripcion || "Sin descripción"}</td>
          <td style="text-align: right; padding: 5px; border: 1px solid #999;">${this.formatNumber(proc.total || 0)}</td>
      `;
      } else {
        filaProc = `
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">${i + 1}</td>
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">-</td>
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">-</td>
          <td style="text-align: center; color: #ccc; padding: 5px; border: 1px solid #999;">-</td>
      `;
      }

      filas.push(`<tr>${filaDiag}${filaProc}</tr>`);
    }

    return filas.join("");
  },

  renderFilaDiaTipico(nombreServicio, datosServicio, mesesCompletos) {
    if (!datosServicio || !datosServicio.dia_tipico) {
      return `
          <tr>
              <td class="indicator-name">${nombreServicio}</td>
              ${mesesCompletos.map(() => '<td class="data-cell">0.00</td>').join("")}
              <td class="total-cell">0.00</td>
          </tr>
      `;
    }

    const celdasMeses = mesesCompletos
      .map((mes) => {
        const valor = datosServicio.dia_tipico?.[mes] || 0;
        return `<td class="data-cell">${this.formatNumber(valor)}</td>`;
      })
      .join("");

    const promedio = datosServicio.promedio_dia_tipico || 0;

    return `
      <tr>
          <td class="indicator-name">${nombreServicio}</td>
          ${celdasMeses}
          <td class="total-cell">${this.formatNumber(promedio)}</td>
      </tr>
  `;
  },

  renderFilaProductividadAuxiliar(
    nombreServicio,
    datosServicio,
    mesesCompletos,
  ) {
    if (!datosServicio) {
      return `
          <tr>
              <td class="indicator-name">${nombreServicio}</td>
              ${mesesCompletos.map(() => '<td class="data-cell">0</td>').join("")}
              <td class="total-cell">0</td>
          </tr>
      `;
    }

    const celdasMeses = mesesCompletos
      .map((mes) => {
        const valor = datosServicio.meses?.[mes] || 0;
        return `<td class="data-cell">${this.formatNumber(valor)}</td>`;
      })
      .join("");

    const totalAcumulado = datosServicio.total_acumulado || 0;

    return `
      <tr>
          <td class="indicator-name">${nombreServicio}</td>
          ${celdasMeses}
          <td class="total-cell">${this.formatNumber(totalAcumulado)}</td>
      </tr>
  `;
  },

  async cargarDatosHistoricos() {
    try {
      if (!this.datosHistoricosCache) {
        const response = await fetch(
          "../../data/output/siais_historico_completo.json",
        );
        if (!response.ok) {
          console.warn("No se pudo cargar el archivo de datos históricos");
          this.datosHistoricosCache = { periodos: {} };
          return;
        }
        this.datosHistoricosCache = await response.json();
        // console.log(' Datos históricos cargados:', Object.keys(this.datosHistoricosCache.periodos || {}));
      }
    } catch (error) {
      console.error("Error cargando datos históricos:", error);
      this.datosHistoricosCache = { periodos: {} };
    }
  },
  obtenerDatosHistoricos() {
    return this.datosHistoricosCache || { periodos: {} };
  },

  obtenerValorIndicador(
    datosHistoricos,
    periodo,
    indicador,
    clavePresupuestal,
  ) {
    try {
      const datosPeriodo = datosHistoricos.periodos?.[periodo];
      if (!datosPeriodo || !datosPeriodo.servidores) {
        return 0;
      }

      // CASO ESPECIAL: Consultas de M.F. Subsecuentes = Medicina Familiar - Aten 1ra. Vez
      if (indicador === "Consultas de M.F. Subsecuentes") {
        let consultasMF = 0;
        let consultas1raVez = 0;

        for (const servidor of datosPeriodo.servidores) {
          const unidad = servidor.claves_presupuestales?.[clavePresupuestal];
          if (unidad && unidad.categorias) {
            // Obtener Consultas de Medicina Familiar
            if (unidad.categorias["Consultas de Medicina Familiar"]) {
              consultasMF +=
                unidad.categorias["Consultas de Medicina Familiar"].valor || 0;
            }
            // Obtener Consultas Aten 1ra. Vez
            if (unidad.categorias["Consultas Aten 1ra. Vez"]) {
              consultas1raVez +=
                unidad.categorias["Consultas Aten 1ra. Vez"].valor || 0;
            }
          }
        }

        const subsecuentes = consultasMF - consultas1raVez;
        // console.log(` ${periodo}: MF(${consultasMF}) - 1raVez(${consultas1raVez}) = Subsecuentes(${subsecuentes})`);
        return Math.max(0, subsecuentes); // No permitir negativos
      }

      // CASO NORMAL: Buscar directamente en el JSON
      for (const servidor of datosPeriodo.servidores) {
        const unidad = servidor.claves_presupuestales?.[clavePresupuestal];
        if (unidad && unidad.categorias && unidad.categorias[indicador]) {
          const valor = unidad.categorias[indicador].valor || 0;
          // console.log(` Encontrado ${indicador}: ${valor}`);
          return valor;
        }
      }

      return 0;
    } catch (error) {
      console.error(
        `Error obteniendo valor para ${indicador} en período ${periodo}:`,
        error,
      );
      return 0;
    }
  },
});
