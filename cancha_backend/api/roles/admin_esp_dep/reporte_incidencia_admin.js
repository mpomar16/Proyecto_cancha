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
 * LISTAR incidencias del admin_esp_dep
 */
const obtenerIncidenciasAdmin = async (id_admin_esp_dep, limite = 10, offset = 0) => {
  const sql = `
    SELECT 
      ri.id_reporte, ri.detalle, ri.sugerencia, ri.verificado,
      en.id_encargado, uenc.nombre AS encargado_nombre, uenc.apellido AS encargado_apellido,
      r.id_reserva,
      cli.id_cliente, ucli.nombre AS cliente_nombre, ucli.apellido AS cliente_apellido,
      ca.id_cancha, ca.nombre AS cancha_nombre,
      e.id_espacio, e.nombre AS espacio_nombre
    FROM reporte_incidencia ri
    JOIN encargado en ON ri.id_encargado = en.id_encargado
    JOIN usuario uenc ON en.id_encargado = uenc.id_persona
    JOIN reserva r ON ri.id_reserva = r.id_reserva
    JOIN cliente cli ON r.id_cliente = cli.id_cliente
    JOIN usuario ucli ON cli.id_cliente = ucli.id_persona
    JOIN cancha ca ON r.id_cancha = ca.id_cancha
    JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
    WHERE e.id_admin_esp_dep = $1
    ORDER BY ri.id_reporte DESC
    LIMIT $2 OFFSET $3
  `;

  const sqlCount = `
    SELECT COUNT(*)
    FROM reporte_incidencia ri
    JOIN reserva r ON ri.id_reserva = r.id_reserva
    JOIN cancha ca ON r.id_cancha = ca.id_cancha
    JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
    WHERE e.id_admin_esp_dep = $1
  `;

  const [rows, total] = await Promise.all([
    pool.query(sql, [id_admin_esp_dep, limite, offset]),
    pool.query(sqlCount, [id_admin_esp_dep])
  ]);

  return {
    incidencias: rows.rows,
    total: Number(total.rows[0].count)
  };
};


/**
 * BUSCAR incidencias
 */
const buscarIncidenciasAdmin = async (id_admin_esp_dep, q, limite = 10, offset = 0) => {
  const like = `%${q.replace(/[%_\\]/g, '\\$&')}%`;

  const sql = `
    SELECT 
      ri.id_reporte, ri.detalle, ri.sugerencia, ri.verificado,
      en.id_encargado, uenc.nombre AS encargado_nombre, uenc.apellido AS encargado_apellido,
      r.id_reserva,
      cli.id_cliente, ucli.nombre AS cliente_nombre, ucli.apellido AS cliente_apellido,
      ca.id_cancha, ca.nombre AS cancha_nombre,
      e.id_espacio, e.nombre AS espacio_nombre
    FROM reporte_incidencia ri
    JOIN encargado en ON ri.id_encargado = en.id_encargado
    JOIN usuario uenc ON en.id_encargado = uenc.id_persona
    JOIN reserva r ON ri.id_reserva = r.id_reserva
    JOIN cliente cli ON r.id_cliente = cli.id_cliente
    JOIN usuario ucli ON cli.id_cliente = ucli.id_persona
    JOIN cancha ca ON r.id_cancha = ca.id_cancha
    JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
    WHERE e.id_admin_esp_dep = $1
      AND (
        uenc.nombre ILIKE $2 OR uenc.apellido ILIKE $2 OR
        ucli.nombre ILIKE $2 OR ucli.apellido ILIKE $2 OR
        ca.nombre ILIKE $2 OR
        ri.detalle ILIKE $2 OR ri.sugerencia ILIKE $2
      )
    ORDER BY ri.id_reporte DESC
    LIMIT $3 OFFSET $4
  `;

  const sqlCount = `
    SELECT COUNT(*)
    FROM reporte_incidencia ri
    JOIN reserva r ON ri.id_reserva = r.id_reserva
    JOIN cancha ca ON r.id_cancha = ca.id_cancha
    JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
    WHERE e.id_admin_esp_dep = $1
      AND (
        ri.detalle ILIKE $2 OR ri.sugerencia ILIKE $2 OR
        ca.nombre ILIKE $2 OR
        EXISTS (SELECT 1 FROM usuario WHERE id_persona = r.id_cliente AND (nombre ILIKE $2 OR apellido ILIKE $2))
      )
  `;

  const [rows, total] = await Promise.all([
    pool.query(sql, [id_admin_esp_dep, like, limite, offset]),
    pool.query(sqlCount, [id_admin_esp_dep, like])
  ]);

  return {
    incidencias: rows.rows,
    total: Number(total.rows[0].count)
  };
};


/**
 * FILTRAR incidencias
 */
const filtrarIncidenciasAdmin = async (id_admin_esp_dep, tipo, limite = 10, offset = 0) => {
  let whereExtra = '';
  let order = 'ri.id_reporte DESC';

  switch (tipo) {
    case 'verificado_si': whereExtra = 'AND ri.verificado = true'; break;
    case 'verificado_no': whereExtra = 'AND ri.verificado = false'; break;
    case 'cliente_nombre': order = 'ucli.nombre ASC, ucli.apellido ASC'; break;
    case 'cancha_nombre': order = 'ca.nombre ASC'; break;
  }

  const sql = `
    SELECT 
      ri.id_reporte, ri.detalle, ri.sugerencia, ri.verificado,
      en.id_encargado, uenc.nombre AS encargado_nombre, uenc.apellido AS encargado_apellido,
      r.id_reserva,
      cli.id_cliente, ucli.nombre AS cliente_nombre, ucli.apellido AS cliente_apellido,
      ca.id_cancha, ca.nombre AS cancha_nombre,
      e.id_espacio, e.nombre AS espacio_nombre
    FROM reporte_incidencia ri
    JOIN encargado en ON ri.id_encargado = en.id_encargado
    JOIN usuario uenc ON en.id_encargado = uenc.id_persona
    JOIN reserva r ON ri.id_reserva = r.id_reserva
    JOIN cliente cli ON r.id_cliente = cli.id_cliente
    JOIN usuario ucli ON cli.id_cliente = ucli.id_persona
    JOIN cancha ca ON r.id_cancha = ca.id_cancha
    JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
    WHERE e.id_admin_esp_dep = $1
    ${whereExtra}
    ORDER BY ${order}
    LIMIT $2 OFFSET $3
  `;

  const sqlCount = `
    SELECT COUNT(*)
    FROM reporte_incidencia ri
    JOIN reserva r ON ri.id_reserva = r.id_reserva
    JOIN cancha ca ON r.id_cancha = ca.id_cancha
    JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
    WHERE e.id_admin_esp_dep = $1
    ${whereExtra}
  `;

  const [rows, total] = await Promise.all([
    pool.query(sql, [id_admin_esp_dep, limite, offset]),
    pool.query(sqlCount, [id_admin_esp_dep])
  ]);

  return {
    incidencias: rows.rows,
    total: Number(total.rows[0].count)
  };
};


/**
 * DETALLE por ID
 */
const obtenerIncidenciaPorId = async (id, id_admin_esp_dep) => {
  const sql = `
    SELECT 
      ri.*,
      en.id_encargado, uenc.nombre AS encargado_nombre, uenc.apellido AS encargado_apellido,
      r.id_reserva,
      cli.id_cliente, ucli.nombre AS cliente_nombre, ucli.apellido AS cliente_apellido, ucli.correo AS cliente_correo,
      ca.id_cancha, ca.nombre AS cancha_nombre,
      e.id_espacio, e.nombre AS espacio_nombre
    FROM reporte_incidencia ri
    JOIN encargado en ON ri.id_encargado = en.id_encargado
    JOIN usuario uenc ON en.id_encargado = uenc.id_persona
    JOIN reserva r ON ri.id_reserva = r.id_reserva
    JOIN cliente cli ON r.id_cliente = cli.id_cliente
    JOIN usuario ucli ON cli.id_cliente = ucli.id_persona
    JOIN cancha ca ON r.id_cancha = ca.id_cancha
    JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
    WHERE ri.id_reporte = $1 AND e.id_admin_esp_dep = $2
  `;

  const r = await pool.query(sql, [id, id_admin_esp_dep]);
  return r.rows[0] || null;
};

// =====================================================
// =================== CONTROLADORES ====================
// =====================================================

const ctrlListar = async (req, res) => {
  try {
    const id = Number(req.query.id_admin_esp_dep);
    const limit = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);

    const data = await obtenerIncidenciasAdmin(id, limit, offset);

    res.json(respuesta(true, "OK", data));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const ctrlBuscar = async (req, res) => {
  try {
    const id = Number(req.query.id_admin_esp_dep);
    const q = req.query.q;
    const limit = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);

    const data = await buscarIncidenciasAdmin(id, q, limit, offset);

    res.json(respuesta(true, "OK", data));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const ctrlFiltrar = async (req, res) => {
  try {
    const id = Number(req.query.id_admin_esp_dep);
    const tipo = req.query.tipo;
    const limit = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);

    const data = await filtrarIncidenciasAdmin(id, tipo, limit, offset);

    res.json(respuesta(true, "OK", data));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const ctrlIndividual = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const id_admin = Number(req.query.id_admin_esp_dep);

    const incidencia = await obtenerIncidenciaPorId(id, id_admin);

    if (!incidencia) return res.status(404).json(respuesta(false, "No encontrado"));

    res.json(respuesta(true, "OK", { incidencia }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const actualizarVerificado = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const id_admin = Number(req.query.id_admin_esp_dep);
    const { verificado } = req.body;

    const sql = `
      UPDATE reporte_incidencia
      SET verificado = $1
      FROM reserva r
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE reporte_incidencia.id_reporte = $2
      AND reporte_incidencia.id_reserva = r.id_reserva
      AND e.id_admin_esp_dep = $3
    `;

    const r = await pool.query(sql, [verificado, id, id_admin]);

    res.json(respuesta(true, "Verificado actualizado"));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};


// =====================================================
// ======================== RUTAS =======================
// =====================================================

router.get('/datos-especificos', ctrlListar);
router.get('/buscar', ctrlBuscar);
router.get('/filtro', ctrlFiltrar);
router.get('/dato-individual/:id', ctrlIndividual);
router.patch('/:id', actualizarVerificado);


module.exports = router;
