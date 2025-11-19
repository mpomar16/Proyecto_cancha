/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";

// normalizador
const norm = (v) =>
  String(v || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

// leer usuario
const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// leer token
const readTokenPayload = () => {
  try {
    const t = localStorage.getItem("token");
    if (!t || t.split(".").length !== 3) return {};
    const b = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (b.length % 4)) % 4);
    return JSON.parse(atob(b + pad));
  } catch {
    return {};
  }
};

const pickRole = (u, p) => {
  const bag = new Set();
  const arr = Array.isArray(u?.roles)
    ? u.roles
    : u?.role
    ? [u.role]
    : [];
  arr.forEach((r) =>
    bag.add(
      norm(typeof r === "string" ? r : r?.rol || r?.role || r?.nombre || r?.name)
    )
  );
  const parr = Array.isArray(p?.roles)
    ? p.roles
    : p?.rol
    ? [p.rol]
    : [];
  parr.forEach((r) => bag.add(norm(r)));
  const list = Array.from(bag);

  if (list.includes("ADMIN_ESP_DEP")) return "ADMIN_ESP_DEP";
  if (list.includes("ADMIN") || list.includes("ADMINISTRADOR"))
    return "ADMINISTRADOR";
  return list[0] || "DEFAULT";
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
  if (!text) return "-";
  const s = String(text);
  return s.length <= max ? s : s.slice(0, max) + "...";
};

// formato fecha dd/mm/yyyy
const formatDateDdMmYyyy = (value) => {
  if (!value) return "";
  const s = String(value);
  if (s.length < 10) return "";
  const part = s.slice(0, 10);
  const [yyyy, mm, dd] = part.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${dd}/${mm}/${yyyy}`;
};

const ControlAdmin = () => {
  const [role, setRole] = useState(null);
  const [idAdminEspDep, setIdAdminEspDep] = useState(null);
  const [controladores, setControladores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentControl, setCurrentControl] = useState(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const limit = 10;

  useEffect(() => {
    const u = readUser();
    const p = readTokenPayload();
    const r = pickRole(u, p);
    const idGuess = resolveAdminId(u, p);

    setRole(r);
    setIdAdminEspDep(idGuess);
  }, []);

  const permissions =
    permissionsConfig[role || "DEFAULT"] || permissionsConfig.DEFAULT;

  const fetchControladores = async (extraParams = {}) => {
    if (!permissions.canView) {
      setError("No tienes permisos");
      return;
    }
    if (!idAdminEspDep) return;

    setLoading(true);
    setError("");

    const offset = (page - 1) * limit;

    const baseParams = {
      id_admin_esp_dep: idAdminEspDep,
      limit,
      offset,
    };

    const fullParams = { ...baseParams, ...extraParams };

    try {
      let r;
      if (extraParams.q) {
        r = await api.get("/control-admin/buscar", { params: fullParams });
      } else if (extraParams.tipo) {
        r = await api.get("/control-admin/filtro", { params: fullParams });
      } else {
        r = await api.get("/control-admin/datos-especificos", {
          params: fullParams,
        });
      }

      if (r.data?.exito) {
        const d = r.data.datos || {};
        setControladores(d.controladores || []);
        setTotal(d.total || 0);
      } else {
        setError(r.data?.mensaje || "Error al cargar");
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || "Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role && idAdminEspDep) {
      fetchControladores({});
    }
  }, [role, idAdminEspDep, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);

    if (searchTerm.trim()) {
      fetchControladores({ q: searchTerm.trim() });
    } else {
      fetchControladores({});
    }
  };

  const handleFiltroChange = (e) => {
    const tipo = e.target.value;
    setFiltro(tipo);
    setPage(1);

    if (tipo) {
      fetchControladores({ tipo });
    } else {
      fetchControladores({});
    }
  };

  const openViewModal = async (id) => {
    try {
      const r = await api.get(`/control-admin/dato-individual/${id}`, {
        params: { id_admin_esp_dep: idAdminEspDep },
      });

      if (r.data?.exito) {
        setCurrentControl(r.data.datos?.controlador || {});
        setModalOpen(true);
      } else {
        setError(r.data?.mensaje || "No se pudo cargar");
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || "Error de conexion");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentControl(null);
  };

  const handlePageChange = (newPage) => {
    const maxPage = Math.ceil(total / limit) || 1;
    if (newPage >= 1 && newPage <= maxPage) {
      setPage(newPage);
    }
  };

  if (!role) return <p>Cargando permisos...</p>;
  if (!permissions.canView) return <p>No tienes permisos.</p>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        Gestion de controladores (General)
      </h2>

      {/* Busqueda y filtro */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 items-stretch">
        <div className="flex-1">
          <form onSubmit={handleSearch} className="flex h-full">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-4 py-2 w-full rounded-l"
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600">
              Buscar
            </button>
          </form>
        </div>

        <select
          value={filtro}
          onChange={handleFiltroChange}
          className="border rounded px-3 py-2 sm:min-w-[200px]"
        >
          <option value="">Sin filtro</option>
          <option value="nombre">Ordenar por nombre</option>
          <option value="apellido">Ordenar por apellido</option>
          <option value="correo">Ordenar por correo</option>
          <option value="fecha">Ordenar por fecha de asignacion</option>
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <p>Cargando controladores...</p>
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
                  <th className="px-4 py-2 text-left">Correo</th>
                  <th className="px-4 py-2 text-left">F. Asignacion</th>
                  <th className="px-4 py-2 text-left">Espacio</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {controladores.map((x, i) => (
                  <tr key={x.id_control} className="border-t">
                    <td className="px-4 py-2">{(page - 1) * limit + i + 1}</td>
                    <td className="px-4 py-2">
                      {x.nombre} {x.apellido}
                    </td>
                    <td className="px-4 py-2">{x.correo || "-"}</td>
                    <td className="px-4 py-2">
                      {formatDateDdMmYyyy(x.fecha_asignacion)}
                    </td>
                    <td className="px-4 py-2">{x.espacio_nombre || "-"}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openViewModal(x.id_control)}
                        className="text-green-500 hover:text-green-700"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
                {controladores.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Sin datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginacion */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="bg-gray-300 px-4 py-2 rounded-l disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-100">
              Pagina {page} de {Math.ceil(total / limit) || 1}
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

      {/* Modal */}
      {modalOpen && currentControl && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">
              Detalle del controlador
            </h3>

            <div className="space-y-2 text-sm">
              <p>
                <strong>ID:</strong> {currentControl.id_control}
              </p>
              <p>
                <strong>Nombre:</strong> {currentControl.nombre}{" "}
                {currentControl.apellido}
              </p>
              <p>
                <strong>Correo:</strong> {currentControl.correo || "-"}
              </p>
              <p>
                <strong>Fecha asignacion:</strong>{" "}
                {formatDateDdMmYyyy(currentControl.fecha_asignacion) || "-"}
              </p>
              <p>
                <strong>Espacio:</strong> {currentControl.espacio_nombre || "-"}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                {currentControl.estado ? "Activo" : "Inactivo"}
              </p>
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

export default ControlAdmin;
