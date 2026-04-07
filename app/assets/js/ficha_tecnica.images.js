class SistemaImagenes32Unidades {
  constructor() {
    const imageConfig = window.FICHA_TECNICA_CONFIG?.imageSystem || {};
    this.baseImagePath =
      imageConfig.baseImagePath || "../assets/img/imagenes/unidades/";
    this.defaultImage =
      imageConfig.defaultImage || "../assets/img/imagenes/default/HGSZMF04.png";
    this.mapeoImagenes = imageConfig.mapeoImagenes || {};
  }

  obtenerImagenUnidad(unit) {
    const nombreUnidad = unit.informacion_general.nombre_unidad;

    // ESTRATEGIA 1: Búsqueda exacta por nombre
    if (this.mapeoImagenes[nombreUnidad]) {
      const rutaImagen = this.baseImagePath + this.mapeoImagenes[nombreUnidad];
      return rutaImagen;
    }

    // ESTRATEGIA 2: Búsqueda por clave presupuestal
    const clave = unit.informacion_general.clave_presupuestal;
    if (clave && clave !== "") {
      const imagenPorClave = this.buscarPorClave(clave);
      if (imagenPorClave) return imagenPorClave;
    }

    // ESTRATEGIA 3: Búsqueda por CLUES
    const clues = unit.informacion_general.clues;
    if (clues && clues !== "") {
      const imagenPorClues = this.buscarPorClues(clues);
      if (imagenPorClues) return imagenPorClues;
    }

    // ESTRATEGIA 4: Búsqueda aproximada por nombre
    const imagenAproximada = this.buscarNombreAproximado(nombreUnidad);
    if (imagenAproximada) return imagenAproximada;

    // FALLBACK: Imagen por defecto
    return this.defaultImage;
  }

  async precargarImagenUnidad(unit) {
    const rutaImagen = this.obtenerImagenUnidad(unit);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log(` Imagen cargada: ${rutaImagen}`);
        resolve(true);
      };
      img.onerror = () => {
        console.warn(` Error cargando imagen: ${rutaImagen}`);
        resolve(false);
      };
      img.src = rutaImagen;
    });
  }
  buscarPorClave(clave) {
    for (const [nombreUnidad, archivo] of Object.entries(this.mapeoImagenes)) {
      if (archivo.includes(clave.toLowerCase())) {
        return this.baseImagePath + archivo;
      }
    }
    return null;
  }

  buscarPorClues(clues) {
    for (const [nombreUnidad, archivo] of Object.entries(this.mapeoImagenes)) {
      if (archivo.includes(clues.toLowerCase())) {
        return this.baseImagePath + archivo;
      }
    }
    return null;
  }

  buscarNombreAproximado(nombreUnidad) {
    const nombreLimpio = this.limpiarNombre(nombreUnidad);

    for (const [nombre, archivo] of Object.entries(this.mapeoImagenes)) {
      const nombreMapeoLimpio = this.limpiarNombre(nombre);
      if (nombreLimpio === nombreMapeoLimpio) {
        return this.baseImagePath + archivo;
      }
    }

    // Búsqueda parcial
    for (const [nombre, archivo] of Object.entries(this.mapeoImagenes)) {
      if (this.sonSimilares(nombreUnidad, nombre)) {
        return this.baseImagePath + archivo;
      }
    }

    return null;
  }

  limpiarNombre(nombre) {
    return nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[^a-z0-9]/g, "")
      .trim();
  }

  sonSimilares(nombre1, nombre2) {
    const limpio1 = this.limpiarNombre(nombre1);
    const limpio2 = this.limpiarNombre(nombre2);

    // Extraer partes clave (tipo + número)
    const partes1 = limpio1.match(/([a-z]+)(\d+[a-z]*)/);
    const partes2 = limpio2.match(/([a-z]+)(\d+[a-z]*)/);

    if (partes1 && partes2) {
      return partes1[1] === partes2[1] && partes1[2] === partes2[2];
    }

    return limpio1.includes(limpio2) || limpio2.includes(limpio1);
  }

  async precargarImagenes() {
    const imagenesAPrecargar = Object.values(this.mapeoImagenes);
    const promesasImagen = imagenesAPrecargar.map((archivo) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () =>
          resolve({
            archivo,
            cargada: true,
          });
        img.onerror = () =>
          resolve({
            archivo,
            cargada: false,
          });
        img.src = this.baseImagePath + archivo;
      });
    });

    const resultados = await Promise.all(promesasImagen);

    // console.log(' Imágenes precargadas:');
    resultados.forEach((resultado) => {
      const estado = resultado.cargada ? "" : "";
      // console.log(`   ${estado} ${resultado.archivo}`);
    });

    return resultados;
  }

  generarMapeoCompleto(unidades) {
    // console.log(' MAPEO DE IMÁGENES PARA LAS 32 UNIDADES:');
    // console.log('// Copia este código en el mapeoImagenes:');

    unidades.forEach((unidad, index) => {
      const nombre = unidad.informacion_general.nombre_unidad;
      const nombreArchivo = this.generarNombreArchivo(nombre, index);
      // console.log(`'${nombre}': '${nombreArchivo}',`);
    });
  }

  generarNombreArchivo(nombreUnidad, index) {
    // Limpiar y formatear nombre
    let nombreArchivo = nombreUnidad
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    // Si queda muy largo, usar versión corta
    if (nombreArchivo.length > 30) {
      const match = nombreUnidad.match(/([A-Z]+)\s*(\d+[A-Z]*)\s*(.+)/);
      if (match) {
        const tipo = match[1].toLowerCase();
        const numero = match[2].toLowerCase();
        const ciudad = match[3]
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z]/g, "");
        nombreArchivo = `${tipo}${numero}_${ciudad}`;
      }
    }

    return `${nombreArchivo}.jpg`;
  }
}
