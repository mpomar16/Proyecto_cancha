/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const norm = (v) => String(v || '').trim().toUpperCase().replace(/\s+/g, '_');

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
};

const readTokenPayload = () => {
  try {
    const t = localStorage.getItem('token');
    if (!t || t.split('.').length !== 3) return {};
    const b = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - (b.length % 4)) % 4);
    return JSON.parse(atob(b + pad));
  } catch { return {}; }
};

const pickRole = (u, p) => {
  const bag = new Set();
  const arr = Array.isArray(u?.roles) ? u.roles : (u?.role ? [u.role] : []);
  arr.forEach(r => bag.add(norm(typeof r === 'string' ? r : r?.rol || r?.role || r?.nombre || r?.name)));
  const parr = Array.isArray(p?.roles) ? p.roles : (p?.rol ? [p.rol] : []);
  parr.forEach(r => bag.add(norm(r)));
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
  ADMIN_ESP_DEP: { canView: true, canEdit: true, canDelete: true },
  DEFAULT: { canView: false, canEdit: false, canDelete: false },
};

const ResenaAdmin = () => {
  const [role, setRole] = useState(null);
  const [idAdminEspDep, setIdAdminEspDep] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [currentResena, setCurrentResena] = useState(null);
  const [formData, setFormData] = useState({
    estrellas: '',
    comentario: '',
    estado: false,
    verificado: false
  });
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const canchaId = params.get('cancha'); // 👈 obtiene el id_cancha desde la URL si existe


  const limit = 10;

  useEffect(() => {
    const u = readUser();
    const p = readTokenPayload();
    const r = pickRole(u, p);
    setRole(r);
    const idGuess = resolveAdminId(u, p);
    setIdAdminEspDep(idGuess);
  }, []);

  const permissions = permissionsConfig[role || 'DEFAULT'] || permissionsConfig.DEFAULT;

  // === CARGAR RESEÑAS ===
  const fetchResenas = async (params = {}) => {
    if (!permissions.canView) {
      setError('No tienes permisos para ver reseñas');
      return;
    }

    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;

    // ✅ parámetros base: id_admin_esp_dep y paginación
    const fullParams = {
      ...params,
      limit,
      offset,
      id_admin_esp_dep: idAdminEspDep
    };

    // ✅ si hay una cancha en la URL, la añadimos
    if (canchaId) fullParams.id_cancha = canchaId;

    try {
      let r;

      // 🔹 Buscar reseñas
      if (params.q) {
        r = await api.get('/resena-admin/buscar', { params: fullParams });
      }

      // 🔹 Filtrar reseñas (verificado, cancha, cliente, etc.)
      else if (params.tipo) {
        r = await api.get('/resena-admin/filtro', { params: fullParams });
      }

      // 🔹 Datos normales (todas las reseñas)
      else {
        r = await api.get('/resena-admin/datos-especificos', { params: fullParams });
      }

      // ✅ respuesta
      if (r.data?.exito) {
        setResenas(r.data.datos.resenas || []);
        setTotal(r.data.datos.paginacion?.total || 0);
      } else {
        setError(r.data?.mensaje || 'Error al cargar reseñas');
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (role && idAdminEspDep) fetchResenas({ id_cancha: canchaId });
  }, [role, idAdminEspDep, page, canchaId]);


  const handleSearch = (e) => {
    e.preventDefault();
    const baseParams = canchaId ? { id_cancha: canchaId } : {};
    if (searchTerm.trim()) fetchResenas({ q: searchTerm, ...baseParams });
    else fetchResenas(baseParams);
  };


  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    const baseParams = canchaId ? { id_cancha: canchaId } : {};
    if (tipo) fetchResenas({ tipo, ...baseParams });
    else fetchResenas(baseParams);
  };


  const handleDelete = async (id) => {
    if (!permissions.canDelete) return;
    if (!window.confirm('Estas seguro de eliminar esta reseña?')) return;
    try {
      const r = await api.delete(`/resena-admin/${id}`, { params: { id_admin_esp_dep: idAdminEspDep } });
      if (r.data?.exito) fetchResenas();
      else setError(r.data?.mensaje || 'No se pudo eliminar');
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion');
    }
  };

  const openEditModal = async (id) => {
    if (!permissions.canEdit) return;
    try {
      const r = await api.get(`/resena-admin/dato-individual/${id}`, { params: { id_admin_esp_dep: idAdminEspDep } });
      if (r.data?.exito) {
        const x = r.data.datos?.resena || {};
        setFormData({
          estrellas: x.estrellas || '',
          comentario: x.comentario || '',
          estado: x.estado || false,
          verificado: x.verificado || false
        });
        setCurrentResena(x);
        setEditMode(true);
        setViewMode(false);
        setModalOpen(true);
      } else setError(r.data?.mensaje || 'No se pudo cargar');
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion');
    }
  };

  const openViewModal = async (id) => {
    if (!permissions.canView) return;
    try {
      const r = await api.get(`/resena-admin/dato-individual/${id}`, { params: { id_admin_esp_dep: idAdminEspDep } });
      if (r.data?.exito) {
        const x = r.data.datos?.resena || {};
        setFormData({
          estrellas: x.estrellas || '',
          comentario: x.comentario || '',
          estado: x.estado || false,
          verificado: x.verificado || false
        });
        setCurrentResena(x);
        setEditMode(false);
        setViewMode(true);
        setModalOpen(true);
      } else setError(r.data?.mensaje || 'No se pudo cargar');
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion');
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentResena(null);
    setError(null);
    setViewMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!permissions.canEdit || viewMode) return;
    try {
      const payload = {
        estrellas: Number(formData.estrellas),
        comentario: formData.comentario || null,
        estado: !!formData.estado,
        verificado: !!formData.verificado
      };
      const r = await api.patch(`/resena-admin/${currentResena.id_resena}`, payload, { params: { id_admin_esp_dep: idAdminEspDep } });
      if (r.data?.exito) { closeModal(); fetchResenas(); }
      else setError(r.data?.mensaje || 'No se pudo actualizar');
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) setPage(newPage);
  };

  if (!role) return <p>Cargando permisos...</p>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Gestion de Reseñas {canchaId ? `(Cancha #${canchaId})` : '(Todas las canchas)'}
      </h2>
      <div className="flex flex-col xl:flex-row gap-4 mb-6 items-stretch">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex h-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, cancha o comentario"
              className="border rounded-l px-4 py-2 w-full"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 whitespace-nowrap">
              Buscar
            </button>
          </form>
        </div>

        <select value={filtro} onChange={handleFiltroChange} className="border rounded px-3 py-2 sm:min-w-[200px]">
          <option value="">Todos - sin filtro</option>
          <option value="cliente_nombre">Ordenar por cliente</option>
          <option value="cancha_nombre">Ordenar por cancha</option>
          <option value="verificado_si">Solo verificadas</option>
          <option value="verificado_no">Solo no verificadas</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando reseñas...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Cancha</th>
                  <th className="px-4 py-2 text-left">Estrellas</th>
                  <th className="px-4 py-2 text-left">Comentario</th>
                  <th className="px-4 py-2 text-left">Verificado</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resenas.map((x, i) => (
                  <tr key={x.id_resena} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + i + 1}</td>
                    <td className="px-4 py-2">{`${x.cliente_nombre} ${x.cliente_apellido}`}</td>
                    <td className="px-4 py-2">{x.cancha_nombre}</td>
                    <td className="px-4 py-2">{x.estrellas}</td>
                    <td className="px-4 py-2">{x.comentario || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${x.verificado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {x.verificado ? 'Si' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      {permissions.canView && (
                        <button onClick={() => openViewModal(x.id_resena)} className="text-green-500 hover:text-green-700">
                          Ver
                        </button>
                      )}
                      {permissions.canEdit && (
                        <button onClick={() => openEditModal(x.id_resena)} className="text-blue-500 hover:text-blue-700">
                          Editar
                        </button>
                      )}
                      {permissions.canDelete && (
                        <button onClick={() => handleDelete(x.id_resena)} className="text-red-500 hover:text-red-700">
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-l hover:bg-gray-400 disabled:opacity-50">
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-100">Pagina {page} de {Math.ceil(total / limit)}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === Math.ceil(total / limit)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-r hover:bg-gray-400 disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {viewMode ? 'Ver reseña' : 'Editar reseña'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estrellas</label>
                <input
                  name="estrellas"
                  value={formData.estrellas}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  type="number"
                  min="1"
                  max="5"
                  required
                  disabled={viewMode}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Comentario</label>
                <textarea
                  name="comentario"
                  value={formData.comentario}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  rows="3"
                  disabled={viewMode}
                />
              </div>
              <div className="flex items-center space-x-4 col-span-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="estado" checked={formData.estado} onChange={handleInputChange} disabled={viewMode} />
                  <span>Activo</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" name="verificado" checked={formData.verificado} onChange={handleInputChange} disabled={viewMode} />
                  <span>Verificado</span>
                </label>
              </div>
              <div className="col-span-2 flex justify-end mt-4">
                <button type="button" onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600">
                  Cerrar
                </button>
                {!viewMode && (
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Actualizar
                  </button>
                )}
              </div>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResenaAdmin;
