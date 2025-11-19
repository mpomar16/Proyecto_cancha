const express = require('express');
const pool = require('../../../config/database');
const { verifyToken, checkRole } = require('../../../middleware/auth');

const router = express.Router();
const respuesta = (exito, mensaje, datos = null) => ({ exito, mensaje, datos });

/* ============================================================
   =========================== MODELOS =========================
   ============================================================ */

/**
 * Obtener canchas de los espacios donde el usuario es encargado
 */
const obtenerCanchas = async (id_usuario, limite, offset) => {
  const q = `
    SELECT 
      c.id_cancha,
      c.nombre,
      c.capacidad,
      c.estado,
      c.ubicacion,
      c.monto_por_hora,
      c.imagen_cancha,
      c.id_espacio,
      e.nombre AS espacio_nombre
    FROM encargado en
    JOIN cancha c ON c.id_espacio = en.id_espacio
    JOIN espacio_deportivo e ON e.id_espacio = c.id_espacio
    WHERE en.id_encargado = $1
    ORDER BY c.nombre ASC
    LIMIT $2 OFFSET $3
  `;

  const qt = `
    SELECT COUNT(*)
    FROM encargado en
    JOIN cancha c ON c.id_espacio = en.id_espacio
    WHERE en.id_encargado = $1
  `;

  const [r1, r2] = await Promise.all([
    pool.query(q, [id_usuario, limite, offset]),
    pool.query(qt, [id_usuario])
  ]);

  // Ahora cargamos disciplinas por cancha
  const canchas = r1.rows;

  for (let c of canchas) {
    const d = await pool.query(`
      SELECT sp.id_disciplina, d.nombre, sp.frecuencia_practica
      FROM se_practica sp
      JOIN disciplina d ON d.id_disciplina = sp.id_disciplina
      WHERE sp.id_cancha = $1
    `, [c.id_cancha]);

    c.disciplinas = d.rows;
  }

  return {
    canchas,
    total: Number(r2.rows[0].count)
  };
};

/**
 * Filtro general para ordenar canchas
 */
const filtrarCanchas = async (id_usuario, tipo, limite, offset) => {
  const filtros = {
    nombre: 'c.nombre ASC',
    capacidad: 'c.capacidad ASC',
    monto: 'c.monto_por_hora ASC',
    estado: 'c.estado ASC'
  };

  const orderBy = filtros[tipo] || filtros.nombre;

  const sql = `
    SELECT 
      c.id_cancha,
      c.nombre,
      c.capacidad,
      c.estado,
      c.ubicacion,
      c.monto_por_hora,
      c.imagen_cancha,
      c.id_espacio,
      e.nombre AS espacio_nombre
    FROM encargado en
    JOIN cancha c ON c.id_espacio = en.id_espacio
    JOIN espacio_deportivo e ON e.id_espacio = c.id_espacio
    WHERE en.id_encargado = $1
    ORDER BY ${orderBy}
    LIMIT $2 OFFSET $3
  `;

  const totalSql = `
    SELECT COUNT(*)
    FROM encargado en
    JOIN cancha c ON c.id_espacio = en.id_espacio
    WHERE en.id_encargado = $1
  `;

  const [rows, total] = await Promise.all([
    pool.query(sql, [id_usuario, limite, offset]),
    pool.query(totalSql, [id_usuario])
  ]);

  return {
    canchas: rows.rows,
    total: Number(total.rows[0].count)
  };
};


/**
 * Buscar canchas
 */
const buscarCanchas = async (id_usuario, q, limite, offset) => {
  const like = `%${q}%`;

  const sql = `
    SELECT 
      c.id_cancha,
      c.nombre,
      c.capacidad,
      c.estado,
      c.ubicacion,
      c.monto_por_hora,
      c.imagen_cancha,
      c.id_espacio,
      e.nombre AS espacio_nombre
    FROM encargado en
    JOIN cancha c ON c.id_espacio = en.id_espacio
    JOIN espacio_deportivo e ON e.id_espacio = c.id_espacio
    WHERE en.id_encargado = $1
      AND (c.nombre ILIKE $2 OR c.ubicacion ILIKE $2)
    ORDER BY c.nombre ASC
    LIMIT $3 OFFSET $4
  `;

  const totalSql = `
    SELECT COUNT(*)
    FROM encargado en
    JOIN cancha c ON c.id_espacio = en.id_espacio
    WHERE en.id_encargado = $1
      AND (c.nombre ILIKE $2 OR c.ubicacion ILIKE $2)
  `;

  const [r1, r2] = await Promise.all([
    pool.query(sql, [id_usuario, like, limite, offset]),
    pool.query(totalSql, [id_usuario, like])
  ]);

  return {
    canchas: r1.rows,
    total: Number(r2.rows[0].count)
  };
};


/**
 * Obtener una cancha específica del encargado
 */
const obtenerCanchaPorId = async (id_usuario, id_cancha) => {
  const canchaSql = `
    SELECT 
      c.id_cancha,
      c.nombre,
      c.capacidad,
      c.estado,
      c.ubicacion,
      c.monto_por_hora,
      c.imagen_cancha,
      c.id_espacio,
      e.nombre AS espacio_nombre
    FROM encargado en
    JOIN cancha c ON c.id_espacio = en.id_espacio
    JOIN espacio_deportivo e ON e.id_espacio = c.id_espacio
    WHERE en.id_encargado = $1 AND c.id_cancha = $2
  `;

  const disciplinaSql = `
    SELECT 
      sp.id_disciplina,
      d.nombre,
      sp.frecuencia_practica
    FROM se_practica sp
    JOIN disciplina d ON d.id_disciplina = sp.id_disciplina
    WHERE sp.id_cancha = $1
  `;

  const [c, d] = await Promise.all([
    pool.query(canchaSql, [id_usuario, id_cancha]),
    pool.query(disciplinaSql, [id_cancha])
  ]);

  if (c.rows.length === 0) return null;

  return {
    ...c.rows[0],
    disciplinas: d.rows
  };
};

/* ============================================================
   ======================== CONTROLADORES ======================
   ============================================================ */

const datosEspecificosController = async (req, res) => {
  try {
    const id_usuario = req.user.id_persona;
    const limite = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);

    const data = await obtenerCanchas(id_usuario, limite, offset);

    res.json(respuesta(true, "Canchas obtenidas", {
      canchas: data.canchas,
      paginacion: {
        limite,
        offset,
        total: data.total
      }
    }));

  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};


const filtroController = async (req, res) => {
  try {
    const id_usuario = req.user.id_persona;
    const tipo = req.query.tipo;
    const limite = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);

    const data = await filtrarCanchas(id_usuario, tipo, limite, offset);

    res.json(respuesta(true, "Canchas filtradas", {
      canchas: data.canchas,
      paginacion: {
        limite,
        offset,
        total: data.total
      }
    }));

  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};


const buscarController = async (req, res) => {
  try {
    const id_usuario = req.user.id_persona;
    const q = req.query.q || "";
    const limite = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);

    const data = await buscarCanchas(id_usuario, q, limite, offset);

    res.json(respuesta(true, "Resultados de búsqueda", data));

  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};


const detalleController = async (req, res) => {
  try {
    const id_usuario = req.user.id_persona;
    const id_cancha = Number(req.params.id);

    const cancha = await obtenerCanchaPorId(id_usuario, id_cancha);

    if (!cancha)
      return res.status(404).json(respuesta(false, "No encontrado"));

    res.json(respuesta(true, "OK", { cancha }));

  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};


/* ============================================================
   ============================ RUTAS ==========================
   ============================================================ */

router.get('/datos-especificos', verifyToken, checkRole(['ENCARGADO']), datosEspecificosController);
router.get('/filtro', verifyToken, checkRole(['ENCARGADO']), filtroController);
router.get('/buscar', verifyToken, checkRole(['ENCARGADO']), buscarController);
router.get('/dato-individual/:id', verifyToken, checkRole(['ENCARGADO']), detalleController);

module.exports = router;
