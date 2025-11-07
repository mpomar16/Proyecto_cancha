// config/mail.js  (puedes versionarlo si usas credenciales de prueba)
module.exports = {
  ENABLED: true,                                     // pon en false si no quieres enviar realmente
  HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  PORT: Number(process.env.SMTP_PORT || 587),
  SECURE: (process.env.SMTP_SECURE || 'false') === 'true', // false para 587
  USER: process.env.SMTP_USER || 'michelona1682xd@gmail.com',    // usa App Password si es Gmail
  PASS: process.env.SMTP_PASS || 'wrjpkorlmonopyuk',
  FROM: process.env.MAIL_FROM || 'Cancha App <no-reply@cancha.local>',
  ADMIN_TO: process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@tuapp.local'
};
