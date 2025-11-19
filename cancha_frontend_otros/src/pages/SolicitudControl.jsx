/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import React, { useEffect, useState } from "react";
import api from "../services/api";

const permissionsConfig = {
  ADMINISTRADOR: { canView: true, canApprove: true, canReject: true },
  DEFAULT: { canView: false, canApprove: false, canReject: false }
};

const getEffectiveRole = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const bag = new Set();

    if (Array.isArray(u.roles)) {
      for (const r of u.roles) {
        if (typeof r === "string") bag.add(r);
        else if (r && typeof r === "object") {
          ["rol", "role", "nombre", "name"].forEach((k) => {
            if (r[k]) bag.add(r[k]);
          });
        }
      }
    }

    if (u.role) bag.add(u.role);
    if (u.rol) bag.add(u.rol);

    const norm = Array.from(bag).map((v) =>
      String(v || "").trim().toUpperCase().replace(/\s+/g, "_")
    );

    if (norm.includes("ADMINISTRADOR") || norm.includes("ADMIN")) {
      return "ADMINISTRADOR";
    }

    return "DEFAULT";
  } catch {
    return "DEFAULT";
  }
};

const SolicitudControl = () => {
  const basePath = "/solicitud-control";

  const [role, setRole] = useState(() => getEffectiveRole());
  const permissions = permissionsConfig[role] || permissionsConfig.DEFAULT;

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [estado, setEstado] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const [current, setCurrent] = useState(null);
  const [approveComment, setApproveComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");

  const fetchSolicitudes = async (params = {}) => {
    if (!permissions.canView) return;

    setLoading(true);
    const offset = (page - 1) * limit;
    const full = { ...params, limit, offset };

    try {
      let res;
      if (full.q)
        res = await api.get(`${basePath}/buscar`, { params: full });
      else if (full.estado)
        res = await api.get(`${basePath}/filtro`, { params: full });
      else
        res = await api.get(`${basePath}/datos-especificos`, { params: full });

      if (res.data?.exito) {
        setItems(res.data.datos.solicitudes || []);
        setTotal(res.data.datos.paginacion.total || 0);
      } else {
        setError(res.data?.mensaje || "Error al cargar solicitudes");
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes(estado ? { estado } : {});
  }, [page, role]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);

    if (searchTerm.trim()) fetchSolicitudes({ q: searchTerm });
    else fetchSolicitudes(estado ? { estado } : {});
  };

  const handleEstadoChange = (e) => {
    const value = e.target.value;
    setEstado(value);
    setPage(1);
    fetchSolicitudes(value ? { estado: value } : {});
  };

  const openView = async (id) => {
    try {
      const r = await api.get(`${basePath}/dato-individual/${id}`);
      if (r.data?.exito) {
        setCurrent(r.data.datos.solicitud);
        setViewOpen(true);
      }
    } catch {
      setError("No se pudo obtener el detalle");
    }
  };

  const closeView = () => {
    setViewOpen(false);
    setCurrent(null);
  };

  const openApprove = (row) => {
    setCurrent(row);
    setApproveComment("");
    setApproveOpen(true);
  };

  const closeApprove = () => {
    setApproveOpen(false);
    setApproveComment("");
    setCurrent(null);
  };

  const confirmApprove = async () => {
    try {
      const r = await api.post(`${basePath}/${current.id_solicitud}/aprobar`, {
        comentario_decision: approveComment || null
      });

      if (r.data?.exito) {
        setSuccess("Solicitud aprobada correctamente.");
        closeApprove();
        fetchSolicitudes(estado ? { estado } : {});
      } else {
        setError("No se pudo aprobar.");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  const openReject = (row) => {
    setCurrent(row);
    setRejectComment("");
    setRejectOpen(true);
  };

  const closeReject = () => {
    setRejectOpen(false);
    setRejectComment("");
    setCurrent(null);
  };

  const confirmReject = async () => {
    try {
      const r = await api.post(`${basePath}/${current.id_solicitud}/rechazar`, {
        comentario_decision: rejectComment || null
      });

      if (r.data?.exito) {
        setSuccess("Solicitud rechazada correctamente.");
        closeReject();
        fetchSolicitudes(estado ? { estado } : {});
      } else {
        setError("No se pudo rechazar");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  const canAct = (row) => row?.estado === "pendiente";

  if (!permissions.canView)
    return <p>No tienes permisos para ver solicitudes.</p>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Solicitudes de Control
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">
          {success}
        </div>
      )}

      {/* BUSCADOR */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 items-stretch">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex h-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por usuario, correo o espacio"
              className="border rounded-l px-4 py-2 w-full"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
            >
              Buscar
            </button>
          </form>
        </div>

        <select
          value={estado}
          onChange={handleEstadoChange}
          className="border rounded px-3 py-2"
        >
          <option value="">Sin filtro</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      {/* TABLA */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Usuario</th>
                  <th className="px-4 py-2 text-left">Correo</th>
                  <th className="px-4 py-2 text-left">Espacio</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {items.map((row, i) => (
                  <tr key={row.id_solicitud} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + i + 1}</td>
                    <td className="px-4 py-2">{row.id_solicitud}</td>
                    <td className="px-4 py-2">{row.usuario_nombre || "-"}</td>
                    <td className="px-4 py-2">{row.correo || "-"}</td>
                    <td className="px-4 py-2">{row.espacio_nombre || "-"}</td>
                    <td className="px-4 py-2 capitalize">{row.estado}</td>
                    <td className="px-4 py-2">
                      {row.fecha_solicitud
                        ? new Date(row.fecha_solicitud).toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => openView(row.id_solicitud)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Ver
                      </button>

                      <button
                        onClick={() => openApprove(row)}
                        disabled={!canAct(row)}
                        className={`text-blue-600 hover:text-blue-800 ${
                          !canAct(row) ? "opacity-40 cursor-not-allowed" : ""
                        }`}
                      >
                        Aprobar
                      </button>

                      <button
                        onClick={() => openReject(row)}
                        disabled={!canAct(row)}
                        className={`text-red-600 hover:text-red-800 ${
                          !canAct(row) ? "opacity-40 cursor-not-allowed" : ""
                        }`}
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      Sin datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-l disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-100">
              Página {page} de {Math.ceil(total / limit) || 1}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === Math.ceil(total / limit)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-r disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {/* MODAL VER */}
      {viewOpen && current && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow w-full max-w-xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Detalle de Solicitud</h3>

            <div className="space-y-2">
              <p><b>ID:</b> {current.id_solicitud}</p>
              <p><b>Usuario:</b> {current.usuario_nombre}</p>
              <p><b>Correo:</b> {current.correo}</p>
              <p><b>Espacio:</b> {current.espacio_nombre}</p>
              <p><b>Estado:</b> {current.estado}</p>
              <p><b>Motivo:</b> {current.motivo || "-"}</p>
              <p><b>Comentario decisión:</b> {current.comentario_decision || "-"}</p>
              <p>
                <b>Fecha solicitud:</b>{" "}
                {current.fecha_solicitud
                  ? new Date(current.fecha_solicitud).toLocaleString()
                  : "-"}
              </p>
            </div>

            <button
              onClick={closeView}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL APROBAR */}
      {approveOpen && current && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Aprobar Solicitud</h3>

            <textarea
              rows={4}
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-gray-100"
              placeholder="Comentario de aprobación (opcional)"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeApprove}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmApprove}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECHAZAR */}
      {rejectOpen && current && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Rechazar Solicitud</h3>

            <textarea
              rows={4}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-gray-100"
              placeholder="Motivo del rechazo (opcional)"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeReject}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReject}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SolicitudControl;
