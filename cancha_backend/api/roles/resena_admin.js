const express = require('express');
const pool = require('../../config/database');

const router = express.Router();

// === Función de respuesta estandarizada ===
const respuesta = (exito, mensaje, datos = null) => ({
  exito,
  mensaje,
  datos,
});

// =====================================================
// MODELOS - Funciones puras para operaciones en la BD
// =====================================================

/**
 * Obtener reseñas de un admin_esp_dep (solo sus canchas)
 */
const obtenerDatosEspecificos = async (id_admin_esp_dep, limite = 10, offset = 0, id_cancha = null) => {
  try {
    const params = [id_admin_esp_dep];
    let canchaFilter = '';

    if (id_cancha) {
      params.push(id_cancha);
      canchaFilter = `AND ca.id_cancha = $${params.length}`;
    }

    params.push(limite, offset);

    const queryDatos = `
      SELECT re.id_resena, re.estrellas, re.comentario, re.fecha_creacion, re.estado, re.verificado,
             r.id_reserva, c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre,
             e.id_espacio, e.nombre AS espacio_nombre
      FROM resena re
      JOIN reserva r ON re.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
      ${canchaFilter}
      ORDER BY re.fecha_creacion DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const queryTotal = `
      SELECT COUNT(*)
      FROM resena re
      JOIN reserva r ON re.id_reserva = r.id_reserva
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
      ${canchaFilter}
    `;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, params),
      pool.query(queryTotal, params.slice(0, id_cancha ? 2 : 1))
    ]);

    return { resenas: resultDatos.rows, total: parseInt(resultTotal.rows[0].count) };
  } catch (error) {
    console.error('Error en obtenerDatosEspecificos:', error);
    throw error;
  }
};

/**
 * Obtener reseñas filtradas (verificado, cliente, cancha)
 */
const obtenerResenasFiltradas = async (id_admin_esp_dep, tipoFiltro, limite = 10, offset = 0, id_cancha = null) => {
  try {
    const params = [id_admin_esp_dep];
    let canchaFilter = '';

    if (id_cancha) {
      params.push(id_cancha);
      canchaFilter = `AND ca.id_cancha = $${params.length}`;
    }

    params.push(limite, offset);

    let whereExtra = '';
    let orderClause = 're.id_resena ASC';

    switch (tipoFiltro) {
      case 'verificado_si':
        whereExtra = 'AND re.verificado = true';
        orderClause = 're.fecha_creacion DESC';
        break;
      case 'verificado_no':
        whereExtra = 'AND re.verificado = false';
        orderClause = 're.fecha_creacion DESC';
        break;
      case 'cliente_nombre':
        orderClause = 'u.nombre ASC, u.apellido ASC';
        break;
      case 'cancha_nombre':
        orderClause = 'ca.nombre ASC';
        break;
      default:
        orderClause = 're.id_resena ASC';
    }

    const queryDatos = `
      SELECT re.id_resena, re.estrellas, re.comentario, re.fecha_creacion, re.estado, re.verificado,
             r.id_reserva, c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre
      FROM resena re
      JOIN reserva r ON re.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
      ${whereExtra}
      ORDER BY ${orderClause}
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*)
      FROM resena re
      JOIN reserva r ON re.id_reserva = r.id_reserva
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
      ${whereExtra}
    `;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [id_admin_esp_dep, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep])
    ]);
    return { resenas: resultDatos.rows, total: parseInt(resultTotal.rows[0].count) };
  } catch (error) {
    console.error('Error en obtenerResenasFiltradas:', error);
    throw error;
  }
};

/**
 * Buscar reseñas por texto (cliente, cancha, comentario)
 */
const buscarResenas = async (id_admin_esp_dep, texto, limite = 10, offset = 0, id_cancha = null) => {
  try {
    const params = [id_admin_esp_dep];
    let canchaFilter = '';

    if (id_cancha) {
      params.push(id_cancha);
      canchaFilter = `AND ca.id_cancha = $${params.length}`;
    }

    params.push(`%${texto.replace(/[%_\\]/g, '\\$&')}%`, limite, offset);

    const termino = `%${texto.replace(/[%_\\]/g, '\\$&')}%`;
    const queryDatos = `
      SELECT re.id_resena, re.estrellas, re.comentario, re.fecha_creacion, re.estado, re.verificado,
             r.id_reserva, c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre
      FROM resena re
      JOIN reserva r ON re.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
        AND (
          u.nombre ILIKE $2 OR 
          u.apellido ILIKE $2 OR 
          ca.nombre ILIKE $2 OR 
          re.comentario ILIKE $2
        )
      ORDER BY re.fecha_creacion DESC
      LIMIT $3 OFFSET $4
    `;
    const queryTotal = `
      SELECT COUNT(*)
      FROM resena re
      JOIN reserva r ON re.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
        AND (
          u.nombre ILIKE $2 OR 
          u.apellido ILIKE $2 OR 
          ca.nombre ILIKE $2 OR 
          re.comentario ILIKE $2
        )
    `;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [id_admin_esp_dep, termino, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep, termino])
    ]);
    return { resenas: resultDatos.rows, total: parseInt(resultTotal.rows[0].count) };
  } catch (error) {
    console.error('Error en buscarResenas:', error);
    throw error;
  }
};

/**
 * Obtener una reseña específica (solo si pertenece al admin)
 */
const obtenerResenaPorId = async (id, id_admin_esp_dep) => {
  try {
    const query = `
      SELECT re.*, 
             r.id_reserva, c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido, u.correo AS cliente_correo,
             ca.id_cancha, ca.nombre AS cancha_nombre,
             e.id_espacio, e.nombre AS espacio_nombre
      FROM resena re
      JOIN reserva r ON re.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE re.id_resena = $1 AND e.id_admin_esp_dep = $2
    `;
    const result = await pool.query(query, [id, id_admin_esp_dep]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error en obtenerResenaPorId:', error);
    throw error;
  }
};

/**
 * Actualizar reseña (solo si pertenece al admin)
 */
const actualizarResena = async (id, id_admin_esp_dep, camposActualizar) => {
  try {
    const resenaExistente = await obtenerResenaPorId(id, id_admin_esp_dep);
    if (!resenaExistente) throw new Error('Reseña no encontrada o no pertenece al administrador');

    const camposPermitidos = ['estrellas', 'comentario', 'estado', 'verificado'];
    const campos = Object.keys(camposActualizar).filter(c => camposPermitidos.includes(c));
    if (campos.length === 0) throw new Error('No hay campos válidos para actualizar');

    const setClause = campos.map((c, i) => `${c}=$${i + 3}`).join(', ');
    const values = [id, id_admin_esp_dep, ...campos.map(c => camposActualizar[c])];

    const query = `
      UPDATE resena 
      SET ${setClause}
      WHERE id_resena = $1
        AND id_reserva IN (
          SELECT r.id_reserva
          FROM reserva r
          JOIN cancha ca ON r.id_cancha = ca.id_cancha
          JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
          WHERE e.id_admin_esp_dep = $2
        )
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error en actualizarResena:', error);
    throw error;
  }
};

/**
 * Eliminar reseña (solo si pertenece al admin)
 */
const eliminarResena = async (id, id_admin_esp_dep) => {
  try {
    const query = `
      DELETE FROM resena
      WHERE id_resena = $1
        AND id_reserva IN (
          SELECT r.id_reserva
          FROM reserva r
          JOIN cancha ca ON r.id_cancha = ca.id_cancha
          JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
          WHERE e.id_admin_esp_dep = $2
        )
      RETURNING id_resena
    `;
    const result = await pool.query(query, [id, id_admin_esp_dep]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error en eliminarResena:', error);
    throw error;
  }
};

// =====================================================
// CONTROLADORES
// =====================================================

const obtenerDatosEspecificosController = async (req, res) => {
  try {
    const id_admin_esp_dep = parseInt(req.query.id_admin_esp_dep);
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const id_cancha = req.query.id_cancha ? parseInt(req.query.id_cancha) : null;

    const { resenas, total } = await obtenerDatosEspecificos(id_admin_esp_dep, limite, offset, id_cancha);
    res.json(respuesta(true, 'Reseñas obtenidas correctamente', {
      resenas,
      paginacion: { limite, offset, total }
    }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const obtenerResenasFiltradasController = async (req, res) => {
  try {
    const { tipo, id_admin_esp_dep } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const id_cancha = req.query.id_cancha ? parseInt(req.query.id_cancha) : null;
    const { resenas, total } = await obtenerResenasFiltradas(id_admin_esp_dep, tipo, limite, offset, id_cancha);

    res.json(respuesta(true, 'Reseñas filtradas correctamente', { resenas, paginacion: { limite, offset, total } }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const buscarResenasController = async (req, res) => {
  try {
    const { q, id_admin_esp_dep } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const id_cancha = req.query.id_cancha ? parseInt(req.query.id_cancha) : null;
    const { resenas, total } = await buscarResenas(id_admin_esp_dep, q, limite, offset, id_cancha);

    res.json(respuesta(true, 'Búsqueda realizada correctamente', { resenas, paginacion: { limite, offset, total } }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const obtenerResenaPorIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_admin_esp_dep } = req.query;
    const resena = await obtenerResenaPorId(parseInt(id), parseInt(id_admin_esp_dep));
    if (!resena) return res.status(404).json(respuesta(false, 'Reseña no encontrada'));
    res.json(respuesta(true, 'Reseña obtenida correctamente', { resena }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const actualizarResenaController = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_admin_esp_dep } = req.query;
    const resenaAct = await actualizarResena(parseInt(id), parseInt(id_admin_esp_dep), req.body);
    if (!resenaAct) return res.status(404).json(respuesta(false, 'No se pudo actualizar la reseña'));
    res.json(respuesta(true, 'Reseña actualizada correctamente', { resena: resenaAct }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const eliminarResenaController = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_admin_esp_dep } = req.query;
    const eliminada = await eliminarResena(parseInt(id), parseInt(id_admin_esp_dep));
    if (!eliminada) return res.status(404).json(respuesta(false, 'No se pudo eliminar la reseña'));
    res.json(respuesta(true, 'Reseña eliminada correctamente'));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

// =====================================================
// RUTAS
// =====================================================

router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerResenasFiltradasController);
router.get('/buscar', buscarResenasController);
router.get('/dato-individual/:id', obtenerResenaPorIdController);
router.patch('/:id', actualizarResenaController);
router.delete('/:id', eliminarResenaController);

module.exports = router;
