// src/components/EmpresaNavbarCasual.jsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const DEFAULT_BASE = "http://localhost:3000";

function resolveImageSrc(logo_imagen, baseUrl = DEFAULT_BASE) {
  if (!logo_imagen) return "";
  // Si ya viene completa (http/https), úsala tal cual
  if (/^https?:\/\//i.test(logo_imagen)) return logo_imagen;
  // Si viene relativa (ej: /uploads/logo.png) anteponer base
  return `${baseUrl}${logo_imagen}`;
}

function EmpresaNavbarCasual({ data, baseUrl = DEFAULT_BASE }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);

  const nombreSistema = data?.nombre_sistema ?? "Mi Sistema";
  const logoSrc = useMemo(
    () => resolveImageSrc(data?.logo_imagen, baseUrl),
    [data?.logo_imagen, baseUrl]
  );

  const handleImageError = (e) => {
    e.target.src = "/default-avatar.png";
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-azul-950 shadow-sm font-poppins z-50">
      <nav className="bg-azul-950 mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo + Nombre */}
        <div className="flex lg:flex-1 items-center">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center">
            {logoSrc && (
              <img
                src={logoSrc}
                alt="Logo"
                className="h-10 w-10 rounded-full object-cover"
                onError={handleImageError}
              />
            )}
            <span className="ml-3 text-xl font-bold text-blanco-50">
              {nombreSistema}
            </span>
          </Link>
        </div>

        {/* Hamburguesa móvil */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-blanco-50"
          >
            <svg
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              className="w-6 h-6"
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Links desktop */}
        <div className="hidden lg:flex lg:gap-x-12 relative">
          <a
            href="#hero"
            className="transition hover:-translate-y-1 hover:scale-110 hover:text-verde-600 text-sm font-bold text-blanco-50"
          >
            Inicio
          </a>

          {/* Menú Producto */}
          <div className="relative">
            <button
              onClick={() => setProductMenuOpen((v) => !v)}
              className="transition flex items-center gap-x-1 text-sm font-bold text-blanco-50 hover:text-verde-600"
            >
              Producto
              <svg
                viewBox="0 -1 20 20"
                fill="currentColor"
                className={`w-5 h-5 transition-transform ${productMenuOpen ? "rotate-180" : ""}`}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.72-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {productMenuOpen && (
              <div className="absolute left-0 mt-3 w-56 rounded-lg bg-azul-950 shadow-xl ring-1 ring-gris-300/10">
                <div className="p-4 space-y-3">
                  <a href="#" className="block text-sm font-medium text-blanco-50 hover:text-verde-600">
                    Publicar Espacio Deportivo
                  </a>
                  <a href="#" className="block text-sm font-medium text-blanco-50 hover:text-verde-600">
                    Reservar Cancha
                  </a>
                </div>
              </div>
            )}
          </div>

          <a
            href="#empresa"
            className="transition hover:-translate-y-1 hover:scale-110 hover:text-verde-600 text-sm font-bold text-blanco-50"
          >
            Compañía
          </a>
          <a
            href="#contactos"
            className="transition hover:-translate-y-1 hover:scale-110 hover:text-verde-600 text-sm font-bold text-blanco-50"
          >
            Contactos
          </a>
        </div>

        {/* Login desktop */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-verde-600 hover:text-verde-600/80 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold border-2 border-verde-600 outline-2 outline-verde-600 text-verde-600 px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Sign Up <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-azul-950 p-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blanco-50">{nombreSistema}</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-blanco-50 hover:text-verde-600 transition"
            >
              <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" className="w-6 h-6">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="mt-8 space-y-4">
            <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block text-base font-semibold text-blanco-50 hover:text-verde-600">
              Inicio
            </a>
            <a href="#empresa" onClick={() => setMobileMenuOpen(false)} className="block text-base font-semibold text-blanco-50 hover:text-verde-600">
              Compañía
            </a>
            <a href="#contactos" onClick={() => setMobileMenuOpen(false)} className="block text-base font-semibold text-blanco-50 hover:text-verde-600">
              Contactos
            </a>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-verde-600 hover:text-verde-600/80 transition">
              Sign In
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold border-2 border-verde-600 outline-2 outline-verde-600 text-verde-600 px-4 py-2 rounded-lg hover:opacity-90 transition">
              Sign Up <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default EmpresaNavbarCasual;
