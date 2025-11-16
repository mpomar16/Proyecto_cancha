const express = require("express");
const pool = require("../../../config/database");

const router = express.Router();

const respuesta = (exito, mensaje, datos = null) => ({
  exito,
  mensaje,
  datos
});

const sanitizeLike = (text) => {
  if (!text) return "%";
  return `%${text.replace(/[%_\\]/g, "\\$&")}%`;
};

const misReservasDeportistaController = async (req, res) => {
  try {
    const idPersonaRaw = req.query.id_persona;
    const idPersona = idPersonaRaw ? parseInt(idPersonaRaw, 10) : null;
    const q = req.query.q ? String(req.query.q) : "";
    const tipo = req.query.tipo ? String(req.query.tipo) : "default";
    const limite = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;

    if (!idPersona || Number.isNaN(idPersona)) {
      return res
        .status(400)
        .json(respuesta(false, "id_persona no valido o no proporcionado"));
    }

    let orderBy = "r.fecha_reserva DESC";
    if (tipo === "monto") {
      orderBy = "r.monto_total DESC";
    } else if (tipo === "estado") {
      orderBy = "r.estado ASC";
    } else if (tipo === "fecha") {
      orderBy = "r.fecha_reserva DESC";
    }

    const paramsDatos = [idPersona];
    const paramsTotal = [idPersona];

    let whereClause = "rd.id_persona = $1 AND rd.estado = 'activo'";
    let idx = 2;

    if (q && q.trim() !== "") {
      const termino = sanitizeLike(q.trim());
      whereClause += ` AND (c.nombre ILIKE $${idx} OR r.estado ILIKE $${idx})`;
      paramsDatos.push(termino);
      paramsTotal.push(termino);
      idx += 1;
    }

    paramsDatos.push(limite);
    paramsDatos.push(offset);

    const queryDatos = `
      SELECT
        rd.id_reserva_deportista,
        rd.fecha_union,
        rd.estado AS estado_participante,
        r.id_reserva,
        r.fecha_reserva,
        MIN(rh.hora_inicio) AS hora_inicio,
        MAX(rh.hora_fin) AS hora_fin,
        r.monto_total,
        r.estado AS reserva_estado,
        c.id_cancha,
        c.nombre AS cancha_nombre,
        cli.id_cliente,
        u.nombre AS cliente_nombre,
        u.apellido AS cliente_apellido
      FROM reserva_deportista rd
      JOIN reserva r ON rd.id_reserva = r.id_reserva
      JOIN reserva_horario rh ON rh.id_reserva = r.id_reserva
      JOIN cancha c ON r.id_cancha = c.id_cancha
      JOIN cliente cli ON r.id_cliente = cli.id_cliente
      JOIN usuario u ON cli.id_cliente = u.id_persona
      WHERE ${whereClause}
      GROUP BY
        rd.id_reserva_deportista,
        rd.fecha_union,
        rd.estado,
        r.id_reserva,
        r.fecha_reserva,
        r.monto_total,
        r.estado,
        c.id_cancha,
        c.nombre,
        cli.id_cliente,
        u.nombre,
        u.apellido
      ORDER BY ${orderBy}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;

    const queryTotal = `
      SELECT COUNT(*) AS total
      FROM reserva_deportista rd
      JOIN reserva r ON rd.id_reserva = r.id_reserva
      JOIN reserva_horario rh ON rh.id_reserva = r.id_reserva
      JOIN cancha c ON r.id_cancha = c.id_cancha
      JOIN cliente cli ON r.id_cliente = cli.id_cliente
      JOIN usuario u ON cli.id_cliente = u.id_persona
      WHERE ${whereClause}
    `;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, paramsDatos),
      pool.query(queryTotal, paramsTotal)
    ]);

    const reservas = resultDatos.rows.map((row) => ({
      id_reserva_deportista: row.id_reserva_deportista,
      fecha_union: row.fecha_union,
      estado_participante: row.estado_participante,
      id_reserva: row.id_reserva,
      fecha_reserva: row.fecha_reserva,
      hora_inicio: row.hora_inicio,
      hora_fin: row.hora_fin,
      monto_total: row.monto_total,
      estado: row.reserva_estado,
      id_cancha: row.id_cancha,
      cancha_nombre: row.cancha_nombre,
      id_cliente: row.id_cliente,
      cliente_nombre: row.cliente_nombre,
      cliente_apellido: row.cliente_apellido,
      tipo_reserva: "DEPORTISTA"
    }));

    const total = parseInt(resultTotal.rows[0]?.total || "0", 10);

    return res.json(
      respuesta(true, "Reservas como deportista obtenidas correctamente", {
        reservas,
        paginacion: {
          limite,
          offset,
          total
        }
      })
    );
  } catch (error) {
    console.error("Error en misReservasDeportistaController:", error.message);
    return res
      .status(500)
      .json(
        respuesta(
          false,
          error.message || "Error al obtener reservas como deportista"
        )
      );
  }
};

router.get("/mis-reservas", misReservasDeportistaController);

module.exports = router;
