Object.assign(FichaTecnicaApp.prototype, {
  renderRecursosOOAD(unidad) {
    const recursos = unidad.recursos_para_la_salud || {};
    const consultorios = recursos.consultorios || {};
    const camasCensables = recursos.camas_censables || {};
    const camasNoCens = recursos.camas_no_censables || {};
    const modulos = recursos.servicios_especiales || {};
    const quirofanos = recursos.quirofanos || {};
    const urgencias = recursos.urgencias || {};
    const equipos = recursos.equipos_diagnostico || {};
    const procedimientos = recursos.procedimientos || {};
    const hemodialisis = recursos.hemodialisis || {};
    const ambulancias = recursos.ambulancias || {};

    const totalConsultorios =
      parseInt(consultorios.total_consultorio_unidad) || 0;
    const totalCamasCens = parseInt(camasCensables.total_censables) || 0;
    const totalCamasNoCens = parseInt(camasNoCens.no_censables) || 0;
    const totalAmbul = parseInt(ambulancias.ambulancias) || 0;
    const totalQuirofanos = parseInt(quirofanos.quirofanos) || 0;
    const totalCamas = totalCamasCens + totalCamasNoCens;

    const dataRow = (label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #eef2ef;padding-bottom:8px;margin-bottom:8px;"><span style="font-size:12px;color:#414942;font-weight:500;">${label}</span><span style="font-size:22px;font-weight:800;color:#1C4D32;font-family:'Noto Serif',serif;line-height:1;">${parseInt(val)}</span></div>`;
    };
    const dataRowRed = (label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #eef2ef;padding-bottom:8px;margin-bottom:8px;"><span style="font-size:12px;color:#414942;font-weight:500;">${label}</span><span style="font-size:22px;font-weight:800;color:#7b5454;font-family:'Noto Serif',serif;line-height:1;">${parseInt(val)}</span></div>`;
    };
    const sectionCard = (icon, label, color, rows) =>
      `<div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 4px 20px rgba(25,28,27,.06);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;"><span style="font-size:11px;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:.12em;">${label}</span><span class="material-symbols-outlined" style="color:#717972;font-size:20px;">${icon}</span></div>${rows}</div>`;
    const moduleBadge = (icon, label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:#fff;border-radius:10px;margin-bottom:6px;"><div style="display:flex;align-items:center;gap:10px;"><span class="material-symbols-outlined" style="color:#1C4D32;font-size:18px;">${icon}</span><span style="font-size:13px;font-weight:600;color:#191c1b;">${label}</span></div><div style="display:flex;align-items:center;gap:6px;"><span style="font-size:17px;font-weight:800;color:#1C4D32;font-family:'Noto Serif',serif;">${parseInt(val)}</span><span style="font-size:9px;font-weight:800;padding:2px 8px;background:#1C4D32;color:#fff;border-radius:99px;text-transform:uppercase;">ACTIVO</span></div></div>`;
    };
    const equipCard = (icon, label, val, color) => {
      if (!parseInt(val)) return "";
      return `<div style="background:#fff;padding:18px;border-radius:12px;border:1px solid #e2e8e4;display:flex;flex-direction:column;gap:12px;"><span class="material-symbols-outlined" style="color:${color};font-size:26px;">${icon}</span><div><h4 style="font-size:12px;font-weight:700;color:#191c1b;margin:0 0 4px;line-height:1.3;">${label}</h4><p style="font-size:20px;font-weight:900;color:${color};font-family:'Noto Serif',serif;margin:0;">${parseInt(val)}</p></div><span style="padding:2px 10px;background:#dcfce7;color:#15803d;border-radius:99px;font-size:9px;font-weight:800;text-transform:uppercase;width:fit-content;">Funcional</span></div>`;
    };
    const salaCard = (icon, label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="background:#f2f4f2;padding:14px 16px;border-radius:10px;border:1px solid #e2e8e4;display:flex;align-items:center;gap:14px;margin-bottom:8px;"><div style="width:44px;height:44px;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span class="material-symbols-outlined" style="color:#1C4D32;font-size:22px;">${icon}</span></div><div style="flex:1;"><h4 style="font-size:13px;font-weight:700;color:#191c1b;margin:0 0 2px;">${label}</h4><p style="font-size:11px;color:#717972;margin:0;">Disponible</p></div><span style="font-size:20px;font-weight:800;color:#1C4D32;font-family:'Noto Serif',serif;">${parseInt(val)}</span></div>`;
    };

    const eqRows = [
      [
        "Lab. Clinico (Peines)",
        equipos.peine_laboratorio_clinico,
        "Aux. Diagnostico",
      ],
      ["Rayos X Fijo", equipos.rayos_x_fijos, "Aux. Diagnostico"],
      [
        "Rayos X Transportable",
        equipos.rayos_x_transportable,
        "Aux. Diagnostico",
      ],
      ["Mastografo Digital", equipos.mastografo_digital, "Aux. Diagnostico"],
      ["Electrocardiografo", equipos.electrocardiografo, "Aux. Diagnostico"],
      ["Electromiografo", equipos.electromiografo, "Aux. Diagnostico"],
      [
        "Electroencefalografo",
        equipos.electroencefalografo,
        "Aux. Diagnostico",
      ],
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
    ].filter(([, v]) => parseInt(v) > 0);

    const catColor = (cat) => {
      if (cat === "Sala Proc.") return "background:#dbeafe;color:#1d4ed8";
      if (cat === "Hemodialisis") return "background:#fef3c7;color:#b45309";
      if (cat === "Tomografia") return "background:#f3e8ff;color:#7e22ce";
      return "background:#dcfce7;color:#15803d";
    };

    return `
  <section id="sec-recursos" class="ft-section mb-10">
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:32px;">
          <h2 style="font-size:30px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Recursos para la Salud</h2>
          <p style="font-size:14px;color:#414942;margin:0;">Consolidado OOAD — Infraestructura, Modulos y Equipamiento</p>
      </div>
      <div class="res-grid-top" style="display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto auto;gap:20px;margin-bottom:40px;">
  
          <!-- Fila 1: Consultorios + Camas + Capacidad (span 2) -->
          ${sectionCard("medical_services", "Consultorios", "#1C4D32", dataRow("Total Unidad", consultorios.total_consultorio_unidad) + dataRow("Medicina Familiar", consultorios.medicina_familiar) + dataRow("Especialidad", consultorios.especialidad) + dataRow("Urgencias Medicas", consultorios.urgencias_medicas) + dataRow("Aten. Medica Continua", consultorios.atn_medica_continua) + dataRow("CADIMSS", consultorios.cadimss) + dataRow("Planif. Familiar", consultorios.planificacion_familiar) + dataRow("Banco de Sangre", consultorios.banco_sangre) + dataRow("Aux. Med. Familiar", consultorios.aux_medicina_familiar) + dataRow("Profesionales", consultorios.profesionales) + dataRow("Estomatologia", consultorios.estomatologia))}
  
          ${sectionCard("bed", "Camas", "#7b5454", '<p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#717972;margin:0 0 8px;">Censables</p>' + dataRowRed("Total Censables", camasCensables.total_censables) + dataRowRed("Medicina Interna", camasCensables.medicina_interna) + dataRowRed("Cirugia", camasCensables.cirugia) + dataRowRed("Gineco-Obstetricia", camasCensables.gineco_obstetricia) + dataRowRed("Pediatria", camasCensables.pediatria) + dataRowRed("Cuna / Cir. Pediatrica", camasCensables.cuna_cirugia_pediatrica) + '<p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#717972;margin:10px 0 8px;padding-top:10px;border-top:1px solid #eef2ef;">No Censables</p>' + dataRowRed("Total No Censables", camasNoCens.no_censables) + dataRowRed("Camillas AMC", camasNoCens.camillas_amc) + dataRowRed("Obs. Adulto", camasNoCens.observacion_adulto) + dataRowRed("Obs. Pediatrica", camasNoCens.observacion_pediatrica))}
  
          <!-- Panel Capacidad Total span 2 rows en columna 3 -->
          <div style="background:#1C4D32;color:#fff;padding:28px;border-radius:12px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;position:relative;box-shadow:0 8px 32px rgba(28,77,50,.25);grid-row:1/span 2;">
              <div style="position:relative;z-index:1;">
                  <h3 style="font-size:18px;font-weight:700;font-family:'Noto Serif',serif;margin:0 0 4px;">Capacidad Total</h3>
                  <p style="font-size:9px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.15em;font-weight:800;margin:0;">Consolidado OOAD</p>
              </div>
              <div style="position:relative;z-index:1;padding:20px 0;">
                  <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:16px;">
                      <span style="font-size:52px;font-weight:900;font-family:'Noto Serif',serif;line-height:1;">${totalCamas}</span>
                      <span style="font-size:14px;color:rgba(255,255,255,.7);">Camas</span>
                  </div>
                  <div style="width:100%;height:6px;background:rgba(255,255,255,.2);border-radius:99px;overflow:hidden;margin-bottom:8px;">
                      <div style="height:100%;background:#fff;border-radius:99px;width:${Math.min(100, Math.round((totalCamasCens / (totalCamas || 1)) * 100))}%;"></div>
                  </div>
                  <p style="font-size:9px;color:rgba(255,255,255,.5);margin:0 0 20px;">Censables vs No Censables</p>
                  <div style="display:flex;flex-direction:column;gap:16px;">
                      <div style="background:rgba(255,255,255,.1);padding:14px 16px;border-radius:10px;">
                          <p style="font-size:9px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;margin:0 0 4px;">Consultorios</p>
                          <span style="font-size:28px;font-weight:900;font-family:'Noto Serif',serif;">${totalConsultorios}</span>
                      </div>
                      <div style="background:rgba(255,255,255,.1);padding:14px 16px;border-radius:10px;">
                          <p style="font-size:9px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;margin:0 0 4px;">Quirofanos</p>
                          <span style="font-size:28px;font-weight:900;font-family:'Noto Serif',serif;">${totalQuirofanos}</span>
                      </div>
                      <div style="background:rgba(255,255,255,.1);padding:14px 16px;border-radius:10px;">
                          <p style="font-size:9px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;margin:0 0 4px;">Ambulancias</p>
                          <span style="font-size:28px;font-weight:900;font-family:'Noto Serif',serif;">${totalAmbul}</span>
                      </div>
                  </div>
              </div>
              <div style="position:absolute;right:-20px;bottom:-20px;opacity:.08;">
                  <span class="material-symbols-outlined" style="font-size:160px;color:#fff;">analytics</span>
              </div>
          </div>
  
          <!-- Fila 2: Modulos + Quirofanos (col 1 y 2, col 3 ya tiene el bento) -->
          ${sectionCard("health_and_safety", "Modulos de Atencion", "#5a6e5a", '<div style="background:#f2f4f2;border-radius:10px;padding:6px;">' + moduleBadge("health_and_safety", "PrevenIMSS", modulos.prevenimss) + moduleBadge("stethoscope", "Enf. Esp. Med. Familiar", modulos.enf_esp_med_familiar) + moduleBadge("support_agent", "Atencion Orientacion DH", modulos.atencion_orientacion_dh) + moduleBadge("bloodtype", "Banco de Sangre", modulos.banco_sangre) + "</div>")}
  
          ${sectionCard("surgical", "Quirofanos", "#1C4D32", dataRow("Quirofanos", quirofanos.quirofanos) + dataRow("Sala de Expulsion", quirofanos.sala_expulsion) + dataRow("Mixta Cir.-Tococirug.", quirofanos.mixta_cirugia_tococirugia) + dataRow("Urgencias", quirofanos.urgencias) + dataRow("Tococirugia", quirofanos.tococirugia) + dataRow("Hibrida", quirofanos.hibrida))}
  
      </div>
  
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="width:4px;height:28px;background:#ba1a1a;border-radius:2px;"></div><h3 style="font-size:20px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Urgencias y Equipamiento</h3></div>
      <div class="res-grid-mid" style="display:grid;grid-template-columns:1fr 2fr;gap:28px;margin-bottom:40px;">
          <div style="display:flex;flex-direction:column;gap:20px;">
              ${sectionCard("emergency", "Urgencias", "#ba1a1a", dataRow("Total Camas", urgencias.total_camas_urgencias) + dataRow("Observacion Adulto", urgencias.cama_observ_adulto) + dataRow("Observacion Pediatrica", urgencias.cama_observ_pediatrica) + dataRow("Corta Estancia", urgencias.cama_corta_estancia) + dataRow("Reanimacion Adulto", urgencias.reanimacion_adulto) + dataRow("Atencion Medica Continua", urgencias.atencion_medica_continua))}
              <div>
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><div style="width:4px;height:22px;background:#5a6e5a;border-radius:2px;"></div><h3 style="font-size:16px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Salas de Procedimiento</h3></div>
                  ${salaCard("radiology", "Radiodiagnostico", procedimientos.radiodiagnostico)}
                  ${salaCard("biotech", "Proc. Quirurgicos", procedimientos.procedimientos_quirurgicos)}
                  ${salaCard("monitor_heart", "Endoscopia Altas", procedimientos.endoscopia_altas)}
                  ${salaCard("monitor_heart", "Endoscopia Bajas", procedimientos.endoscopia_bajas)}
                  ${salaCard("labs", "Maq. Hemodialisis", hemodialisis.maquinas_hemodialisis)}
              </div>
          </div>
          <div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:4px;height:22px;background:#c4af85;border-radius:2px;"></div><h3 style="font-size:17px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Equipamiento Medico</h3></div>
              <div class="res-grid-equip" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
                  ${equipCard("biotech", "Rayos X Fijo", equipos.rayos_x_fijos, "#1C4D32")}
                  ${equipCard("science", "Lab. Clinico (Peines)", equipos.peine_laboratorio_clinico, "#1C4D32")}
                  ${equipCard("monitor_heart", "Electrocardiografo", equipos.electrocardiografo, "#1C4D32")}
                  ${equipCard("radiology", "Mastografo Digital", equipos.mastografo_digital, "#1C4D32")}
                  ${equipCard("hub", "Rayos X Transp.", equipos.rayos_x_transportable, "#7b5454")}
                  ${equipCard("person_search", "Tomografo", equipos.tomografos, "#7b5454")}
              </div>
              <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(25,28,27,.06);">
                  <table style="width:100%;table-layout:fixed;border-collapse:collapse;text-align:left;">
                      <thead><tr style="background:#1C4D32;color:#fff;"><th style="padding:12px 18px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Equipo</th><th style="padding:12px 18px;font-size:10px;font-weight:700;text-transform:uppercase;text-align:right;">Cant.</th><th style="padding:12px 18px;font-size:10px;font-weight:700;text-transform:uppercase;text-align:right;width:120px;">Categoria</th></tr></thead>
                      <tbody style="background:#fff;">
                          ${
                            eqRows
                              .map(
                                ([nombre, val, cat], i, arr) =>
                                  `<tr style="border-bottom:${i < arr.length - 1 ? "1px solid #eef2ef" : "none"};"><td style="padding:11px 18px;font-size:13px;font-weight:600;color:#191c1b;">${nombre}</td><td style="padding:11px 18px;font-size:13px;font-weight:800;color:#1C4D32;text-align:right;">${parseInt(val)}</td><td style="padding:11px 10px;text-align:right;vertical-align:middle;"><span style="display:inline-flex;max-width:100%;padding:3px 8px;${catColor(cat)};border-radius:99px;font-size:9px;font-weight:800;text-transform:uppercase;line-height:1.15;white-space:normal;word-break:break-word;text-align:center;justify-content:center;">${cat}</span></td></tr>`,
                              )
                              .join("") ||
                            '<tr><td colspan="3" style="padding:20px;text-align:center;color:#717972;">Sin datos</td></tr>'
                          }
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="width:4px;height:28px;background:#414942;border-radius:2px;"></div><h3 style="font-size:20px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Unidades Moviles</h3></div>
      <div class="res-grid-bottomcards" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
          <div style="background:#f2f4f2;padding:24px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;border:1px solid #e2e8e4;"><div><p style="font-size:9px;color:#414942;font-weight:800;text-transform:uppercase;letter-spacing:.15em;margin:0 0 6px;">Total Ambulancias</p><span style="font-size:40px;font-weight:900;color:#1C4D32;font-family:'Noto Serif',serif;">${ambulancias.ambulancias || 0}</span></div><div style="width:48px;height:48px;background:rgba(28,77,50,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;"><span class="material-symbols-outlined" style="color:#1C4D32;">ambulance</span></div></div>
          <div style="background:#f2f4f2;padding:24px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;border:1px solid #e2e8e4;"><div><p style="font-size:9px;color:#414942;font-weight:800;text-transform:uppercase;letter-spacing:.15em;margin:0 0 6px;">Amb. Equipadas</p><span style="font-size:40px;font-weight:900;color:#7b5454;font-family:'Noto Serif',serif;">${ambulancias.ambulancias_equipadas || 0}</span></div><div style="width:48px;height:48px;background:rgba(123,84,84,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;"><span class="material-symbols-outlined" style="color:#7b5454;">emergency_share</span></div></div>
          <div style="background:#1C4D32;padding:24px;border-radius:12px;grid-column:span 2;display:flex;align-items:center;gap:20px;"><div style="width:52px;height:52px;background:rgba(255,255,255,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span class="material-symbols-outlined" style="color:#fff;font-size:28px;">local_hospital</span></div><div><h4 style="font-size:14px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px;">Recursos IMSS — OOAD Tabasco</h4><p style="font-size:11px;color:rgba(255,255,255,.6);margin:0;">Consolidado de todas las unidades medicas de la delegacion</p></div></div>
      </div>
  </section>
          `;
  },

  renderRecursosUMF(unidad) {
    const recursos = unidad.recursos_para_la_salud || {};
    const consultorios = recursos.consultorios || {};
    const camasNoCens = recursos.camas_no_censables || {};
    const camasCens = recursos.camas_censables || {};
    const servicios = recursos.servicios_especiales || {};
    const equipos = recursos.equipos_diagnostico || {};
    const ambulancias = recursos.ambulancias || {};

    const totalConsultorios =
      parseInt(consultorios.total_consultorio_unidad) || 0;
    const totalAmbul = parseInt(ambulancias.ambulancias) || 0;
    const totalNoCens = parseInt(camasNoCens.no_censables) || 0;
    const totalCens = parseInt(camasCens.total_censables) || 0;
    const totalCamas = totalNoCens + totalCens;

    const dataRow = (label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #eef2ef;padding-bottom:8px;margin-bottom:8px;"><span style="font-size:12px;color:#414942;font-weight:500;">${label}</span><span style="font-size:22px;font-weight:800;color:#1C4D32;font-family:'Noto Serif',serif;line-height:1;">${parseInt(val)}</span></div>`;
    };
    const dataRowRed = (label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #eef2ef;padding-bottom:8px;margin-bottom:8px;"><span style="font-size:12px;color:#414942;font-weight:500;">${label}</span><span style="font-size:22px;font-weight:800;color:#7b5454;font-family:'Noto Serif',serif;line-height:1;">${parseInt(val)}</span></div>`;
    };
    const sectionCard = (icon, label, color, rows) =>
      `<div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 4px 20px rgba(25,28,27,.06);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;"><span style="font-size:11px;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:.12em;">${label}</span><span class="material-symbols-outlined" style="color:#717972;font-size:20px;">${icon}</span></div>${rows}</div>`;
    const moduleBadge = (icon, label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:#fff;border-radius:10px;margin-bottom:6px;"><div style="display:flex;align-items:center;gap:10px;"><span class="material-symbols-outlined" style="color:#1C4D32;font-size:18px;">${icon}</span><span style="font-size:13px;font-weight:600;color:#191c1b;">${label}</span></div><div style="display:flex;align-items:center;gap:6px;"><span style="font-size:17px;font-weight:800;color:#1C4D32;font-family:'Noto Serif',serif;">${parseInt(val)}</span><span style="font-size:9px;font-weight:800;padding:2px 8px;background:#1C4D32;color:#fff;border-radius:99px;text-transform:uppercase;">ACTIVO</span></div></div>`;
    };
    const equipCard = (icon, label, val, color) => {
      if (!parseInt(val)) return "";
      return `<div style="background:#fff;padding:18px;border-radius:12px;border:1px solid #e2e8e4;display:flex;flex-direction:column;gap:12px;"><span class="material-symbols-outlined" style="color:${color};font-size:26px;">${icon}</span><div><h4 style="font-size:12px;font-weight:700;color:#191c1b;margin:0 0 4px;line-height:1.3;">${label}</h4><p style="font-size:20px;font-weight:900;color:${color};font-family:'Noto Serif',serif;margin:0;">${parseInt(val)}</p></div><span style="padding:2px 10px;background:#dcfce7;color:#15803d;border-radius:99px;font-size:9px;font-weight:800;text-transform:uppercase;width:fit-content;">Funcional</span></div>`;
    };
    const salaCard = (icon, label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="background:#f2f4f2;padding:14px 16px;border-radius:10px;border:1px solid #e2e8e4;display:flex;align-items:center;gap:14px;margin-bottom:8px;"><div style="width:44px;height:44px;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span class="material-symbols-outlined" style="color:#1C4D32;font-size:22px;">${icon}</span></div><div style="flex:1;"><h4 style="font-size:13px;font-weight:700;color:#191c1b;margin:0 0 2px;">${label}</h4><p style="font-size:11px;color:#717972;margin:0;">Disponible</p></div><span style="font-size:20px;font-weight:800;color:#1C4D32;font-family:'Noto Serif',serif;">${parseInt(val)}</span></div>`;
    };

    const eqInventory = [
      ["Lab. Clinico (Peines)", equipos.peine_laboratorio_clinico],
      ["Rayos X Fijo", equipos.rayos_x_fijos],
      ["Rayos X Transportable", equipos.rayos_x_transportable],
      ["Mastografo Digital", equipos.mastografo_digital],
      ["Electrocardiografo", equipos.electrocardiografo],
      ["Electromiografo", equipos.electromiografo],
      ["Electroencefalografo", equipos.electroencefalografo],
      ["Ecocardiografo", equipos.ecocardiografo],
      ["Tomografo", equipos.tomografos],
    ].filter(([, v]) => parseInt(v) > 0);

    return `
  <section id="sec-recursos" class="ft-section mb-10">
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:32px;">
          <h2 style="font-size:30px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Recursos para la Salud</h2>
          <p style="font-size:14px;color:#414942;margin:0;">Estado actual de infraestructura, equipamiento y unidades moviles</p>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="width:4px;height:28px;background:#1C4D32;border-radius:2px;"></div><h3 style="font-size:20px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Infraestructura Critica</h3></div>
      <div class="res-grid-top" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:40px;">
          ${sectionCard("medical_services", "Consultorios", "#1C4D32", dataRow("Total Unidad", consultorios.total_consultorio_unidad) + dataRow("Medicina Familiar", consultorios.medicina_familiar) + dataRow("Especialidad", consultorios.especialidad) + dataRow("AMC", consultorios.amc) + dataRow("Estomatologia", consultorios.estomatologia) + dataRow("Planif. Familiar", consultorios.planificacion_familiar) + dataRow("CADIMSS", consultorios.cadimss) + dataRow("Nutricion", consultorios.nutricion_dietetica))}
          ${sectionCard("bed", "Camas", "#7b5454", '<p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#717972;margin:0 0 8px;">No Censables</p>' + dataRowRed("Total No Censables", camasNoCens.no_censables) + dataRowRed("Camillas AMC", camasNoCens.camillas_amc) + dataRowRed("Obs. Adulto", camasNoCens.observacion_adulto) + dataRowRed("Obs. Pediatrica", camasNoCens.observacion_pediatrica) + '<p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#717972;margin:10px 0 8px;padding-top:10px;border-top:1px solid #eef2ef;">Censables</p>' + dataRowRed("Total Censables", camasCens.total_censables) + dataRowRed("Medicina Interna", camasCens.medicina_interna) + dataRowRed("Cirugia", camasCens.cirugia) + dataRowRed("Gineco-Obstetricia", camasCens.gineco_obstetricia) + dataRowRed("Pediatria", camasCens.pediatria) + dataRowRed("Cuna / Cir. Pediatrica", camasCens.cuna_cirugia_pediatrica))}
          <div style="background:#1C4D32;color:#fff;padding:28px;border-radius:12px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;position:relative;box-shadow:0 8px 32px rgba(28,77,50,.25);">
              <div style="position:relative;z-index:1;"><h3 style="font-size:18px;font-weight:700;font-family:'Noto Serif',serif;margin:0 0 4px;">Capacidad Total</h3><p style="font-size:9px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.15em;font-weight:800;margin:0;">Infraestructura Registrada</p></div>
              <div style="position:relative;z-index:1;padding:20px 0;">
                  <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:16px;"><span style="font-size:52px;font-weight:900;font-family:'Noto Serif',serif;line-height:1;">${totalConsultorios}</span><span style="font-size:14px;color:rgba(255,255,255,.7);">Consultorios</span></div>
                  <div style="width:100%;height:6px;background:rgba(255,255,255,.2);border-radius:99px;overflow:hidden;margin-bottom:10px;"><div style="height:100%;background:#fff;border-radius:99px;width:${Math.min(100, totalConsultorios)}%;"></div></div>
                  <div style="display:flex;justify-content:space-between;margin-top:12px;"><div><p style="font-size:9px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;margin:0 0 2px;">Camas</p><span style="font-size:22px;font-weight:900;font-family:'Noto Serif',serif;">${totalCamas}</span></div><div><p style="font-size:9px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;margin:0 0 2px;">Ambulancias</p><span style="font-size:22px;font-weight:900;font-family:'Noto Serif',serif;">${totalAmbul}</span></div></div>
              </div>
              <div style="position:absolute;right:-20px;bottom:-20px;opacity:.08;"><span class="material-symbols-outlined" style="font-size:140px;color:#fff;">analytics</span></div>
          </div>
      </div>
      <div class="res-grid-mid" style="display:grid;grid-template-columns:1fr 2fr;gap:28px;margin-bottom:40px;">
          <div style="display:flex;flex-direction:column;gap:24px;">
              <div>
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:4px;height:22px;background:#7b5454;border-radius:2px;"></div><h3 style="font-size:17px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Modulos de Atencion</h3></div>
                  <div style="background:#f2f4f2;border-radius:12px;padding:8px;">
                      ${moduleBadge("health_and_safety", "PrevenIMSS", servicios.prevenimss)}
                      ${moduleBadge("stethoscope", "Enf. Esp. Med. Familiar", servicios.enf_esp_med_familiar)}
                      ${moduleBadge("support_agent", "Atencion Orientacion DH", servicios.atencion_orientacion_dh)}
                      ${moduleBadge("bloodtype", "Banco de Sangre", servicios.banco_sangre)}
                  </div>
              </div>
              <div>
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:4px;height:22px;background:#5a6e5a;border-radius:2px;"></div><h3 style="font-size:17px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Salas de Procedimiento</h3></div>
                  ${salaCard("radiology", "Rayos X Fijo", equipos.rayos_x_fijos)}
                  ${salaCard("radiology", "Rayos X Transportable", equipos.rayos_x_transportable)}
                  ${salaCard("monitor_heart", "Electrocardiografo", equipos.electrocardiografo)}
                  ${salaCard("labs", "Lab. Clinico", equipos.peine_laboratorio_clinico)}
              </div>
          </div>
          <div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:4px;height:22px;background:#c4af85;border-radius:2px;"></div><h3 style="font-size:17px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Equipamiento Medico</h3></div>
              <div class="res-grid-equip" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
                  ${equipCard("biotech", "Rayos X Fijo", equipos.rayos_x_fijos, "#1C4D32")}
                  ${equipCard("science", "Lab. Clinico (Peines)", equipos.peine_laboratorio_clinico, "#1C4D32")}
                  ${equipCard("monitor_heart", "Electrocardiografo", equipos.electrocardiografo, "#1C4D32")}
                  ${equipCard("radiology", "Mastografo Digital", equipos.mastografo_digital, "#1C4D32")}
                  ${equipCard("hub", "Rayos X Transportable", equipos.rayos_x_transportable, "#7b5454")}
                  ${equipCard("person_search", "Tomografo", equipos.tomografos, "#7b5454")}
              </div>
              <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(25,28,27,.06);">
                  <table style="width:100%;table-layout:fixed;border-collapse:collapse;text-align:left;">
                      <thead><tr style="background:#1C4D32;color:#fff;"><th style="padding:12px 18px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Equipo</th><th style="padding:12px 18px;font-size:10px;font-weight:700;text-transform:uppercase;text-align:right;">Cant.</th><th style="padding:12px 18px;font-size:10px;font-weight:700;text-transform:uppercase;text-align:right;">Estado</th></tr></thead>
                      <tbody style="background:#fff;">
                          ${
                            eqInventory
                              .map(
                                ([nombre, val], i, arr) =>
                                  `<tr style="border-bottom:${i < arr.length - 1 ? "1px solid #eef2ef" : "none"};"><td style="padding:11px 18px;font-size:13px;font-weight:600;color:#191c1b;">${nombre}</td><td style="padding:11px 18px;font-size:13px;font-weight:800;color:#1C4D32;text-align:right;">${parseInt(val)}</td><td style="padding:11px 18px;text-align:right;"><span style="padding:3px 10px;background:#dcfce7;color:#15803d;border-radius:99px;font-size:9px;font-weight:800;text-transform:uppercase;">FUNCIONAL</span></td></tr>`,
                              )
                              .join("") ||
                            '<tr><td colspan="3" style="padding:20px;text-align:center;color:#717972;">Sin datos</td></tr>'
                          }
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="width:4px;height:28px;background:#ba1a1a;border-radius:2px;"></div><h3 style="font-size:20px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Unidades Moviles y Ambulancias</h3></div>
      <div class="res-grid-bottomcards" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
          <div style="background:#f2f4f2;padding:24px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;border:1px solid #e2e8e4;"><div><p style="font-size:9px;color:#414942;font-weight:800;text-transform:uppercase;letter-spacing:.15em;margin:0 0 6px;">Activas</p><span style="font-size:40px;font-weight:900;color:#1C4D32;font-family:'Noto Serif',serif;">${ambulancias.ambulancias || 0}</span></div><div style="width:48px;height:48px;background:rgba(28,77,50,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;"><span class="material-symbols-outlined" style="color:#1C4D32;font-size:24px;">ambulance</span></div></div>
          <div style="background:#f2f4f2;padding:24px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;border:1px solid #e2e8e4;"><div><p style="font-size:9px;color:#414942;font-weight:800;text-transform:uppercase;letter-spacing:.15em;margin:0 0 6px;">Total Camas</p><span style="font-size:40px;font-weight:900;color:#7b5454;font-family:'Noto Serif',serif;">${totalCamas}</span></div><div style="width:48px;height:48px;background:rgba(123,84,84,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;"><span class="material-symbols-outlined" style="color:#7b5454;font-size:24px;">bed</span></div></div>
          <div style="background:#1C4D32;padding:24px;border-radius:12px;grid-column:span 2;display:flex;align-items:center;gap:20px;"><div style="width:52px;height:52px;background:rgba(255,255,255,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span class="material-symbols-outlined" style="color:#fff;font-size:28px;">local_hospital</span></div><div><h4 style="font-size:14px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px;">UMF · IMSS Tabasco</h4><p style="font-size:11px;color:rgba(255,255,255,.6);margin:0;">Fuente: IFU — Recursos para la Salud</p></div></div>
      </div>
  </section>
          `;
  },

  renderRecursosHGZ(unidad) {
    const recursos = unidad.recursos_para_la_salud || {};
    const consultorios = recursos.consultorios || {};
    const camasCensables = recursos.camas_censables || {};
    const camasNoCensables = recursos.camas_no_censables || {};
    const quirofanos = recursos.quirofanos || {};
    const urgencias = recursos.urgencias || {};
    const equipos = recursos.equipos_diagnostico || {};
    const procedimientos = recursos.procedimientos || {};
    const hemodialisis = recursos.hemodialisis || {};
    const ambulancias = recursos.ambulancias || {};

    const totalConsultorios =
      parseInt(consultorios.total_consultorio_unidad) || 0;
    const totalCamasCens = parseInt(camasCensables.total_censables) || 0;
    const totalCamasNoCens = parseInt(camasNoCensables.no_censables) || 0;
    const totalAmbul = parseInt(ambulancias.ambulancias) || 0;
    const totalQuirofanos = parseInt(quirofanos.quirofanos) || 0;
    const totalCamas = totalCamasCens + totalCamasNoCens;

    const dataRow = (label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #eef2ef;padding-bottom:8px;margin-bottom:8px;"><span style="font-size:12px;color:#414942;font-weight:500;">${label}</span><span style="font-size:22px;font-weight:800;color:#1C4D32;font-family:'Noto Serif',serif;line-height:1;">${parseInt(val)}</span></div>`;
    };
    const dataRowRed = (label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1px solid #eef2ef;padding-bottom:8px;margin-bottom:8px;"><span style="font-size:12px;color:#414942;font-weight:500;">${label}</span><span style="font-size:22px;font-weight:800;color:#7b5454;font-family:'Noto Serif',serif;line-height:1;">${parseInt(val)}</span></div>`;
    };
    const sectionCard = (icon, label, color, rows) =>
      `<div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 4px 20px rgba(25,28,27,.06);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;"><span style="font-size:11px;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:.12em;">${label}</span><span class="material-symbols-outlined" style="color:#717972;font-size:20px;">${icon}</span></div>${rows}</div>`;
    const equipCard = (icon, label, val, color) => {
      if (!parseInt(val)) return "";
      return `<div style="background:#fff;padding:18px;border-radius:12px;border:1px solid #e2e8e4;display:flex;flex-direction:column;gap:12px;"><span class="material-symbols-outlined" style="color:${color};font-size:26px;">${icon}</span><div><h4 style="font-size:12px;font-weight:700;color:#191c1b;margin:0 0 4px;line-height:1.3;">${label}</h4><p style="font-size:20px;font-weight:900;color:${color};font-family:'Noto Serif',serif;margin:0;">${parseInt(val)}</p></div><span style="padding:2px 10px;background:#dcfce7;color:#15803d;border-radius:99px;font-size:9px;font-weight:800;text-transform:uppercase;width:fit-content;">Funcional</span></div>`;
    };
    const salaCard = (icon, label, val) => {
      if (!parseInt(val)) return "";
      return `<div style="background:#f2f4f2;padding:14px 16px;border-radius:10px;border:1px solid #e2e8e4;display:flex;align-items:center;gap:14px;margin-bottom:8px;"><div style="width:44px;height:44px;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span class="material-symbols-outlined" style="color:#1C4D32;font-size:22px;">${icon}</span></div><div style="flex:1;"><h4 style="font-size:13px;font-weight:700;color:#191c1b;margin:0 0 2px;">${label}</h4><p style="font-size:11px;color:#717972;margin:0;">Disponible</p></div><span style="font-size:20px;font-weight:800;color:#1C4D32;font-family:'Noto Serif',serif;">${parseInt(val)}</span></div>`;
    };

    const eqInventory = [
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
    ].filter(([, v]) => parseInt(v) > 0);

    const catColor = (cat) => {
      if (cat === "Sala Proc.") return "background:#dbeafe;color:#1d4ed8";
      if (cat === "Hemodialisis") return "background:#fef3c7;color:#b45309";
      if (cat === "Tomografia") return "background:#f3e8ff;color:#7e22ce";
      return "background:#dcfce7;color:#15803d";
    };

    return `
  <section id="sec-recursos" class="ft-section mb-10">
      <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:32px;">
          <h2 style="font-size:30px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Recursos para la Salud</h2>
          <p style="font-size:14px;color:#414942;margin:0;">Infraestructura, equipamiento y servicios del hospital</p>
      </div>
      <div class="res-grid-kpis" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:40px;">
          ${[
            ["medical_services", "Consultorios", totalConsultorios, "#1C4D32"],
            ["bed", "Camas Censables", totalCamasCens, "#7b5454"],
            ["king_bed", "No Censables", totalCamasNoCens, "#414942"],
            ["surgical", "Quirofanos", totalQuirofanos, "#1C4D32"],
            ["ambulance", "Ambulancias", totalAmbul, "#7b5454"],
          ]
            .map(
              ([icon, label, val, color]) =>
                `<div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 4px 20px rgba(25,28,27,.06);display:flex;flex-direction:column;gap:8px;"><div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:10px;font-weight:700;color:#717972;text-transform:uppercase;letter-spacing:.1em;">${label}</span><span class="material-symbols-outlined" style="font-size:18px;color:${color};">${icon}</span></div><span style="font-size:40px;font-weight:900;font-family:'Noto Serif',serif;color:${color};line-height:1;">${val}</span></div>`,
            )
            .join("")}
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="width:4px;height:28px;background:#1C4D32;border-radius:2px;"></div><h3 style="font-size:20px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Infraestructura Hospitalaria</h3></div>
      <div class="res-grid-infra" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:20px;margin-bottom:40px;">
          ${sectionCard("medical_services", "Consultorios", "#1C4D32", dataRow("Total Unidad", consultorios.total_consultorio_unidad) + dataRow("Medicina Familiar", consultorios.medicina_familiar) + dataRow("Especialidad", consultorios.especialidad) + dataRow("Urgencias Medicas", consultorios.urgencias_medicas) + dataRow("Aten. Medica Continua", consultorios.atn_medica_continua) + dataRow("Profesionales", consultorios.profesionales))}
          ${sectionCard("bed", "Camas", "#7b5454", '<p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#717972;margin:0 0 8px;">Censables</p>' + dataRowRed("Total Censables", camasCensables.total_censables) + dataRowRed("Medicina Interna", camasCensables.medicina_interna) + dataRowRed("Cirugia", camasCensables.cirugia) + dataRowRed("Gineco-Obstetricia", camasCensables.gineco_obstetricia) + dataRowRed("Pediatria", camasCensables.pediatria) + dataRowRed("Cuna / Cir. Pediatrica", camasCensables.cuna_cirugia_pediatrica) + '<p style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#717972;margin:10px 0 8px;padding-top:10px;border-top:1px solid #eef2ef;">No Censables</p>' + dataRowRed("No Censables", camasNoCensables.no_censables))}
          ${sectionCard("surgical", "Quirofanos", "#1C4D32", dataRow("Quirofanos", quirofanos.quirofanos) + dataRow("Sala de Expulsion", quirofanos.sala_expulsion) + dataRow("Mixta Cir.-Tococirug.", quirofanos.mixta_cirugia_tococirugia) + dataRow("Urgencias", quirofanos.urgencias) + dataRow("Tococirugia", quirofanos.tococirugia) + dataRow("Hibrida", quirofanos.hibrida))}
          <div style="background:#1C4D32;color:#fff;padding:28px;border-radius:12px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;position:relative;box-shadow:0 8px 32px rgba(28,77,50,.25);">
              <div style="position:relative;z-index:1;"><h3 style="font-size:18px;font-weight:700;font-family:'Noto Serif',serif;margin:0 0 4px;">Capacidad Total</h3><p style="font-size:9px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.15em;font-weight:800;margin:0;">Infraestructura Registrada</p></div>
              <div style="position:relative;z-index:1;padding:20px 0;">
                  <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:16px;"><span style="font-size:52px;font-weight:900;font-family:'Noto Serif',serif;line-height:1;">${totalCamas}</span><span style="font-size:14px;color:rgba(255,255,255,.7);">Camas Totales</span></div>
                  <div style="width:100%;height:6px;background:rgba(255,255,255,.2);border-radius:99px;overflow:hidden;margin-bottom:10px;"><div style="height:100%;background:#fff;border-radius:99px;width:${Math.min(100, Math.round((totalCamasCens / (totalCamas || 1)) * 100))}%;"></div></div>
                  <p style="font-size:9px;color:rgba(255,255,255,.5);margin:0 0 12px;">Censables vs No Censables</p>
                  <div style="display:flex;justify-content:space-between;"><div><p style="font-size:9px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;margin:0 0 2px;">Consultorios</p><span style="font-size:22px;font-weight:900;font-family:'Noto Serif',serif;">${totalConsultorios}</span></div><div><p style="font-size:9px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;margin:0 0 2px;">Quirofanos</p><span style="font-size:22px;font-weight:900;font-family:'Noto Serif',serif;">${totalQuirofanos}</span></div></div>
              </div>
              <div style="position:absolute;right:-20px;bottom:-20px;opacity:.08;"><span class="material-symbols-outlined" style="font-size:140px;color:#fff;">analytics</span></div>
          </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="width:4px;height:28px;background:#ba1a1a;border-radius:2px;"></div><h3 style="font-size:20px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Urgencias y Equipamiento</h3></div>
      <div class="res-grid-mid" style="display:grid;grid-template-columns:1fr 2fr;gap:28px;margin-bottom:40px;">
          <div style="display:flex;flex-direction:column;gap:20px;">
              ${sectionCard("emergency", "Urgencias", "#ba1a1a", dataRow("Total Camas Urgencias", urgencias.total_camas_urgencias) + dataRow("Observacion Adulto", urgencias.cama_observ_adulto) + dataRow("Observacion Pediatrica", urgencias.cama_observ_pediatrica) + dataRow("Corta Estancia", urgencias.cama_corta_estancia) + dataRow("Reanimacion Adulto", urgencias.reanimacion_adulto))}
              <div>
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><div style="width:4px;height:22px;background:#5a6e5a;border-radius:2px;"></div><h3 style="font-size:16px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Salas de Procedimiento</h3></div>
                  ${salaCard("radiology", "Radiodiagnostico", procedimientos.radiodiagnostico)}
                  ${salaCard("biotech", "Proc. Quirurgicos", procedimientos.procedimientos_quirurgicos)}
                  ${salaCard("monitor_heart", "Endoscopia Altas", procedimientos.endoscopia_altas)}
                  ${salaCard("monitor_heart", "Endoscopia Bajas", procedimientos.endoscopia_bajas)}
                  ${salaCard("labs", "Maq. Hemodialisis", hemodialisis.maquinas_hemodialisis)}
              </div>
          </div>
          <div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:4px;height:22px;background:#c4af85;border-radius:2px;"></div><h3 style="font-size:17px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Equipamiento Medico</h3></div>
              <div class="res-grid-equip" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
                  ${equipCard("biotech", "Rayos X Fijo", equipos.rayos_x_fijos, "#1C4D32")}
                  ${equipCard("science", "Lab. Clinico (Peines)", equipos.peine_laboratorio_clinico, "#1C4D32")}
                  ${equipCard("monitor_heart", "Electrocardiografo", equipos.electrocardiografo, "#1C4D32")}
                  ${equipCard("radiology", "Mastografo Digital", equipos.mastografo_digital, "#1C4D32")}
                  ${equipCard("hub", "Rayos X Transp.", equipos.rayos_x_transportable, "#7b5454")}
                  ${equipCard("person_search", "Tomografo", equipos.tomografos, "#7b5454")}
              </div>
              <div style="border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(25,28,27,.06);">
                  <table style="width:100%;table-layout:fixed;border-collapse:collapse;text-align:left;">
                      <thead><tr style="background:#1C4D32;color:#fff;"><th style="padding:12px 18px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Equipo</th><th style="padding:12px 18px;font-size:10px;font-weight:700;text-transform:uppercase;text-align:right;">Cant.</th><th style="padding:12px 18px;font-size:10px;font-weight:700;text-transform:uppercase;text-align:right;width:120px;">Categoria</th></tr></thead>
                      <tbody style="background:#fff;">
                          ${
                            eqInventory
                              .map(
                                ([nombre, val, cat], i, arr) =>
                                  `<tr style="border-bottom:${i < arr.length - 1 ? "1px solid #eef2ef" : "none"};"><td style="padding:11px 18px;font-size:13px;font-weight:600;color:#191c1b;">${nombre}</td><td style="padding:11px 18px;font-size:13px;font-weight:800;color:#1C4D32;text-align:right;">${parseInt(val)}</td><td style="padding:11px 10px;text-align:right;vertical-align:middle;"><span style="display:inline-flex;max-width:100%;padding:3px 8px;${catColor(cat)};border-radius:99px;font-size:9px;font-weight:800;text-transform:uppercase;line-height:1.15;white-space:normal;word-break:break-word;text-align:center;justify-content:center;">${cat}</span></td></tr>`,
                              )
                              .join("") ||
                            '<tr><td colspan="3" style="padding:20px;text-align:center;color:#717972;">Sin datos</td></tr>'
                          }
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;"><div style="width:4px;height:28px;background:#414942;border-radius:2px;"></div><h3 style="font-size:20px;font-weight:700;color:#1C4D32;font-family:'Noto Serif',serif;margin:0;">Unidades Moviles</h3></div>
      <div class="res-grid-bottomcards" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
          <div style="background:#f2f4f2;padding:24px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;border:1px solid #e2e8e4;"><div><p style="font-size:9px;color:#414942;font-weight:800;text-transform:uppercase;letter-spacing:.15em;margin:0 0 6px;">Total Ambulancias</p><span style="font-size:40px;font-weight:900;color:#1C4D32;font-family:'Noto Serif',serif;">${ambulancias.ambulancias || 0}</span></div><div style="width:48px;height:48px;background:rgba(28,77,50,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;"><span class="material-symbols-outlined" style="color:#1C4D32;">ambulance</span></div></div>
          <div style="background:#f2f4f2;padding:24px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;border:1px solid #e2e8e4;"><div><p style="font-size:9px;color:#414942;font-weight:800;text-transform:uppercase;letter-spacing:.15em;margin:0 0 6px;">Amb. Equipadas</p><span style="font-size:40px;font-weight:900;color:#7b5454;font-family:'Noto Serif',serif;">${ambulancias.ambulancias_equipadas || 0}</span></div><div style="width:48px;height:48px;background:rgba(123,84,84,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;"><span class="material-symbols-outlined" style="color:#7b5454;">emergency_share</span></div></div>
          <div style="background:#1C4D32;padding:24px;border-radius:12px;grid-column:span 2;display:flex;align-items:center;gap:20px;"><div style="width:52px;height:52px;background:rgba(255,255,255,.15);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><span class="material-symbols-outlined" style="color:#fff;font-size:28px;">local_hospital</span></div><div><h4 style="font-size:14px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px;">Recursos IMSS — HGZ</h4><p style="font-size:11px;color:rgba(255,255,255,.6);margin:0;">Sistema de Registro RENAPO · CLUES</p></div></div>
      </div>
  </section>
          `;
  },

  renderRecursosParaLaSalud(unidad) {
    const tipoUnidad = unidad.informacion_general.tipo_unidad;
    const nombreUnidad = unidad.informacion_general.nombre_unidad;

    // Verificar si tiene datos de recursos
    if (!unidad.recursos_para_la_salud) {
      // Para hospitales, no mostrar mensaje si no hay recursos (es normal en modo HGZ)
      if (
        tipoUnidad === "Hospital General de Zona" ||
        tipoUnidad === "Hospital General de Subzona" ||
        tipoUnidad === "Hospital General de Subzona con Medicina Familiar"
      ) {
        return ""; // No mostrar nada
      }

      // Para UMF, mostrar advertencia
      return `
              <div class="recursos-salud-section">
                  <div class="recursos-header">
                      <h2>RECURSOS PARA LA SALUD</h2>
                  </div>
                  <div class="alert alert-warning">
                      <p> No se encontraron datos de recursos para esta unidad.</p>
                      <p>Ejecute el script de extracción de datos del IFU para obtener esta información.</p>
                  </div>
              </div>`;
    }

    // Renderizar según tipo de unidad
    if (tipoUnidad === "OOAD") {
      // OOAD usa template personalizado que muestra los 10 grupos de recursos consolidados
      return this.renderRecursosOOAD(unidad);
    } else if (tipoUnidad === "Unidad de Medicina Familiar") {
      return this.renderRecursosUMF(unidad);
    } else if (
      tipoUnidad === "Hospital General de Zona" ||
      tipoUnidad === "Hospital General de Subzona"
    ) {
      // Todos los hospitales (HGZ y HGSZMF) usan template complejo
      return this.renderRecursosHGZ(unidad);
    } else {
      // Para otros tipos, usar template UMF como base
      return this.renderRecursosUMF(unidad);
    }
  },
});
