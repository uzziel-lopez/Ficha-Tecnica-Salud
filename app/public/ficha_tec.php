<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fichas Técnicas IMSS Tabasco</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif:wght@600;700;800&display=swap"
        rel="stylesheet">
    <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        rel="stylesheet">
    <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script id="tw-config">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        "primary": "#1C4D32",
                        "primary-dark": "#0f4c25",
                        "primary-light": "#1a6b38",
                        "primary-container": "#baefca",
                        "on-primary": "#ffffff",
                        "secondary": "#7b5454",
                        "surface": "#f8faf8",
                        "surface-lo": "#f2f4f2",
                        "surface-hi": "#e6e9e7",
                        "surface-0": "#ffffff",
                        "on-surface": "#191c1b",
                        "on-muted": "#414942",
                        "border-soft": "#c0c9c0",
                        "bg": "#f8faf8",
                    },
                    fontFamily: {
                        "sans": ["Inter", "sans-serif"],
                        "serif": ["Noto Serif", "serif"],
                    },
                },
            },
        };
    </script>
    <script>
        window.__PDF_RENDER_MODE = new URLSearchParams(window.location.search).get('pdf_mode') === '1';
        if (window.__PDF_RENDER_MODE) {
            document.documentElement.classList.add('pdf-render-mode');
        }
    </script>
    <link rel="stylesheet" href="../assets/css/ficha_tec.page.css">
    <script src="../assets/js/ficha_tecnica.config.js"></script>
</head>

<body style="padding-top:56px;">

    <!-- TopAppBar fija -->
    <header
        class="ft-topbar fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 bg-primary shadow-lg border-b border-white/10"
        style="height:56px;">
        <div class="flex items-center gap-4">
            <div class="bg-white rounded px-1 py-0.5" style="line-height:0;">
                <img alt="IMSS" class="h-7" src="../assets/img/imagenes/logo_imss.png"
                    onerror="this.style.display='none'">
            </div>
            <div class="h-6 w-px bg-white/20"></div>
            <span class="ft-brand-text text-base font-bold text-white tracking-tight" style="font-family:'Noto Serif',serif;">Fichas
                Técnicas IMSS Tabasco</span>
        </div>
        <div class="flex items-center gap-2">
            <button onclick="window.location.href='index.php'"
                class="ft-btn-map flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200">
                <span class="material-symbols-outlined" style="font-size:18px;">map</span>
                <span class="ft-btn-map-text">Regresar al Mapa</span>
            </button>
            <button onclick="window.ftApp?.exportInstitutionalPDF()"
                class="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
                title="Descargar ficha técnica en PDF">
                <span class="material-symbols-outlined" style="font-size:20px;">print</span>
            </button>
        </div>
    </header>

    <!-- Layout: Sidebar + Main -->
    <div id="appLayout" class="flex" style="min-height:calc(100vh - 56px);">

        <!-- Sidebar fija -->
        <aside id="appSidebar" class="fixed left-0 flex flex-col bg-surface-0 border-r border-border-soft/40 z-40"
            style="top:56px;width:248px;height:calc(100vh - 56px);">

            <!-- Identidad de la unidad -->
            <div class="px-5 py-5 border-b border-border-soft/30">
                <div class="flex items-center gap-2 mb-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"
                        style="animation:blink 2s infinite;"></span>
                    <span class="text-[9px] font-bold text-on-muted tracking-[0.15em] uppercase">Unidad Activa</span>
                </div>
                <h2 id="sidebarUnitName" class="text-sm font-bold text-primary leading-snug mt-1"
                    style="font-family:'Noto Serif',serif;">Cargando...</h2>
                <p id="sidebarUnitType" class="text-[10px] text-on-muted mt-0.5"></p>
            </div>

            <!-- Navegación -->
            <nav id="sidebarNav" class="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
                <a href="#sec-info"
                    class="sidebar-link active flex items-center gap-3 rounded-xl py-2.5 px-4 text-sm font-semibold bg-primary text-white shadow-sm">
                    <span class="material-symbols-outlined ms-fill" style="font-size:20px;">info</span>
                    Información General
                </a>
                <a href="#sec-poblacion"
                    class="sidebar-link flex items-center gap-3 rounded-xl py-2.5 px-4 text-sm font-medium text-on-muted hover:bg-primary/5 hover:text-primary">
                    <span class="material-symbols-outlined" style="font-size:20px;">groups</span>
                    Población
                </a>
                <a href="#sec-recursos"
                    class="sidebar-link flex items-center gap-3 rounded-xl py-2.5 px-4 text-sm font-medium text-on-muted hover:bg-primary/5 hover:text-primary">
                    <span class="material-symbols-outlined" style="font-size:20px;">medical_services</span>
                    Recursos para la Salud
                </a>
                <a href="#sec-productividad"
                    class="sidebar-link flex items-center gap-3 rounded-xl py-2.5 px-4 text-sm font-medium text-on-muted hover:bg-primary/5 hover:text-primary">
                    <span class="material-symbols-outlined" style="font-size:20px;">analytics</span>
                    Productividad
                </a>
                <a href="#sec-hospitalizacion"
                    class="sidebar-link flex items-center gap-3 rounded-xl py-2.5 px-4 text-sm font-medium text-on-muted hover:bg-primary/5 hover:text-primary">
                    <span class="material-symbols-outlined" style="font-size:20px;">bed</span>
                    Hospitalización
                </a>
                <a href="#sec-motivos"
                    class="sidebar-link flex items-center gap-3 rounded-xl py-2.5 px-4 text-sm font-medium text-on-muted hover:bg-primary/5 hover:text-primary">
                    <span class="material-symbols-outlined" style="font-size:20px;">diagnosis</span>
                    Motivos de Atención
                </a>
            </nav>

            <!-- Corte de datos -->
            <div class="p-4 border-t border-border-soft/30">
                <div class="bg-primary/5 rounded-xl p-3 border border-primary/10">
                    <p class="text-[9px] font-bold text-primary/60 uppercase tracking-widest">Corte de Datos</p>
                    <p class="text-xs font-semibold text-primary mt-0.5">Acumulado 2025</p>
                </div>
            </div>
        </aside>

        <!-- Área principal -->
        <main class="flex-1 overflow-auto" style="margin-left:248px;">
            <div id="loadingOverlay" class="flex flex-col items-center justify-center"
                style="min-height:calc(100vh - 56px);">
                <div class="w-9 h-9 border-4 border-primary border-t-transparent rounded-full"
                    style="animation:spin .9s linear infinite;"></div>
                <p class="mt-3 text-sm font-medium text-on-muted">Cargando ficha técnica...</p>
            </div>
            <div id="fichaContainer"></div>
        </main>
    </div>

    <div id="mobileTextDetail" aria-hidden="true">
        <div class="detail-card" role="dialog" aria-modal="true" aria-label="Detalle del texto">
            <div class="detail-head">
                <span class="detail-title">Detalle completo</span>
                <button type="button" class="detail-close" id="mobileTextDetailClose">Cerrar</button>
            </div>
            <p class="detail-text" id="mobileTextDetailText"></p>
        </div>
    </div>

    <script src="../assets/js/ficha_tecnica.images.js"></script>
    <script src="../assets/js/ficha_tecnica.app.data.js"></script>
    <script src="../assets/js/ficha_tecnica.app.render.js"></script>
    <script src="../assets/js/ficha_tecnica.app.productividad.js"></script>
    <script src="../assets/js/ficha_tecnica.app.recursos.js"></script>
    <script src="../assets/js/ficha_tecnica.app.pdf.js"></script>

</body>

</html>
