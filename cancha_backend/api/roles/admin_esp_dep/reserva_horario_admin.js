const express = require('express');
const pool = require('../../../config/database');

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
 * Obtener todos los horarios asociados a un admin_esp_dep
 */
const obtenerDatosEspecificos = async (id_admin_esp_dep, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT rh.id_horario, rh.fecha, rh.hora_inicio, rh.hora_fin, rh.monto,
             r.id_reserva, c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre,
             e.id_espacio, e.nombre AS espacio_nombre
      FROM reserva_horario rh
      JOIN reserva r ON rh.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
      ORDER BY rh.fecha DESC, rh.hora_inicio ASC
      LIMIT $2 OFFSET $3
    `;
    const queryTotal = `
      SELECT COUNT(*) 
      FROM reserva_horario rh
      JOIN reserva r ON rh.id_reserva = r.id_reserva
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
    `;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [id_admin_esp_dep, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep])
    ]);
    return {
      horarios: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    console.error('Error en obtenerDatosEspecificos:', error);
    throw error;
  }
};

/**
 * Filtros de ordenamiento
 */
const obtenerHorariosFiltrados = async (id_admin_esp_dep, tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      fecha: 'rh.fecha DESC, rh.hora_inicio ASC',
      hora: 'rh.hora_inicio ASC',
      monto: 'rh.monto ASC',
      default: 'rh.id_horario ASC'
    };
    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT rh.id_horario, rh.fecha, rh.hora_inicio, rh.hora_fin, rh.monto,
             r.id_reserva, c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre,
             e.id_espacio, e.nombre AS espacio_nombre
      FROM reserva_horario rh
      JOIN reserva r ON rh.id_reserva = r.id_reserva
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
      FROM reserva_horario rh
      JOIN reserva r ON rh.id_reserva = r.id_reserva
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
    `;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [id_admin_esp_dep, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep])
    ]);
    return {
      horarios: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    console.error('Error en obtenerHorariosFiltrados:', error);
    throw error;
  }
};

/**
 * Buscar horarios (nombre, apellido, cancha)
 */
const buscarHorarios = async (id_admin_esp_dep, texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT rh.id_horario, rh.fecha, rh.hora_inicio, rh.hora_fin, rh.monto,
             r.id_reserva, c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido,
             ca.id_cancha, ca.nombre AS cancha_nombre,
             e.id_espacio, e.nombre AS espacio_nombre
      FROM reserva_horario rh
      JOIN reserva r ON rh.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
        AND (
          u.nombre ILIKE $2 OR 
          u.apellido ILIKE $2 OR 
          ca.nombre ILIKE $2
        )
      ORDER BY rh.fecha DESC, rh.hora_inicio ASC
      LIMIT $3 OFFSET $4
    `;
    const queryTotal = `
      SELECT COUNT(*) 
      FROM reserva_horario rh
      JOIN reserva r ON rh.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
        AND (
          u.nombre ILIKE $2 OR 
          u.apellido ILIKE $2 OR 
          ca.nombre ILIKE $2
        )
    `;
    const termino = `%${texto.replace(/[%_\\]/g, '\\$&')}%`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [id_admin_esp_dep, termino, limite, offset]),
      pool.query(queryTotal, [id_admin_esp_dep, termino])
    ]);
    return {
      horarios: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    console.error('Error en buscarHorarios:', error);
    throw error;
  }
};

/**
 * Obtener un horario específico (solo si pertenece al admin)
 */
const obtenerHorarioPorId = async (id_horario, id_admin_esp_dep) => {
  try {
    const query = `
      SELECT rh.*, 
             r.id_reserva, c.id_cliente, u.nombre AS cliente_nombre, u.apellido AS cliente_apellido, u.correo AS cliente_correo,
             ca.id_cancha, ca.nombre AS cancha_nombre,
             e.id_espacio, e.nombre AS espacio_nombre
      FROM reserva_horario rh
      JOIN reserva r ON rh.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE rh.id_horario = $1 AND e.id_admin_esp_dep = $2
    `;
    const result = await pool.query(query, [id_horario, id_admin_esp_dep]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error en obtenerHorarioPorId:', error);
    throw error;
  }
};

/**
 * Crear nuevo horario (valida solapamientos antes de insertar)
 */
const crearHorario = async (datos) => {
  try {
    const { id_reserva, fecha, hora_inicio, hora_fin, monto } = datos;
    if (!id_reserva || !fecha || !hora_inicio || !hora_fin) {
      return { advertencia: true, mensaje: 'Faltan campos obligatorios' };
    }

    // Obtener la cancha asociada a la reserva
    const canchaQuery = `
      SELECT ca.id_cancha
      FROM reserva r
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      WHERE r.id_reserva = $1
    `;
    const canchaRes = await pool.query(canchaQuery, [id_reserva]);
    if (!canchaRes.rows.length) {
      return { advertencia: true, mensaje: 'La reserva no está vinculada a una cancha válida' };
    }
    const id_cancha = canchaRes.rows[0].id_cancha;

    // Verificar si ya existe un horario que se superpone
    const conflictoQuery = `
      SELECT rh.id_horario
      FROM reserva_horario rh
      JOIN reserva r ON rh.id_reserva = r.id_reserva
      WHERE r.id_cancha = $1
        AND rh.fecha = $2
        AND (
          (rh.hora_inicio <= $3 AND rh.hora_fin > $3) OR
          (rh.hora_inicio < $4 AND rh.hora_fin >= $4) OR
          ($3 <= rh.hora_inicio AND $4 >= rh.hora_fin)
        )
    `;
    const conflicto = await pool.query(conflictoQuery, [id_cancha, fecha, hora_inicio, hora_fin]);

    if (conflicto.rows.length > 0) {
      // Devolver advertencia sin lanzar error
      return { advertencia: true, mensaje: 'Conflicto de horario: ya existe una reserva en esa cancha y horario' };
    }

    // Insertar nuevo horario si no hay conflicto
    const insertQuery = `
      INSERT INTO reserva_horario (id_reserva, fecha, hora_inicio, hora_fin, monto)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [id_reserva, fecha, hora_inicio, hora_fin, monto || null];
    const result = await pool.query(insertQuery, values);

    return { horario: result.rows[0] };
  } catch (error) {
    console.error('Error en crearHorario:', error);
    throw error;
  }
};

/**
 * Actualizar horario (solo si pertenece al admin)
 */
const actualizarHorario = async (id, id_admin_esp_dep, camposActualizar) => {
  try {
    const horario = await obtenerHorarioPorId(id, id_admin_esp_dep);
    if (!horario) throw new Error('Horario no encontrado o no pertenece al administrador');

    const camposPermitidos = ['fecha', 'hora_inicio', 'hora_fin', 'monto'];
    const campos = Object.keys(camposActualizar).filter(c => camposPermitidos.includes(c));
    if (!campos.length) throw new Error('No hay campos válidos para actualizar');

    const setClause = campos.map((c, i) => `${c}=$${i + 3}`).join(', ');
    const values = [id, id_admin_esp_dep, ...campos.map(c => camposActualizar[c])];
    const query = `
      UPDATE reserva_horario
      SET ${setClause}
      WHERE id_horario=$1 AND id_reserva IN (
        SELECT r.id_reserva
        FROM reserva r
        JOIN cancha ca ON r.id_cancha = ca.id_cancha
        JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
        WHERE e.id_admin_esp_dep=$2
      )
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error en actualizarHorario:', error);
    throw error;
  }
};

/**
 * Eliminar horario (solo si pertenece al admin)
 */
const eliminarHorario = async (id, id_admin_esp_dep) => {
  try {
    const query = `
      DELETE FROM reserva_horario
      WHERE id_horario=$1 AND id_reserva IN (
        SELECT r.id_reserva
        FROM reserva r
        JOIN cancha ca ON r.id_cancha = ca.id_cancha
        JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
        WHERE e.id_admin_esp_dep=$2
      )
      RETURNING id_horario
    `;
    const result = await pool.query(query, [id, id_admin_esp_dep]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error en eliminarHorario:', error);
    throw error;
  }
};
/**
 * Obtener reservas activas (sin horario) de un admin_esp_dep
 */
const obtenerReservasDisponibles = async (id_admin_esp_dep) => {
  try {
    const query = `
      SELECT 
        r.id_reserva, 
        r.fecha_reserva, 
        r.estado, 
        r.monto_total,
        c.id_cliente, 
        u.nombre AS cliente_nombre, 
        u.apellido AS cliente_apellido,
        ca.id_cancha, 
        ca.nombre AS cancha_nombre
      FROM reserva r
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      JOIN cancha ca ON r.id_cancha = ca.id_cancha
      JOIN espacio_deportivo e ON ca.id_espacio = e.id_espacio
      WHERE e.id_admin_esp_dep = $1
        AND r.estado IN ('pendiente', 'pagada', 'en_cuotas')
        AND NOT EXISTS (
          SELECT 1 
          FROM reserva_horario rh
          WHERE rh.id_reserva = r.id_reserva
        )
      ORDER BY r.fecha_reserva DESC
    `;
    const result = await pool.query(query, [id_admin_esp_dep]);
    return result.rows;
  } catch (error) {
    console.error('Error en obtenerReservasDisponibles:', error);
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
    if (!id_admin_esp_dep) return res.status(400).json(respuesta(false, 'ID de administrador requerido'));

    const { horarios, total } = await obtenerDatosEspecificos(id_admin_esp_dep, limite, offset);
    res.json(respuesta(true, 'Horarios obtenidos correctamente', { horarios, paginacion: { limite, offset, total } }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const obtenerHorariosFiltradosController = async (req, res) => {
  try {
    const { tipo, id_admin_esp_dep } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const { horarios, total } = await obtenerHorariosFiltrados(id_admin_esp_dep, tipo, limite, offset);
    res.json(respuesta(true, 'Horarios filtrados correctamente', { horarios, paginacion: { limite, offset, total } }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const buscarHorariosController = async (req, res) => {
  try {
    const { q, id_admin_esp_dep } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const { horarios, total } = await buscarHorarios(id_admin_esp_dep, q, limite, offset);
    res.json(respuesta(true, 'Búsqueda realizada correctamente', { horarios, paginacion: { limite, offset, total } }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const obtenerHorarioPorIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_admin_esp_dep } = req.query;
    const horario = await obtenerHorarioPorId(parseInt(id), parseInt(id_admin_esp_dep));
    if (!horario) return res.status(404).json(respuesta(false, 'Horario no encontrado'));
    res.json(respuesta(true, 'Horario obtenido correctamente', { horario }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const crearHorarioController = async (req, res) => {
  try {
    const resultado = await crearHorario(req.body);

    // Si se detectó advertencia
    if (resultado.advertencia) {
      return res.status(200).json(respuesta(false, resultado.mensaje));
    }

    // Si todo bien
    res.status(201).json(respuesta(true, 'Horario creado correctamente', { horario: resultado.horario }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const actualizarHorarioController = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_admin_esp_dep } = req.query;
    const horarioAct = await actualizarHorario(parseInt(id), parseInt(id_admin_esp_dep), req.body);
    if (!horarioAct) return res.status(404).json(respuesta(false, 'No se pudo actualizar el horario'));
    res.json(respuesta(true, 'Horario actualizado correctamente', { horario: horarioAct }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const eliminarHorarioController = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_admin_esp_dep } = req.query;
    const eliminado = await eliminarHorario(parseInt(id), parseInt(id_admin_esp_dep));
    if (!eliminado) return res.status(404).json(respuesta(false, 'No se pudo eliminar el horario'));
    res.json(respuesta(true, 'Horario eliminado correctamente'));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};
const obtenerReservasDisponiblesController = async (req, res) => {
  try {
    const id_admin_esp_dep = parseInt(req.query.id_admin_esp_dep);
    if (isNaN(id_admin_esp_dep))
      return res.status(400).json(respuesta(false, 'id_admin_esp_dep requerido y numerico'));
    
    const reservas = await obtenerReservasDisponibles(id_admin_esp_dep);
    res.json(respuesta(true, 'Reservas disponibles obtenidas correctamente', { reservas }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

// =====================================================
// RUTAS
// =====================================================

router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerHorariosFiltradosController);
router.get('/buscar', buscarHorariosController);
router.get('/dato-individual/:id', obtenerHorarioPorIdController);
router.post('/', crearHorarioController);
router.patch('/:id', actualizarHorarioController);
router.delete('/:id', eliminarHorarioController);
router.get('/reservas-disponibles', obtenerReservasDisponiblesController);

module.exports = router;
