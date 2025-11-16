/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import Header from "../../Header";

const UnirseReserva = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const code = searchParams.get("code") || "";

  const [user, setUser] = useState(null);
  const [idPersona, setIdPersona] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [reserva, setReserva] = useState(null);
  const [puedeUnirse, setPuedeUnirse] = useState(false);
  const [yaUnido, setYaUnido] = useState(false);
  const [cupoLleno, setCupoLleno] = useState(false);

  const [mustLogin, setMustLogin] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (!data) {
      setMustLogin(true);
      setLoading(false);
      return;
    }
    try {
      const u = JSON.parse(data);
      setUser(u);

      let personaId = null;
      if (u.id_persona) {
        personaId = u.id_persona;
      } else if (Array.isArray(u.roles)) {
        const r = u.roles.find(
          item => item && item.datos && item.datos.id_persona
        );
        if (r) {
          personaId = r.datos.id_persona;
        }
      }

      if (personaId) {
        setIdPersona(personaId);
        setMustLogin(false);
      } else {
        setMustLogin(true);
      }
    } catch (e) {
      setMustLogin(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInfo = async () => {
    if (!code) {
      setError("Codigo no valido");
      setLoading(false);
      return;
    }
    if (!idPersona) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const params = { code, id_persona: idPersona };

      const resp = await api.get("/unirse-reserva/info", { params });
      if (!resp.data?.exito) {
        const msg = resp.data?.mensaje || "No se pudo obtener la informacion";
        setError(msg);
        setReserva(null);
      } else {
        const datos = resp.data.datos || {};
        setReserva(datos.reserva || null);
        setPuedeUnirse(Boolean(datos.puede_unirse));
        setYaUnido(Boolean(datos.ya_unido));
        setCupoLleno(Boolean(datos.cupo_lleno));
      }
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.message ||
        "Error al consultar la reserva";
      setError(msg);
      setReserva(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!code) return;
    if (mustLogin) return;
    if (!idPersona) return;
    fetchInfo();
  }, [code, idPersona, mustLogin]);

  const handleJoin = async () => {
    if (!user || !idPersona) {
      setError("Debe iniciar sesion para unirse a la reserva");
      return;
    }
    if (!code) {
      setError("Codigo no valido");
      return;
    }

    try {
      setLoadingJoin(true);
      setError(null);
      setSuccess(null);

      const resp = await api.post("/unirse-reserva", {
        code,
        id_persona: idPersona
      });

      if (!resp.data?.exito) {
        const msg = resp.data?.mensaje || "No se pudo unir a la reserva";
        setError(msg);
      } else {
        const datos = resp.data.datos || {};
        if (datos.reserva) {
          setReserva(datos.reserva);
        }
        setSuccess("Inscripcion a la reserva completada");
        setYaUnido(true);
        setPuedeUnirse(false);
        setCupoLleno(false);
      }
    } catch (err) {
      const msg =
        err.response?.data?.mensaje ||
        err.message ||
        "Error al unirse a la reserva";
      setError(msg);
    } finally {
      setLoadingJoin(false);
    }
  };

  const handleGoLogin = () => {
    const current = window.location.pathname + window.location.search;
    navigate(`/?redirect=${encodeURIComponent(current)}`);
  };

  const renderEstadoReserva = (estado) => {
    if (!estado) return "-";
    const base =
      "inline-block px-3 py-1 rounded-full text-xs font-semibold ";
    if (estado === "pagada") {
      return (
        <span className={base + "bg-green-100 text-green-700"}>
          {estado}
        </span>
      );
    }
    if (estado === "cancelada") {
      return (
        <span className={base + "bg-red-100 text-red-700"}>
          {estado}
        </span>
      );
    }
    return (
      <span className={base + "bg-yellow-100 text-yellow-700"}>
        {estado}
      </span>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F7FA] pt-32 px-4 pb-10">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F2634]">
              Unirse a reserva
            </h1>
            <Link
              to="/"
              className="text-sm px-3 py-1 rounded-md bg-[#23475F] text-white hover:bg-[#01CD6C] transition-all"
            >
              Volver al inicio
            </Link>
          </div>

          {mustLogin && (
            <div className="mb-4 bg-yellow-50 text-yellow-800 px-4 py-3 rounded text-sm">
              Debe iniciar sesion para ver la informacion de la reserva y unirse.
              <div className="mt-3 flex">
                <button
                  type="button"
                  onClick={handleGoLogin}
                  className="px-4 py-2 rounded-md bg-[#23475F] text-white text-sm font-semibold hover:bg-[#01CD6C] transition-all"
                >
                  Ir a iniciar sesion
                </button>
              </div>
            </div>
          )}

          {!mustLogin && loading && (
            <p className="text-[#23475F] text-sm">
              Cargando informacion de la reserva...
            </p>
          )}

          {!mustLogin && !loading && error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded text-sm mb-4">
              {error}
            </div>
          )}

          {!mustLogin && !loading && success && (
            <div className="bg-green-100 text-green-700 px-4 py-3 rounded text-sm mb-4">
              {success}
            </div>
          )}

          {!mustLogin && !loading && reserva && (
            <div className="space-y-6 mt-2">
              <section className="border border-[#E2E8F0] rounded-xl p-4 md:p-5 bg-[#F8FAFC]">
                <h2 className="text-lg font-semibold text-[#0F2634] mb-3">
                  Datos de la reserva
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#64748B]">Codigo de reserva</p>
                    <p className="font-semibold text-[#0F2634]">
                      #{reserva.id_reserva}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Estado</p>
                    {renderEstadoReserva(reserva.estado)}
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Cancha</p>
                    <p className="font-medium text-[#0F2634]">
                      {reserva.cancha_nombre || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Fecha de reserva</p>
                    <p className="font-medium text-[#0F2634]">
                      {reserva.fecha_reserva
                        ? String(reserva.fecha_reserva).substring(0, 10)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">Cupo maximo</p>
                    <p className="font-medium text-[#0F2634]">
                      {reserva.cupo || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#64748B]">
                      Participantes inscritos
                    </p>
                    <p className="font-medium text-[#0F2634]">
                      {reserva.cupo_ocupado || 0}
                    </p>
                  </div>
                </div>
              </section>

              <section className="border border-[#E2E8F0] rounded-xl p-4 md:p-5">
                <h2 className="text-lg font-semibold text-[#0F2634] mb-3">
                  Cliente responsable
                </h2>
                <p className="text-sm text-[#64748B] mb-1">Nombre</p>
                <p className="font-medium text-[#0F2634]">
                  {reserva.cliente_nombre} {reserva.cliente_apellido}
                </p>
              </section>

              <section className="border border-[#E2E8F0] rounded-xl p-4 md:p-5 bg-[#F8FAFC]">
                <h2 className="text-lg font-semibold text-[#0F2634] mb-3">
                  Estado de union
                </h2>
                {yaUnido && (
                  <p className="text-sm text-green-700 mb-2">
                    Ya esta unido a esta reserva como deportista.
                  </p>
                )}
                {cupoLleno && (
                  <p className="text-sm text-red-600 mb-2">
                    El cupo de la reserva esta lleno.
                  </p>
                )}
                {!yaUnido && reserva.estado === "cancelada" && (
                  <p className="text-sm text-red-600 mb-2">
                    La reserva esta cancelada, no es posible unirse.
                  </p>
                )}
                {!yaUnido &&
                  !cupoLleno &&
                  reserva.estado !== "cancelada" && (
                    <div>
                      <p className="text-sm text-[#64748B] mb-2">
                        Si se une, sus datos quedaran registrados como deportista de esta reserva.
                      </p>
                    </div>
                  )}

                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={
                      !user ||
                      !idPersona ||
                      !puedeUnirse ||
                      loadingJoin
                    }
                    onClick={handleJoin}
                    className={
                      "flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-all " +
                      (user && idPersona && puedeUnirse
                        ? "bg-[#01CD6C] text-white hover:bg-[#00b359]"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed")
                    }
                  >
                    {loadingJoin ? "Procesando..." : "Unirse a la reserva"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/mis-reservas")}
                    className="flex-1 px-4 py-2 rounded-md text-sm font-semibold bg-[#E2E8F0] text-[#0F2634] hover:bg-[#CBD5E1] transition-all"
                  >
                    Ir a mis reservas
                  </button>
                </div>
              </section>
            </div>
          )}

          {!mustLogin && !loading && !error && !reserva && (
            <p className="text-sm text-[#64748B] mt-4">
              No se encontro informacion para este codigo.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default UnirseReserva;
