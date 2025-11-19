const express = require('express');
const pool = require('../../../config/database');
const { verifyToken, checkRole } = require('../../../middleware/auth');

const router = express.Router();
const respuesta = (exito, mensaje, datos = null) => ({ exito, mensaje, datos });

const obtenerEspacios = async (id_usuario, limite, offset) => {
  const q = `
    SELECT 
      e.id_espacio,
      e.nombre,
      e.direccion,
      e.descripcion,
      e.latitud,
      e.longitud,
      e.horario_apertura,
      e.horario_cierre,
      e.imagen_principal,
      e.imagen_sec_1,
      e.imagen_sec_2,
      e.imagen_sec_3,
      e.imagen_sec_4,
      a.id_admin_esp_dep,
      u.nombre AS admin_nombre,
      u.apellido AS admin_apellido,
      u.correo AS admin_correo
    FROM encargado en
    JOIN espacio_deportivo e ON e.id_espacio = en.id_espacio
    JOIN admin_esp_dep a ON e.id_admin_esp_dep = a.id_admin_esp_dep
    JOIN usuario u ON a.id_admin_esp_dep = u.id_persona
    WHERE en.id_encargado = $1
    ORDER BY e.nombre ASC
    LIMIT $2 OFFSET $3
  `;

  const qt = `
    SELECT COUNT(*) 
    FROM encargado 
    WHERE id_encargado = $1
  `;

  const [r1, r2] = await Promise.all([
    pool.query(q, [id_usuario, limite, offset]),
    pool.query(qt, [id_usuario]),
  ]);

  return {
    espacios: r1.rows,
    total: Number(r2.rows[0].count)
  };
};

const obtenerEspaciosFiltrados = async (id_usuario, tipo, limite, offset) => {
  const tiposValidos = {
    nombre: 'e.nombre ASC',
    direccion: 'e.direccion ASC'
  };

  const orderBy = tiposValidos[tipo] || tiposValidos.nombre;

  const q = `
    SELECT 
      e.id_espacio,
      e.nombre,
      e.direccion,
      e.descripcion,
      e.latitud,
      e.longitud,
      e.horario_apertura,
      e.horario_cierre,
      e.imagen_principal,
      e.imagen_sec_1,
      e.imagen_sec_2,
      e.imagen_sec_3,
      e.imagen_sec_4,
      a.id_admin_esp_dep,
      u.nombre AS admin_nombre,
      u.apellido AS admin_apellido,
      u.correo AS admin_correo
    FROM encargado en
    JOIN espacio_deportivo e ON e.id_espacio = en.id_espacio
    JOIN admin_esp_dep a ON e.id_admin_esp_dep = a.id_admin_esp_dep
    JOIN usuario u ON a.id_admin_esp_dep = u.id_persona
    WHERE en.id_encargado = $1
    ORDER BY ${orderBy}
    LIMIT $2 OFFSET $3
  `;

  const qt = `
    SELECT COUNT(*)
    FROM encargado 
    WHERE id_encargado = $1
  `;

  const [rows, total] = await Promise.all([
    pool.query(q, [id_usuario, limite, offset]),
    pool.query(qt, [id_usuario])
  ]);

  return { espacios: rows.rows, total: Number(total.rows[0].count) };
};

const buscarEspacios = async (id_usuario, q, limite, offset) => {
  const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
  const like = `%${sanitizeInput(q)}%`;

  const sql = `
    SELECT 
      e.id_espacio,
      e.nombre,
      e.direccion,
      e.descripcion,
      e.latitud,
      e.longitud,
      e.horario_apertura,
      e.horario_cierre,
      e.imagen_principal,
      e.imagen_sec_1,
      e.imagen_sec_2,
      e.imagen_sec_3,
      e.imagen_sec_4,
      a.id_admin_esp_dep,
      u.nombre AS admin_nombre,
      u.apellido AS admin_apellido,
      u.correo AS admin_correo
    FROM encargado en
    JOIN espacio_deportivo e ON e.id_espacio = en.id_espacio
    JOIN admin_esp_dep a ON e.id_admin_esp_dep = a.id_admin_esp_dep
    JOIN usuario u ON a.id_admin_esp_dep = u.id_persona
    WHERE en.id_encargado = $1
      AND (
        e.nombre ILIKE $2 OR
        e.direccion ILIKE $2 OR
        e.descripcion ILIKE $2 OR
        u.nombre ILIKE $2 OR
        u.apellido ILIKE $2
      )
    ORDER BY e.nombre ASC
    LIMIT $3 OFFSET $4
  `;

  const totalSql = `
    SELECT COUNT(*)
    FROM encargado en
    JOIN espacio_deportivo e ON e.id_espacio = en.id_espacio
    JOIN admin_esp_dep a ON e.id_admin_esp_dep = a.id_admin_esp_dep
    JOIN usuario u ON a.id_admin_esp_dep = u.id_persona
    WHERE en.id_encargado = $1
      AND (
        e.nombre ILIKE $2 OR
        e.direccion ILIKE $2 OR
        e.descripcion ILIKE $2 OR
        u.nombre ILIKE $2 OR
        u.apellido ILIKE $2
      )
  `;

  const [r1, r2] = await Promise.all([
    pool.query(sql, [id_usuario, like, limite, offset]),
    pool.query(totalSql, [id_usuario, like]),
  ]);

  return {
    espacios: r1.rows,
    total: Number(r2.rows[0].count)
  };
};

const obtenerEspacioPorId = async (id_usuario, id_espacio) => {
  const q = `
    SELECT 
      e.id_espacio,
      e.nombre,
      e.direccion,
      e.descripcion,
      e.latitud,
      e.longitud,
      e.horario_apertura,
      e.horario_cierre,
      e.imagen_principal,
      e.imagen_sec_1,
      e.imagen_sec_2,
      e.imagen_sec_3,
      e.imagen_sec_4,
      a.id_admin_esp_dep,
      u.nombre AS admin_nombre,
      u.apellido AS admin_apellido,
      u.correo AS admin_correo
    FROM encargado en
    JOIN espacio_deportivo e ON e.id_espacio = en.id_espacio
    JOIN admin_esp_dep a ON e.id_admin_esp_dep = a.id_admin_esp_dep
    JOIN usuario u ON a.id_admin_esp_dep = u.id_persona
    WHERE en.id_encargado = $1 AND e.id_espacio = $2
  `;

  const r = await pool.query(q, [id_usuario, id_espacio]);
  return r.rows[0] || null;
};

const datosEspecificosController = async (req, res) => {
  try {
    const id_usuario = req.user.id_persona;
    const limite = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);

    const { espacios, total } = await obtenerEspacios(id_usuario, limite, offset);

    res.json(
      respuesta(true, "Espacios obtenidos", {
        espacios,
        paginacion: { limite, offset, total }
      })
    );
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

    const out = await obtenerEspaciosFiltrados(id_usuario, tipo, limite, offset);

    res.json(
      respuesta(true, "Espacios filtrados", {
        espacios: out.espacios,
        paginacion: { limite, offset, total: out.total }
      })
    );
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const buscarController = async (req, res) => {
  try {
    const id_usuario = req.user.id_persona;
    const q = req.query.q || '';
    const limite = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);

    const out = await buscarEspacios(id_usuario, q, limite, offset);

    res.json(
      respuesta(true, "Resultados", {
        espacios: out.espacios,
        paginacion: { limite, offset, total: out.total }
      })
    );
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

const detalleController = async (req, res) => {
  try {
    const id_usuario = req.user.id_persona;
    const id_espacio = Number(req.params.id);

    const espacio = await obtenerEspacioPorId(id_usuario, id_espacio);

    if (!espacio)
      return res.status(404).json(respuesta(false, "No encontrado"));

    res.json(respuesta(true, "OK", { espacio }));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

router.get('/datos-especificos', verifyToken, checkRole(['ENCARGADO']), datosEspecificosController);
router.get('/filtro', verifyToken, checkRole(['ENCARGADO']), filtroController);
router.get('/buscar', verifyToken, checkRole(['ENCARGADO']), buscarController);
router.get('/dato-individual/:id', verifyToken, checkRole(['ENCARGADO']), detalleController);

module.exports = router;
