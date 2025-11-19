/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import React, { useEffect, useState } from 'react';
import api from '../services/api';

const permissionsConfig = {
  ADMINISTRADOR: { canView: true, canApprove: true, canReject: true },
  DEFAULT:       { canView: false, canApprove: false, canReject: false }
};

const getEffectiveRole = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");

    // 1) Revisar si user.role o user.rol existe
    const direct = (u.role || u.rol || "").toUpperCase();
    if (direct === "ADMINISTRADOR") return "ADMINISTRADOR";

    // 2) Revisar si user.roles[] existe
    if (Array.isArray(u.roles)) {
      const r = u.roles.map(x => String(x).toUpperCase());
      if (r.includes("ADMINISTRADOR")) return "ADMINISTRADOR";
    }

    // 3) Decodificar el token
    const token = localStorage.getItem("token");
    if (token && token.split(".").length === 3) {
      try {
        const payload = JSON.parse(
          atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );

        // token.roles[] ?
        if (Array.isArray(payload.roles)) {
          const r = payload.roles.map(x => String(x).toUpperCase());
          if (r.includes("ADMINISTRADOR")) return "ADMINISTRADOR";
        }

        // token.rol ?
        if (payload.rol && String(payload.rol).toUpperCase() === "ADMINISTRADOR") {
          return "ADMINISTRADOR";
        }
      } catch {}
    }

    return "DEFAULT";
  } catch {
    return "DEFAULT";
  }
};

const SolicitudAdminEspDep = () => {
  const basePath = '/solicitud-admin-esp-dep';

  const [role, setRole] = useState(() => getEffectiveRole());
  const permissions = permissionsConfig[role] || permissionsConfig.DEFAULT;

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [estado, setEstado] = useState('');

  const [viewOpen, setViewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);

  const [current, setCurrent] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [approveComment, setApproveComment] = useState('');

  const fetchSolicitudes = async (params = {}) => {
    if (!permissions.canView) {
      setError('No tienes permisos');
      return;
    }
    setLoading(true);
    setError(null);

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
        const d = res.data.datos;
        setItems(d.solicitudes || []);
        setTotal(d.paginacion?.total || 0);
      } else {
        setError(res.data?.mensaje || 'Error al cargar');
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexión');
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
    const v = e.target.value;
    setEstado(v);
    setPage(1);
    fetchSolicitudes(v ? { estado: v } : {});
  };

  const openView = async (id) => {
    try {
      const r = await api.get(`${basePath}/dato-individual/${id}`);
      if (r.data?.exito) {
        setCurrent(r.data.datos?.solicitud || null);
        setViewOpen(true);
      } else {
        setError('No se pudo obtener');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  const closeView = () => {
    setViewOpen(false);
    setCurrent(null);
  };

  const canAct = (row) => row?.estado === 'pendiente';

  const openApprove = (row) => {
    setCurrent(row);
    setApproveComment('');
    setApproveOpen(true);
  };

  const closeApprove = () => {
    setApproveOpen(false);
    setCurrent(null);
    setApproveComment('');
  };

  const confirmApprove = async () => {
    if (!current) return;
    try {
      const r = await api.post(`${basePath}/${current.id_solicitud}/aprobar`, {
        comentario_decision: approveComment || null
      });

      if (r.data?.exito) {
        closeApprove();
        fetchSolicitudes(estado ? { estado } : {});
      } else setError('No se pudo aprobar');
    } catch {
      setError('Error de conexión');
    }
  };

  const openReject = (row) => {
    setCurrent(row);
    setRejectComment('');
    setRejectOpen(true);
  };

  const closeReject = () => {
    setRejectOpen(false);
    setCurrent(null);
    setRejectComment('');
  };

  const reject = async () => {
    if (!current) return;
    try {
      const r = await api.post(`${basePath}/${current.id_solicitud}/rechazar`, {
        comentario_decision: rejectComment || null
      });

      if (r.data?.exito) {
        closeReject();
        fetchSolicitudes(estado ? { estado } : {});
      } else setError('No se pudo rechazar');
    } catch {
      setError('Error de conexión');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) setPage(newPage);
  };

  if (!permissions.canView) return <p>No tienes permisos</p>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Gestión de Solicitudes de Administración de Espacios
      </h2>

      {/* BUSCADOR + FILTRO */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 items-stretch">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex h-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="border rounded-l px-4 py-2 w-full"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r">
              Buscar
            </button>
          </form>
        </div>

        <div>
          <select
            value={estado}
            onChange={handleEstadoChange}
            className="border rounded px-3 py-2"
          >
            <option value="">Sin filtro</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
            <option value="anulada">Anulada</option>
          </select>
        </div>
      </div>

      {/* TABLA */}
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
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
                  <th className="px-4 py-2 text-left">Fecha Solicitud</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {items.map((r, i) => (
                  <tr key={r.id_solicitud} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + i + 1}</td>
                    <td className="px-4 py-2">{r.id_solicitud}</td>
                    <td className="px-4 py-2">{r.usuario_nombre || '-'}</td>
                    <td className="px-4 py-2">{r.correo || '-'}</td>
                    <td className="px-4 py-2">{r.espacio_nombre || '-'}</td>
                    <td className="px-4 py-2 capitalize">{r.estado}</td>
                    <td className="px-4 py-2">
                      {r.fecha_solicitud ? new Date(r.fecha_solicitud).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => openView(r.id_solicitud)}
                        className="text-green-600"
                      >
                        Ver Datos
                      </button>

                      <button
                        onClick={() => openApprove(r)}
                        disabled={!canAct(r)}
                        className={`text-blue-600 ${!canAct(r) ? 'opacity-40' : ''}`}
                      >
                        Aprobar
                      </button>

                      <button
                        onClick={() => openReject(r)}
                        disabled={!canAct(r)}
                        className={`text-red-600 ${!canAct(r) ? 'opacity-40' : ''}`}
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
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
              className="bg-gray-300 px-4 py-2 rounded-l disabled:opacity-50"
            >
              Anterior
            </button>

            <span className="px-4 py-2 bg-gray-100">
              Página {page} de {Math.ceil(total / limit) || 1}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === Math.ceil(total / limit)}
              className="bg-gray-300 px-4 py-2 rounded-r disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {viewOpen && current && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Detalle de Solicitud</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">ID</div>
                <div className="font-medium">{current.id_solicitud}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Estado</div>
                <div className="font-medium capitalize">{current.estado}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Usuario</div>
                <div className="font-medium">{current.usuario_nombre || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Correo</div>
                <div className="font-medium">{current.correo || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Fecha solicitud</div>
                <div className="font-medium">{current.fecha_solicitud ? new Date(current.fecha_solicitud).toLocaleString() : '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Fecha decision</div>
                <div className="font-medium">{current.fecha_decision ? new Date(current.fecha_decision).toLocaleString() : '-'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-600">Motivo</div>
                <div className="font-medium whitespace-pre-wrap">{current.motivo || '-'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-600">Comentario decision</div>
                <div className="font-medium whitespace-pre-wrap">{current.comentario_decision || '-'}</div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={closeView} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {approveOpen && current && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Aprobar Solicitud</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Comentario decision (opcional)</div>
              <textarea
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                rows={4}
                className="w-full border rounded px-3 py-2 bg-gray-100"
                placeholder="Comentario de aprobacion"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeApprove} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancelar
              </button>
              <button onClick={confirmApprove} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Confirmar aprobacion
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectOpen && current && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Rechazar Solicitud</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Comentario decision (opcional)</div>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
                className="w-full border rounded px-3 py-2 bg-gray-100"
                placeholder="Motivo del rechazo"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeReject} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancelar
              </button>
              <button onClick={reject} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudAdminEspDep;