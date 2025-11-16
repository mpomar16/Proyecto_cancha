const nodemailer = require('nodemailer');
const mailCfg = require('../config/mail');
const pool = require('../config/database');   // <── FALTABA ESTO

let transporter = null;

if (mailCfg.ENABLED) {
  transporter = nodemailer.createTransport({
    host: mailCfg.HOST,
    port: mailCfg.PORT,
    secure: !!mailCfg.SECURE,
    auth: mailCfg.USER && mailCfg.PASS
      ? { user: mailCfg.USER, pass: mailCfg.PASS }
      : undefined
  });
}

async function sendMail({ to, subject, html, text, bcc }) {
  if (!mailCfg.ENABLED) {
    console.log('[MAIL DISABLED]', { to, subject });
    return;
  }

  if (!transporter) {
    console.log('[MAIL ERROR] transporter is null');
    return;
  }

  return transporter.sendMail({
    from: mailCfg.FROM,
    to,
    bcc,
    subject,
    html,
    text
  });
}

// ======================
// ADMIN ESP DEPTO
// ======================
async function notifyAdminNuevaSolicitud({ id_solicitud, usuario, correo, espacio_nombre }) {
  if (!mailCfg.ADMIN_TO) return;

  const subject = 'Nueva solicitud para Admin de Espacio Deportivo';
  const html = `
    <h3>Nueva solicitud para administrar un espacio</h3>
    <p><b>ID Solicitud:</b> ${id_solicitud}</p>
    <p><b>Solicitante:</b> ${usuario} (${correo})</p>
    <p><b>Espacio:</b> ${espacio_nombre}</p>
    <p>Ingrese al panel de administración para aprobar o rechazar.</p>
  `;

  return sendMail({
    to: mailCfg.ADMIN_TO,
    subject,
    html
  });
}

async function notifyUsuarioResultado({ to, aprobado, usuario, espacio_nombre, comentario }) {
  const subject = aprobado
    ? 'Tu solicitud fue aprobada'
    : 'Tu solicitud fue rechazada';

  const html = aprobado
    ? `<p>${usuario}, tu solicitud para <b>${espacio_nombre}</b> fue aprobada.</p>`
    : `<p>${usuario}, tu solicitud para <b>${espacio_nombre}</b> fue rechazada.</p><p>${comentario || ''}</p>`;

  return sendMail({ to, subject, html });
}

// ======================
// ROLES (control / encargado)
// ======================
async function notifyAdminNuevaSolicitudRol({ id_solicitud, rol, id_usuario }) {
  if (!mailCfg.ADMIN_TO) return;

  // obtener usuario real
  const u = await pool.query(
    `SELECT usuario, correo FROM usuario WHERE id_persona=$1`,
    [id_usuario]
  );

  const usuario = u.rows[0]?.usuario || 'Usuario desconocido';
  const correo = u.rows[0]?.correo || 'Sin correo';

  const subject = 'Nueva solicitud de rol en el sistema';

  const html = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">

    <h2 style="margin-bottom: 10px; color: #333;">
      Nueva solicitud de rol
    </h2>

    <p style="margin: 6px 0;">
      <b>ID Solicitud:</b> ${id_solicitud}
    </p>

    <p style="margin: 6px 0;">
      <b>Solicitante:</b> ${usuario} (${correo})
    </p>

    <p style="margin: 6px 0;">
      <b>Rol solicitado:</b> ${rol}
    </p>

    <p style="margin-top: 14px;">
      Ingrese al panel de administración para aprobar o rechazar esta solicitud.
    </p>

  </div>
`;


  return sendMail({
    to: mailCfg.ADMIN_TO,
    subject,
    html
  });
}

async function notifyUsuarioResultadoRol({ to, aprobado, rol, comentario }) {
  const subject = aprobado
    ? `Tu solicitud para ${rol} fue aprobada`
    : `Tu solicitud para ${rol} fue rechazada`;

  const html = aprobado
    ? `<p>Tu solicitud para el rol <b>${rol}</b> fue aprobada.</p>`
    : `<p>Tu solicitud para el rol <b>${rol}</b> fue rechazada.</p><p>${comentario || ''}</p>`;

  return sendMail({ to, subject, html });
}

module.exports = {
  sendMail,
  notifyAdminNuevaSolicitud,
  notifyUsuarioResultado,
  notifyAdminNuevaSolicitudRol,
  notifyUsuarioResultadoRol
};
