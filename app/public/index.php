<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mapa Unidades IMSS Tabasco</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
    <link rel="stylesheet" href="../assets/css/index.css" />
</head>

<body>
    <div class="navbar">
        <div class="navbar-content">
            <div class="navbar-heading">
                <p class="navbar-eyebrow">Coordinación de Servicios de Salud</p>
                <div class="navbar-title">Fichas Técnicas IMSS Tabasco</div>
                <p class="navbar-subtitle">
                    <span class="status-dot" aria-hidden="true"></span>
                    Cobertura y distribución de unidades médicas
                </p>
            </div>
            <div class="navbar-controls">
                <a class="navbar-back-btn" href="../../../index.php">&larr; Indicadores Consolidados</a>
                <div class="view-toggle">
                    <button class="view-btn active" type="button" data-view="map" onclick="setMobileView('map')">Mapa</button>
                    <button class="view-btn" type="button" data-view="list" onclick="setMobileView('list')">Lista</button>
                </div>
            </div>
        </div>
    </div>

    <div class="main-content">
        <section class="kpi-board" id="summaryGrid">
            <article class="kpi-card kpi-total">
                <div class="kpi-head">
                    <p class="kpi-title">Total de unidades</p>
                    <span class="kpi-tag">Cobertura estatal</span>
                </div>
                <p class="kpi-number" id="totalUnits">0</p>
                <p class="kpi-caption" id="totalMeta">Cobertura estatal</p>
                <div class="kpi-track"><span id="totalMeter"></span></div>
            </article>

            <article class="kpi-card kpi-hospital">
                <div class="kpi-head">
                    <p class="kpi-title">Hospitales</p>
                    <span class="kpi-tag">Segundo nivel</span>
                </div>
                <p class="kpi-number" id="hospitalCount">0</p>
                <p class="kpi-caption" id="hospitalMeta">Participación</p>
                <div class="kpi-track"><span id="hospitalMeter"></span></div>
            </article>

            <article class="kpi-card kpi-umf">
                <div class="kpi-head">
                    <p class="kpi-title">Medicina familiar</p>
                    <span class="kpi-tag">Primer nivel</span>
                </div>
                <p class="kpi-number" id="umfCount">0</p>
                <p class="kpi-caption" id="umfMeta">Participación</p>
                <div class="kpi-track"><span id="umfMeter"></span></div>
            </article>

            <article class="kpi-card kpi-ooad">
                <div class="kpi-head">
                    <p class="kpi-title">OOAD</p>
                    <span class="kpi-tag">Gestión</span>
                </div>
                <p class="kpi-number" id="ooadCount">0</p>
                <p class="kpi-caption" id="ooadMeta">Participación</p>
                <div class="kpi-track"><span id="ooadMeter"></span></div>
            </article>
        </section>

        <div class="workspace">
            <section class="panel map-panel">
                <div class="panel-head">
                    <div class="panel-head-top">
                        <div>
                            <h2>Mapa estatal de unidades</h2>
                            <p>Haz clic en un marcador para ver detalles y abrir la ficha técnica.</p>
                        </div>
                    </div>
                    <div class="map-filters" id="mapFilters">
                        <button type="button" class="map-filter-btn active" data-filter="all">Todas</button>
                        <button type="button" class="map-filter-btn" data-filter="hospital">Hospitales</button>
                        <button type="button" class="map-filter-btn" data-filter="umf">UMF</button>
                        <button type="button" class="map-filter-btn" data-filter="ooad">OOAD</button>
                    </div>
                </div>
                <div id="mapContainer"></div>
                <div class="map-foot">
                    <span>Fuente: Coordinación de Servicios de Salud</span>
                </div>
            </section>

            <aside class="panel list-panel" id="listContainer">
                <div class="panel-head">
                    <h2 class="units-list-title">Directorio de unidades</h2>
                    <p>Filtro por nombre, municipio o tipo para acceso directo.</p>
                </div>
                <div class="quick-filters" id="quickFilters">
                    <button type="button" class="filter-btn active" data-filter="all">Todas</button>
                    <button type="button" class="filter-btn" data-filter="hospital">Hospitales</button>
                    <button type="button" class="filter-btn" data-filter="umf">UMF</button>
                    <button type="button" class="filter-btn" data-filter="ooad">OOAD</button>
                </div>
                <div class="search-box">
                    <span class="search-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        class="search-input"
                        id="searchInput"
                        placeholder="Buscar por nombre, municipio o tipo de unidad"
                    >
                </div>
                <div id="unitsList" class="units-list"></div>
                <div class="list-foot" id="listFooter"></div>
            </aside>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
    <script src="../assets/js/ficha_tecnica.config.js"></script>
    <script>
        const unidadesMedicasRaw = window.FICHA_TECNICA_CONFIG?.unidadesMedicas || [];
        const unidadesMedicas = buildUniqueUnits(unidadesMedicasRaw);
        let activeCategory = 'all';

        function normalizeText(value) {
            return String(value || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toUpperCase()
                .replace(/\s+/g, ' ')
                .trim();
        }

        function normalizeHospitalName(name) {
            return normalizeText(name)
                .replace(/^HGSMF\b/, 'HGSZMF')
                .replace(/\b0+(\d)/g, '$1');
        }

        function buildUniqueUnits(units) {
            const seen = new Map();
            units.forEach((unidad, index) => {
                const isHospital = unidad.categoria === 'hospital';
                const identity = isHospital
                    ? `${unidad.categoria}|${normalizeText(unidad.tipo)}|${normalizeText(unidad.municipio)}|${normalizeHospitalName(unidad.nombre)}`
                    : `${unidad.categoria}|${normalizeText(unidad.nombre)}|${normalizeText(unidad.municipio)}`;

                const current = { ...unidad, _originalIndex: index };
                if (!seen.has(identity)) {
                    seen.set(identity, current);
                    return;
                }

                const prev = seen.get(identity);
                if (normalizeText(current.nombre).includes('HGSZMF') && !normalizeText(prev.nombre).includes('HGSZMF')) {
                    seen.set(identity, current);
                }
            });

            return Array.from(seen.values());
        }

        const map = L.map('mapContainer', { attributionControl: false }).setView([17.9892, -92.9475], 9);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);

        const hospitalIcon = L.divIcon({
            className: 'custom-marker-shell',
            html: '<span class="custom-marker marker-hospital"></span>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const umfIcon = L.divIcon({
            className: 'custom-marker-shell',
            html: '<span class="custom-marker marker-umf"></span>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });

        const ooadIcon = L.divIcon({
            className: 'custom-marker-shell',
            html: '<span class="custom-marker marker-ooad"></span>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        const markerEntries = [];

        unidadesMedicas.forEach((unidad) => {
            let icon = umfIcon;
            if (unidad.categoria === 'hospital') {
                icon = hospitalIcon;
            } else if (unidad.categoria === 'ooad') {
                icon = ooadIcon;
            }

            const marker = L.marker([unidad.lat, unidad.lng], { icon }).addTo(map);

            const popupContent = `
                <div class="popup-content">
                    <h3>${unidad.nombre}</h3>
                    <p><strong>Tipo:</strong> ${unidad.tipo}</p>
                    <p><strong>Municipio:</strong> ${unidad.municipio}</p>
                    <button class="select-btn" onclick="selectUnit(${unidad._originalIndex})">
                        Ver ficha técnica
                    </button>
                </div>
            `;

            marker.bindPopup(popupContent);
            markerEntries.push({ unidad, marker });
        });

        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = `
                <h4 class="legend-title">Tipo de unidad</h4>
                <div class="legend-item">
                    <span class="legend-icon hospital"></span>
                    <span>Hospital</span>
                </div>
                <div class="legend-item">
                    <span class="legend-icon umf"></span>
                    <span>UMF</span>
                </div>
                <div class="legend-item">
                    <span class="legend-icon ooad"></span>
                    <span>OOAD</span>
                </div>
            `;
            return div;
        };
        legend.addTo(map);

        function selectUnit(originalIndex) {
            window.location.href = `ficha_tec.php?unidad=${originalIndex}`;
        }

        function focusUnitOnMap(originalIndex) {
            const entry = markerEntries.find(({ unidad }) => unidad._originalIndex === originalIndex);
            if (!entry) return;

            const { marker } = entry;
            const latLng = marker.getLatLng();
            const targetZoom = Math.max(map.getZoom(), 13);

            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }

            const runFocus = () => {
                map.flyTo(latLng, targetZoom, { duration: 0.75 });
                setTimeout(() => marker.openPopup(), 420);
            };

            if (window.innerWidth <= 980) {
                setMobileView('map');
                setTimeout(runFocus, 220);
                return;
            }

            runFocus();
        }

        function setSummary() {
            const total = unidadesMedicas.length;
            const hospitales = unidadesMedicas.filter((u) => u.categoria === 'hospital').length;
            const umf = unidadesMedicas.filter((u) => u.categoria === 'umf').length;
            const ooad = unidadesMedicas.filter((u) => u.categoria === 'ooad').length;

            const pct = (value) => total > 0 ? Math.round((value / total) * 100) : 0;

            document.getElementById('totalUnits').textContent = total;
            document.getElementById('hospitalCount').textContent = hospitales;
            document.getElementById('umfCount').textContent = umf;
            document.getElementById('ooadCount').textContent = ooad;

            document.getElementById('totalMeta').textContent = `${total} unidades registradas`;
            document.getElementById('hospitalMeta').textContent = `${pct(hospitales)}% del total`;
            document.getElementById('umfMeta').textContent = `${pct(umf)}% del total`;
            document.getElementById('ooadMeta').textContent = `${pct(ooad)}% del total`;

            document.getElementById('totalMeter').style.width = '100%';
            document.getElementById('hospitalMeter').style.width = `${pct(hospitales)}%`;
            document.getElementById('umfMeter').style.width = `${pct(umf)}%`;
            document.getElementById('ooadMeter').style.width = `${Math.max(pct(ooad), 6)}%`;
        }

        function applyMapCategoryFilter() {
            markerEntries.forEach(({ unidad, marker }) => {
                const shouldShow = activeCategory === 'all' || unidad.categoria === activeCategory;
                const isVisible = map.hasLayer(marker);

                if (shouldShow && !isVisible) {
                    marker.addTo(map);
                } else if (!shouldShow && isVisible) {
                    marker.closePopup();
                    map.removeLayer(marker);
                }
            });
        }

        function filterByCategory(units) {
            if (activeCategory === 'all') return units;
            return units.filter((u) => u.categoria === activeCategory);
        }

        function renderUnitsList() {
            const listContainer = document.getElementById('unitsList');
            const listFooter = document.getElementById('listFooter');
            const searchInput = document.getElementById('searchInput');
            const searchTerm = searchInput.value.toLowerCase().trim();

            let units = filterByCategory(unidadesMedicas);
            if (searchTerm) {
                units = units.filter((unidad) => (
                    unidad.nombre.toLowerCase().includes(searchTerm) ||
                    unidad.municipio.toLowerCase().includes(searchTerm) ||
                    unidad.tipo.toLowerCase().includes(searchTerm)
                ));
            }

            if (units.length === 0) {
                listContainer.innerHTML = `
                    <div class="no-results">
                        <p>No se encontraron unidades</p>
                        <small>Ajusta filtros o criterio de búsqueda</small>
                    </div>
                `;
                if (listFooter) {
                    listFooter.textContent = `Mostrando 0 de ${unidadesMedicas.length} unidades`;
                }
                return;
            }

            listContainer.innerHTML = '';
            units.forEach((unidad) => {
                const card = document.createElement('div');
                card.className = `unit-card cat-${unidad.categoria}`;

                const badgeLabel = {
                    hospital: 'Hospital',
                    umf: 'UMF',
                    ooad: 'OOAD'
                }[unidad.categoria] || unidad.categoria.toUpperCase();

                card.innerHTML = `
                    <div class="unit-card-head">
                        <h3>${unidad.nombre}</h3>
                        <span class="unit-badge badge-${unidad.categoria}">${badgeLabel}</span>
                    </div>
                    <p>${unidad.tipo}</p>
                    <p class="unit-municipio">${unidad.municipio}</p>
                    <div class="unit-actions">
                        <button type="button" class="unit-btn unit-btn-primary" data-action="ficha">Ver ficha</button>
                        <button type="button" class="unit-btn unit-btn-ghost" data-action="mapa">Ver en mapa</button>
                    </div>
                `;

                const fichaBtn = card.querySelector('[data-action="ficha"]');
                const mapaBtn = card.querySelector('[data-action="mapa"]');
                fichaBtn.addEventListener('click', () => selectUnit(unidad._originalIndex));
                mapaBtn.addEventListener('click', () => focusUnitOnMap(unidad._originalIndex));

                listContainer.appendChild(card);
            });

            if (listFooter) {
                listFooter.textContent = `Mostrando ${units.length} de ${unidadesMedicas.length} unidades`;
            }
        }

        function setCategory(filter) {
            activeCategory = filter;
            document.querySelectorAll('.filter-btn').forEach((item) => {
                item.classList.toggle('active', item.dataset.filter === filter);
            });
            document.querySelectorAll('.map-filter-btn').forEach((item) => {
                item.classList.toggle('active', item.dataset.filter === filter);
            });
            applyMapCategoryFilter();
            renderUnitsList();
        }

        function setupSearch() {
            const searchInput = document.getElementById('searchInput');
            searchInput.addEventListener('input', renderUnitsList);
        }

        function setupCategoryFilters() {
            const buttons = document.querySelectorAll('.filter-btn');
            buttons.forEach((btn) => {
                btn.addEventListener('click', () => {
                    setCategory(btn.dataset.filter);
                });
            });

            const mapButtons = document.querySelectorAll('.map-filter-btn');
            mapButtons.forEach((btn) => {
                btn.addEventListener('click', () => {
                    setCategory(btn.dataset.filter);
                });
            });
        }

        function setMobileView(view) {
            if (window.innerWidth > 980) return;
            const isMap = view === 'map';
            document.body.classList.toggle('mobile-list-mode', !isMap);
            document.querySelectorAll('.view-btn').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });
            if (isMap) {
                deferredInvalidateSize(180);
            }
        }

        function deferredInvalidateSize(delay) {
            requestAnimationFrame(() => {
                setTimeout(() => map.invalidateSize({ animate: false }), delay ?? 0);
            });
        }

        function syncResponsiveState() {
            if (window.innerWidth > 980) {
                document.body.classList.remove('mobile-list-mode');
                deferredInvalidateSize(0);
                return;
            }
            const activeViewBtn = document.querySelector('.view-btn.active');
            const activeView = activeViewBtn?.dataset.view;
            setMobileView(activeView === 'list' ? 'list' : 'map');
        }

        setupSearch();
        setupCategoryFilters();
        setSummary();
        applyMapCategoryFilter();
        renderUnitsList();
        syncResponsiveState();

        window.addEventListener('load', () => deferredInvalidateSize(120));
        window.addEventListener('resize', syncResponsiveState);
    </script>
</body>

</html>
