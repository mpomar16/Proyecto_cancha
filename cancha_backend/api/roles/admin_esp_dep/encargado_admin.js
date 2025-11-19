const express = require('express');
const pool = require('../../../config/database');

const router = express.Router();

// =====================================================
// RESPUESTA ESTANDAR
// =====================================================
const respuesta = (exito, mensaje, datos = null) => ({
  exito,
  mensaje,
  datos,
});

// =====================================================
// ======================= MODELOS ======================
// =====================================================

/**
 * Obtener encargados que pertenecen a un admin_esp_dep
 */
const obtenerDatosEspecificos = async (id_admin_esp_dep, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT 
        en.id_encargado,
        u.nombre AS encargado_nombre,
        u.apellido AS encargado_apellido,
        u.correo,
        en.responsabilidad,
        en.fecha_inicio,
        en.hora_ingreso,
        en.hora_salida,
        en.estado,
        e.id_espacio,
        e.nombre AS espacio_nombre
      FROM encargado en
      JOIN usuario u ON en.id_encargado = u.id_persona
      JOIN espacio_deportivo e ON en.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
      ORDER BY en.id_encargado ASC
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*)
      FROM encargado en
      JOIN espacio_deportivo e ON en.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
    `;

    const [rows, total] = await Promise.all([
      pool.query(queryDatos, [id_admin_esp_dep, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep])
    ]);

    return { encargados: rows.rows, total: Number(total.rows[0].count) };
  } catch (err) {
    console.error("ERROR obtenerDatosEspecificos:", err);
    throw err;
  }
};


/**
 * Filtro general (nombre, cancha, fecha)
 */
const obtenerEncargadosFiltrados = async (id_admin_esp_dep, tipoFiltro, limite = 10, offset = 0) => {
  try {
    let orderBy = 'u.nombre ASC';

    switch (tipoFiltro) {
      case 'apellido': orderBy = 'u.apellido ASC'; break;
      case 'correo': orderBy = 'u.correo ASC'; break;
      case 'fecha': orderBy = 'en.fecha_inicio DESC'; break;
    }

    const query = `
      SELECT 
        en.id_encargado,
        u.nombre AS encargado_nombre,
        u.apellido AS encargado_apellido,
        u.correo,
        en.responsabilidad,
        en.fecha_inicio,
        en.hora_ingreso,
        en.hora_salida,
        en.estado,
        e.id_espacio,
        e.nombre AS espacio_nombre
      FROM encargado en
      JOIN usuario u ON en.id_encargado = u.id_persona
      JOIN espacio_deportivo e ON en.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*)
      FROM encargado en
      JOIN espacio_deportivo e ON en.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
    `;

    const [rows, total] = await Promise.all([
      pool.query(query, [id_admin_esp_dep, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep])
    ]);

    return { encargados: rows.rows, total: Number(total.rows[0].count) };
  } catch (e) {
    console.error("ERROR obtenerEncargadosFiltrados:", e);
    throw e;
  }
};


/**
 * BUSCAR por nombre, apellido, correo o responsabilidad
 */
const buscarEncargados = async (id_admin_esp_dep, q, limite = 10, offset = 0) => {
  try {
    const term = `%${q.replace(/[%_\\]/g, '\\$&')}%`;

    const queryDatos = `
      SELECT 
        en.id_encargado,
        u.nombre AS encargado_nombre,
        u.apellido AS encargado_apellido,
        u.correo,
        en.responsabilidad,
        en.fecha_inicio,
        en.hora_ingreso,
        en.hora_salida,
        en.estado,
        e.id_espacio,
        e.nombre AS espacio_nombre
      FROM encargado en
      JOIN usuario u ON en.id_encargado = u.id_persona
      JOIN espacio_deportivo e ON en.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
        AND (
          u.nombre ILIKE $2 OR
          u.apellido ILIKE $2 OR
          u.correo ILIKE $2 OR
          en.responsabilidad ILIKE $2
        )
      ORDER BY u.nombre ASC
      LIMIT $3 OFFSET $4
    `;

    const queryTotal = `
      SELECT COUNT(*)
      FROM encargado en
      JOIN usuario u ON en.id_encargado = u.id_persona
      JOIN espacio_deportivo e ON en.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
        AND (
          u.nombre ILIKE $2 OR
          u.apellido ILIKE $2 OR
          u.correo ILIKE $2 OR
          en.responsabilidad ILIKE $2
        )
    `;

    const [rows, total] = await Promise.all([
      pool.query(queryDatos, [id_admin_esp_dep, term, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep, term])
    ]);

    return { encargados: rows.rows, total: Number(total.rows[0].count) };
  } catch (e) {
    console.error("ERROR buscarEncargados:", e);
    throw e;
  }
};

/**
 * DATO INDIVIDUAL
 */
const obtenerEncargadoPorId = async (id_encargado, id_admin_esp_dep) => {
  try {
    const query = `
      SELECT 
        en.*,
        u.nombre,
        u.apellido,
        u.correo,
        u.usuario,
        e.id_espacio,
        e.nombre AS espacio_nombre
      FROM encargado en
      JOIN usuario u ON en.id_encargado = u.id_persona
      JOIN espacio_deportivo e ON en.id_espacio = e.id_espacio
      WHERE en.id_encargado = $1
        AND e.id_admin_esp_dep = $2
    `;

    const r = await pool.query(query, [id_encargado, id_admin_esp_dep]);
    return r.rows[0] || null;

  } catch (e) {
    console.error("ERROR obtenerEncargadoPorId:", e);
    throw e;
  }
};

// =====================================================
// =================== CONTROLADORES ====================
// =====================================================

const obtenerDatosEspecificosController = async (req, res) => {
  try {
    const id_admin = parseInt(req.query.id_admin_esp_dep);
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { encargados, total } = await obtenerDatosEspecificos(id_admin, limite, offset);
    res.json(respuesta(true, 'Encargados obtenidos correctamente', { encargados, paginacion: { limite, offset, total }}));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const obtenerEncargadosFiltradosController = async (req, res) => {
  try {
    const id_admin = parseInt(req.query.id_admin_esp_dep);
    const tipo = req.query.tipo;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { encargados, total } = await obtenerEncargadosFiltrados(id_admin, tipo, limite, offset);

    res.json(respuesta(true, 'Encargados filtrados correctamente', { encargados, paginacion: { limite, offset, total }}));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const buscarEncargadosController = async (req, res) => {
  try {
    const id_admin = parseInt(req.query.id_admin_esp_dep);
    const q = req.query.q;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { encargados, total } = await buscarEncargados(id_admin, q, limite, offset);

    res.json(respuesta(true, 'Encargados encontrados', { encargados, paginacion: { limite, offset, total }}));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const obtenerEncargadoPorIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const id_admin = parseInt(req.query.id_admin_esp_dep);

    const encargado = await obtenerEncargadoPorId(parseInt(id), id_admin);

    if (!encargado) return res.status(404).json(respuesta(false, 'Encargado no encontrado'));

    res.json(respuesta(true, 'Encargado obtenido correctamente', { encargado }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

// =====================================================
// ======================== RUTAS =======================
// =====================================================

router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerEncargadosFiltradosController);
router.get('/buscar', buscarEncargadosController);
router.get('/dato-individual/:id', obtenerEncargadoPorIdController);

module.exports = router;