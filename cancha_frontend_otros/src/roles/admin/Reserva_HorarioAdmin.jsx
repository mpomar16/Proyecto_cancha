/* eslint-disable no-empty */
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

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
  ADMINISTRADOR: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  ADMIN_ESP_DEP: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  DEFAULT: { canView: false, canCreate: false, canEdit: false, canDelete: false },
};

const Reserva_HorarioAdmin = () => {
  const [role, setRole] = useState(null);
  const [idAdminEspDep, setIdAdminEspDep] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtro, setFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [currentHorario, setCurrentHorario] = useState(null);

  const [formData, setFormData] = useState({
    id_reserva: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    monto: ''
  });

  useEffect(() => {
    const u = readUser();
    const p = readTokenPayload();
    const r = pickRole(u, p);
    setRole(r);
    const idGuess = resolveAdminId(u, p);
    setIdAdminEspDep(r === 'ADMIN_ESP_DEP' ? idGuess : null);
  }, []);

  const permissions = permissionsConfig[role || 'DEFAULT'] || permissionsConfig.DEFAULT;

  const fetchReservasActivas = async () => {
    try {
      if (!idAdminEspDep) return;
      const res = await api.get('/reserva-horario-admin/reservas-disponibles', {
        params: { id_admin_esp_dep: idAdminEspDep },
      });
      if (res.data?.exito) setReservas(res.data.datos?.reservas || []);
    } catch {
      setError('Error al cargar reservas disponibles');
    }
  };


  const fetchHorarios = async (params = {}) => {
    if (!permissions.canView) { setError('No tienes permisos para ver horarios'); return; }
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;
    const extra = role === 'ADMIN_ESP_DEP' && idAdminEspDep ? { id_admin_esp_dep: idAdminEspDep } : {};
    const fullParams = { ...params, limit, offset, ...extra };

    try {
      let resp;
      if (params.q) resp = await api.get('/reserva-horario-admin/buscar', { params: fullParams });
      else if (params.tipo) resp = await api.get('/reserva-horario-admin/filtro', { params: fullParams });
      else resp = await api.get('/reserva-horario-admin/datos-especificos', { params: fullParams });

      if (resp.data?.exito) {
        const rows = Array.isArray(resp.data.datos?.horarios) ? resp.data.datos.horarios : [];
        const t = resp.data.datos?.paginacion?.total;
        setHorarios(rows);
        setTotal(typeof t === 'number' ? t : rows.length);
      } else {
        setError(resp.data?.mensaje || 'Error al cargar horarios');
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!role) return;
    fetchHorarios();
    fetchReservasActivas();
  }, [role, idAdminEspDep, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) fetchHorarios({ q: searchTerm });
    else fetchHorarios();
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) fetchHorarios({ tipo });
    else fetchHorarios();
  };

  const handleDelete = async (id) => {
    if (!permissions.canDelete) return;
    if (!window.confirm('¿Seguro de eliminar este horario?')) return;
    try {
      const r = await api.delete(`/reserva-horario-admin/${id}`, {
        params: { id_admin_esp_dep: idAdminEspDep } // ✅ correcto
      });
      if (r.data?.exito) fetchHorarios();
      else setError(r.data?.mensaje || 'No se pudo eliminar');
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion');
    }
  };


  const openCreateModal = () => {
    if (!permissions.canCreate) return;
    setEditMode(false);
    setViewMode(false);
    setFormData({ id_reserva: '', fecha: '', hora_inicio: '', hora_fin: '', monto: '' });
    setCurrentHorario(null);
    setModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const r = await api.get(`/reserva-horario-admin/dato-individual/${id}`, {
        params: { id_admin_esp_dep: idAdminEspDep },
      });
      if (!r.data?.exito) { setError(r.data?.mensaje || 'No se pudo cargar'); return; }

      const d = r.data.datos?.horario || {};

      // ✅ aseguramos que la reserva actual esté en el listado
      setReservas(prev => {
        const exists = prev.some(r => r.id_reserva === d.id_reserva);
        if (exists) return prev;
        return [
          ...prev,
          {
            id_reserva: d.id_reserva,
            cliente_nombre: d.cliente_nombre,
            cliente_apellido: d.cliente_apellido,
            cancha_nombre: d.cancha_nombre,
            fecha_reserva: d.fecha,
            monto_total: d.monto,
          },
        ];
      });

      setFormData({
        id_reserva: d.id_reserva || '',
        fecha: d.fecha ? new Date(d.fecha).toISOString().split('T')[0] : '',
        hora_inicio: d.hora_inicio || '',
        hora_fin: d.hora_fin || '',
        monto: d.monto || ''
      });

      setCurrentHorario(d);
      setEditMode(true);
      setViewMode(false);
      setModalOpen(true);
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion');
    }
  };

  const openViewModal = async (id) => {
    try {
      const r = await api.get(`/reserva-horario-admin/dato-individual/${id}`, {
        params: { id_admin_esp_dep: idAdminEspDep },
      });
      if (!r.data?.exito) { setError(r.data?.mensaje || 'No se pudo cargar'); return; }

      const d = r.data.datos?.horario || {};

      // ✅ igual que en editar: incluir la reserva si no está
      setReservas(prev => {
        const exists = prev.some(r => r.id_reserva === d.id_reserva);
        if (exists) return prev;
        return [
          ...prev,
          {
            id_reserva: d.id_reserva,
            cliente_nombre: d.cliente_nombre,
            cliente_apellido: d.cliente_apellido,
            cancha_nombre: d.cancha_nombre,
            fecha_reserva: d.fecha,
            monto_total: d.monto,
          },
        ];
      });

      setFormData({
        id_reserva: d.id_reserva || '',
        fecha: d.fecha ? new Date(d.fecha).toISOString().split('T')[0] : '',
        hora_inicio: d.hora_inicio || '',
        hora_fin: d.hora_fin || '',
        monto: d.monto || ''
      });

      setCurrentHorario(d);
      setEditMode(false);
      setViewMode(true);
      setModalOpen(true);
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error de conexion');
    }
  };


  const closeModal = () => { setModalOpen(false); setError(null); setViewMode(false); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // ✅ Si el usuario selecciona una reserva
    if (name === 'id_reserva') {
      const selected = reservas.find(r => String(r.id_reserva) === String(value));
      if (selected) {
        setFormData(prev => ({
          ...prev,
          id_reserva: value,
          // fecha viene de reserva.fecha_reserva
          fecha: selected.fecha_reserva
            ? new Date(selected.fecha_reserva).toISOString().split('T')[0]
            : '',
          // monto viene de reserva.monto_total
          monto: selected.monto_total || ''
        }));
        return;
      }
    }

    // ✅ Si es otro campo, mantener el comportamiento normal
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id_reserva: parseInt(formData.id_reserva),
        fecha: formData.fecha,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        monto: formData.monto ? parseFloat(formData.monto) : null
      };
      let r;
      if (editMode) r = await api.patch(`/reserva-horario-admin/${currentHorario.id_horario}`, payload, {
        params: { id_admin_esp_dep: idAdminEspDep }
      });

      else r = await api.post('/reserva-horario-admin/', payload);
      if (r.data?.exito) {
        closeModal();
        fetchHorarios();
      } else {
        alert(r.data?.mensaje || 'Advertencia: no se pudo guardar');
        // limpiamos el error para que no salga en rojo
        setError(null);
      }

    } catch (e) { setError(e.response?.data?.mensaje || 'Error de conexion'); }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) setPage(newPage);
  };

  const isFieldDisabled = (fieldName) => {
    if (viewMode) return true; // modo ver -> todo bloqueado
    if (editMode) {
      // en modo editar, solo hora_inicio y hora_fin se pueden cambiar
      return fieldName !== 'hora_inicio' && fieldName !== 'hora_fin';
    }
    return false; // modo crear -> todo habilitado
  };


  if (!role) return <p>Cargando permisos...</p>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Gestion de Horarios de Reserva</h2>

      <div className="flex flex-col xl:flex-row gap-4 mb-6 items-stretch">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex h-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente o cancha"
              className="border rounded-l px-4 py-2 w-full"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 whitespace-nowrap">
              Buscar
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <select value={filtro} onChange={handleFiltroChange} className="border rounded px-3 py-2 flex-1 sm:min-w-[180px]">
            <option value="">Todos - sin filtro</option>
            <option value="fecha">Por fecha</option>
            <option value="hora">Por hora</option>
          </select>
          {permissions.canCreate && (
            <button onClick={openCreateModal} className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 whitespace-nowrap">
              Crear
            </button>
          )}
        </div>
      </div>

      {loading ? <p>Cargando horarios...</p> : error ? <p className="text-red-500">{error}</p> : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Cancha</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Hora Inicio</th>
                  <th className="px-4 py-2 text-left">Hora Fin</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((h, i) => (
                  <tr key={h.id_horario} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + i + 1}</td>
                    <td className="px-4 py-2">{`${h.cliente_nombre} ${h.cliente_apellido}`}</td>
                    <td className="px-4 py-2">{h.cancha_nombre}</td>
                    <td className="px-4 py-2">{new Date(h.fecha).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{h.hora_inicio}</td>
                    <td className="px-4 py-2">{h.hora_fin}</td>
                    <td className="px-4 py-2 flex gap-2">
                      {permissions.canView && (
                        <button onClick={() => openViewModal(h.id_horario)} className="text-green-500 hover:text-green-700 mr-2">Ver</button>
                      )}
                      {permissions.canEdit && (
                        <button onClick={() => openEditModal(h.id_horario)} className="text-blue-500 hover:text-blue-700 mr-2">Editar</button>
                      )}
                      {permissions.canDelete && (
                        <button onClick={() => handleDelete(h.id_horario)} className="text-red-500 hover:text-red-700">Eliminar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-l hover:bg-gray-400 disabled:opacity-50">Anterior</button>
            <span className="px-4 py-2 bg-gray-100">Pagina {page} de {Math.ceil(total / limit)}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === Math.ceil(total / limit)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-r hover:bg-gray-400 disabled:opacity-50">Siguiente</button>
          </div>
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {viewMode ? 'Ver Horario' : editMode ? 'Editar Horario' : 'Crear Horario'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reserva</label>
                <select
                  name="id_reserva"
                  value={formData.id_reserva}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={isFieldDisabled('id_reserva')}
                >
                  <option value="">Seleccione una reserva activa</option>
                  {reservas.map(r => (
                    <option key={r.id_reserva} value={r.id_reserva}>
                      #{r.id_reserva} - {r.cliente_nombre} {r.cliente_apellido} ({r.cancha_nombre})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <input
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={isFieldDisabled('fecha')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hora Inicio</label>
                <input
                  name="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={isFieldDisabled('hora_inicio')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hora Fin</label>
                <input
                  name="hora_fin"
                  type="time"
                  value={formData.hora_fin}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={isFieldDisabled('hora_fin')}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Monto</label>
                <input
                  name="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isFieldDisabled('monto')}
                />
              </div>

              <div className="col-span-2 flex justify-end mt-4">
                <button type="button" onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600">Cerrar</button>
                {!viewMode && (
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    {editMode ? 'Actualizar' : 'Crear'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reserva_HorarioAdmin;
