import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const PagosCliente = ({ idReserva, saldoPendienteInicial }) => {
  const [pagos, setPagos] = useState([]);
  const [saldoPendiente, setSaldoPendiente] = useState(
    Number(saldoPendienteInicial || 0)
  );

  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("transferencia");

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("default");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const backendLimit = 1000;
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSaldoPendiente(Number(saldoPendienteInicial || 0));
  }, [saldoPendienteInicial]);

  const fetchPagos = async (search = "", filtro = "default") => {
    if (!idReserva) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let resp;

      if (search) {
        resp = await api.get("/pago/buscar", {
          params: {
            q: search,
            limit: backendLimit,
            offset: 0
          }
        });
      } else if (filtro !== "default") {
        resp = await api.get("/pago/filtro", {
          params: {
            tipo: filtro,
            limit: backendLimit,
            offset: 0
          }
        });
      } else {
        resp = await api.get("/pago/datos-especificos", {
          params: {
            limit: backendLimit,
            offset: 0
          }
        });
      }

      if (!resp.data?.exito) {
        const msg = resp.data?.mensaje || "No se pudieron cargar los pagos";
        setError(msg);
        setPagos([]);
        setTotal(0);
      } else {
        const datos = resp.data?.datos || {};
        const todos = datos.pagos || [];
        const filtrados = todos.filter(
          (p) => p.id_reserva === Number(idReserva)
        );
        setPagos(filtrados);
        setTotal(filtrados.length);
        setCurrentPage(1);
      }
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.message ||
        "Error de conexion al cargar pagos";
      setError(msg);
      setPagos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idReserva) {
      fetchPagos(searchTerm, filter);
    }
  }, [idReserva, filter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPagos(searchTerm, filter);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleMontoChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setMonto("");
      return;
    }
    const n = Number(value);
    if (Number.isNaN(n) || n <= 0) {
      setMonto("");
      return;
    }
    if (saldoPendiente > 0 && n > saldoPendiente) {
      setMonto(String(saldoPendiente));
    } else {
      setMonto(value);
    }
  };

  const handleCrearPago = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!idReserva) {
      setError("No se encontro la reserva");
      return;
    }

    const n = Number(monto);
    if (!n || Number.isNaN(n) || n <= 0) {
      setError("El monto debe ser un numero positivo");
      return;
    }

    if (saldoPendiente > 0 && n > saldoPendiente) {
      setError("El monto no puede ser mayor al saldo pendiente");
      return;
    }

    try {
      setSaving(true);
      const body = {
        id_reserva: idReserva,
        monto: n,
        metodo_pago: metodo
      };
      const resp = await api.post("/pago", body);
      if (!resp.data?.exito || !resp.data?.datos?.pago) {
        const msg = resp.data?.mensaje || "No se pudo registrar el pago";
        setError(msg);
      } else {
        const nuevoSaldo =
          saldoPendiente > 0
            ? Math.max(0, saldoPendiente - n)
            : saldoPendiente;
        setSaldoPendiente(nuevoSaldo);
        setMonto("");
        setSuccess("Pago registrado");
        fetchPagos(searchTerm, filter);
      }
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.message ||
        "Error al registrar el pago";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pagosPagina = pagos.slice(start, end);

  return (
    <div className="border border-[#E2E8F0] rounded-xl p-4 md:p-5 bg-[#FFF]">
      <h2 className="text-xl md:text-2xl font-bold text-[#0F2634] mb-4">
        Pagos de la reserva
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-sm text-[#64748B] mb-1">Saldo pendiente</p>
          <p className="text-lg font-semibold text-[#0F2634]">
            Bs. {saldoPendiente}
          </p>
        </div>
        <form
          onSubmit={handleCrearPago}
          className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label className="block text-sm text-[#64748B] mb-1">
              Monto a pagar
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              max={saldoPendiente > 0 ? saldoPendiente : undefined}
              value={monto}
              onChange={handleMontoChange}
              className="w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm text-[#0F2634]"
              placeholder={
                saldoPendiente > 0
                  ? `Hasta Bs. ${saldoPendiente}`
                  : "Sin saldo pendiente"
              }
              disabled={saldoPendiente <= 0}
            />
          </div>
          <div>
            <label className="block text-sm text-[#64748B] mb-1">
              Metodo de pago
            </label>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              className="w-full border border-[#CBD5E1] rounded-md px-3 py-2 text-sm text-[#0F2634]"
            >
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="efectivo">Efectivo</option>
              <option value="QR">QR</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving || saldoPendiente <= 0}
            className={
              "w-full px-4 py-2 rounded-md text-sm font-semibold text-white " +
              (saving || saldoPendiente <= 0
                ? "bg-[#94A3B8] cursor-not-allowed"
                : "bg-[#01CD6C] hover:bg-[#00b359] shadow-md hover:shadow-lg transition-all")
            }
          >
            {saving ? "Guardando..." : "Registrar pago"}
          </button>
        </form>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <form
          onSubmit={handleSearchSubmit}
          className="w-full md:w-2/3 flex gap-2"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, cancha o metodo de pago"
            className="flex-1 border border-[#CBD5E1] rounded-md px-3 py-2 text-sm text-[#23475F]"
          />
          <select
            value={filter}
            onChange={handleFilterChange}
            className="border border-[#CBD5E1] rounded-md px-3 py-2 text-sm text-[#23475F]"
          >
            <option value="default">Sin filtro</option>
            <option value="fecha">Ordenar por fecha</option>
            <option value="monto">Ordenar por monto</option>
            <option value="metodo">Ordenar por metodo</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-[#01CD6C] text-white text-sm font-semibold hover:bg-[#00b359] transition-all"
          >
            Buscar
          </button>
        </form>
      </div>

      {loading && (
        <div className="mb-4 text-sm text-[#23475F]">
          Cargando pagos...
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded">
          {success}
        </div>
      )}

      {pagos.length === 0 && !loading && !error && (
        <div className="text-center text-[#64748B] py-6">
          No se registraron pagos para esta reserva
        </div>
      )}

      {pagos.length > 0 && (
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#F1F5F9] text-[#0F2634]">
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Monto</th>
                <th className="px-3 py-2 text-left">Metodo</th>
                <th className="px-3 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagosPagina.map((p) => (
                <tr
                  key={p.id_pago}
                  className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]"
                >
                  <td className="px-3 py-2">
                    {p.fecha_pago
                      ? String(p.fecha_pago).substring(0, 10)
                      : "-"}
                  </td>
                  <td className="px-3 py-2">Bs. {p.monto}</td>
                  <td className="px-3 py-2">{p.metodo_pago}</td>
                  <td className="px-3 py-2">
                    <Link
                      to={`/comprobante-pago/${p.id_pago}`}
                      className="inline-block px-3 py-1 rounded-md bg-[#0F2634] text-white text-xs font-semibold hover:bg-[#01CD6C] transition-all"
                    >
                      Comprobante
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={
              "px-3 py-1 rounded-md text-sm " +
              (currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#23475F] text-white hover:bg-[#01CD6C]")
            }
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={
                "px-3 py-1 rounded-md text-sm " +
                (p === currentPage
                  ? "bg-[#01CD6C] text-white"
                  : "bg-[#E2E8F0] text-[#0F2634] hover:bg-[#CBD5E1]")
              }
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={
              "px-3 py-1 rounded-md text-sm " +
              (currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#23475F] text-white hover:bg-[#01CD6C]")
            }
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default PagosCliente;
