import React, { useState, useEffect } from "react";
import api from "../../services/api";

const getImageUrl = (path) => {
  if (!path) return "";
  const base = (api.defaults?.baseURL || "").replace(/\/$/, "");
  const clean = String(path).replace(/^\//, "");
  return `${base}/${clean}`;
};

const Espacio_DeportivoEncargado = () => {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [currentEspacio, setCurrentEspacio] = useState(null);

  const fetchEspacios = async (params = {}) => {
    setLoading(true);
    setError(null);

    const offset = (page - 1) * limit;

    try {
      let resp;

      if (params.q) {
        resp = await api.get("/espacio-encargado/buscar", {
          params: { limit, offset, q: params.q },
        });
      } else if (params.tipo) {
        resp = await api.get("/espacio-encargado/filtro", {
          params: { limit, offset, tipo: params.tipo },
        });
      } else {
        resp = await api.get("/espacio-encargado/datos-especificos", {
          params: { limit, offset },
        });
      }

      if (resp.data?.exito) {
        const rows = resp.data.datos?.espacios || [];
        const t = resp.data.datos?.paginacion?.total;
        setEspacios(rows);
        setTotal(typeof t === "number" ? t : 0);
      } else {
        setError(resp.data?.mensaje || "Error al cargar");
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspacios();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (searchTerm.trim()) fetchEspacios({ q: searchTerm });
    else fetchEspacios();
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);
    if (tipo) fetchEspacios({ tipo });
    else fetchEspacios();
  };

  const openViewModal = async (id) => {
    try {
      const r = await api.get(`/espacio-encargado/dato-individual/${id}`);
      if (!r.data?.exito) {
        setError(r.data?.mensaje || "No se pudo cargar");
        return;
      }
      setCurrentEspacio(r.data.datos?.espacio || null);
      setModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error de conexion");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentEspacio(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) setPage(newPage);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Mis Espacios Deportivos</h2>

      {/* Busqueda + Filtro */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 items-stretch">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex h-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, direccion, descripcion o admin"
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

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <select
            value={filtro}
            onChange={handleFiltroChange}
            className="border rounded px-3 py-2 flex-1 sm:min-w-[180px]"
          >
            <option value="">Todos - sin filtro</option>
            <option value="nombre">Por nombre</option>
            <option value="direccion">Por direccion</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <p>Cargando espacios...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Direccion</th>
                  <th className="px-4 py-2 text-left">Horario apertura</th>
                  <th className="px-4 py-2 text-left">Horario cierre</th>
                  <th className="px-4 py-2 text-left">Administrador</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {espacios.map((e, index) => (
                  <tr key={e.id_espacio} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + index + 1}</td>
                    <td className="px-4 py-2">{e.nombre}</td>
                    <td className="px-4 py-2">{e.direccion || "-"}</td>
                    <td className="px-4 py-2">{e.horario_apertura || "-"}</td>
                    <td className="px-4 py-2">{e.horario_cierre || "-"}</td>
                    <td className="px-4 py-2">
                      {e.admin_nombre || e.admin_apellido
                        ? `${e.admin_nombre || ""} ${e.admin_apellido || ""}`
                        : "Sin admin"}
                    </td>

                    <td className="px-4 py-2">
                      <button
                        onClick={() => openViewModal(e.id_espacio)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Ver datos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginacion */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-l hover:bg-gray-400 disabled:opacity-50"
            >
              Anterior
            </button>

            <span className="px-4 py-2 bg-gray-100">
              Pagina {page} de {Math.ceil(total / limit)}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === Math.ceil(total / limit)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-r hover:bg-gray-400 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {/* Modal de Vista */}
      {modalOpen && currentEspacio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">

            <h3 className="text-xl font-semibold mb-4">
              Datos del Espacio Deportivo
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <p><strong>Nombre:</strong> {currentEspacio.nombre}</p>
              <p><strong>Direccion:</strong> {currentEspacio.direccion || "-"}</p>
              <p><strong>Descripcion:</strong> {currentEspacio.descripcion || "-"}</p>

              <p><strong>Latitud:</strong> {currentEspacio.latitud || "-"}</p>
              <p><strong>Longitud:</strong> {currentEspacio.longitud || "-"}</p>
              <p><strong>Apertura:</strong> {currentEspacio.horario_apertura || "-"}</p>
              <p><strong>Cierre:</strong> {currentEspacio.horario_cierre || "-"}</p>

              <p className="col-span-2">
                <strong>Administrador:</strong>{" "}
                {(currentEspacio.admin_nombre || "") +
                  " " +
                  (currentEspacio.admin_apellido || "")}
              </p>

              <p className="col-span-2 text-sm text-gray-600">
                <strong>Correo admin:</strong> {currentEspacio.admin_correo || "-"}
              </p>

              {/* Imagenes */}
              <div className="col-span-2 mt-4">
                <h4 className="font-semibold mb-2">Imagenes</h4>

                <div className="grid grid-cols-2 gap-4">
                  {currentEspacio.imagen_principal && (
                    <img
                      src={getImageUrl(currentEspacio.imagen_principal)}
                      alt="img1"
                      className="w-full h-40 object-cover rounded"
                    />
                  )}

                  {[1, 2, 3, 4].map((i) => {
                    const key = `imagen_sec_${i}`;
                    return (
                      currentEspacio[key] && (
                        <img
                          key={key}
                          src={getImageUrl(currentEspacio[key])}
                          alt={key}
                          className="w-full h-40 object-cover rounded"
                        />
                      )
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
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

export default Espacio_DeportivoEncargado;
