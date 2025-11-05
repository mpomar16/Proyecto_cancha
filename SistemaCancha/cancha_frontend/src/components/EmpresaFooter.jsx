// src/components/EmpresaFooter.jsx
import { Mail, Phone, MapPin } from "lucide-react";

const DEFAULT_BASE = "http://localhost:3000";

function resolveUrl(path, baseUrl = DEFAULT_BASE) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path; // ya es absoluta
  return `${baseUrl}${path}`;                   // relativa -> anteponer base
}

function EmpresaFooter({ data, baseUrl = DEFAULT_BASE }) {
  // No usamos hooks, así que este return temprano no rompe reglas
  if (!data) return <div>Cargando...</div>;

  const logoSrc = resolveUrl(data.logo_imagen, baseUrl);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-azul-950 text-gris-200 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 grid gap-12 md:grid-cols-2 lg:grid-cols-5">

        {/* Logo + texto + redes */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 text-blanco-50 text-lg font-bold">
            {logoSrc && (
              <img
                src={logoSrc}
                alt="Logo"
                className="h-8 w-8 object-cover rounded-full"
                onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
              />
            )}
            <span>{data.nombre_sistema || "PlayPass"}</span>
          </div>

          <p className="text-sm text-blanco-50 mt-4 max-w-xs">
            {data.quienes_somos || "Reserva online, accede con QR."}
          </p>

          {/* Redes sociales (placeholders) */}
          <div className="mt-16 flex space-x-4">
            <a href="#" className="text-verde-600 transition-colors">
              {/* Facebook */}
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2c0-2 1.2-3 3-3 .9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.7h2.6l-.4 3h-2.2v7A10 10 0 0 0 22 12" />
              </svg>
            </a>
            <a href="#" className="text-verde-600 transition-colors">
              {/* X / Twitter */}
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
            <a href="#" className="text-verde-600 hover:text-verde-600 transition-colors">
              {/* Instagram */}
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.5-.9a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z" />
              </svg>
            </a>
            <a href="#" className="text-verde-600 hover:text-verde-600 transition-colors">
              {/* YouTube */}
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.5 6.2s-.2-1.6-.8-2.3c-.7-.8-1.5-.8-1.9-.9C18.2 2.7 12 2.7 12 2.7h0s-6.2 0-8.8.3c-.4 0-1.2.1-1.9.9-.6.7-.8 2.3-.8 2.3S0 8.2 0 10.2v1.6c0 2 .2 4 .2 4s.2 1.6.8 2.3c.7.8 1.6.8 2 1 1.5.1 6.5.3 8.8.3s7.3 0 8.8-.3c.4 0 1.2-.1 1.9-.9.6-.7.8-2.3.8-2.3s.2-2 .2-4V10c0-2-.2-3.9-.2-3.9zM9.5 14.6V8.7l5.7 2.9-5.7 3z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Columnas de links */}
        <div>
          <h3 className="font-semibold text-blanco-50">Enlaces Rápidos</h3>
          <ul className="mt-4 space-y-2 text-gris-200 text-sm">
            <li><a href="/" className="hover:text-verde-600">Inicio</a></li>
            <li><a href="#empresa" className="hover:text-verde-600">Compañía</a></li>
            <li><a href="#contactos" className="hover:text-verde-600">Contactos</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-blanco-50">Servicios</h3>
          <ul className="mt-4 space-y-2 text-gris-200 text-sm">
            <li><a href="/login" className="hover:text-verde-600">Comenzar Reserva</a></li>
            <li><a href="/registro" className="hover:text-verde-600">Publicar mi Espacio Deportivo</a></li>
          </ul>
        </div>

        {/* Contactos dinámicos */}
        <div>
          <h3 className="font-semibold text-blanco-50">Contactos</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {data.correo_empresa && (
              <li>
                <a href={`mailto:${data.correo_empresa}`} className="flex items-center gap-2 hover:text-verde-600">
                  <Mail size={20} /> {data.correo_empresa}
                </a>
              </li>
            )}
            {data.telefono && (
              <li>
                <a href={`tel:${data.telefono}`} className="flex items-center gap-2 hover:text-verde-600">
                  <Phone size={20} /> {data.telefono}
                </a>
              </li>
            )}
            {data.direccion && (
              <li className="flex items-center gap-2 hover:text-verde-600">
                <MapPin size={20} /> {data.direccion}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="mx-10 mt-12 border-t border-verde-600/80 pt-6 text-center text-sm text-gris-200">
        Copyright © {year} {data.nombre_sistema || "PlayPass"}
      </div>
    </footer>
  );
}

export default EmpresaFooter;
