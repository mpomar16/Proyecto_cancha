import { useMemo } from "react";

const DEFAULT_BASE = "http://localhost:3000";

function resolveUrl(path, baseUrl = DEFAULT_BASE) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl}${path}`;
}

function EmpresaBody({ data, baseUrl = DEFAULT_BASE }) {
  const d = data ?? {};
  const isLoading = !data;

  const handleImageError = (e) => {
    e.target.src = "/default-avatar.png";
  };

  const formatTitulo = (texto) => {
    if (!texto) return null;
    const parts = texto.split(/(CLICK|QR)/g);
    return parts.map((part, i) =>
      part === "CLICK" || part === "QR"
        ? <span key={i} className="text-verde-600">{part}</span>
        : <span key={i}>{part}</span>
    );
  };

  // ✅ Hooks SIEMPRE antes de cualquier return
  const heroBg = useMemo(() => resolveUrl(d.imagen_hero, baseUrl), [d.imagen_hero, baseUrl]);
  const img1   = useMemo(() => resolveUrl(d.imagen_1,   baseUrl), [d.imagen_1,   baseUrl]);
  const img2   = useMemo(() => resolveUrl(d.imagen_2,   baseUrl), [d.imagen_2,   baseUrl]);
  const img3   = useMemo(() => resolveUrl(d.imagen_3,   baseUrl), [d.imagen_3,   baseUrl]);

  const Card = ({ src, titulo, descripcion, alt }) => (
    <div className="rounded-lg shadow-lg overflow-hidden bg-blanco-50">
      {src && (
        <img
          src={src}
          alt={alt}
          className="w-full h-56 object-cover"
          onError={handleImageError}
        />
      )}
      <div className="p-6">
        {titulo && <h3 className="text-xl font-semibold text-verde-600">{titulo}</h3>}
        {descripcion && <p className="mt-2 text-azul-950 text-sm">{descripcion}</p>}
      </div>
    </div>
  );

  // 👇 Ya no hay returns antes de los hooks
  return (
    <div>
      {/* Puedes mostrar un overlay o mensajes si está cargando */}
      {/* HERO */}
      <section
        className="relative font-poppins isolate bg-cover bg-center bg-no-repeat min-h-[100vh] flex items-center justify-center h-screen"
        style={{ backgroundImage: img2 ? `url(${img2})` : "none" }}
      >
        <div className="absolute inset-0 bg-azul-950/90" />
        <div className="relative z-10 max-w-3xl px-4 text-left">
          <p className="mt-6 text-4xl sm:text-6xl font-bold text-blanco-50 drop-shadow-lg">
            {isLoading ? "Cargando..." : formatTitulo(d.titulo_h1)}
          </p>
          {!isLoading && d.descripcion_h1 && (
            <p className="mt-6 text-xl sm:text-xl font-normal text-blanco-50 drop-shadow">
              {d.descripcion_h1}
            </p>
          )}
          <div className="mt-8 flex items-center gap-4">
            <a
              href="/login"
              className="rounded-md bg-verde-600 px-6 py-3 text-base font-semibold text-blanco-50 shadow hover:opacity-90 transition inline-flex items-center gap-2"
            >
              Reserva ahora →
            </a>
          </div>
        </div>
      </section>

      {/* TE OFRECEMOS */}
      <section className="my-20 px-6 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-azul-950">Te Ofrecemos</h2>
          {!isLoading && d.te_ofrecemos && (
            <p className="mt-4 max-w-2xl mx-auto text-azul-950">{d.te_ofrecemos}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(d.imagen_1 || d.titulo_1 || d.descripcion_1) && (
            <Card src={img1} titulo={d.titulo_1} descripcion={d.descripcion_1} alt="Imagen 1" />
          )}
          {(d.imagen_2 || d.titulo_2 || d.descripcion_2) && (
            <Card src={img2} titulo={d.titulo_2} descripcion={d.descripcion_2} alt="Imagen 2" />
          )}
          {(d.imagen_3 || d.titulo_3 || d.descripcion_3) && (
            <Card src={img3} titulo={d.titulo_3} descripcion={d.descripcion_3} alt="Imagen 3" />
          )}
        </div>
      </section>

      {/* MISIÓN & VISIÓN */}
      <section className="max-w-[89vw] mt-20 mx-auto rounded-lg shadow-lg bg-azul-950 px-6 lg:px-20">
        <div className="py-10 grid divide-y divide-verde-600/100 md:grid-cols-2 md:divide-y-0 md:divide-x text-blanco-50">
          <div className="sm:p-10 lg:p-12 content-center">
            <h3 className="text-3xl font-bold mb-2">Misión</h3>
            <span className="block h-1 w-16 bg-verde-600 mb-4" />
            <p className="text-gris-200 leading-relaxed">{d.mision}</p>
          </div>
          <div className="sm:p-10 lg:p-12 content-center">
            <h3 className="text-3xl font-bold mb-2">Visión</h3>
            <span className="block h-1 w-16 bg-verde-600 mb-4" />
            <p className="text-gris-200 leading-relaxed">{d.vision}</p>
          </div>
        </div>
      </section>

      {/* OBJETIVOS */}
      <section className="mt-20 max-w-[89vw] mx-auto rounded-lg px-6 lg:px-8 mb-20">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="mt-2 text-3xl font-bold leading-tight text-azul-950 sm:text-4xl">
            Nuestros <span className="text-verde-600">Objetivos</span>
          </h2>
          {!isLoading && d.nuestro_objetivo && (
            <p className="mx-auto mt-4 max-w-2xl text-azul-950">{d.nuestro_objetivo}</p>
          )}
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            {d.objetivo_1 && (
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-600 text-blanco-50 font-bold">1</div>
                <div>
                  <h4 className="text-lg font-semibold text-azul-950">Objetivo 1</h4>
                  <p className="mt-1 text-azul-950">{d.objetivo_1}</p>
                </div>
              </div>
            )}
            {d.objetivo_2 && (
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-600 text-blanco-50 font-bold">2</div>
                <div>
                  <h4 className="text-lg font-semibold text-azul-950">Objetivo 2</h4>
                  <p className="mt-1 text-azul-950">{d.objetivo_2}</p>
                </div>
              </div>
            )}
            {d.objetivo_3 && (
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verde-600 text-blanco-50 font-bold">3</div>
                <div>
                  <h4 className="text-lg font-semibold text-azul-950">Objetivo 3</h4>
                  <p className="mt-1 text-azul-950">{d.objetivo_3}</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-azul-950 to-azul-950 opacity-30 blur-3xl" />
            {heroBg && (
              <img
                src={img2}
                alt="Ilustración de objetivos"
                className="bg-blanco-50 relative w-full rounded-2xl shadow-xl object-cover"
                onError={handleImageError}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default EmpresaBody;
