const express = require('express');
const pool = require('../../config/database');

const router = express.Router();

const respuesta = (exito, mensaje, datos = null) => ({ exito, mensaje, datos });

// ===================================================
// MODELOS — PAGOS del ADMIN_ESP_DEP
// ===================================================

/**
 * Obtener pagos (opcionalmente filtrados por reserva, cancha o espacio)
 */
const obtenerPagosAdmin = async (id_admin_esp_dep, limite = 10, offset = 0, id_reserva = null, id_cancha = null, id_espacio = null) => {
  try {
    const params = [id_admin_esp_dep];
    let filtros = 'WHERE e.id_admin_esp_dep = $1';

    if (id_reserva) {
      params.push(id_reserva);
      filtros += ` AND p.id_reserva = $${params.length}`;
    }

    if (id_cancha) {
      params.push(id_cancha);
      filtros += ` AND ca.id_cancha = $${params.length}`;
    }

    if (id_espacio) {
      params.push(id_espacio);
      filtros += ` AND e.id_espacio = $${params.length}`;
    }

    params.push(limite, offset);

    const query = `
      SELECT 
        p.id_pago, p.monto, p.metodo_pago, p.fecha_pago,
        r.id_reserva, r.estado AS estado_reserva,
        c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
        ca.id_cancha, ca.nombre AS cancha_nombre,
        e.id_espacio, e.nombre AS espacio_nombre
      FROM pago p
      JOIN reserva r ON p.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      ${filtros}
      ORDER BY p.fecha_pago DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM pago p
      JOIN reserva r ON p.id_reserva = r.id_reserva
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      ${filtros}
    `;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(query, params),
      pool.query(queryTotal, params.slice(0, params.length - 2))
    ]);

    return {
      pagos: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    console.error('Error en obtenerPagosAdmin:', error);
    throw error;
  }
};

/**
 * Búsqueda general (nombre, apellido, cancha, método)
 */
const buscarPagosAdmin = async (id_admin_esp_dep, texto, limite = 10, offset = 0) => {
  try {
    const termino = `%${texto.replace(/[%_\\]/g, '\\$&')}%`;

    const query = `
      SELECT 
        p.id_pago, p.monto, p.metodo_pago, p.fecha_pago,
        r.id_reserva, r.estado AS estado_reserva,
        c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
        ca.id_cancha, ca.nombre AS cancha_nombre,
        e.id_espacio, e.nombre AS espacio_nombre
      FROM pago p
      JOIN reserva r ON p.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
        AND (
          u.nombre ILIKE $2 OR
          u.apellido ILIKE $2 OR
          ca.nombre ILIKE $2 OR
          p.metodo_pago ILIKE $2
        )
      ORDER BY p.fecha_pago DESC
      LIMIT $3 OFFSET $4
    `;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(query, [id_admin_esp_dep, termino, limite, offset]),
      pool.query(
        `
        SELECT COUNT(*) 
        FROM pago p
        JOIN reserva r ON p.id_reserva = r.id_reserva
        JOIN cancha ca ON r.id_cancha = ca.id_cancha
        JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
        JOIN cliente c ON r.id_cliente = c.id_cliente
        JOIN usuario u ON c.id_cliente = u.id_persona
        WHERE e.id_admin_esp_dep = $1
          AND (
            u.nombre ILIKE $2 OR
            u.apellido ILIKE $2 OR
            ca.nombre ILIKE $2 OR
            p.metodo_pago ILIKE $2
          )
        `,
        [id_admin_esp_dep, termino]
      )
    ]);

    return {
      pagos: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    console.error('Error en buscarPagosAdmin:', error);
    throw error;
  }
};

/**
 * Filtros específicos (por fecha, monto, método)
 */
const obtenerPagosFiltradosAdmin = async (id_admin_esp_dep, tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenes = {
      fecha: 'p.fecha_pago DESC',
      monto: 'p.monto DESC',
      metodo: 'p.metodo_pago ASC',
      default: 'p.id_pago ASC'
    };
    const orden = ordenes[tipoFiltro] || ordenes.default;

    const query = `
      SELECT 
        p.id_pago, p.monto, p.metodo_pago, p.fecha_pago,
        r.id_reserva, r.estado AS estado_reserva,
        c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
        ca.id_cancha, ca.nombre AS cancha_nombre,
        e.id_espacio, e.nombre AS espacio_nombre
      FROM pago p
      JOIN reserva r ON p.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
      ORDER BY ${orden}
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM pago p
      JOIN reserva r ON p.id_reserva = r.id_reserva
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
    `;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(query, [id_admin_esp_dep, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep])
    ]);

    return {
      pagos: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    console.error('Error en obtenerPagosFiltradosAdmin:', error);
    throw error;
  }
};

// ===================================================
// CONTROLADORES
// ===================================================

const obtenerPagosAdminController = async (req, res) => {
  try {
    const id_admin_esp_dep = parseInt(req.query.id_admin_esp_dep);
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const id_reserva = req.query.id_reserva ? parseInt(req.query.id_reserva) : null;
    const id_cancha = req.query.id_cancha ? parseInt(req.query.id_cancha) : null;
    const id_espacio = req.query.id_espacio ? parseInt(req.query.id_espacio) : null;

    if (isNaN(id_admin_esp_dep)) {
      return res.status(400).json(respuesta(false, 'id_admin_esp_dep es requerido y numérico'));
    }

    const { pagos, total } = await obtenerPagosAdmin(id_admin_esp_dep, limite, offset, id_reserva, id_cancha, id_espacio);
    res.json(respuesta(true, 'Pagos obtenidos correctamente', { pagos, paginacion: { limite, offset, total } }));
  } catch (error) {
    res.status(500).json(respuesta(false, error.message));
  }
};

const buscarPagosAdminController = async (req, res) => {
  try {
    const { q, id_admin_esp_dep } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    if (!q) return res.status(400).json(respuesta(false, 'Debe proporcionar un texto de búsqueda'));
    const { pagos, total } = await buscarPagosAdmin(parseInt(id_admin_esp_dep), q, limite, offset);
    res.json(respuesta(true, 'Búsqueda completada', { pagos, paginacion: { limite, offset, total } }));
  } catch (error) {
    res.status(500).json(respuesta(false, error.message));
  }
};

const obtenerPagosFiltradosAdminController = async (req, res) => {
  try {
    const tipo = req.query.tipo;
    const id_admin_esp_dep = parseInt(req.query.id_admin_esp_dep);
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { pagos, total } = await obtenerPagosFiltradosAdmin(id_admin_esp_dep, tipo, limite, offset);
    res.json(respuesta(true, 'Pagos filtrados correctamente', { pagos, paginacion: { limite, offset, total } }));
  } catch (error) {
    res.status(500).json(respuesta(false, error.message));
  }
};

// ===================================================
// RUTAS
// ===================================================
router.get('/datos-especificos', obtenerPagosAdminController);
router.get('/buscar', buscarPagosAdminController);
router.get('/filtro', obtenerPagosFiltradosAdminController);

module.exports = router;
