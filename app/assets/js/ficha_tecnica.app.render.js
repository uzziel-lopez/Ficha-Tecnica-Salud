Object.assign(FichaTecnicaApp.prototype, {
  renderFicha() {
    const unit = this.currentUnit;
    const info = {
      ...unit.informacion_general,
      jurisdiccion: `${unit.informacion_general.datos_administrativos_completos["Clave Jurisdicción Sanitaria"]} - ${unit.informacion_general.datos_administrativos_completos["Jurisdicción Sanitaria"]}`,
    };

    const infoUnidad = info.datos_administrativos_completos;
    const poblacion = unit.poblacion_adscrita;
    const asegurada = unit.poblacion_asegurada;
    const piramide = unit.piramide_poblacional;
    const rutaImagen = this.sistemaImagenes.obtenerImagenUnidad(unit);

    // Actualizar sidebar con nombre de la unidad
    const sidebarName = document.getElementById("sidebarUnitName");
    const sidebarType = document.getElementById("sidebarUnitType");
    if (sidebarName) sidebarName.textContent = info.nombre_unidad;
    if (sidebarType)
      sidebarType.textContent = `${info.tipo_unidad} · ${info.municipio}`;

    // HIDE HOSPITALIZACION SI SU UNIDAD ES UMF
    const navHosp = document.querySelector('a[href="#sec-hospitalizacion"]');
    if (navHosp) {
      if (info.tipo_unidad === "Unidad de Medicina Familiar") {
        navHosp.style.display = "none";
      } else {
        navHosp.style.display = "flex";
      }
    }

    // Determinar nivel de atención para el badge
    const nivelBadge = info.nivel_atencion
      ? info.nivel_atencion.includes("2") ||
        info.nivel_atencion.toLowerCase().includes("hospital")
        ? "Segundo Nivel de Atención"
        : "Primer Nivel de Atención"
      : "IMSS Tabasco";

    const fichaHTML = `
          <div class="ft-shell" style="max-width:1200px; margin:0 auto; padding:20px 24px 48px;">
  
              <!-- ===== HERO SECTION ===== -->
              <section id="sec-info" class="ft-section ft-hero relative rounded-2xl overflow-hidden shadow-2xl mb-8" style="height:400px;">
                  <img
                      src="${rutaImagen}"
                      alt="${info.nombre_unidad}"
                      class="absolute inset-0 w-full h-full"
                      style="object-fit:cover; object-position:center;"
                      onerror="this.src='${this.sistemaImagenes.defaultImage}';"
                  >
                  <div class="absolute inset-0" style="background:linear-gradient(to top, rgba(0,0,0,.92) 0%, rgba(0,0,0,.4) 55%, rgba(0,0,0,.1) 100%);"></div>
  
                  <!-- Badge tipo + logo IMSS flotante -->
                  <div class="absolute top-6 right-6 bg-white p-2 rounded-xl shadow-lg">
                      <img src="../assets/img/imagenes/logo_imss.png" alt="IMSS" style="height:36px;" onerror="this.style.display='none'">
                  </div>
  
                  <!-- Contenido inferior -->
                  <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <div class="flex items-center gap-3 mb-4">
                          <span class="px-3 py-1 text-white text-[10px] font-bold tracking-[.18em] uppercase rounded-full" style="background:rgba(123,84,84,.9);">${info.tipo_unidad}</span>
                          <span class="px-3 py-1 text-white text-[10px] font-bold tracking-[.12em] uppercase rounded-full" style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);">${nivelBadge}</span>
                      </div>
                      <h1 class="text-4xl font-bold leading-tight drop-shadow-lg mb-2" style="font-family:'Noto Serif',serif;">${info.nombre_unidad}</h1>
                      <p class="text-white/80 text-sm">${info.municipio}, Tabasco &mdash; Clave: <strong class="text-white/90">${info.clave_presupuestal}</strong></p>
                  </div>
              </section>
  
              <!-- ===== GRID PRINCIPAL: info + panel técnico ===== -->
              <div class="ft-main-grid grid gap-6 mb-6" style="grid-template-columns: 1fr 320px; align-items:start;">
  
                  <!-- Columna principal -->
                  <div style="display:flex; flex-direction:column; gap:20px;">
  
                      <!-- GOBIERNO DE LA UNIDAD -->
                      <div class="relative overflow-hidden rounded-2xl bg-white border p-7 shadow-sm" style="border-color:#e2e8e4;">
                          <div class="absolute top-0 right-0 w-40 h-40 rounded-full" style="background:rgba(28,77,50,.04); margin-top:-3rem; margin-right:-3rem;"></div>
                          <div class="flex items-center gap-3 mb-6 pb-4" style="border-bottom:1px solid #e8eeea;">
                              <span class="material-symbols-outlined ms-fill text-primary" style="font-size:26px;">account_balance</span>
                              <h3 class="text-lg font-bold text-primary" style="font-family:'Noto Serif',serif;">Gobierno de la Unidad</h3>
                          </div>
                          <div class="grid gap-y-6 gap-x-8" style="grid-template-columns: 1fr 1fr;">
                              <div>
                                  <label class="block text-[10px] font-black text-on-muted uppercase tracking-[.15em] mb-1">Responsable de Unidad</label>
                                  <p class="text-base font-bold text-on-surface" style="font-family:'Noto Serif',serif;">${info.responsable || "Por definir"}</p>
                                  <p class="text-primary text-xs font-medium mt-0.5">${info.cargo || "Director(a) de Unidad Médica"}</p>
                              </div>
                              <div>
                                  <label class="block text-[10px] font-black text-on-muted uppercase tracking-[.15em] mb-1">CLUES</label>
                                  <p class="text-base font-semibold text-on-surface font-mono">${info.clues || "No disponible"}</p>
                              </div>
                              <div>
                                  <label class="block text-[10px] font-black text-on-muted uppercase tracking-[.15em] mb-1">Domicilio</label>
                                  <p class="text-sm font-medium text-on-surface leading-snug">${infoUnidad["Dirección"] || "No disponible"}</p>
                              </div>
                              <div>
                                  <label class="block text-[10px] font-black text-on-muted uppercase tracking-[.15em] mb-1">Jurisdicción Sanitaria</label>
                                  <p class="text-sm font-medium text-on-surface">${info.jurisdiccion}</p>
                              </div>
                              <div>
                                  <label class="block text-[10px] font-black text-on-muted uppercase tracking-[.15em] mb-1">Clave Personal</label>
                                  <p class="text-sm font-semibold text-on-surface">${infoUnidad["Clave Personal"] || "No disponible"}</p>
                              </div>
                              <div>
                                  <label class="block text-[10px] font-black text-on-muted uppercase tracking-[.15em] mb-1">Inicio de Productividad</label>
                                  <p class="text-sm font-semibold text-on-surface">${infoUnidad["Inicio de Productividad"] || "No disponible"}</p>
                              </div>
                              <div>
                                  <label class="block text-[10px] font-black text-on-muted uppercase tracking-[.15em] mb-1">Unidad PREI</label>
                                  <p class="text-sm font-semibold text-on-surface">${infoUnidad["Unidad de Información PREI"] || "No disponible"}</p>
                              </div>
                              <div>
                                  <label class="block text-[10px] font-black text-on-muted uppercase tracking-[.15em] mb-1">Zona / Turno</label>
                                  <p class="text-sm font-semibold text-on-surface">${info.zona || "No disponible"}</p>
                              </div>
                          </div>
                      </div>
  
                      <!-- TARJETAS: Geolocalización + Operatividad -->
                      <div class="ft-info-cards-grid grid gap-5" style="grid-template-columns:1fr 1fr;">
  
                          <!-- Geolocalización -->
                          <div class="rounded-2xl p-6 border" style="background:#f2f4f2; border-color:#dde5de;">
                              <div class="flex items-center gap-2 mb-4">
                                  <div class="p-1.5 rounded-lg" style="background:rgba(28,77,50,.1);">
                                      <span class="material-symbols-outlined text-primary" style="font-size:20px;">location_on</span>
                                  </div>
                                  <h4 class="text-[11px] font-black text-on-surface uppercase tracking-[.18em]">Geolocalización</h4>
                              </div>
                              <p class="text-sm font-medium text-on-surface leading-relaxed mb-5 italic">"${infoUnidad["Dirección"] || info.municipio + ", Tabasco"}"</p>
                              <div class="flex justify-between items-center pt-4" style="border-top:1px solid #c8d5c9;">
                                  <span class="text-[10px] font-bold text-on-muted uppercase tracking-widest">Delegación</span>
                                  <span class="text-[10px] font-black text-white px-3 py-1 rounded-full" style="background:#1C4D32;">Tabasco</span>
                              </div>
                          </div>
  
                          <!-- Operatividad -->
                          <div class="rounded-2xl bg-white p-6 border shadow-sm" style="border-color:#e2e8e4;">
                              <div class="flex items-center gap-2 mb-4">
                                  <div class="p-1.5 rounded-lg" style="background:rgba(123,84,84,.1);">
                                      <span class="material-symbols-outlined text-secondary" style="font-size:20px;">schedule</span>
                                  </div>
                                  <h4 class="text-[11px] font-black text-on-surface uppercase tracking-[.18em]">Operatividad</h4>
                              </div>
                              <div style="display:flex; flex-direction:column; gap:10px;">
                                  <div class="flex justify-between items-center pb-2" style="border-bottom:1px solid #eef2ef;">
                                      <span class="text-xs text-on-muted font-medium">Nivel de Atención</span>
                                      <span class="text-xs font-bold text-on-surface">${info.nivel_atencion || "Primer nivel"}</span>
                                  </div>
                                  <div class="flex justify-between items-center pb-2" style="border-bottom:1px solid #eef2ef;">
                                      <span class="text-xs text-on-muted font-medium">Tipo de Unidad</span>
                                      <span class="text-xs font-bold text-on-surface">${info.tipo_unidad}</span>
                                  </div>
                                  <div class="flex justify-between items-center">
                                      <span class="text-xs text-on-muted font-medium">Estatus</span>
                                      <span class="flex items-center gap-1.5 text-[10px] font-black text-white px-3 py-1 rounded-full" style="background:#1C4D32;">
                                          <span class="w-1.5 h-1.5 rounded-full bg-white" style="animation:blink 2s infinite;"></span>
                                          ACTIVO
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </div>
  
                  </div><!-- /columna principal -->
  
                  <!-- Panel técnico oscuro -->
                  <div class="text-white rounded-2xl p-7 shadow-2xl relative overflow-hidden" style="background:#1e2a24; border:1px solid rgba(255,255,255,.06);">
                      <div class="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl" style="background:rgba(255,255,255,.03);"></div>
                      <div class="flex justify-between items-start mb-6 pb-4" style="border-bottom:1px solid rgba(255,255,255,.1);">
                          <h3 class="text-base font-bold" style="font-family:'Noto Serif',serif;">Datos Técnicos</h3>
                          <span class="material-symbols-outlined" style="font-size:20px; color:rgba(255,255,255,.25);">analytics</span>
                      </div>
                      <div style="display:flex; flex-direction:column; gap:20px;">
                          <div>
                              <div class="flex justify-between items-end mb-1">
                                  <span class="text-[9px] font-black uppercase tracking-widest" style="color:rgba(255,255,255,.45);">Longitud</span>
                                  <span class="material-symbols-outlined" style="font-size:16px; color:rgba(255,255,255,.2);">explore</span>
                              </div>
                              <span class="text-base font-mono font-bold" style="color:#9ed2af;">${infoUnidad.Longitud || "&mdash;"}</span>
                          </div>
                          <div>
                              <div class="flex justify-between items-end mb-1">
                                  <span class="text-[9px] font-black uppercase tracking-widest" style="color:rgba(255,255,255,.45);">Latitud</span>
                                  <span class="material-symbols-outlined" style="font-size:16px; color:rgba(255,255,255,.2);">explore</span>
                              </div>
                              <span class="text-base font-mono font-bold" style="color:#9ed2af;">${infoUnidad.Latitud || "&mdash;"}</span>
                          </div>
                          <div style="padding-top:16px; border-top:1px solid rgba(255,255,255,.1);">
                              <div class="flex justify-between items-end mb-1">
                                  <span class="text-[9px] font-black uppercase tracking-widest" style="color:rgba(255,255,255,.45);">Sup. Terreno</span>
                                  <span class="material-symbols-outlined" style="font-size:16px; color:rgba(255,255,255,.2);">square_foot</span>
                              </div>
                              <span class="text-xl font-bold text-white">${infoUnidad["Superficie total en metros cuadrados"] ? this.formatNumber(infoUnidad["Superficie total en metros cuadrados"]) : "&mdash;"} <span class="text-sm font-normal" style="color:rgba(255,255,255,.5);">m²</span></span>
                          </div>
                          <div>
                              <div class="flex justify-between items-end mb-1">
                                  <span class="text-[9px] font-black uppercase tracking-widest" style="color:rgba(255,255,255,.45);">Sup. Construida</span>
                                  <span class="material-symbols-outlined" style="font-size:16px; color:rgba(255,255,255,.2);">architecture</span>
                              </div>
                              <span class="text-xl font-bold text-white">${infoUnidad["Superficie construida en metros cuadrados"] ? this.formatNumber(infoUnidad["Superficie construida en metros cuadrados"]) : "&mdash;"} <span class="text-sm font-normal" style="color:rgba(255,255,255,.5);">m²</span></span>
                          </div>
                          <div style="padding-top:16px; border-top:1px solid rgba(255,255,255,.1);">
                              <div class="flex justify-between items-end mb-1">
                                  <span class="text-[9px] font-black uppercase tracking-widest" style="color:rgba(255,255,255,.45);">Clave Presupuestal</span>
                              </div>
                              <span class="text-lg font-bold font-mono" style="color:#baefca;">${info.clave_presupuestal}</span>
                          </div>
                      </div>
                      <button onclick="window.ftApp?.exportInstitutionalPDF()" class="mt-6 w-full py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all" style="background:rgba(255,255,255,.08); color:rgba(255,255,255,.75); border:1px solid rgba(255,255,255,.12);" onmouseover="this.style.background='rgba(255,255,255,.15)'" onmouseout="this.style.background='rgba(255,255,255,.08)'">
                          <span class="material-symbols-outlined" style="font-size:16px;">download</span>
                          Descargar Ficha PDF
                      </button>
                  </div><!-- /panel técnico -->
  
              </div><!-- /grid principal -->
  
              <!-- ===== SECCIÓN POBLACIÓN ===== -->
              <section id="sec-poblacion" class="ft-section mb-10">
                  <!-- Header de sección -->
                  <div class="mb-8 flex justify-between items-end">
                      <div>
                          <h2 class="text-3xl font-bold mb-1" style="color:#1C4D32; font-family:'Noto Serif',serif;">Análisis Poblacional</h2>
                          <p class="text-sm" style="color:#414942;">${info.zona ? info.zona + " · " : ""}${info.municipio}, Tabasco</p>
                      </div>
                      <div class="text-right">
                          <span class="text-[9px] font-bold uppercase tracking-widest block mb-1" style="color:#7b5454;">Periodo Actual</span>
                          <span class="text-base font-bold" style="font-family:'Noto Serif',serif; color:#191c1b;">Acumulado 2025</span>
                      </div>
                  </div>
  
                  <!-- Bento Grid: Población Adscrita (4 métricas) -->
                  <div class="ft-pop-grid grid gap-5 mb-6" style="grid-template-columns:repeat(4,1fr);">
                      <div class="p-6 rounded-2xl shadow-sm" style="background:#f2f4f2; border-left:4px solid #1C4D32;">
                          <span class="text-[10px] font-bold uppercase tracking-wider" style="color:#414942;">Población Total</span>
                          <div class="mt-2 flex items-baseline gap-2">
                              <span class="text-3xl font-bold" style="color:#1C4D32; font-family:'Noto Serif',serif;">${this.formatNumber(poblacion.total)}</span>
                          </div>
                          <p class="text-[10px] mt-2" style="color:#414942;">Total de derechohabientes registrados</p>
                      </div>
                      <div class="p-6 rounded-2xl shadow-sm" style="background:#f2f4f2; border-left:4px solid #7b5454;">
                          <span class="text-[10px] font-bold uppercase tracking-wider" style="color:#414942;">Titulares</span>
                          <div class="mt-2 flex items-baseline gap-2">
                              <span class="text-3xl font-bold" style="color:#7b5454; font-family:'Noto Serif',serif;">${this.formatNumber(poblacion.titulares)}</span>
                          </div>
                          <p class="text-[10px] mt-2" style="color:#414942;">Trabajadores cotizantes activos</p>
                      </div>
                      <div class="p-6 rounded-2xl shadow-sm" style="background:#f2f4f2; border-left:4px solid #9ed2af;">
                          <span class="text-[10px] font-bold uppercase tracking-wider" style="color:#414942;">Beneficiarios</span>
                          <div class="mt-2 flex items-baseline gap-2">
                              <span class="text-3xl font-bold" style="color:#1C4D32; font-family:'Noto Serif',serif;">${this.formatNumber(poblacion.beneficiarios)}</span>
                          </div>
                          <p class="text-[10px] mt-2" style="color:#414942;">Derechohabientes por vínculo familiar</p>
                      </div>
                      <div class="p-6 rounded-2xl shadow-sm" style="background:#f2f4f2; border-left:4px solid #717972;">
                          <span class="text-[10px] font-bold uppercase tracking-wider" style="color:#414942;">Adscritos a MF</span>
                          <div class="mt-2 flex items-baseline gap-2">
                              <span class="text-3xl font-bold" style="color:#191c1b; font-family:'Noto Serif',serif;">${this.formatNumber(poblacion.medico_familiar)}</span>
                          </div>
                          <p class="text-[10px] mt-2" style="color:#414942;">Población asignada a médico familiar</p>
                      </div>
                  </div>
  
                  <!-- Bento Grid: Población Asegurada (4 métricas) -->
                  <div class="ft-pop-grid grid gap-5 mb-8" style="grid-template-columns:repeat(4,1fr);">
                      <div class="p-5 rounded-2xl" style="background:#fff; border:1px solid #e2e8e4;">
                          <span class="text-[9px] font-bold uppercase tracking-widest" style="color:#7b5454;">Riesgos de Trabajo</span>
                          <p class="text-xl font-bold mt-1" style="color:#191c1b; font-family:'Noto Serif',serif;">${this.formatNumber(asegurada.riesgos_trabajo)}</p>
                      </div>
                      <div class="p-5 rounded-2xl" style="background:#fff; border:1px solid #e2e8e4;">
                          <span class="text-[9px] font-bold uppercase tracking-widest" style="color:#7b5454;">Enf. General y Maternidad</span>
                          <p class="text-xl font-bold mt-1" style="color:#191c1b; font-family:'Noto Serif',serif;">${this.formatNumber(asegurada.enfermedad_maternidad)}</p>
                      </div>
                      <div class="p-5 rounded-2xl" style="background:#fff; border:1px solid #e2e8e4;">
                          <span class="text-[9px] font-bold uppercase tracking-widest" style="color:#7b5454;">Invalidez</span>
                          <p class="text-xl font-bold mt-1" style="color:#191c1b; font-family:'Noto Serif',serif;">${this.formatNumber(asegurada.invalidez)}</p>
                      </div>
                      <div class="p-5 rounded-2xl" style="background:#fff; border:1px solid #e2e8e4;">
                          <span class="text-[9px] font-bold uppercase tracking-widest" style="color:#7b5454;">Trabajadores IMSS</span>
                          <p class="text-xl font-bold mt-1" style="color:#191c1b; font-family:'Noto Serif',serif;">${this.formatNumber(asegurada.trabajadores_imss)}</p>
                      </div>
                  </div>
  
                  <!-- Pirámide + Tabla lado a lado -->
                  ${this.renderDemographics(piramide)}
              </section>
  
  
              <!-- ===== SECCIONES DINÁMICAS ===== -->
              ${this.renderRecursosParaLaSalud(unit)}
              <section id="sec-productividad" class="ft-section">
                  ${this.renderProductividadMedicinaFamiliar(unit)}
                  ${this.renderProductividadServicios(unit)}
                  ${this.renderProductividadServiciosAuxiliares(unit)}
                  ${this.renderProductividadServiciosMedicos(unit)}
                  ${this.renderHospitalizacion(unit)}
                  ${this.renderDiaTypico(unit)}
              </section>
              ${this.renderMotivosAtencion(unit)}
              ${this.renderMotivosAtencionHospital(unit)}
  
              <!-- Footer institucional -->
              <footer class="mt-10 pt-6 flex justify-between items-center text-xs text-on-muted" style="border-top:1px solid #d8dfd9;">
                  <div class="flex items-center gap-3">
                      <img src="../assets/img/imagenes/logo_imss.png" alt="IMSS" style="height:20px; opacity:.5; filter:grayscale(1);" onerror="this.style.display='none'">
                      <span>© 2025 Instituto Mexicano del Seguro Social · OOAD Tabasco</span>
                  </div>
                  <span>Fuente: DIR · Población 202406</span>
              </footer>
  
          </div>
      `;

    this.fichaContainer.innerHTML = fichaHTML;
    this.setupInteractivity();
    this.resetResourceCardsScroll();
    this.setupSidebarScroll();
  },
  setupSidebarScroll() {
    // Resalta el enlace activo del sidebar al hacer scroll
    const sections = document.querySelectorAll(".ft-section[id]");
    const links = document.querySelectorAll("#sidebarNav .sidebar-link");
    const nav = document.getElementById("sidebarNav");
    if (!sections.length || !links.length || !nav) return;

    let manualScrollAt = 0;
    const markManualScroll = () => {
      manualScrollAt = Date.now();
    };

    nav.addEventListener("wheel", markManualScroll, { passive: true });
    nav.addEventListener("touchstart", markManualScroll, { passive: true });
    nav.addEventListener("touchmove", markManualScroll, { passive: true });
    nav.addEventListener("mousedown", markManualScroll);

    const syncActiveLinkIntoView = (activeLink) => {
      if (!activeLink) return;

      // Si el usuario está moviendo manualmente la navegación,
      // no forzar autoscroll por un instante.
      if (Date.now() - manualScrollAt < 1200) return;

      const isHorizontal = window.innerWidth <= 1100;
      activeLink.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: isHorizontal ? "center" : "nearest",
      });
    };

    // Mapa: id de sección => href del link del sidebar al que pertenece
    const seccionASidebar = {
      "sec-productividad-servicios": "#sec-productividad",
      "sec-productividad-auxiliares": "#sec-productividad",
      "sec-dia-tipico": "#sec-productividad",
    };

    const activarLink = (sectionId) => {
      // Resuelve el href correcto del sidebar para esta sección
      const targetHref = seccionASidebar[sectionId]
        ? seccionASidebar[sectionId]
        : "#" + sectionId;

      let activeLink = null;

      links.forEach((link) => {
        const isActive = link.getAttribute("href") === targetHref;
        if (isActive) {
          link.classList.add(
            "active",
            "bg-primary",
            "text-white",
            "font-semibold",
            "shadow-sm",
          );
          link.classList.remove(
            "text-on-muted",
            "hover:bg-primary/5",
            "hover:text-primary",
            "font-medium",
          );
          activeLink = link;
        } else {
          link.classList.remove(
            "active",
            "bg-primary",
            "text-white",
            "font-semibold",
            "shadow-sm",
          );
          link.classList.add(
            "text-on-muted",
            "hover:bg-primary/5",
            "hover:text-primary",
            "font-medium",
          );
        }
      });

      syncActiveLinkIntoView(activeLink);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activarLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    sections.forEach((sec) => observer.observe(sec));
  },

  renderDemographics(piramide) {
    if (
      !piramide ||
      (!piramide.total_poblacion &&
        !piramide.poblacion_hombres &&
        !piramide.poblacion_mujeres)
    ) {
      return "";
    }

    const pyramidData = this.preparePyramidData(piramide);

    // Calcular totales M/H para el resumen
    const totalHombres = Object.values(piramide.poblacion_hombres || {}).reduce(
      (s, v) => s + (parseInt(v) || 0),
      0,
    );
    const totalMujeres = Object.values(piramide.poblacion_mujeres || {}).reduce(
      (s, v) => s + (parseInt(v) || 0),
      0,
    );
    const totalPob =
      totalHombres + totalMujeres || parseInt(piramide.total_poblacion) || 0;
    const pctH = totalPob
      ? ((totalHombres / totalPob) * 100).toFixed(1)
      : "0.0";
    const pctM = totalPob
      ? ((totalMujeres / totalPob) * 100).toFixed(1)
      : "0.0";

    // Tabla detallada usando pyramidData
    const tableRows = pyramidData
      .map((row, i) => {
        const total = (row.male || 0) + (row.female || 0);
        const pMH = totalHombres
          ? ((row.male / totalHombres) * 100).toFixed(1)
          : "0.0";
        const pMM = totalMujeres
          ? ((row.female / totalMujeres) * 100).toFixed(1)
          : "0.0";
        const altBg = i % 2 !== 0 ? "background:#f2f4f2;" : "";
        return `
              <tr style="${altBg}">
                  <td style="padding:12px 20px; font-weight:700; color:#191c1b; font-size:13px;">${row.age}</td>
                  <td style="padding:12px 14px; text-align:right; font-variant-numeric:tabular-nums; font-size:13px;">${this.formatNumber(row.male)}</td>
                  <td style="padding:12px 14px; text-align:right; color:#717972; font-size:12px;">${pMH}%</td>
                  <td style="padding:12px 14px; text-align:right; font-variant-numeric:tabular-nums; font-size:13px;">${this.formatNumber(row.female)}</td>
                  <td style="padding:12px 14px; text-align:right; color:#717972; font-size:12px;">${pMM}%</td>
                  <td style="padding:12px 20px; text-align:right; font-weight:700; font-variant-numeric:tabular-nums; font-size:13px;">${this.formatNumber(total)}</td>
              </tr>`;
      })
      .join("");

    return `
          <div class="ft-demographics-grid" style="display:grid; grid-template-columns:4fr 8fr; gap:20px; align-items:start;">
  
              <!-- Panel izquierdo: pirámide -->
              <div class="ft-pyramid-panel rounded-2xl p-7 shadow-sm" style="background:#ffffff; border:1px solid #e2e8e4;">
                  <div class="ft-pyramid-header flex justify-between items-center mb-7">
                      <h3 class="ft-pyramid-title-text text-xl font-bold" style="color:#1C4D32; font-family:'Noto Serif',serif;">Pirámide Poblacional</h3>
                      <div style="display:flex; gap:16px;">
                          <div style="display:flex; align-items:center; gap:6px;">
                              <div style="width:12px; height:12px; background:#7b5454; border-radius:2px;"></div>
                              <span style="font-size:11px; font-weight:500;">Hombres</span>
                          </div>
                          <div style="display:flex; align-items:center; gap:6px;">
                              <div style="width:12px; height:12px; background:#1C4D32; border-radius:2px;"></div>
                              <span style="font-size:11px; font-weight:500;">Mujeres</span>
                          </div>
                      </div>
                  </div>
  
                  <!-- Pirámide canvas (usa JS createPyramid) -->
                  <div class="pyramid-section">
                      <div class="pyramid-titles">
                          <div class="pyramid-title">HOMBRES</div>
                          <div></div>
                          <div class="pyramid-title">MUJERES</div>
                      </div>
                      <div class="pyramid-chart" id="pyramid-chart"></div>
                  </div>
  
                  <!-- Resumen M/H -->
                  <div class="ft-pyramid-summary" style="margin-top:28px; padding-top:24px; border-top:1px solid #e2e8e4; display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                      <div>
                          <span style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.15em; color:#414942;">Total Mujeres</span>
                          <p style="font-size:22px; font-weight:700; color:#1C4D32; font-family:'Noto Serif',serif; margin:4px 0 2px;">${this.formatNumber(totalMujeres)}</p>
                          <p style="font-size:11px; color:#414942;">${pctM}% de la unidad</p>
                      </div>
                      <div>
                          <span style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.15em; color:#414942;">Total Hombres</span>
                          <p style="font-size:22px; font-weight:700; color:#7b5454; font-family:'Noto Serif',serif; margin:4px 0 2px;">${this.formatNumber(totalHombres)}</p>
                          <p style="font-size:11px; color:#414942;">${pctH}% de la unidad</p>
                      </div>
                  </div>
              </div>
  
              <!-- Panel derecho: tabla detallada -->
              <div class="rounded-2xl overflow-hidden shadow-sm" style="border:1px solid #e2e8e4;">
                  <div class="ft-demog-head" style="padding:20px 24px; border-bottom:1px solid #e2e8e4; background:#f2f4f2; display:flex; justify-content:space-between; align-items:center;">
                      <h3 class="ft-demog-title text-xl font-bold" style="color:#1C4D32; font-family:'Noto Serif',serif;">Detalle por Grupo de Edad</h3>
                  </div>
                  <div class="demog-table-wrap" style="overflow-x:auto;">
                      <table class="demog-table" style="width:100%; border-collapse:collapse; text-align:left;">
                          <thead>
                              <tr style="background:#1C4D32; color:#fff;">
                                  <th style="padding:14px 20px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em;">Grupo de Edad</th>
                                  <th style="padding:14px 14px; font-size:11px; font-weight:700; text-transform:uppercase; text-align:right;">Hombres</th>
                                  <th style="padding:14px 14px; font-size:11px; font-weight:700; text-transform:uppercase; text-align:right;">H %</th>
                                  <th style="padding:14px 14px; font-size:11px; font-weight:700; text-transform:uppercase; text-align:right;">Mujeres</th>
                                  <th style="padding:14px 14px; font-size:11px; font-weight:700; text-transform:uppercase; text-align:right;">M %</th>
                                  <th style="padding:14px 20px; font-size:11px; font-weight:700; text-transform:uppercase; text-align:right;">Total</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${tableRows}
                          </tbody>
                          <tfoot>
                              <tr style="background:#e6e9e7;">
                                  <td style="padding:14px 20px; font-weight:800; color:#1C4D32; font-size:13px;">TOTAL</td>
                                  <td style="padding:14px 14px; text-align:right; font-weight:700; font-variant-numeric:tabular-nums; font-size:13px;">${this.formatNumber(totalHombres)}</td>
                                  <td style="padding:14px 14px; text-align:right; font-weight:700; font-size:12px;">100%</td>
                                  <td style="padding:14px 14px; text-align:right; font-weight:700; font-variant-numeric:tabular-nums; font-size:13px;">${this.formatNumber(totalMujeres)}</td>
                                  <td style="padding:14px 14px; text-align:right; font-weight:700; font-size:12px;">100%</td>
                                  <td style="padding:14px 20px; text-align:right; font-weight:800; font-variant-numeric:tabular-nums; color:#1C4D32; font-size:13px;">${this.formatNumber(totalPob)}</td>
                              </tr>
                          </tfoot>
                      </table>
                  </div>
              </div>
  
          </div>
      `;
  },

  preparePyramidData(piramide) {
    // Combinar los datos de hombres, mujeres y total
    const data = [];
    const ageGroups = Object.keys(piramide.total_poblacion || {});

    ageGroups.forEach((group) => {
      const male = piramide.poblacion_hombres
        ? piramide.poblacion_hombres[group] || 0
        : 0;
      const female = piramide.poblacion_mujeres
        ? piramide.poblacion_mujeres[group] || 0
        : 0;
      const total = piramide.total_poblacion
        ? piramide.total_poblacion[group] || 0
        : male + female;

      data.push({
        age: group,
        male: male,
        female: female,
        total: total,
      });
    });

    // Ordenar los grupos de edad
    return this.sortAgeGroups(data);
  },
  sortAgeGroups(data) {
    const order = [
      "<1",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10 a 14",
      "15 a 19",
      "20 a 24",
      "25  a 29",
      "30 a 34",
      "35 a 39",
      "40 a 44",
      "45 a 49",
      "50 a 54",
      "55 a 59",
      "60 a 64",
      "65 a 69",
      "70 a 74",
      "75 a 79",
      "80 a 84",
      "85 y más",
      "No especificada",
    ];

    return data.sort((a, b) => {
      const indexA = order.indexOf(a.age);
      const indexB = order.indexOf(b.age);

      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  },
  generateDemographicTable(data) {
    const totalPopulation = data.reduce((sum, item) => sum + item.total, 0);

    let tableHTML = `
          <div class="table-header">
              <div class="table-cell">GRUPO DE EDAD</div>
              <div class="table-cell">HOMBRES<br>No.</div>
              <div class="table-cell">%</div>
              <div class="table-cell">MUJERES<br>No.</div>
              <div class="table-cell">%</div>
              <div class="table-cell">TOTAL<br>No.</div>
              <div class="table-cell">%</div>
          </div>
      `;

    data.forEach((item) => {
      const malePercent =
        totalPopulation > 0
          ? ((item.male / totalPopulation) * 100).toFixed(2)
          : "0.00";
      const femalePercent =
        totalPopulation > 0
          ? ((item.female / totalPopulation) * 100).toFixed(2)
          : "0.00";
      const totalPercent =
        totalPopulation > 0
          ? ((item.total / totalPopulation) * 100).toFixed(2)
          : "0.00";

      tableHTML += `
              <div class="table-row">
                  <div class="table-cell age-group">${item.age}</div>
                  <div class="table-cell">${this.formatNumber(item.male)}</div>
                  <div class="table-cell">${malePercent}</div>
                  <div class="table-cell">${this.formatNumber(item.female)}</div>
                  <div class="table-cell">${femalePercent}</div>
                  <div class="table-cell">${this.formatNumber(item.total)}</div>
                  <div class="table-cell">${totalPercent}</div>
              </div>
          `;
    });

    // Totales
    const totalMale = data.reduce((sum, item) => sum + item.male, 0);
    const totalFemale = data.reduce((sum, item) => sum + item.female, 0);
    const malePercentTotal =
      totalPopulation > 0
        ? ((totalMale / totalPopulation) * 100).toFixed(2)
        : "0.00";
    const femalePercentTotal =
      totalPopulation > 0
        ? ((totalFemale / totalPopulation) * 100).toFixed(2)
        : "0.00";

    tableHTML += `
          <div class="table-row table-total">
              <div class="table-cell age-group">TOTAL</div>
              <div class="table-cell">${this.formatNumber(totalMale)}</div>
              <div class="table-cell">${malePercentTotal}%</div>
              <div class="table-cell">${this.formatNumber(totalFemale)}</div>
              <div class="table-cell">${femalePercentTotal}%</div>
              <div class="table-cell">${this.formatNumber(totalPopulation)}</div>
              <div class="table-cell">100.00</div>
          </div>
      `;

    return tableHTML;
  },
  setupInteractivity() {
    // Generar pirámide poblacional
    this.createPyramid();

    // Efectos hover
    this.addHoverEffects();

    // Texto truncado: tooltip desktop + detalle en movil
    this.setupEllipsisInteractions();

    // Botones de acción
    // createActionButtons eliminado: los controles de impresión están en el sidebar
  },
  setupEllipsisInteractions() {
    const cells = document.querySelectorAll(".ft-ellipsis-cell[data-fulltext]");
    if (!cells.length) return;

    cells.forEach((cell) => {
      const fullText = cell.getAttribute("data-fulltext") || "";
      if (!fullText) return;
      cell.setAttribute("title", fullText);
    });

    const overlay = document.getElementById("mobileTextDetail");
    const content = document.getElementById("mobileTextDetailText");
    const closeBtn = document.getElementById("mobileTextDetailClose");
    if (!overlay || !content || !closeBtn) return;

    const closeOverlay = () => {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    };

    const openOverlay = (text) => {
      content.textContent = text;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
    };

    closeBtn.onclick = closeOverlay;
    overlay.onclick = (event) => {
      if (event.target === overlay) {
        closeOverlay();
      }
    };

    cells.forEach((cell) => {
      cell.onclick = () => {
        if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
          const text =
            cell.getAttribute("data-fulltext") || cell.textContent || "";
          openOverlay(text.trim());
        }
      };
    });
  },
  resetResourceCardsScroll() {
    requestAnimationFrame(() => {
      document
        .querySelectorAll("#fichaContainer .recurso-card .card-data")
        .forEach((el) => {
          el.scrollTop = 0;
        });
    });
  },
  createPyramid() {
    const pyramidContainer = document.getElementById("pyramid-chart");
    if (!pyramidContainer || !this.currentUnit.piramide_poblacional) return;

    pyramidContainer.innerHTML = "";
    const pyramidData = this.preparePyramidData(
      this.currentUnit.piramide_poblacional,
    );

    if (pyramidData.length === 0) return;

    const maxValue = Math.max(
      ...pyramidData.map((d) => Math.max(d.male, d.female)),
    );
    const safeMaxValue = maxValue || 1;
    const containerWidth = pyramidContainer.clientWidth || 520;
    const axisWidth = window.innerWidth <= 640 ? 40 : 60;
    const labelReserve = window.innerWidth <= 640 ? 24 : 36;
    const sideMin = window.innerWidth <= 640 ? 36 : 72;
    const sideMax = window.innerWidth <= 640 ? 120 : 220;
    const sideMaxWidth = Math.max(
      sideMin,
      Math.min(
        sideMax,
        Math.floor((containerWidth - axisWidth) / 2) - labelReserve,
      ),
    );

    // Invertir el orden para mostrar de mayor a menor edad
    const reversedData = [...pyramidData].reverse();

    reversedData.forEach((data, index) => {
      const maleWidth = Math.max((data.male / safeMaxValue) * sideMaxWidth, 3);
      const femaleWidth = Math.max(
        (data.female / safeMaxValue) * sideMaxWidth,
        3,
      );

      const row = document.createElement("div");
      row.className = "pyramid-row";

      // Lado masculino (izquierda)
      const maleSide = document.createElement("div");
      maleSide.className = "male-side";

      // Etiqueta numérica hombres (fuera de la barra, a la izquierda)
      const maleNum = document.createElement("span");
      maleNum.className = "pyramid-num";
      maleNum.textContent = this.formatNumber(data.male);

      const maleBar = document.createElement("div");
      maleBar.className = "pyramid-bar male-bar";
      maleBar.style.width = maleWidth + "px";

      maleSide.appendChild(maleNum);
      maleSide.appendChild(maleBar);

      // Etiqueta central (edad)
      const ageLabel = document.createElement("div");
      ageLabel.className = "age-label";
      ageLabel.textContent = data.age;

      // Lado femenino (derecha)
      const femaleSide = document.createElement("div");
      femaleSide.className = "female-side";

      const femaleBar = document.createElement("div");
      femaleBar.className = "pyramid-bar female-bar";
      femaleBar.style.width = femaleWidth + "px";

      // Etiqueta numérica mujeres (fuera de la barra, a la derecha)
      const femaleNum = document.createElement("span");
      femaleNum.className = "pyramid-num";
      femaleNum.textContent = this.formatNumber(data.female);

      femaleSide.appendChild(femaleBar);
      femaleSide.appendChild(femaleNum);

      row.appendChild(maleSide);
      row.appendChild(ageLabel);
      row.appendChild(femaleSide);

      pyramidContainer.appendChild(row);
    });

    // Animar la pirámide solo en vista interactiva, no en modo PDF
    if (!window.__PDF_RENDER_MODE) {
      setTimeout(() => this.animatePyramid(), 100);
    }
  },
  animatePyramid() {
    const bars = document.querySelectorAll(".pyramid-bar");
    bars.forEach((bar, index) => {
      setTimeout(() => {
        bar.style.opacity = "0";
        bar.style.transform = "scaleX(0)";
        bar.style.transition = "all 0.8s ease";

        setTimeout(() => {
          bar.style.opacity = "1";
          bar.style.transform = "scaleX(1)";
        }, 100);
      }, index * 40);
    });
  },
  addHoverEffects() {
    const infoItems = document.querySelectorAll(".info-item, .population-item");
    infoItems.forEach((item) => {
      item.addEventListener("mouseenter", function () {
        this.style.backgroundColor = "#f8f9fa";
        this.style.padding = "8px";
        this.style.borderRadius = "4px";
        this.style.transition = "all 0.3s ease";
      });

      item.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "transparent";
        this.style.padding = "8px 0";
      });
    });

    const tableRows = document.querySelectorAll(".table-row");
    tableRows.forEach((row) => {
      row.addEventListener("mouseenter", function () {
        if (!this.classList.contains("table-total")) {
          this.style.backgroundColor = "#e3f2fd";
          this.style.transition = "all 0.3s ease";
        }
      });

      row.addEventListener("mouseleave", function () {
        if (!this.classList.contains("table-total")) {
          this.style.backgroundColor = "";
        }
      });
    });
  },
});
