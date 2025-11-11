/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

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

const CalendarioReservasAdmin = () => {
  const u = readUser();
  const p = readTokenPayload();
  const idAdminEspDep = resolveAdminId(u, p);
  const location = useLocation();
  const navigate = useNavigate();
  const qs = new URLSearchParams(location.search);
  const qsEspacio = qs.get('espacio');
  const qsCancha = qs.get('cancha');

  const [espacios, setEspacios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [espacioSel, setEspacioSel] = useState('');
  const [canchaSel, setCanchaSel] = useState('');

  const calRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!idAdminEspDep) return;
      const [e, c] = await Promise.all([
        api.get('/espacio-admin/mis-espacios', { params: { id_admin_esp_dep: idAdminEspDep } }),
        api.get('/cancha-admin/datos-especificos', { params: { id_admin_esp_dep: idAdminEspDep } })
      ]);
      const es = e.data?.datos?.espacios || [];
      const cs = c.data?.datos?.canchas || [];
      setEspacios(es);
      setCanchas(cs);
      if (qsEspacio) setEspacioSel(String(qsEspacio));
      if (qsCancha) setCanchaSel(String(qsCancha));
    };
    fetchData();
  }, [idAdminEspDep]);

  useEffect(() => {
    if (canchaSel) return;
    if (qsCancha) setCanchaSel(String(qsCancha));
  }, [canchas]);

  const headerToolbar = useMemo(() => ({
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  }), []);

  const filteredCanchas = useMemo(() => {
    if (!espacioSel) return canchas;
    return canchas.filter(x => String(x.id_espacio) === String(espacioSel));
  }, [canchas, espacioSel]);

  const refetch = () => {
    const apiCal = calRef.current?.getApi?.();
    if (apiCal) apiCal.refetchEvents();
  };

  const onEspacioChange = (e) => {
    const v = e.target.value;
    setEspacioSel(v);
    setCanchaSel('');
    refetch();
  };

  const onCanchaChange = (e) => {
    const v = e.target.value;
    setCanchaSel(v);
    refetch();
  };

  const eventsFn = async (info, success, failure) => {
    try {
      const params = {
        id_admin_esp_dep: idAdminEspDep,
        start: info.startStr,
        end: info.endStr
      };
      if (espacioSel) params.id_espacio = espacioSel;
      if (canchaSel) params.id_cancha = canchaSel;
      const r = await api.get('/reserva-admin/calendario', { params });
      if (!r.data?.exito) return failure(new Error('error'));
      const eventos = (r.data.datos?.eventos || []).map(ev => ({
        id: String(ev.id_horario),
        title: `#${ev.id_reserva} ${ev.cancha_nombre} - ${ev.cliente_nombre} ${ev.cliente_apellido}`,
        start: ev.start_ts,
        end: ev.end_ts,
        backgroundColor: ev.color,
        borderColor: ev.color,
        extendedProps: {
          canchaId: ev.id_cancha,
          espacioId: ev.id_espacio,
          reservaId: ev.id_reserva,
          horarioId: ev.id_horario,
          estado: ev.estado
        }
      }));
      success(eventos);
    } catch (e) {
      failure(e);
    }
  };

  const onEventClick = (arg) => {
    const idReserva = arg.event.extendedProps?.reservaId;
    if (idReserva) navigate(`/administrador/reserva?id_reserva=${idReserva}`);
    };


  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Calendario de Reservas</h2>
        <div className="flex gap-2">
          <select value={espacioSel} onChange={onEspacioChange} className="border rounded px-3 py-2">
            <option value="">Todos los espacios</option>
            {espacios.map(e => (
              <option key={e.id_espacio} value={String(e.id_espacio)}>{e.nombre}</option>
            ))}
          </select>
          <select value={canchaSel} onChange={onCanchaChange} className="border rounded px-3 py-2">
            <option value="">Todas las canchas</option>
            {filteredCanchas.map(c => (
              <option key={c.id_cancha} value={String(c.id_cancha)}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>
      <FullCalendar
        ref={calRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={headerToolbar}
        weekends={true}
        nowIndicator={true}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        locale="es"
        events={eventsFn}
        eventClick={onEventClick}
        height="auto"
      />
    </div>
  );
};

export default CalendarioReservasAdmin;
