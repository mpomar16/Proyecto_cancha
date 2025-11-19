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
 * Obtener controladores que pertenecen a un admin_esp_dep
 */
const obtenerDatosEspecificos = async (id_admin_esp_dep, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT 
        c.id_control,
        u.nombre,
        u.apellido,
        u.correo,
        c.fecha_asignacion,
        c.estado,
        e.id_espacio,
        e.nombre AS espacio_nombre
      FROM control c
      JOIN usuario u ON c.id_control = u.id_persona
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
      ORDER BY c.id_control ASC
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*)
      FROM control c
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
    `;

    const [rows, total] = await Promise.all([
      pool.query(queryDatos, [id_admin_esp_dep, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep])
    ]);

    return { controladores: rows.rows, total: Number(total.rows[0].count) };
  } catch (e) {
    console.error("ERROR obtenerDatosEspecificos:", e);
    throw e;
  }
};


/**
 * Filtro general
 */
const obtenerControlFiltrado = async (id_admin_esp_dep, tipoFiltro, limite = 10, offset = 0) => {
  try {
    let orderBy = "u.nombre ASC";

    switch (tipoFiltro) {
      case "apellido":
        orderBy = "u.apellido ASC";
        break;
      case "correo":
        orderBy = "u.correo ASC";
        break;
      case "fecha":
        orderBy = "c.fecha_asignacion DESC";
        break;
    }

    const query = `
      SELECT 
        c.id_control,
        u.nombre,
        u.apellido,
        u.correo,
        c.fecha_asignacion,
        c.estado,
        e.id_espacio,
        e.nombre AS espacio_nombre
      FROM control c
      JOIN usuario u ON c.id_control = u.id_persona
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*)
      FROM control c
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
    `;

    const [rows, total] = await Promise.all([
      pool.query(query, [id_admin_esp_dep, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep])
    ]);

    return { controladores: rows.rows, total: Number(total.rows[0].count) };
  } catch (e) {
    console.error("ERROR obtenerControlFiltrado:", e);
    throw e;
  }
};


/**
 * Buscar controladores por parámetros
 */
const buscarControladores = async (id_admin_esp_dep, q, limite = 10, offset = 0) => {
  try {
    const term = `%${q.replace(/[%_\\]/g, '\\$&')}%`;

    const queryDatos = `
      SELECT 
        c.id_control,
        u.nombre,
        u.apellido,
        u.correo,
        c.fecha_asignacion,
        c.estado,
        e.id_espacio,
        e.nombre AS espacio_nombre
      FROM control c
      JOIN usuario u ON c.id_control = u.id_persona
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
        AND (
          u.nombre ILIKE $2 OR
          u.apellido ILIKE $2 OR
          u.correo ILIKE $2
        )
      ORDER BY u.nombre ASC
      LIMIT $3 OFFSET $4
    `;

    const queryTotal = `
      SELECT COUNT(*)
      FROM control c
      JOIN usuario u ON c.id_control = u.id_persona
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
        AND (
          u.nombre ILIKE $2 OR
          u.apellido ILIKE $2 OR
          u.correo ILIKE $2
        )
    `;

    const [rows, total] = await Promise.all([
      pool.query(queryDatos, [id_admin_esp_dep, term, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep, term])
    ]);

    return { controladores: rows.rows, total: Number(total.rows[0].count) };
  } catch (e) {
    console.error("ERROR buscarControladores:", e);
    throw e;
  }
};


/**
 * Dato individual
 */
const obtenerControlPorId = async (id_control, id_admin_esp_dep) => {
  try {
    const query = `
      SELECT 
        c.*,
        u.nombre,
        u.apellido,
        u.correo,
        u.usuario,
        e.id_espacio,
        e.nombre AS espacio_nombre
      FROM control c
      JOIN usuario u ON c.id_control = u.id_persona
      JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
      WHERE c.id_control = $1
        AND e.id_admin_esp_dep = $2
    `;

    const r = await pool.query(query, [id_control, id_admin_esp_dep]);
    return r.rows[0] || null;
  } catch (e) {
    console.error("ERROR obtenerControlPorId:", e);
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

    const datos = await obtenerDatosEspecificos(id_admin, limite, offset);
    res.json(respuesta(true, 'Controladores obtenidos correctamente', datos));
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

    const datos = await obtenerControlFiltrado(id_admin, tipo, limite, offset);
    res.json(respuesta(true, 'Controladores filtrados correctamente', datos));
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

    const datos = await buscarControladores(id_admin, q, limite, offset);
    res.json(respuesta(true, 'Busqueda realizada correctamente', datos));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const obtenerEncargadoPorIdController = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const id_admin = parseInt(req.query.id_admin_esp_dep);

    const controlador = await obtenerControlPorId(id, id_admin);

    if (!controlador) {
      return res.status(404).json(respuesta(false, 'Controlador no encontrado'));
    }

    res.json(respuesta(true, 'Controlador obtenido correctamente', { controlador }));
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
