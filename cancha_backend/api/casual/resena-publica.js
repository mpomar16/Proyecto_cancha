const express = require('express');
const pool = require('../../config/database');

const router = express.Router();

const respuesta = (exito, mensaje, datos = null) => ({
  exito,
  mensaje,
  datos,
});

const obtenerResenasPorCancha = async (idCancha, limite = 20, offset = 0) => {
  try {
    const queryDatos = `
      SELECT
        s.id_resena,
        s.estrellas,
        s.comentario,
        s.fecha_creacion,
        s.verificado,
        c.id_cliente,
        u.nombre AS cliente_nombre,
        u.apellido AS cliente_apellido
      FROM resena s
      JOIN reserva r ON s.id_reserva = r.id_reserva
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN usuario u ON c.id_cliente = u.id_persona
      WHERE r.id_cancha = $1
        AND s.verificado = true
      ORDER BY s.fecha_creacion DESC
      LIMIT $2 OFFSET $3
    `;
    const queryTotal = `
      SELECT COUNT(*) AS total
      FROM resena s
      JOIN reserva r ON s.id_reserva = r.id_reserva
      WHERE r.id_cancha = $1
        AND s.verificado = true
    `;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [idCancha, limite, offset]),
      pool.query(queryTotal, [idCancha]),
    ]);
    return {
      resenas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].total, 10),
    };
  } catch (error) {
    console.log('Error en obtenerResenasPorCancha:', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const obtenerResenasPorCanchaController = async (req, res) => {
  try {
    const idCancha = parseInt(req.params.id_cancha, 10);
    const limite = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    if (!idCancha || Number.isNaN(idCancha)) {
      console.log('ID de cancha no valido:', req.params.id_cancha);
      return res
        .status(400)
        .json(respuesta(false, 'ID de cancha no valido o no proporcionado'));
    }

    const { resenas, total } = await obtenerResenasPorCancha(idCancha, limite, offset);

    return res.json(
      respuesta(true, 'Resenas obtenidas correctamente', {
        resenas,
        paginacion: {
          limite,
          offset,
          total,
        },
      }),
    );
  } catch (error) {
    console.log('Error en obtenerResenasPorCanchaController:', {
      error: error.message,
      stack: error.stack,
      params: req.params,
      query: req.query,
    });
    return res
      .status(500)
      .json(respuesta(false, error.message || 'Error al obtener resenas'));
  }
};

router.get('/por-cancha/:id_cancha', obtenerResenasPorCanchaController);

module.exports = router;
