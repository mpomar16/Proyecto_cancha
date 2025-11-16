/**
 * Rutas para gestionar solicitudes de rol (control / encargado)
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

// ============================
// ROLES PERMITIDOS
// ============================
const rolesPermitidos = ['control', 'encargado'];

const mapRolToTable = {
    control: {
        table: 'control',
        pk: 'id_control',
        insert: `
      INSERT INTO control(id_control, fecha_asignacion, estado)
      VALUES ($1, CURRENT_DATE, true)
    `
    },
    encargado: {
        table: 'encargado',
        pk: 'id_encargado',
        insert: `
      INSERT INTO encargado(
        id_encargado, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado
      )
      VALUES ($1, NULL, CURRENT_DATE, NULL, NULL, true)
    `
    }
};

// ============================
// VALIDACIONES
// ============================
async function validarDuplicado(id_usuario, rol) {
    const cfg = mapRolToTable[rol];

    // ya tiene el rol
    const existingRol = await pool.query(
        `SELECT 1 FROM ${cfg.table} WHERE ${cfg.pk}=$1`,
        [id_usuario]
    );
    if (existingRol.rowCount > 0) throw new Error("El usuario ya posee este rol");

    // solicitud pendiente
    const pending = await pool.query(
        `SELECT 1 FROM solicitud_rol
     WHERE id_usuario=$1 AND rol_destino=$2 AND estado='pendiente'`,
        [id_usuario, rol]
    );
    if (pending.rowCount > 0) throw new Error("Ya existe una solicitud pendiente");

    // solicitud aprobada anteriormente
    const approved = await pool.query(
        `SELECT 1 FROM solicitud_rol
     WHERE id_usuario=$1 AND rol_destino=$2 AND estado='aprobada'`,
        [id_usuario, rol]
    );
    if (approved.rowCount > 0) throw new Error("La solicitud ya fue aprobada anteriormente");
}

// ============================
// CREAR SOLICITUD
// ============================
async function crearSolicitudRol({ id_usuario, rol_destino, motivo }) {
    const rol = rol_destino.toLowerCase();
    if (!rolesPermitidos.includes(rol)) throw new Error("Rol invalido");

    await validarDuplicado(id_usuario, rol);

    const q = `
    INSERT INTO solicitud_rol(id_usuario, rol_destino, motivo)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
    const { rows } = await pool.query(q, [id_usuario, rol, motivo]);
    return rows[0];
}

// ============================
// APROBAR SOLICITUD
// ============================
async function aprobarSolicitud({ id_solicitud, adminId }) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // bloquear solicitud
        const solRes = await client.query(
            `SELECT * FROM solicitud_rol WHERE id_solicitud=$1 FOR UPDATE`,
            [id_solicitud]
        );
        if (!solRes.rowCount) throw new Error("Solicitud no encontrada");

        const sol = solRes.rows[0];
        if (sol.estado !== 'pendiente') throw new Error("Solicitud ya procesada");

        const rol = sol.rol_destino;
        const cfg = mapRolToTable[rol];

        // verificar si ya tiene el rol
        const exists = await client.query(
            `SELECT 1 FROM ${cfg.table} WHERE ${cfg.pk}=$1`,
            [sol.id_usuario]
        );

        // si no tiene, crear registro del rol
        if (!exists.rowCount) {
            await client.query(cfg.insert, [sol.id_usuario]);
        }

        // actualizar solicitud
        await client.query(
            `UPDATE solicitud_rol
       SET estado='aprobada',
           decidido_por_admin=$1,
           fecha_decision=NOW()
       WHERE id_solicitud=$2`,
            [adminId, id_solicitud]
        );

        await client.query("COMMIT");

        // datos de usuario para correo
        const u = await pool.query(
            `SELECT usuario, correo FROM usuario WHERE id_persona=$1`,
            [sol.id_usuario]
        );

        return {
            to: u.rows[0]?.correo,
            usuario: u.rows[0]?.usuario,
            rol
        };

    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}

// ============================
// RUTAS
// ============================

// Crear solicitud
router.post('/', verifyToken, async (req, res) => {
    try {
        const id_usuario = req.user.id_persona;
        const { rol, motivo } = req.body;

        const sol = await crearSolicitudRol({
            id_usuario,
            rol_destino: rol,
            motivo
        });

        // enviar correo a admins
        try {
            await notifyAdminNuevaSolicitudRol({
                id_usuario,
                id_solicitud: sol.id_solicitud,
                rol
            });

        } catch { }

        res.json(respuesta(true, "Solicitud enviada correctamente", sol));

    } catch (e) {
        res.status(400).json(respuesta(false, e.message));
    }
});

// Aprobar solicitud
router.post('/:id/aprobar', verifyToken, checkRole(['ADMINISTRADOR']), async (req, res) => {
    try {
        const id_solicitud = Number(req.params.id);
        const adminId = req.user.id_persona;

        const out = await aprobarSolicitud({ id_solicitud, adminId });

        // correo al usuario
        try {
            await notifyUsuarioResultadoRol({
                to: out.to,
                aprobado: true,
                rol: out.rol
            });
        } catch { }

        res.json(respuesta(true, "Solicitud aprobada"));
    } catch (e) {
        res.status(400).json(respuesta(false, e.message));
    }
});

// Rechazar solicitud
router.post('/:id/rechazar', verifyToken, checkRole(['ADMINISTRADOR']), async (req, res) => {
    try {
        const id_solicitud = Number(req.params.id);
        const adminId = req.user.id_persona;
        const comentario = req.body.comentario || null;

        const upd = `
      UPDATE solicitud_rol
      SET estado='rechazada',
          comentario_decision=$1,
          decidido_por_admin=$2,
          fecha_decision=NOW()
      WHERE id_solicitud=$3 AND estado='pendiente'
      RETURNING *
    `;
        const r = await pool.query(upd, [comentario, adminId, id_solicitud]);
        if (!r.rowCount) throw new Error("Solicitud no encontrada");

        // enviar correo al usuario
        try {
            await notifyUsuarioResultadoRol({
                to: r.rows[0].correo,
                aprobado: false,
                rol: r.rows[0].rol_destino,
                comentario
            });
        } catch { }

        res.json(respuesta(true, "Solicitud rechazada"));

    } catch (e) {
        res.status(400).json(respuesta(false, e.message));
    }
});

module.exports = router;
