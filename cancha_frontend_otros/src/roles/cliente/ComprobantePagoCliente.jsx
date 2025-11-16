/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import Header from "../../Header";

const ComprobantePagoCliente = () => {
  const { idPago } = useParams();

  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPago = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await api.get(`/pago/dato-individual/${idPago}`);
        const ok = resp.data?.exito;
        const datos = resp.data?.datos || {};
        const p = datos.pago || datos || null;

        if (!ok || !p) {
          const msg = resp.data?.mensaje || "No se encontro el pago";
          setError(msg);
          setLoading(false);
          return;
        }

        setPago(p);
      } catch (err) {
        const msg =
          err.response?.data?.mensaje ||
          err.message ||
          "Error al cargar el pago";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (idPago) {
      fetchPago();
    } else {
      setLoading(false);
      setError("Identificador de pago no valido");
    }
  }, [idPago]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F7FA] pt-32 px-4 pb-10">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F2634] mb-4 text-center">
            Comprobante de pago
          </h1>

          {loading && (
            <div className="text-center text-[#23475F]">
              Cargando informacion del pago...
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded text-center">
              {error}
            </div>
          )}

          {!loading && !error && pago && (
            <div className="space-y-4">
              <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC]">
                <p className="text-xs text-[#94A3B8] mb-1">
                  Numero de comprobante
                </p>
                <p className="text-lg font-semibold text-[#0F2634]">
                  CP-{String(pago.id_pago).padStart(6, "0")}
                </p>
              </div>

              <div className="border border-[#E2E8F0] rounded-xl p-4">
                <h2 className="text-sm font-semibold text-[#0F2634] mb-2">
                  Datos del pago
                </h2>
                <div className="space-y-1 text-sm text-[#0F2634]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Fecha:</span>
                    <span>
                      {pago.fecha_pago
                        ? String(pago.fecha_pago).substring(0, 10)
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Metodo de pago:</span>
                    <span>{pago.metodo_pago}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Monto:</span>
                    <span className="font-semibold text-[#01CD6C]">
                      Bs. {pago.monto}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-[#E2E8F0] rounded-xl p-4">
                <h2 className="text-sm font-semibold text-[#0F2634] mb-2">
                  Datos de la reserva
                </h2>
                <div className="space-y-1 text-sm text-[#0F2634]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Codigo de reserva:</span>
                    <span>#{pago.id_reserva}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Cancha:</span>
                    <span>{pago.cancha_nombre || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="border border-[#E2E8F0] rounded-xl p-4">
                <h2 className="text-sm font-semibold text-[#0F2634] mb-2">
                  Cliente responsable
                </h2>
                <div className="space-y-1 text-sm text-[#0F2634]">
                  <div>
                    <span className="text-[#64748B]">Nombre: </span>
                    <span>
                      {pago.cliente_nombre} {pago.cliente_apellido}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748B]">Correo: </span>
                    <span>{pago.cliente_correo || "-"}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#94A3B8] text-center mt-2">
                Este comprobante es valido solo si el pago figura como
                registrado en el sistema del espacio deportivo.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 px-4 py-2 rounded-md bg-[#01CD6C] text-white text-sm font-semibold hover:bg-[#00b359] transition-all"
                >
                  Imprimir o guardar PDF
                </button>
                <Link
                  to={-1}
                  className="flex-1 text-center px-4 py-2 rounded-md bg-[#E2E8F0] text-[#0F2634] text-sm font-semibold hover:bg-[#CBD5E1] transition-all"
                >
                  Volver
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ComprobantePagoCliente;
