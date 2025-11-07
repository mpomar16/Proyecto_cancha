const nodemailer = require('nodemailer');
const mailCfg = require('../config/mail');

let transporter = null;
if (mailCfg.ENABLED) {
  transporter = nodemailer.createTransport({
    host: mailCfg.HOST,
    port: mailCfg.PORT,
    secure: mailCfg.SECURE,
    auth: { user: mailCfg.USER, pass: mailCfg.PASS },
  });
}

async function sendMail({ to, subject, html, text }) {
  if (!mailCfg.ENABLED) {
    console.log('[MAIL DISABLED] ->', { to, subject });
    return;
  }
  await transporter.sendMail({
    from: mailCfg.FROM,
    to,
    subject,
    text,
    html,
  });
}

async function notifyAdminNuevaSolicitud({ id_solicitud, id_usuario, id_espacio, usuario, correo, espacio_nombre }) {
  const subject = 'Nueva solicitud para Admin de Espacio Deportivo';
  const html = `
    <h3>Nueva solicitud</h3>
    <ul>
      <li><b>ID Solicitud:</b> ${id_solicitud}</li>
      <li><b>Usuario:</b> ${usuario || id_usuario} (${correo || '-'})</li>
      <li><b>Espacio:</b> ${espacio_nombre || id_espacio}</li>
    </ul>
    <p>Ingresa al panel de administración para aprobar o rechazar.</p>
  `;
  await sendMail({ to: mailCfg.ADMIN_TO, subject, html });
}

async function notifyUsuarioResultado({ to, aprobado, usuario, espacio_nombre, comentario }) {
  const subject = aprobado
    ? 'Tu solicitud fue APROBADA'
    : 'Tu solicitud fue RECHAZADA';
  const html = aprobado
    ? `<p>¡Hola ${usuario || ''}!</p>
       <p>Tu solicitud para administrar <b>${espacio_nombre || 'el espacio'}</b> fue <b>APROBADA</b>.</p>
       <p>Ya puedes iniciar sesión con el rol <b>admin_esp_dep</b>.</p>`
    : `<p>Hola ${usuario || ''},</p>
       <p>Tu solicitud para administrar <b>${espacio_nombre || 'el espacio'}</b> fue <b>RECHAZADA</b>.</p>
       ${comentario ? `<p>Motivo: ${comentario}</p>` : ''}`;
  await sendMail({ to, subject, html });
}

module.exports = {
  sendMail,
  notifyAdminNuevaSolicitud,
  notifyUsuarioResultado,
};
