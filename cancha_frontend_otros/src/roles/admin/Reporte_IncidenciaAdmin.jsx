/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';

const norm = (v) => String(v || '').trim().toUpperCase().replace(/\s+/g, '_');

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

const readTokenPayload = () => {
  try {
    const t = localStorage.getItem('token');
    if (!t || t.split('.').length !== 3) return {};
    const b = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - (b.length % 4)) % 4);
    return JSON.parse(atob(b + pad));
  } catch {
    return {};
  }
};

const pickRole = (u, p) => {
  const bag = new Set();
  const arr = Array.isArray(u?.roles) ? u.roles : (u?.role ? [u.role] : []);
  arr.forEach((r) =>
    bag.add(norm(typeof r === 'string' ? r : r?.rol || r?.role || r?.nombre || r?.name))
  );
  const parr = Array.isArray(p?.roles) ? p.roles : (p?.rol ? [p.rol] : []);
  parr.forEach((r) => bag.add(norm(r)));
  const list = Array.from(bag);
  if (list.includes('ADMIN_ESP_DEP')) return 'ADMIN_ESP_DEP';
  if (list.includes('ADMIN') || list.includes('ADMINISTRADOR')) return 'ADMINISTRADOR';
  return list[0] || 'DEFAULT';
};

const resolveAdminId = (u, p) => {
  if (Number.isInteger(u?.id_admin_esp_dep)) return u.id_admin_esp_dep;
  if (Number.isInteger(u?.id_persona)) return u.id_persona;
  if (Number.isInteger(u?.id)) return u.id;
  if (Number.isInteger(u?.persona?.id_persona)) return u.persona.id_persona;
  if (Number.isInteger(p?.id_admin_esp_dep)) return p.id_admin_esp_dep;
  if (Number.isInteger(p?.id_persona)) return p.id_persona;
  if (Number.isInteger(p?.id)) return p.id;
  return null;
};

const permissionsConfig = {
  ADMIN_ESP_DEP: { canView: true, canEdit: true },
  DEFAULT: { canView: false, canEdit: false },
};

const truncate = (text, max = 40) => {
  if (!text) return '-';
  const s = String(text);
  if (s.length <= max) return s;
  return s.slice(0, max) + '...';
};

const Reporte_incidenciaAdmin = () => {
  const [role, setRole] = useState(null);
  const [idAdminEspDep, setIdAdminEspDep] = useState(null);
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentReporte, setCurrentReporte] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [verificadoLocal, setVerificadoLocal] = useState(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const canchaId = params.get('cancha');

  const limit = 10;

  useEffect(() => {
  const u = readUser();
  const p = readTokenPayload();
  const r = pickRole(u, p);
  const idGuess = resolveAdminId(u, p);

  setRole(r);
  setIdAdminEspDep(idGuess);
}, []);


  const permissions = permissionsConfig[role || 'DEFAULT'] || permissionsConfig.DEFAULT;

  const fetchIncidencias = async (extraParams = {}) => {
    if (!permissions.canView) {
      setError('No tienes permisos para ver incidencias');
      return;
    }
    if (!idAdminEspDep) return;

    setLoading(true);
    setError('');
    const offset = (page - 1) * limit;

    const baseParams = {
      id_admin_esp_dep: idAdminEspDep,
      limit,
      offset,
    };

    if (canchaId) baseParams.id_cancha = canchaId;

    const fullParams = { ...baseParams, ...extraParams };

    try {
      let r;
      if (extraParams.q) {
        r = await api.get('/reporte-incidencia-admin/buscar', { params: fullParams });
      } else if (extraParams.tipo) {
        r = await api.get('/reporte-incidencia-admin/filtro', { params: fullParams });
      } else {
        r = await api.get('/reporte-incidencia-admin/datos-especificos', { params: fullParams });
      }
      console.log('📥 RAW RESPONSE:', r);
console.log('📤 DATA:', r.data);
console.log('📦 DATOS RECIBIDOS:', r.data?.datos);


      if (r.data?.exito) {
        const d = r.data.datos || {};
        setIncidencias(d.incidencias || []);
        setTotal(d.paginacion?.total || 0);
      } else {
        setError(r.data?.mensaje || 'Error al cargar incidencias');
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role && idAdminEspDep) {
      const baseParams = canchaId ? { id_cancha: canchaId } : {};
      fetchIncidencias(baseParams);
    }
  }, [role, idAdminEspDep, page, canchaId]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    const baseParams = canchaId ? { id_cancha: canchaId } : {};
    if (searchTerm.trim()) {
      fetchIncidencias({ q: searchTerm.trim(), ...baseParams });
    } else {
      fetchIncidencias(baseParams);
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    const baseParams = canchaId ? { id_cancha: canchaId } : {};
    if (tipo) {
      fetchIncidencias({ tipo, ...baseParams });
    } else {
      fetchIncidencias(baseParams);
    }
  };

  const handleToggleVerificado = async (rep) => {
    if (!permissions.canEdit) return;
    try {
      const payload = { verificado: !rep.verificado };
      const r = await api.patch(
        `/reporte-incidencia-admin/${rep.id_reporte}`,
        payload,
        { params: { id_admin_esp_dep: idAdminEspDep } }
      );
      if (r.data?.exito) {
        const baseParams = canchaId ? { id_cancha: canchaId } : {};
        fetchIncidencias(baseParams);
      } else {
        setError(r.data?.mensaje || 'No se pudo actualizar verificado');
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion');
    }
  };

  const openViewModal = async (id) => {
    if (!permissions.canView) return;
    try {
      const r = await api.get(`/reporte-incidencia-admin/dato-individual/${id}`, {
        params: { id_admin_esp_dep: idAdminEspDep },
      });
      if (r.data?.exito) {
        const x = r.data.datos?.incidencia || {};
        setCurrentReporte(x);
        setViewData(x);
        setVerificadoLocal(!!x.verificado);
        setModalOpen(true);
      } else {
        setError(r.data?.mensaje || 'No se pudo cargar el reporte');
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion');
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentReporte(null);
    setViewData(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) {
      setPage(newPage);
    }
  };

  if (!role) return <p>Cargando permisos...</p>;

  if (!permissions.canView) {
    return <p>No tienes permisos para ver incidencias.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Gestion de incidencias {canchaId ? `(Cancha #${canchaId})` : '(Todas las canchas)'}
      </h2>

      <div className="flex flex-col xl:flex-row gap-4 mb-6 items-stretch">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex h-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por encargado, cliente, cancha o texto"
              className="border rounded-l px-4 py-2 w-full"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 whitespace-nowrap"
            >
              Buscar
            </button>
          </form>
        </div>

        <select
          value={filtro}
          onChange={handleFiltroChange}
          className="border rounded px-3 py-2 sm:min-w-[200px]"
        >
          <option value="">Todos sin filtro</option>
          <option value="encargado_nombre">Ordenar por encargado</option>
          <option value="cliente_nombre">Ordenar por cliente</option>
          <option value="cancha_nombre">Ordenar por cancha</option>
          <option value="verificado_si">Solo verificados</option>
          <option value="verificado_no">Solo no verificados</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando incidencias...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Encargado</th>
                  <th className="px-4 py-2 text-left">Detalle</th>
                  <th className="px-4 py-2 text-left">Sugerencia</th>
                  <th className="px-4 py-2 text-left">Reserva</th>
                  <th className="px-4 py-2 text-left">Cancha</th>
                  <th className="px-4 py-2 text-left">Verificado</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {incidencias.map((x, i) => (
                  <tr key={x.id_reporte} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + i + 1}</td>
                    <td className="px-4 py-2">
                      {x.encargado_nombre || x.encargado_apellido
                        ? `${x.encargado_nombre || ''} ${x.encargado_apellido || ''}`.trim()
                        : '-'}
                    </td>
                    <td className="px-4 py-2">{truncate(x.detalle, 35)}</td>
                    <td className="px-4 py-2">{truncate(x.sugerencia, 35)}</td>
                    <td className="px-4 py-2">{x.id_reserva ? `#${x.id_reserva}` : '-'}</td>
                    <td className="px-4 py-2">{x.cancha_nombre || '-'}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' +
                          (x.verificado
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800')
                        }
                      >
                        {x.verificado ? 'Si' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => openViewModal(x.id_reporte)}
                        className="text-green-500 hover:text-green-700"
                      >
                        Ver
                      </button>
                      {permissions.canEdit && (
                        <button
                          onClick={() => handleToggleVerificado(x)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Cambiar verificado
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {incidencias.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      Sin datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-l hover:bg-gray-400 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-100">
              Pagina {page} de {Math.ceil(total / limit) || 1}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === Math.ceil(total / limit) || total === 0}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-r hover:bg-gray-400 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {modalOpen && viewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Detalle de incidencia</h3>

            <div className="space-y-2 text-sm">
              <p>
                <strong>ID reporte:</strong> {viewData.id_reporte}
              </p>
              <p>
                <strong>Encargado:</strong>{' '}
                {viewData.encargado_nombre || viewData.encargado_apellido
                  ? `${viewData.encargado_nombre || ''} ${viewData.encargado_apellido || ''}`.trim()
                  : '-'}
              </p>
              <p>
                <strong>Cliente:</strong>{' '}
                {viewData.cliente_nombre || viewData.cliente_apellido
                  ? `${viewData.cliente_nombre || ''} ${viewData.cliente_apellido || ''}`.trim()
                  : '-'}
              </p>
              <p>
                <strong>Reserva:</strong> {viewData.id_reserva ? `#${viewData.id_reserva}` : '-'}
              </p>
              <p>
                <strong>Cancha:</strong> {viewData.cancha_nombre || '-'}
              </p>
              <p>
                <strong>Detalle:</strong> {viewData.detalle || '-'}
              </p>
              <p>
                <strong>Sugerencia:</strong> {viewData.sugerencia || '-'}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                  disabled
                    type="checkbox"
                    checked={verificadoLocal}
                    onChange={(e) => setVerificadoLocal(e.target.checked)}
                  />
                  <span>Verificado</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reporte_incidenciaAdmin;
