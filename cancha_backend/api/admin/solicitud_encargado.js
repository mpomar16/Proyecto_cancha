/**
 * Rutas para gestionar solicitudes del rol ENCARGADO
 */

const express = require('express');
const pool = require('../../config/database');
const { verifyToken, checkRole } = require('../../middleware/auth');
const {
    notifyAdminNuevaSolicitudRol,
    notifyUsuarioResultadoRol
} = require('../../lib/mailer');

const router = express.Router();
const respuesta = (exito, mensaje, datos = null) => ({ exito, mensaje, datos });

/* ============================================================
   ========================= MODELOS ===========================
   ============================================================ */

/**
 * Retorna lista de administradores (para correo)
 */
const getCorreosAdmins = async () => {
    const q = `
    SELECT LOWER(TRIM(u.correo)) AS correo
    FROM administrador a
    JOIN usuario u ON u.id_persona = a.id_administrador
    WHERE u.correo IS NOT NULL AND u.correo <> ''
  `;
    const { rows } = await pool.query(q);
    const set = new Set(rows.map(r => r.correo).filter(Boolean));
    return Array.from(set);
};

/**
 * Obtener espacios disponibles (ningún filtro, los muestra todos)
 */
const getEspacios = async () => {
    const q = `
    SELECT id_espacio, nombre, direccion
    FROM espacio_deportivo
    ORDER BY nombre ASC
  `;
    const { rows } = await pool.query(q);
    return rows;
};

/**
 * Verifica que NO exista duplicado:
 * - usuario ya encargado del espacio
 * - solicitud pendiente
 * - solicitud aprobada anterior
 */
const validarDuplicado = async (id_usuario, id_espacio) => {
    // Ya es encargado de ese espacio
    const chk1 = await pool.query(
        `SELECT 1 FROM encargado WHERE id_encargado=$1 AND id_espacio=$2`,
        [id_usuario, id_espacio]
    );
    if (chk1.rowCount > 0)
        throw new Error('Ya eres encargado de este espacio');

    // Solicitud pendiente
    const chk2 = await pool.query(
        `SELECT 1 FROM solicitud_rol
     WHERE id_usuario=$1 AND rol_destino='encargado'
       AND id_espacio=$2 AND estado='pendiente'`,
        [id_usuario, id_espacio]
    );
    if (chk2.rowCount > 0)
        throw new Error('Ya existe una solicitud pendiente');

    // Solicitud ya aprobada previamente
    const chk3 = await pool.query(
        `SELECT 1 FROM solicitud_rol
     WHERE id_usuario=$1 AND rol_destino='encargado'
       AND id_espacio=$2 AND estado='aprobada'`,
        [id_usuario, id_espacio]
    );
    if (chk3.rowCount > 0)
        throw new Error('Una solicitud anterior ya fue aprobada');
};

/**
 * Crear solicitud
 */
const crearSolicitudEncargado = async ({ id_usuario, id_espacio, motivo }) => {
    await validarDuplicado(id_usuario, id_espacio);

    const q = `
    INSERT INTO solicitud_rol(id_usuario, rol_destino, id_espacio, motivo)
    VALUES ($1, 'encargado', $2, $3)
    RETURNING *
  `;
    const { rows } = await pool.query(q, [id_usuario, id_espacio, motivo]);
    return rows[0];
};

/**
 * Aprobar solicitud (rol ENCARGADO)
 */
const aprobarSolicitud = async ({ id_solicitud, adminId }) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Obtener solicitud
        const solRes = await client.query(
            `SELECT * FROM solicitud_rol WHERE id_solicitud=$1 FOR UPDATE`,
            [id_solicitud]
        );
        if (!solRes.rowCount) throw new Error('Solicitud no encontrada');

        const sol = solRes.rows[0];
        if (sol.estado !== 'pendiente')
            throw new Error('La solicitud ya fue procesada');

        const id_usuario = sol.id_usuario;
        const id_espacio = sol.id_espacio;

        /* ======================================================
           1. Insertar en ENCARGADO
           ====================================================== */

        await client.query(
            `INSERT INTO encargado(id_encargado, id_espacio, fecha_inicio, estado)
             VALUES ($1, $2, CURRENT_DATE, true)`,
            [id_usuario, id_espacio]
        );

        /* ======================================================
           2. Insertar en CLIENTE si no existe
           ====================================================== */

        const chkCliente = await client.query(
            `SELECT 1 FROM cliente WHERE id_cliente = $1`,
            [id_usuario]
        );

        if (!chkCliente.rowCount) {
            await client.query(
                `INSERT INTO cliente (id_cliente)
                 VALUES ($1)`,
                [id_usuario]
            );
        }

        /* ======================================================
           3. Actualizar estado de solicitud
           ====================================================== */

        await client.query(
            `UPDATE solicitud_rol
             SET estado='aprobada',
                 decidido_por_admin=$1,
                 fecha_decision=NOW()
             WHERE id_solicitud=$2`,
            [adminId, id_solicitud]
        );

        await client.query('COMMIT');

        /* ======================================================
           4. Info para correo
           ====================================================== */

        const u = await pool.query(
            `SELECT usuario, correo FROM usuario WHERE id_persona=$1`,
            [id_usuario]
        );
        const e = await pool.query(
            `SELECT nombre FROM espacio_deportivo WHERE id_espacio=$1`,
            [id_espacio]
        );

        return {
            to: u.rows[0]?.correo,
            usuario: u.rows[0]?.usuario,
            espacio: e.rows[0]?.nombre
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};


/**
 * Rechazar solicitud
 */
const rechazarSolicitud = async ({ id_solicitud, comentario, adminId }) => {
    const q = `
    UPDATE solicitud_rol
    SET estado='rechazada',
        comentario_decision=$1,
        decidido_por_admin=$2,
        fecha_decision=NOW()
    WHERE id_solicitud=$3 AND estado='pendiente'
    RETURNING *
  `;
    const { rows } = await pool.query(q, [comentario, adminId, id_solicitud]);
    if (!rows.length) throw new Error('Solicitud no encontrada o ya procesada');

    const sol = rows[0];

    const u = await pool.query(
        `SELECT usuario, correo FROM usuario WHERE id_persona=$1`,
        [sol.id_usuario]
    );
    const e = await pool.query(
        `SELECT nombre FROM espacio_deportivo WHERE id_espacio=$1`,
        [sol.id_espacio]
    );

    return {
        to: u.rows[0]?.correo,
        usuario: u.rows[0]?.usuario,
        espacio: e.rows[0]?.nombre,
        comentario
    };
};

/**
 * Obtener solicitudes por estado
 */
const listarSolicitudes = async ({ estado, limite, offset }) => {
    const q = `
    SELECT s.*, 
           u.usuario AS usuario_nombre,
           u.correo,
           e.nombre AS espacio_nombre
    FROM solicitud_rol s
    JOIN usuario u ON u.id_persona = s.id_usuario
    JOIN espacio_deportivo e ON e.id_espacio = s.id_espacio
    WHERE s.rol_destino='encargado' AND s.estado=$1
    ORDER BY s.fecha_solicitud DESC
    LIMIT $2 OFFSET $3
  `;
    const { rows } = await pool.query(q, [estado, limite, offset]);
    return rows;
};

/**
 * Buscar solicitudes
 */
const buscarSolicitudes = async ({ q, limite, offset }) => {
    const like = `%${q}%`;
    const sql = `
    SELECT s.*,
           u.usuario AS usuario_nombre,
           u.correo,
           e.nombre AS espacio_nombre
    FROM solicitud_rol s
    JOIN usuario u ON u.id_persona = s.id_usuario
    JOIN espacio_deportivo e ON e.id_espacio = s.id_espacio
    WHERE s.rol_destino='encargado'
      AND (u.usuario ILIKE $1
        OR u.correo ILIKE $1
        OR e.nombre ILIKE $1
        OR s.estado ILIKE $1
        OR CAST(s.id_solicitud AS TEXT) ILIKE $1)
    ORDER BY s.fecha_solicitud DESC
    LIMIT $2 OFFSET $3
  `;
    const { rows } = await pool.query(sql, [like, limite, offset]);
    return rows;
};

/**
 * Detalle individual
 */
const obtenerDetalle = async (id) => {
    const q = `
    SELECT s.*,
           u.usuario AS usuario_nombre,
           u.correo,
           e.nombre AS espacio_nombre
    FROM solicitud_rol s
    JOIN usuario u ON u.id_persona = s.id_usuario
    JOIN espacio_deportivo e ON e.id_espacio = s.id_espacio
    WHERE s.id_solicitud=$1
  `;
    const r = await pool.query(q, [id]);
    return r.rows[0] || null;
};

/**
 * Datos paginados (general)
 */
const obtenerDatosSolicitudesEncargado = async (limite = 10, offset = 0) => {
    const q = `
    SELECT 
      s.*,
      u.usuario AS usuario_nombre,
      u.correo,
      e.nombre AS espacio_nombre
    FROM solicitud_rol s
    JOIN usuario u ON u.id_persona = s.id_usuario
    JOIN espacio_deportivo e ON e.id_espacio = s.id_espacio
    WHERE s.rol_destino='encargado'
    ORDER BY s.fecha_solicitud DESC
    LIMIT $1 OFFSET $2
  `;

    const qt = `
    SELECT COUNT(*) 
    FROM solicitud_rol 
    WHERE rol_destino='encargado'
  `;

    const [r1, r2] = await Promise.all([
        pool.query(q, [limite, offset]),
        pool.query(qt)
    ]);

    return {
        solicitudes: r1.rows,
        total: Number(r2.rows[0].count)
    };
};

/**
 * Filtrar por estado con paginación
 */
const filtrarSolicitudesEncargado = async (estado, limite, offset) => {
    const q = `
    SELECT 
      s.*,
      u.usuario AS usuario_nombre,
      u.correo,
      e.nombre AS espacio_nombre
    FROM solicitud_rol s
    JOIN usuario u ON u.id_persona = s.id_usuario
    JOIN espacio_deportivo e ON e.id_espacio = s.id_espacio
    WHERE s.rol_destino='encargado' AND s.estado=$1
    ORDER BY s.fecha_solicitud DESC
    LIMIT $2 OFFSET $3
  `;

    const qt = `
    SELECT COUNT(*)
    FROM solicitud_rol 
    WHERE rol_destino='encargado' AND estado=$1
  `;

    const [r1, r2] = await Promise.all([
        pool.query(q, [estado, limite, offset]),
        pool.query(qt, [estado])
    ]);

    return {
        solicitudes: r1.rows,
        total: Number(r2.rows[0].count)
    };
};

/* ============================================================
   ======================== CONTROLADORES ======================
   ============================================================ */

/**
 * Crear solicitud
 */
const crearSolicitudController = async (req, res) => {
    try {
        const id_usuario = req.user.id_persona;
        const { id_espacio, motivo } = req.body;

        if (!id_espacio)
            return res.status(400).json(respuesta(false, 'Debe seleccionar un espacio'));

        const sol = await crearSolicitudEncargado({
            id_usuario,
            id_espacio,
            motivo
        });

        // enviar correo a administradores
        try {
            await notifyAdminNuevaSolicitudRol({
                id_solicitud: sol.id_solicitud,
                id_usuario,
                rol: 'encargado'
            });
        } catch { }

        res.json(respuesta(true, 'Solicitud enviada correctamente', sol));

    } catch (e) {
        res.status(400).json(respuesta(false, e.message));
    }
};

/**
 * Aprobar
 */
const aprobarSolicitudController = async (req, res) => {
    try {
        const id_solicitud = Number(req.params.id);
        const adminId = req.user.id_persona;

        const out = await aprobarSolicitud({ id_solicitud, adminId });

        // enviar correo
        try {
            await notifyUsuarioResultadoRol({
                to: out.to,
                aprobado: true,
                rol: `encargado de ${out.espacio}`
            });
        } catch { }

        res.json(respuesta(true, 'Solicitud aprobada correctamente'));

    } catch (e) {
        res.status(400).json(respuesta(false, e.message));
    }
};

/**
 * Rechazar
 */
const rechazarSolicitudController = async (req, res) => {
    try {
        const { comentario } = req.body;
        const id_solicitud = Number(req.params.id);
        const adminId = req.user.id_persona;

        const out = await rechazarSolicitud({
            id_solicitud,
            comentario,
            adminId
        });

        try {
            await notifyUsuarioResultadoRol({
                to: out.to,
                aprobado: false,
                rol: `encargado de ${out.espacio}`,
                comentario: out.comentario
            });
        } catch { }

        res.json(respuesta(true, 'Solicitud rechazada correctamente'));

    } catch (e) {
        res.status(400).json(respuesta(false, e.message));
    }
};

/**
 * Listar solicitudes por estado
 */
const listarController = async (req, res) => {
    try {
        const estado = req.query.estado || 'pendiente';
        const limit = Number(req.query.limit || 10);
        const offset = Number(req.query.offset || 0);

        const rows = await listarSolicitudes({ estado, limite: limit, offset });

        res.json(respuesta(true, 'Solicitudes obtenidas', {
            solicitudes: rows,
            paginacion: { limite: limit, offset }
        }));
    } catch {
        res.status(500).json(respuesta(false, 'Error interno'));
    }
};

/**
 * Buscar
 */
const buscarController = async (req, res) => {
    try {
        const q = req.query.q || '';
        const limit = Number(req.query.limit || 10);
        const offset = Number(req.query.offset || 0);

        const rows = await buscarSolicitudes({ q, limite: limit, offset });
        res.json(respuesta(true, 'Resultados', {
            solicitudes: rows,
            paginacion: { limit, offset }
        }));
    } catch {
        res.status(500).json(respuesta(false, 'Error interno'));
    }
};

/**
 * Detalle individual
 */
const obtenerDetalleController = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const sol = await obtenerDetalle(id);

        if (!sol) return res.status(404).json(respuesta(false, 'Solicitud no encontrada'));

        res.json(respuesta(true, 'Solicitud obtenida', { solicitud: sol }));
    } catch {
        res.status(500).json(respuesta(false, 'Error interno'));
    }
};

const datosGeneralesController = async (req, res) => {
    try {
        const limite = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        const { solicitudes, total } = await obtenerDatosSolicitudesEncargado(limite, offset);

        res.json(respuesta(true, 'Solicitudes obtenidas', {
            solicitudes,
            paginacion: { limite, offset, total }
        }));

    } catch (e) {
        res.status(500).json(respuesta(false, e.message));
    }
};


const filtrarController = async (req, res) => {
    try {
        const estado = String(req.query.estado || '').toLowerCase();
        const limite = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        const { solicitudes, total } = await filtrarSolicitudesEncargado(estado, limite, offset);

        res.json(respuesta(true, 'Solicitudes filtradas', {
            solicitudes,
            paginacion: { limite, offset, total }
        }));

    } catch (e) {
        res.status(400).json(respuesta(false, e.message));
    }
};


/* ============================================================
   ============================ RUTAS ==========================
   ============================================================ */

router.post('/', verifyToken, crearSolicitudController);

router.get('/', verifyToken, checkRole(['ADMINISTRADOR']), listarController);
router.get('/buscar', verifyToken, checkRole(['ADMINISTRADOR']), buscarController);
router.get('/dato-individual/:id', verifyToken, checkRole(['ADMINISTRADOR']), obtenerDetalleController);

router.get('/datos-especificos', verifyToken, checkRole(['ADMINISTRADOR']), datosGeneralesController);

router.get('/filtro', verifyToken, checkRole(['ADMINISTRADOR']), filtrarController);

router.post('/:id/aprobar', verifyToken, checkRole(['ADMINISTRADOR']), aprobarSolicitudController);
router.post('/:id/rechazar', verifyToken, checkRole(['ADMINISTRADOR']), rechazarSolicitudController);

module.exports = router;
