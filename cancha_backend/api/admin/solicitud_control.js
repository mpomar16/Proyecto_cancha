/**
 * Rutas para gestionar solicitudes del rol CONTROL
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
 * Validar duplicados:
 * - usuario ya está en control
 * - existe solicitud pendiente
 * - existe solicitud aprobada previa
 */
const validarDuplicado = async (id_usuario) => {

    const chk1 = await pool.query(
        `SELECT 1 FROM control WHERE id_control = $1`,
        [id_usuario]
    );
    if (chk1.rowCount > 0) {
        throw new Error('Ya eres parte del rol control');
    }

    const chk2 = await pool.query(
        `SELECT 1 FROM solicitud_rol
         WHERE id_usuario=$1 AND rol_destino='control'
         AND estado='pendiente'`,
        [id_usuario]
    );
    if (chk2.rowCount > 0) {
        throw new Error('Ya existe una solicitud pendiente');
    }

    const chk3 = await pool.query(
        `SELECT 1 FROM solicitud_rol
         WHERE id_usuario=$1 AND rol_destino='control'
         AND estado='aprobada'`,
        [id_usuario]
    );
    if (chk3.rowCount > 0) {
        throw new Error('Ya existe una solicitud aprobada anteriormente');
    }
};

/**
 * Crear solicitud
 */
const crearSolicitudControl = async ({ id_usuario, motivo, id_espacio }) => {
    await validarDuplicado(id_usuario);

    const q = `
        INSERT INTO solicitud_rol(id_usuario, rol_destino, motivo, id_espacio)
        VALUES ($1, 'control', $2, $3)
        RETURNING *
    `;
    const r = await pool.query(q, [id_usuario, motivo, id_espacio]);
    return r.rows[0];
};


/**
 * Aprobar solicitud para rol CONTROL
 */
const aprobarSolicitud = async ({ id_solicitud, adminId }) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Obtener solicitud
        const solR = await client.query(
            `SELECT * FROM solicitud_rol WHERE id_solicitud=$1 FOR UPDATE`,
            [id_solicitud]
        );
        if (!solR.rowCount) throw new Error('Solicitud no encontrada');

        const sol = solR.rows[0];
        if (sol.estado !== 'pendiente')
            throw new Error('La solicitud ya fue procesada');

        const id_usuario = sol.id_usuario;

        /* ======================================================
           1. Asignar rol CONTROL (tabla control)
           ====================================================== */

        await client.query(
            `INSERT INTO control (id_control, fecha_asignacion, estado, id_espacio)
             VALUES ($1, CURRENT_DATE, true, $2)`,
            [id_usuario, sol.id_espacio]
        );

        /* ======================================================
           2. Convertirlo también en CLIENTE si no existe
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
           3. Actualizar estado de la solicitud
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

        const u = await pool.query(
            `SELECT usuario, correo FROM usuario WHERE id_persona=$1`,
            [id_usuario]
        );

        return {
            to: u.rows[0]?.correo,
            usuario: u.rows[0]?.usuario
        };

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
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
    const r = await pool.query(q, [comentario, adminId, id_solicitud]);
    if (!r.rows.length) throw new Error('Solicitud no encontrada o ya procesada');

    const sol = r.rows[0];

    const u = await pool.query(
        `SELECT usuario, correo FROM usuario WHERE id_persona=$1`,
        [sol.id_usuario]
    );

    return {
        to: u.rows[0]?.correo,
        usuario: u.rows[0]?.usuario,
        comentario
    };
};

/**
 * Lista general paginada
 */
const obtenerDatosControl = async (limite, offset) => {
    const q = `
        SELECT s.*,
       u.usuario AS usuario_nombre,
       u.correo,
       e.nombre AS espacio_nombre
FROM solicitud_rol s
JOIN usuario u ON u.id_persona = s.id_usuario
LEFT JOIN espacio_deportivo e ON e.id_espacio = s.id_espacio
WHERE s.rol_destino='control'
ORDER BY s.fecha_solicitud DESC
LIMIT $1 OFFSET $2

    `;

    const qt = `
        SELECT COUNT(*) FROM solicitud_rol WHERE rol_destino='control'
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
 * Filtrar por estado
 */
const filtrarControl = async (estado, limite, offset) => {
    const q = `
        SELECT s.*,
       u.usuario AS usuario_nombre,
       u.correo,
       e.nombre AS espacio_nombre
FROM solicitud_rol s
JOIN usuario u ON u.id_persona = s.id_usuario
LEFT JOIN espacio_deportivo e ON e.id_espacio = s.id_espacio
WHERE s.rol_destino='control' AND s.estado=$1
ORDER BY s.fecha_solicitud DESC
LIMIT $2 OFFSET $3

    `;

    const qt = `
        SELECT COUNT(*) 
        FROM solicitud_rol 
        WHERE rol_destino='control' AND estado=$1
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

/**
 * Buscar datos
 */
const buscarControl = async ({ q, limite, offset }) => {
    const like = `%${q}%`;

    const dataQuery = `
        SELECT s.*,
               u.usuario AS usuario_nombre,
               u.correo,
               e.nombre AS espacio_nombre
        FROM solicitud_rol s
        JOIN usuario u ON u.id_persona = s.id_usuario
        LEFT JOIN espacio_deportivo e ON e.id_espacio = s.id_espacio
        WHERE s.rol_destino = 'control'
          AND (
               u.usuario ILIKE $1 OR
               u.correo ILIKE $1 OR
               e.nombre ILIKE $1 OR
               s.estado ILIKE $1 OR
               CAST(s.id_solicitud AS TEXT) ILIKE $1
          )
        ORDER BY s.fecha_solicitud DESC
        LIMIT $2 OFFSET $3
    `;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM solicitud_rol s
        JOIN usuario u ON u.id_persona = s.id_usuario
        LEFT JOIN espacio_deportivo e ON e.id_espacio = s.id_espacio
        WHERE s.rol_destino = 'control'
          AND (
               u.usuario ILIKE $1 OR
               u.correo ILIKE $1 OR
               e.nombre ILIKE $1 OR
               s.estado ILIKE $1 OR
               CAST(s.id_solicitud AS TEXT) ILIKE $1
          )
    `;

    const [rowsResult, countResult] = await Promise.all([
        pool.query(dataQuery, [like, limite, offset]),
        pool.query(countQuery, [like])
    ]);

    return {
        solicitudes: rowsResult.rows,
        total: Number(countResult.rows[0].total)
    };
};


/**
 * Obtener detalle individual
 */
const obtenerDetalle = async (id) => {
    const q = `
        SELECT s.*,
       u.usuario AS usuario_nombre,
       u.correo,
       e.nombre AS espacio_nombre
FROM solicitud_rol s
JOIN usuario u ON u.id_persona = s.id_usuario
LEFT JOIN espacio_deportivo e ON e.id_espacio = s.id_espacio
WHERE s.id_solicitud=$1

    `;
    const r = await pool.query(q, [id]);
    return r.rows[0] || null;
};

/* ============================================================
   ======================== CONTROLADORES ======================
   ============================================================ */

const crearSolicitudController = async (req, res) => {
    try {
        const id_usuario = req.user.id_persona;

        const { motivo, id_espacio } = req.body;

        const sol = await crearSolicitudControl({
            id_usuario,
            motivo,
            id_espacio
        });


        try {
            await notifyAdminNuevaSolicitudRol({
                id_solicitud: sol.id_solicitud,
                id_usuario,
                rol: 'control'
            });
        } catch { }

        res.json(respuesta(true, "Solicitud creada", sol));
    } catch (e) {
        res.status(400).json(respuesta(false, e.message));
    }
};

const aprobarController = async (req, res) => {
    try {
        const id_solicitud = Number(req.params.id);
        const adminId = req.user.id_persona;

        const out = await aprobarSolicitud({ id_solicitud, adminId });

        try {
            await notifyUsuarioResultadoRol({
                to: out.to,
                aprobado: true,
                rol: 'control'
            });
        } catch { }

        res.json(respuesta(true, "Solicitud aprobada"));
    } catch (e) {
        res.status(400).json(respuesta(false, e.message));
    }
};

const rechazarController = async (req, res) => {
    try {
        const id_solicitud = Number(req.params.id);
        const { comentario } = req.body;
        const adminId = req.user.id_persona;

        const out = await rechazarSolicitud({ id_solicitud, comentario, adminId });

        try {
            await notifyUsuarioResultadoRol({
                to: out.to,
                aprobado: false,
                comentario: out.comentario,
                rol: 'control'
            });
        } catch { }

        res.json(respuesta(true, "Solicitud rechazada"));
    } catch (e) {
        res.status(400).json(respuesta(false, e.message));
    }
};

const listarController = async (req, res) => {
    try {
        const estado = req.query.estado || 'pendiente';
        const limit = Number(req.query.limit || 10);
        const offset = Number(req.query.offset || 0);

        const rows = await filtrarControl(estado, limit, offset);

        res.json(respuesta(true, "Solicitudes obtenidas", rows));
    } catch {
        res.status(500).json(respuesta(false, "Error interno"));
    }
};

const buscarController = async (req, res) => {
    try {
        const q = req.query.q || '';
        const limit = Number(req.query.limit || 10);
        const offset = Number(req.query.offset || 0);

        const out = await buscarControl({ q, limite: limit, offset });

        res.json(respuesta(true, "Resultados", {
            solicitudes: out.solicitudes,
            paginacion: {
                total: out.total,
                limite: limit,
                offset
            }
        }));
    } catch (e) {
        res.status(500).json(respuesta(false, "Error interno"));
    }
};


const detalleController = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const sol = await obtenerDetalle(id);

        if (!sol) return res.status(404).json(respuesta(false, "No encontrado"));

        res.json(respuesta(true, "OK", { solicitud: sol }));
    } catch {
        res.status(500).json(respuesta(false, "Error interno"));
    }
};

const datosGeneralesController = async (req, res) => {
    try {
        const limit = Number(req.query.limit || 10);
        const offset = Number(req.query.offset || 0);

        const out = await obtenerDatosControl(limit, offset);

        res.json(respuesta(true, "Solicitudes obtenidas", {
            solicitudes: out.solicitudes,
            paginacion: {
                total: out.total,
                limite: limit,
                offset
            }
        }));

    } catch (e) {
        res.status(500).json(respuesta(false, e.message));
    }
};

const filtrarController = async (req, res) => {
    try {
        const estado = String(req.query.estado || '').toLowerCase();
        const limit = Number(req.query.limit || 10);
        const offset = Number(req.query.offset || 0);

        const out = await filtrarControl(estado, limit, offset);

        res.json(respuesta(true, "Solicitudes filtradas", {
            solicitudes: out.solicitudes,
            paginacion: {
                total: out.total,
                limite: limit,
                offset
            }
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

router.get('/dato-individual/:id', verifyToken, checkRole(['ADMINISTRADOR']), detalleController);

router.get('/datos-especificos', verifyToken, checkRole(['ADMINISTRADOR']), datosGeneralesController);

router.get('/filtro', verifyToken, checkRole(['ADMINISTRADOR']), filtrarController);

router.post('/:id/aprobar', verifyToken, checkRole(['ADMINISTRADOR']), aprobarController);
router.post('/:id/rechazar', verifyToken, checkRole(['ADMINISTRADOR']), rechazarController);

module.exports = router;