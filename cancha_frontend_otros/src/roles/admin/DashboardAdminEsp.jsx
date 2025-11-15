import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";

const DashboardAdminEsp = ({ idAdminEspDep }) => {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get("/dashboard-admin", { params: { id_admin_esp_dep: idAdminEspDep } });
      if (res.data?.exito) setData(res.data.datos);
    } catch (e) {
      console.error("Error al cargar dashboard", e);
    }
  };

  useEffect(() => {
    if (idAdminEspDep) fetchData();
  }, [idAdminEspDep]);

  if (!data) return <p>Cargando métricas...</p>;

  return (
    <div className="mb-10">
      {/* === CARDS === */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card title="Reservas activas" value={data.reservas_activas} icon="📅" />
        <Card title="Ingresos (Bs)" value={data.ingresos_mes.toFixed(2)} icon="💰" />
        <Card title="Canchas disponibles" value={`${data.canchas_disponibles}/${data.total_canchas}`} icon="🏟️" />
        <Card
          title="Promedio ⭐"
          value={`${data.promedio_estrellas.toFixed(1)} (${data.total_resenas})`}
          icon="⭐"
        />
        <Card title="Canceladas (%)" value={`${data.porcentaje_canceladas}%`} icon="❌" />
        <Card title="Clientes del mes" value={data.clientes_mes} icon="👥" />
      </div>

      {/* === GRÁFICOS ORGANIZADOS === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="flex flex-col gap-6">
          {/* Fila 1 */}
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="font-semibold mb-2 text-gray-700">Reservas por día (últimos 30 días)</h3>
            <Line
              data={{
                labels: data.chart_reservas_dia.map((d) => d.dia),
                datasets: [
                  {
                    label: "Reservas",
                    data: data.chart_reservas_dia.map((d) => d.total),
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59,130,246,0.1)",
                    tension: 0.3,
                    fill: true,
                  },
                ],
              }}
              height={150}
            />
          </div>

          {/* Fila 2 */}
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="font-semibold mb-2 text-gray-700">Canchas más reservadas</h3>
            <Bar
              data={{
                labels: data.chart_canchas.map((c) => c.cancha),
                datasets: [
                  {
                    label: "Reservas",
                    data: data.chart_canchas.map((c) => c.total),
                    backgroundColor: "#10b981",
                  },
                ],
              }}
              height={150}
            />
          </div>
        </div>

        {/* Columna derecha */}
        <div className="bg-gray-50 p-4 rounded shadow">
          <h3 className="font-semibold mb-2 text-gray-700">Estados de las Reservas</h3>
          <Pie
            data={{
              labels: data.chart_estados.map((e) => e.estado),
              datasets: [
                {
                  data: data.chart_estados.map((e) => e.total),
                  backgroundColor: ["#f59e0b", "#16a34a", "#3b82f6", "#6b7280"],
                },
              ],
            }}
            height={150}
          />
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon }) => (
  <div className="bg-white border rounded-lg shadow p-4 flex flex-col items-center justify-center">
    <div className="text-2xl">{icon}</div>
    <div className="text-gray-500 text-sm mt-1">{title}</div>
    <div className="text-xl font-semibold mt-1">{value}</div>
  </div>
);

export default DashboardAdminEsp;
