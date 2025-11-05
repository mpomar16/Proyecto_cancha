// src/pages/LandingPage.jsx
import EmpresaBody from '../components/EmpresaBody';
import EmpresaFooter from '../components/EmpresaFooter';
import EmpresaNavbarCasual from '../components/EmpresaNavbarCasual';

const API_BASE = "http://localhost:3000";

function LandingPage({ empresa, error }) {

  // Navbar
  const navbarData = {
    nombre_sistema: empresa?.nombre_sistema ?? 'Mi Sistema',
    logo_imagen: empresa?.logo_imagen ?? '',
  };

  // Body (incluye imagen_hero)
  const bodyData = {
    titulo_h1: empresa?.titulo_h1 ?? '',
    descripcion_h1: empresa?.descripcion_h1 ?? '',
    te_ofrecemos: empresa?.te_ofrecemos ?? '',
    imagen_hero: empresa?.imagen_hero ?? empresa?.imagen_1 ?? '',
    imagen_1: empresa?.imagen_1 ?? '',
    imagen_2: empresa?.imagen_2 ?? '',
    imagen_3: empresa?.imagen_3 ?? '',
    titulo_1: empresa?.titulo_1 ?? '',
    titulo_2: empresa?.titulo_2 ?? '',
    titulo_3: empresa?.titulo_3 ?? '',
    descripcion_1: empresa?.descripcion_1 ?? '',
    descripcion_2: empresa?.descripcion_2 ?? '',
    descripcion_3: empresa?.descripcion_3 ?? '',
    mision: empresa?.mision ?? '',
    vision: empresa?.vision ?? '',
    nuestro_objetivo: empresa?.nuestro_objetivo ?? '',
    objetivo_1: empresa?.objetivo_1 ?? '',
    objetivo_2: empresa?.objetivo_2 ?? '',
    objetivo_3: empresa?.objetivo_3 ?? '',
    quienes_somos: empresa?.quienes_somos ?? '',
  };

  // Footer
  const footerData = {
    nombre_sistema: empresa?.nombre_sistema ?? 'Mi Sistema',
    logo_imagen: empresa?.logo_imagen ?? '',
    quienes_somos: empresa?.quienes_somos ?? '',
    correo_empresa: empresa?.correo_empresa ?? '',
    telefono: empresa?.telefono ?? '',
    direccion: empresa?.direccion ?? '',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <EmpresaNavbarCasual data={navbarData} baseUrl={API_BASE} />
      <main className="flex-grow">
        {/* pt-20 para despejar el navbar fixed (ajusta si tu navbar es más alto) */}
        {error && <p className="text-center text-red-600">{error}</p>}
        <EmpresaBody data={bodyData} baseUrl={API_BASE} />
      </main>
      <EmpresaFooter data={footerData} baseUrl={API_BASE} />
    </div>
  );
}

export default LandingPage;
