/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */

import React, { useState, useEffect } from "react";
import api from "../../services/api";

const Reporte_IncidenciaEncargado = () => {
  const [reportes, setReportes] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [detalle, setDetalle] = useState(null);

  const [formDetalle, setFormDetalle] = useState("");
  const [formSugerencia, setFormSugerencia] = useState("");
  const [formReserva, setFormReserva] = useState("");
  const [reservasDisponibles, setReservasDisponibles] = useState([]);


  /* ========================= FETCH LIST ========================= */

  const fetchReportes = async (params = {}) => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * limit;

    try {
      let resp;

      if (params.q) {
        resp = await api.get("/reporte-incidencia-encargado/buscar", {
          params: { q: params.q, limit, offset },
        });
      } else if (params.tipo) {
        resp = await api.get("/reporte-incidencia-encargado/filtro", {
          params: { tipo: params.tipo, limit, offset },
        });
      } else {
        resp = await api.get("/reporte-incidencia-encargado/datos-especificos", {
          params: { limit, offset },
        });
      }

      if (resp.data?.exito) {
        setReportes(resp.data.datos?.reportes || resp.data.reportes || []);
        setTotal(resp.data.datos?.total || resp.data.total || 0);
      } else {
        setError(resp.data?.mensaje || "Error al cargar reportes");
      }
    } catch (e) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, [page]);

  /* ========================= BUSCAR / FILTRO ========================= */

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) fetchReportes({ q: searchTerm });
    else fetchReportes();
  };

  const handleFiltro = (e) => {
    setFiltro(e.target.value);
    setPage(1);
    if (e.target.value) fetchReportes({ tipo: e.target.value });
    else fetchReportes();
  };

  /* ========================= DETALLE ========================= */

  const openModal = async (id) => {
    setLoading(true);
    try {
      const r = await api.get(`/reporte-incidencia-encargado/dato-individual/${id}`);

      if (r.data?.exito) {
        setDetalle(r.data.datos?.reporte);
        setFormDetalle(r.data.datos.reporte.detalle);
        setFormSugerencia(r.data.datos.reporte.sugerencia);
        setFormReserva(r.data.datos.reporte.id_reserva);

        setEditMode("ver");
        setModalOpen(true);
      } else {
        setError("No se pudo cargar detalle");
      }
    } catch (e) {
      setError("Error al cargar detalle");
    } finally {
      setLoading(false);
    }
  };

  const openEditar = async (id) => {
    setLoading(true);
    try {
      await loadReservas();

      const r = await api.get(`/reporte-incidencia-encargado/dato-individual/${id}`);
      if (r.data?.exito) {
        const rep = r.data.datos.reporte;

        if (rep.verificado) {
          setError("No puedes editar un reporte verificado");
          setLoading(false);
          return;
        }

        setDetalle(rep);
        setFormDetalle(rep.detalle);
        setFormSugerencia(rep.sugerencia);
        setFormReserva(rep.id_reserva);

        setEditMode("editar");
        setModalOpen(true);
      }
    } catch (e) {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setDetalle(null);
    setEditMode(false);
  };

  /* ========================= CREAR ========================= */

  const openCreate = async () => {
    await loadReservas();
    setDetalle(null);
    setEditMode("crear");
    setModalOpen(true);
    setFormDetalle("");
    setFormSugerencia("");
    setFormReserva("");
  };


  const enviarNuevo = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.post("/reporte-incidencia-encargado", {
        detalle: formDetalle,
        sugerencia: formSugerencia,
        id_reserva: formReserva,
      });

      if (resp.data?.exito) {
        closeModal();
        fetchReportes();
      } else {
        setError(resp.data?.mensaje || "No se pudo crear reporte");
      }
    } catch (e) {
      setError("Error al crear");
    }
  };

  /* ========================= EDITAR ========================= */

  const enviarEdicion = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.put(`/reporte-incidencia-encargado/${detalle.id_reporte}`, {
        detalle: formDetalle,
        sugerencia: formSugerencia,
        id_reserva: formReserva,
      });

      if (detalle.verificado) {
        setError("No puedes editar un reporte verificado");
        return;
      }

      if (resp.data?.exito) {
        closeModal();
        fetchReportes();
      } else {
        setError(resp.data?.mensaje || "No se pudo editar reporte");
      }
    } catch (e) {
      setError("Error al editar");
    }
  };

  const loadReservas = async () => {
    try {
      const r = await api.get("/reporte-incidencia-encargado/reservas-disponibles");
      if (r.data?.exito) {
        setReservasDisponibles(r.data.datos.reservas);
      }
    } catch (e) {
      console.error("Error al cargar reservas");
    }
  };


  /* ========================= RENDER ========================= */

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Reportes de Incidencias</h2>

      {/* BUSQUEDA Y FILTRO */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 items-stretch">
        {/* BUSCAR */}
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex h-full">
            <input
              type="text"
              placeholder="Buscar por detalle, sugerencia o cancha"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-l px-4 py-2 w-full"
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 whitespace-nowrap">
              Buscar
            </button>
          </form>
        </div>

        {/* FILTRO */}
        <div>
          <select
            value={filtro}
            onChange={handleFiltro}
            className="border rounded px-3 py-2 sm:min-w-[200px]"
          >
            <option value="">Todos - sin filtro</option>
            <option value="fecha">Por fecha</option>
            <option value="verificado">Por verificado</option>
            <option value="cancha">Por cancha</option>
          </select>
        </div>

        {/* CREAR */}
        <button
          onClick={openCreate}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 whitespace-nowrap"
        >
          Crear Reporte
        </button>
      </div>

      {/* TABLA */}
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Cancha</th>
                <th className="px-4 py-2 text-left">Reserva cliente</th>
                <th className="px-4 py-2 text-left">Fecha Reserva</th>
                <th className="px-4 py-2 text-left">Detalle</th>
                <th className="px-4 py-2 text-left">Verificado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {reportes.map((r, i) => (
                <tr key={r.id_reporte} className="border-t">
                  <td className="px-4 py-2">{(page - 1) * limit + i + 1}</td>
                  <td className="px-4 py-2">{r.nombre_cancha}</td>
                  <td className="px-4 py-2">
                    #{r.id_reserva} {r.cliente_completo}
                  </td>
                  <td className="px-4 py-2">
                    {r.fecha_reserva?.split("T")[0]}
                  </td>
                  <td className="px-4 py-2">
                    {r.detalle.length > 30
                      ? r.detalle.slice(0, 30) + "..."
                      : r.detalle}
                  </td>
                  <td className="px-4 py-2">
                    {r.verificado ? "✔" : "❌"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => openModal(r.id_reporte)}
                      className="text-blue-500 hover:text-blue-700 mr-3"
                    >
                      Ver
                    </button>

                    <button
                      onClick={() => r.verificado ? null : openEditar(r.id_reporte)}
                      disabled={r.verificado}
                      className={
                        r.verificado
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-green-600 hover:text-green-800"
                      }
                    >
                      Editar
                    </button>


                  </td>
                </tr>
              ))}

              {reportes.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No hay reportes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINACION */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-l disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="px-4 py-2 bg-gray-100">
          Página {page} de {Math.ceil(total / limit)}
        </span>

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === Math.ceil(total / limit)}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-r disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">
              {editMode === "ver" && "Detalle del Reporte"}
              {editMode === "crear" && "Crear Reporte"}
              {editMode === "editar" && "Editar Reporte"}

            </h3>
            {editMode === "editar" && detalle?.verificado && (
              <p className="text-red-500 font-semibold mb-3">
                Este reporte ya está verificado. No puedes editarlo.
              </p>
            )}


            {/* DATOS */}
            {editMode === "ver" && detalle && (
              <>
                <p><strong>Cancha:</strong> {detalle.nombre_cancha}</p>
                <p><strong>Fecha reserva:</strong> {detalle.fecha_reserva?.split("T")[0]}</p>
                <p><strong>Cliente:</strong> {detalle.cliente_nombre} {detalle.cliente_apellido}</p>
                <p><strong>Reserva:</strong> #{detalle.id_reserva}</p>
                <p><strong>Estado reserva:</strong> {detalle.estado_reserva}</p>
                <p><strong>Verificado:</strong> {detalle.verificado ? "Sí" : "No"}</p>
                <hr className="my-2" />
                <p><strong>Detalle:</strong> {detalle.detalle}</p>
                <p><strong>Sugerencia:</strong> {detalle.sugerencia}</p>
              </>
            )}


            {/* FORMULARIO CREAR / EDITAR */}
            {(editMode === "crear" || (editMode === "editar" && !detalle?.verificado)) && (
              <form
                onSubmit={editMode === "editar" ? enviarEdicion : enviarNuevo}
                className="space-y-3 mt-2"
              >

                <div>
                  <label className="font-semibold">Detalle</label>
                  <textarea
                    className="border w-full rounded p-2"
                    value={formDetalle}
                    onChange={(e) => setFormDetalle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold">Sugerencia</label>
                  <textarea
                    className="border w-full rounded p-2"
                    value={formSugerencia}
                    onChange={(e) => setFormSugerencia(e.target.value)}
                  />
                </div>

                <div>
                  <label className="font-semibold">Reserva</label>
                  <select
                    className="border w-full rounded p-2"
                    value={formReserva}
                    onChange={(e) => setFormReserva(e.target.value)}
                    required
                  >
                    <option value="">Seleccione una reserva</option>
                    {reservasDisponibles.map((r) => (
                      <option key={r.id_reserva} value={r.id_reserva}>
                        #{r.id_reserva} {r.cliente_completo}
                      </option>
                    ))}
                  </select>
                </div>


                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  {detalle ? "Actualizar" : "Crear"}
                </button>
              </form>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Reporte_IncidenciaEncargado;