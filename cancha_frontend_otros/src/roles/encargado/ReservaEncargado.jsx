/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */

import React, { useState, useEffect } from "react";
import api from "../../services/api";

const readUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
};

const readTokenPayload = () => {
    try {
        const t = localStorage.getItem("token");
        if (!t || t.split(".").length !== 3) return {};
        const p = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const pad = "=".repeat((4 - (p.length % 4)) % 4);
        return JSON.parse(atob(p + pad));
    } catch { return {}; }
};

const ReservaEncargado = () => {
    const [reservas, setReservas] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [searchTerm, setSearchTerm] = useState("");
    const [filtro, setFiltro] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [detalle, setDetalle] = useState(null); // info + horarios

    const fetchReservas = async (params = {}) => {
        setLoading(true);
        setError(null);
        const offset = (page - 1) * limit;

        try {
            let resp;

            if (params.q)
                resp = await api.get("/reserva-encargado/buscar", {
                    params: { q: params.q, limit, offset },
                });
            else if (params.tipo)
                resp = await api.get("/reserva-encargado/filtro", {
                    params: { tipo: params.tipo, limit, offset },
                });
            else
                resp = await api.get("/reserva-encargado/datos-especificos", {
                    params: { limit, offset },
                });

            if (resp.data?.exito) {
                setReservas(resp.data.reservas || resp.data.datos?.reservas || []);
                setTotal(resp.data.total || resp.data.datos?.total || 0);
            } else {
                setError(resp.data?.mensaje || "Error al cargar reservas");
            }
        } catch (e) {
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservas();
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        if (searchTerm.trim()) fetchReservas({ q: searchTerm });
        else fetchReservas();
    };

    const handleFiltro = (e) => {
        const v = e.target.value;
        setFiltro(v);
        setPage(1);
        if (v) fetchReservas({ tipo: v });
        else fetchReservas();
    };

    const openModal = async (id) => {
        setLoading(true);
        try {
            const r = await api.get(`/reserva-encargado/dato-individual/${id}`);
            if (r.data?.exito) {
                setDetalle(r.data.datos);

                setModalOpen(true);
            } else setError("No se pudo cargar detalle");
        } catch (e) {
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setDetalle(null);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reservas de mis espacios</h2>

            {/* BUSQUEDA / FILTRO */}
            <div className="flex flex-col xl:flex-row gap-4 mb-6 items-stretch">
                <div className="flex-1">
                    <form onSubmit={handleSearch} className="flex h-full">
                        <input
                            type="text"
                            placeholder="Buscar por cancha, cliente o estado"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border rounded-l px-4 py-2 w-full"
                        />
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 whitespace-nowrap">
                            Buscar
                        </button>
                    </form>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <select
                        value={filtro}
                        onChange={handleFiltro}
                        className="border rounded px-3 py-2 sm:min-w-[200px]"
                    >
                        <option value="">Todos - sin filtro</option>
                        <option value="fecha">Por fecha</option>
                        <option value="monto">Por monto</option>
                        <option value="estado">Por estado</option>
                        <option value="cancha">Por cancha</option>
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
                                    <th className="px-4 py-2 text-left">Cliente</th>
                                    <th className="px-4 py-2 text-left">Cancha</th>
                                    <th className="px-4 py-2 text-left">Fecha</th>
                                    <th className="px-4 py-2 text-left">Monto</th>
                                    <th className="px-4 py-2 text-left">Saldo</th>
                                    <th className="px-4 py-2 text-left">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {reservas.map((r, i) => (
                                    <tr key={r.id_reserva} className="border-t">
                                        <td className="px-4 py-2">{(page - 1) * limit + i + 1}</td>
                                        <td className="px-4 py-2">
                                            {r.cliente_nombre} {r.cliente_apellido}
                                        </td>
                                        <td className="px-4 py-2">{r.nombre_cancha}</td>
                                        <td className="px-4 py-2">{r.fecha_reserva?.split("T")[0]}</td>
                                        <td className="px-4 py-2">{r.monto_total}</td>
                                        <td className="px-4 py-2">{r.saldo_pendiente}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => openModal(r.id_reserva)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                Ver datos
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {reservas.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-gray-500">
                                            No hay reservas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-l hover:bg-gray-400 disabled:opacity-50"
                        >
                            Anterior
                        </button>

                        <span className="px-4 py-2 bg-gray-100">
                            Página {page} de {Math.ceil(total / limit)}
                        </span>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === Math.ceil(total / limit)}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-r hover:bg-gray-400 disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </>
            )}

            {/* MODAL DETALLE */}
            {modalOpen && detalle && detalle.info && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow max-w-lg w-full">
                        <h3 className="text-xl font-semibold mb-4">Detalle de Reserva</h3>

                        <p><strong>Cliente:</strong> {detalle.info.cliente_nombre} {detalle.info.cliente_apellido}</p>
                        <p><strong>Cancha:</strong> {detalle.info.nombre_cancha}</p>
                        <p><strong>Fecha:</strong> {detalle.info.fecha_reserva?.split("T")[0]}</p>
                        <p><strong>Fecha:</strong> {detalle.info.fecha_reserva?.split("T")[0]}</p>
                        <p><strong>Cupo:</strong> {detalle.info.cupo}</p>
                        <p><strong>Monto total:</strong> {detalle.info.monto_total}</p>
                        <p><strong>Saldo pendiente:</strong> {detalle.info.saldo_pendiente}</p>
                        <p><strong>Estado:</strong> {detalle.info.estado}</p>

                        <h4 className="text-lg font-semibold mt-4 mb-2">Horarios</h4>
                        <ul className="border p-3 rounded space-y-2 max-h-48 overflow-y-auto">
                            {detalle.horarios.map((h, idx) => (
                                <li key={idx} className="border-b pb-2">
                                    <p><strong>Inicio:</strong> {h.hora_inicio}</p>
                                    <p><strong>Fin:</strong> {h.hora_fin}</p>
                                </li>
                            ))}
                        </ul>

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

export default ReservaEncargado;
