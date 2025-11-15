const express = require('express');
const pool = require('../../../config/database');
const router = express.Router();

const respuesta = (exito, mensaje, datos = null) => ({ exito, mensaje, datos });

/**
 * Obtener métricas y gráficos para el Dashboard del ADMIN_ESP_DEP
 */
const obtenerDashboard = async (id_admin_esp_dep) => {
  try {
    const result = {};

    // 🔹 Total de reservas activas
    const q1 = await pool.query(`
  SELECT COUNT(*) AS total
  FROM reserva r
  JOIN cancha c ON r.id_cancha = c.id_cancha
  JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
  WHERE e.id_admin_esp_dep = $1
    AND r.estado IN ('pendiente', 'pagada', 'en_cuotas')
    AND r.fecha_reserva >= CURRENT_DATE
`, [id_admin_esp_dep]);

result.reservas_activas = parseInt(q1.rows[0].total || 0);


    // 🔹 Ingresos totales del mes
    const q2 = await pool.query(`
  SELECT 
    COALESCE(SUM(r.monto_total - COALESCE(r.saldo_pendiente, 0)), 0) AS total
  FROM reserva r
  JOIN cancha c ON r.id_cancha = c.id_cancha
  JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
  WHERE e.id_admin_esp_dep = $1
    AND (
      r.estado = 'pagada'
      OR COALESCE(r.saldo_pendiente, 0) > 0
    )
    AND DATE_PART('month', r.fecha_reserva) = DATE_PART('month', CURRENT_DATE)
    AND DATE_PART('year', r.fecha_reserva) = DATE_PART('year', CURRENT_DATE)
`, [id_admin_esp_dep]);

result.ingresos_mes = parseFloat(q2.rows[0].total || 0);


    // 🔹 Canchas disponibles vs total
    const q3 = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE c.estado='disponible') AS disponibles
      FROM cancha c
      JOIN espacio_deportivo e ON c.id_espacio=e.id_espacio
      WHERE e.id_admin_esp_dep=$1
    `, [id_admin_esp_dep]);
    result.total_canchas = parseInt(q3.rows[0].total || 0);
    result.canchas_disponibles = parseInt(q3.rows[0].disponibles || 0);

    // 🔹 Promedio de estrellas
// === Promedio y total de reseñas ===
const q4 = await pool.query(`
  SELECT 
    COALESCE(AVG(rn.estrellas), 0) AS promedio,
    COUNT(rn.id_resena) AS total
  FROM resena rn
  JOIN reserva r ON rn.id_reserva = r.id_reserva
  JOIN cancha c ON r.id_cancha = c.id_cancha
  JOIN espacio_deportivo e ON c.id_espacio = e.id_espacio
  WHERE e.id_admin_esp_dep = $1
    AND rn.estrellas IS NOT NULL
    AND rn.verificado = true
`, [id_admin_esp_dep]);

result.promedio_estrellas = parseFloat(q4.rows[0].promedio || 0);
result.total_resenas = parseInt(q4.rows[0].total || 0);


    // 🔹 Porcentaje de reservas canceladas
    const q5 = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE r.estado='cancelada')::float / NULLIF(COUNT(*),0)*100 AS porcentaje
      FROM reserva r
      JOIN cancha c ON r.id_cancha=c.id_cancha
      JOIN espacio_deportivo e ON c.id_espacio=e.id_espacio
      WHERE e.id_admin_esp_dep=$1
    `, [id_admin_esp_dep]);
    result.porcentaje_canceladas = parseFloat(q5.rows[0].porcentaje || 0).toFixed(2);

    // 🔹 Clientes únicos del mes
    const q6 = await pool.query(`
      SELECT COUNT(DISTINCT r.id_cliente) AS clientes_mes
      FROM reserva r
      JOIN cancha c ON r.id_cancha=c.id_cancha
      JOIN espacio_deportivo e ON c.id_espacio=e.id_espacio
      WHERE e.id_admin_esp_dep=$1
        AND DATE_PART('month', r.fecha_reserva)=DATE_PART('month', CURRENT_DATE)
    `, [id_admin_esp_dep]);
    result.clientes_mes = parseInt(q6.rows[0].clientes_mes || 0);

    // === GRÁFICOS ===

    // 📈 Reservas por día (últimos 30 días)
    const q7 = await pool.query(`
      SELECT TO_CHAR(r.fecha_reserva, 'DD Mon') AS dia, COUNT(*) AS total
      FROM reserva r
      JOIN cancha c ON r.id_cancha=c.id_cancha
      JOIN espacio_deportivo e ON c.id_espacio=e.id_espacio
      WHERE e.id_admin_esp_dep=$1
        AND r.fecha_reserva >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY dia
      ORDER BY MIN(r.fecha_reserva)
    `, [id_admin_esp_dep]);
    result.chart_reservas_dia = q7.rows;

    // 🏟️ Canchas más reservadas
    const q8 = await pool.query(`
      SELECT c.nombre AS cancha, COUNT(*) AS total
      FROM reserva r
      JOIN cancha c ON r.id_cancha=c.id_cancha
      JOIN espacio_deportivo e ON c.id_espacio=e.id_espacio
      WHERE e.id_admin_esp_dep=$1
      GROUP BY c.nombre
      ORDER BY total DESC
      LIMIT 6
    `, [id_admin_esp_dep]);
    result.chart_canchas = q8.rows;

    // 🥧 Estados de reserva
    const q9 = await pool.query(`
      SELECT r.estado, COUNT(*) AS total
      FROM reserva r
      JOIN cancha c ON r.id_cancha=c.id_cancha
      JOIN espacio_deportivo e ON c.id_espacio=e.id_espacio
      WHERE e.id_admin_esp_dep=$1
      GROUP BY r.estado
    `, [id_admin_esp_dep]);
    result.chart_estados = q9.rows;

    return result;
  } catch (e) {
    console.error('Error en obtenerDashboard:', e);
    throw e;
  }
};

// === Controller ===
const obtenerDashboardController = async (req, res) => {
  try {
    const id_admin_esp_dep = parseInt(req.query.id_admin_esp_dep);
    if (isNaN(id_admin_esp_dep)) {
      return res.status(400).json(respuesta(false, 'id_admin_esp_dep requerido y numérico'));
    }
    const data = await obtenerDashboard(id_admin_esp_dep);
    res.json(respuesta(true, 'Dashboard cargado', data));
  } catch (e) {
    res.status(500).json(respuesta(false, e.message));
  }
};

router.get('/', obtenerDashboardController);

module.exports = router;
