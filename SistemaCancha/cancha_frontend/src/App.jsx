// App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Outlet,
  useLocation,
  Navigate,
} from "react-router-dom";
import api from "./services/api";

// Páginas
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";

import Usuario           from "./pages/Usuario";
import Administrador     from "./pages/Administrador";
import Cliente           from "./pages/Cliente";
import Admin_Esp_Dep     from "./pages/Admin_Esp_Dep";
import Deportista        from "./pages/Deportista";
import Control           from "./pages/Control";
import Encargado         from "./pages/Encargado";
import Empresa           from "./pages/Empresa";
import Espacio_Deportivo from "./pages/Espacio_Deportivo";
import Cancha            from "./pages/Cancha";
import Disciplina        from "./pages/Disciplina";
import Reserva           from "./pages/Reserva";
import Reserva_Horario   from "./pages/Reserva_Horario";
import Pago              from "./pages/Pago";
import QR_Reserva        from "./pages/QR_Reserva";
import Reporte_Incidencia from "./pages/Reporte_Incidencia";
import Resena            from "./pages/Resena";
import Se_Practica       from "./pages/Se_Practica";
import Participa_En      from "./pages/Participa_En";

// Config centralizada del panel (rutas internas)
const routesConfig = [
  { id: "dashboard",        label: "Dashboard",          icon: "🏠", path: "/",                   component: Dashboard },
  { id: "usuario",          label: "Usuario",            icon: "👤", path: "/usuario",            component: Usuario },
  { id: "administrador",    label: "Administrador",      icon: "👤", path: "/administrador",      component: Administrador },
  { id: "cliente",          label: "Cliente",            icon: "💼", path: "/cliente",            component: Cliente },
  { id: "admin_esp_dep",    label: "Admin Esp Dep",      icon: "⚙️", path: "/admin-esp-dep",      component: Admin_Esp_Dep },
  { id: "deportista",       label: "Deportista",         icon: "🏃", path: "/deportista",         component: Deportista },
  { id: "control",          label: "Control",            icon: "🎮", path: "/control",            component: Control },
  { id: "encargado",        label: "Encargado",          icon: "👨‍💼", path: "/encargado",        component: Encargado },
  { id: "empresa",          label: "Empresa",            icon: "🏢", path: "/empresa",            component: Empresa },
  { id: "espacio_deportivo",label: "Espacio Deportivo",  icon: "🏟️", path: "/espacio-deportivo", component: Espacio_Deportivo },
  { id: "cancha",           label: "Cancha",             icon: "🎾", path: "/cancha",             component: Cancha },
  { id: "disciplina",       label: "Disciplina",         icon: "🥋", path: "/disciplina",         component: Disciplina },
  { id: "reserva",          label: "Reserva",            icon: "📅", path: "/reserva",            component: Reserva },
  { id: "reserva_horario",  label: "Reserva Horario",    icon: "⏰", path: "/reserva-horario",    component: Reserva_Horario },
  { id: "pago",             label: "Pago",               icon: "💳", path: "/pago",               component: Pago },
  { id: "qr_reserva",       label: "QR Reserva",         icon: "📱", path: "/qr-reserva",         component: QR_Reserva },
  { id: "reporte_incidencia",label:"Reporte Incidencia", icon: "⚠️", path: "/reporte-incidencia", component: Reporte_Incidencia },
  { id: "resena",           label: "Reseña",             icon: "⭐", path: "/resena",             component: Resena },
  { id: "se_practica",      label: "Se Practica",        icon: "🏸", path: "/se-practica",        component: Se_Practica },
  { id: "participa_en",     label: "Participa En",       icon: "👥", path: "/participa-en",       component: Participa_En },
];

// Header simple
const Header = ({ title }) => (
  <header className="bg-white shadow-sm border-b">
    <div className="px-6 py-4">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    </div>
  </header>
);

// Sidebar con NavLink para activo
const Sidebar = () => (
  <div className="w-64 bg-white shadow-lg">
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800">Mi App</h1>
    </div>
    <nav className="mt-6">
      {routesConfig.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            `w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${
              isActive
                ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          <span className="text-lg mr-3">{item.icon}</span>
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </div>
);

// Layout del panel (Sidebar + Header + Outlet)
function AppLayout() {
  const location = useLocation();
  const current = routesConfig.find((r) => r.path === location.pathname) || routesConfig[0];
  const pageTitle = current?.label ?? "Dashboard";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  // Empresa para el Landing
  const [empresa, setEmpresa] = useState(null);
  const [empresaError, setEmpresaError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Esta ruta SÍ existe según tu backend; traemos 1 empresa
        const res = await api.get("/empresa/datos-especificos", {
          params: { limit: 1, offset: 0 },
        });

        const raw = res.data?.datos?.empresas?.[0] || null;
        if (!raw) {
          setEmpresa(null);
          return;
        }

        // Normaliza a lo que consumen Navbar/Body/Footer
        const normalizada = {
          id_empresa: raw.id_empresa,
          nombre_sistema: raw.nombre_sistema ?? "",
          logo_imagen: raw.logo_imagen ?? "",

          titulo_h1: raw.titulo_h1 ?? "",
          descripcion_h1: raw.descripcion_h1 ?? "",
          te_ofrecemos: raw.te_ofrecemos ?? "",

          imagen_hero: raw.imagen_hero ?? raw.imagen_1 ?? "",
          imagen_1: raw.imagen_1 ?? "",
          imagen_2: raw.imagen_2 ?? "",
          imagen_3: raw.imagen_3 ?? "",

          titulo_1: raw.titulo_1 ?? "",
          titulo_2: raw.titulo_2 ?? "",
          titulo_3: raw.titulo_3 ?? "",
          descripcion_1: raw.descripcion_1 ?? "",
          descripcion_2: raw.descripcion_2 ?? "",
          descripcion_3: raw.descripcion_3 ?? "",

          mision: raw.mision ?? "",
          vision: raw.vision ?? "",
          nuestro_objetivo: raw.nuestro_objetivo ?? "",
          objetivo_1: raw.objetivo_1 ?? "",
          objetivo_2: raw.objetivo_2 ?? "",
          objetivo_3: raw.objetivo_3 ?? "",

          quienes_somos: raw.quienes_somos ?? "",
          correo_empresa: raw.correo_empresa ?? "",
          telefono: raw.telefono ?? "",
          direccion: raw.direccion ?? "",
        };

        setEmpresa(normalizada);
      } catch (err) {
        setEmpresaError(
          err.response?.data?.mensaje || err.message || "No se pudo cargar empresa"
        );
      }
    })();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Landing fuera del layout con Sidebar/Header */}
        <Route
          path="/landing"
          element={<LandingPage empresa={empresa} error={empresaError} />}
        />

        {/* Todo lo demás dentro del layout */}
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          {routesConfig
            .filter((r) => r.path !== "/")
            .map((route) => (
              <Route key={route.id} path={route.path} element={<route.component />} />
            ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
