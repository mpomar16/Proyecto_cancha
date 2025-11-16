--
-- PostgreSQL database dump
--

\restrict bxBtF2KPgft1zPZh6mBv26d1zoXh3ETZCtG9vhyAt6BlfvKglivRNghod65Aaeg

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

-- Started on 2025-11-15 23:40:00

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 881 (class 1247 OID 74827)
-- Name: estado_cancha_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_cancha_enum AS ENUM (
    'disponible',
    'ocupada',
    'mantenimiento'
);


ALTER TYPE public.estado_cancha_enum OWNER TO postgres;

--
-- TOC entry 884 (class 1247 OID 74834)
-- Name: estado_control_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_control_enum AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public.estado_control_enum OWNER TO postgres;

--
-- TOC entry 887 (class 1247 OID 74840)
-- Name: estado_encargado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_encargado_enum AS ENUM (
    'activo',
    'inactivo'
);


ALTER TYPE public.estado_encargado_enum OWNER TO postgres;

--
-- TOC entry 890 (class 1247 OID 74846)
-- Name: estado_qr_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_qr_enum AS ENUM (
    'activo',
    'expirado',
    'usado'
);


ALTER TYPE public.estado_qr_enum OWNER TO postgres;

--
-- TOC entry 893 (class 1247 OID 74854)
-- Name: estado_reserva_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_reserva_enum AS ENUM (
    'pendiente',
    'pagada',
    'en_cuotas',
    'cancelada'
);


ALTER TYPE public.estado_reserva_enum OWNER TO postgres;

--
-- TOC entry 968 (class 1247 OID 83023)
-- Name: estado_solicitud_admin_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_solicitud_admin_enum AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada',
    'anulada'
);


ALTER TYPE public.estado_solicitud_admin_enum OWNER TO postgres;

--
-- TOC entry 896 (class 1247 OID 74864)
-- Name: metodo_pago_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.metodo_pago_enum AS ENUM (
    'tarjeta',
    'efectivo',
    'transferencia',
    'QR'
);


ALTER TYPE public.metodo_pago_enum OWNER TO postgres;

--
-- TOC entry 899 (class 1247 OID 74874)
-- Name: sexo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sexo_enum AS ENUM (
    'masculino',
    'femenino'
);


ALTER TYPE public.sexo_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 74879)
-- Name: admin_esp_dep; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_esp_dep (
    id_admin_esp_dep integer NOT NULL,
    fecha_ingreso date NOT NULL,
    direccion character varying(255),
    estado boolean DEFAULT true
);


ALTER TABLE public.admin_esp_dep OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 74883)
-- Name: administrador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrador (
    id_administrador integer NOT NULL,
    direccion text,
    estado boolean DEFAULT true,
    ultimo_login timestamp without time zone,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.administrador OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 74890)
-- Name: cancha; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancha (
    id_cancha integer NOT NULL,
    nombre character varying(100) NOT NULL,
    capacidad integer,
    estado public.estado_cancha_enum,
    ubicacion character varying(255),
    monto_por_hora numeric(10,2),
    imagen_cancha text,
    id_espacio integer NOT NULL
);


ALTER TABLE public.cancha OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 74895)
-- Name: cancha_id_cancha_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cancha_id_cancha_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cancha_id_cancha_seq OWNER TO postgres;

--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 218
-- Name: cancha_id_cancha_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cancha_id_cancha_seq OWNED BY public.cancha.id_cancha;


--
-- TOC entry 219 (class 1259 OID 74896)
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    id_cliente integer NOT NULL,
    fecha_registro date DEFAULT CURRENT_DATE NOT NULL,
    fecha_nac date,
    carnet_identidad character varying(10),
    ci_complemento character varying(3)
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 74900)
-- Name: comentario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comentario (
    id_comentario integer NOT NULL,
    contenido text,
    fecha_comentario date,
    hora_comentario time without time zone,
    id_cancha integer NOT NULL,
    id_cliente integer NOT NULL,
    estado boolean DEFAULT false
);


ALTER TABLE public.comentario OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 74906)
-- Name: comentario_id_comentario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comentario_id_comentario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comentario_id_comentario_seq OWNER TO postgres;

--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 221
-- Name: comentario_id_comentario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comentario_id_comentario_seq OWNED BY public.comentario.id_comentario;


--
-- TOC entry 222 (class 1259 OID 74907)
-- Name: control; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.control (
    id_control integer NOT NULL,
    fecha_asignacion date,
    estado boolean DEFAULT true
);


ALTER TABLE public.control OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 74911)
-- Name: deportista; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deportista (
    id_deportista integer NOT NULL,
    disciplina_principal character varying(100)
);


ALTER TABLE public.deportista OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 74914)
-- Name: disciplina; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disciplina (
    id_disciplina integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text
);


ALTER TABLE public.disciplina OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 74919)
-- Name: disciplina_id_disciplina_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.disciplina_id_disciplina_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.disciplina_id_disciplina_seq OWNER TO postgres;

--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 225
-- Name: disciplina_id_disciplina_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.disciplina_id_disciplina_seq OWNED BY public.disciplina.id_disciplina;


--
-- TOC entry 226 (class 1259 OID 74920)
-- Name: empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa (
    id_empresa integer NOT NULL,
    fecha_registrado timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    logo_imagen character varying(255),
    nombre_sistema character varying(100) NOT NULL,
    titulo_h1 character varying(150),
    descripcion_h1 text,
    te_ofrecemos text,
    imagen_1 character varying(255),
    imagen_2 character varying(255),
    imagen_3 character varying(255),
    titulo_1 character varying(150),
    titulo_2 character varying(150),
    titulo_3 character varying(150),
    descripcion_1 text,
    descripcion_2 text,
    descripcion_3 text,
    mision text,
    vision text,
    objetivo_1 text,
    objetivo_2 text,
    objetivo_3 text,
    quienes_somos text,
    correo_empresa character varying(150),
    direccion text,
    id_administrador integer NOT NULL,
    nuestro_objetivo text,
    imagen_hero character varying(255),
    telefonos character varying(30)[]
);


ALTER TABLE public.empresa OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 74926)
-- Name: empresa_id_empresa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresa_id_empresa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empresa_id_empresa_seq OWNER TO postgres;

--
-- TOC entry 5157 (class 0 OID 0)
-- Dependencies: 227
-- Name: empresa_id_empresa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresa_id_empresa_seq OWNED BY public.empresa.id_empresa;


--
-- TOC entry 228 (class 1259 OID 74927)
-- Name: encargado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.encargado (
    id_encargado integer NOT NULL,
    responsabilidad character varying(255),
    fecha_inicio date,
    hora_ingreso time without time zone,
    hora_salida time without time zone,
    estado boolean DEFAULT true
);


ALTER TABLE public.encargado OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 74931)
-- Name: espacio_deportivo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.espacio_deportivo (
    id_espacio integer NOT NULL,
    nombre character varying(100) NOT NULL,
    direccion character varying(255),
    descripcion text,
    latitud numeric(9,6),
    longitud numeric(9,6),
    horario_apertura time without time zone,
    horario_cierre time without time zone,
    id_admin_esp_dep integer,
    imagen_principal text,
    imagen_sec_1 text,
    imagen_sec_2 text,
    imagen_sec_3 text,
    imagen_sec_4 text
);


ALTER TABLE public.espacio_deportivo OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 74936)
-- Name: espacio_deportivo_id_espacio_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.espacio_deportivo_id_espacio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.espacio_deportivo_id_espacio_seq OWNER TO postgres;

--
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 230
-- Name: espacio_deportivo_id_espacio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.espacio_deportivo_id_espacio_seq OWNED BY public.espacio_deportivo.id_espacio;


--
-- TOC entry 231 (class 1259 OID 74937)
-- Name: pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pago (
    id_pago integer NOT NULL,
    monto numeric(10,2),
    metodo_pago public.metodo_pago_enum,
    fecha_pago date,
    id_reserva integer NOT NULL
);


ALTER TABLE public.pago OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 74940)
-- Name: pago_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pago_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pago_id_pago_seq OWNER TO postgres;

--
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 232
-- Name: pago_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pago_id_pago_seq OWNED BY public.pago.id_pago;


--
-- TOC entry 233 (class 1259 OID 74941)
-- Name: participa_en; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participa_en (
    id_deportista integer NOT NULL,
    id_reserva integer NOT NULL,
    fecha_reserva date
);


ALTER TABLE public.participa_en OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 74944)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    id_persona integer NOT NULL,
    nombre character varying(100),
    apellido character varying(100),
    contrasena character varying(255) NOT NULL,
    telefono character varying(20),
    correo character varying(100) NOT NULL,
    sexo public.sexo_enum,
    imagen_perfil text,
    latitud numeric(9,6),
    longitud numeric(9,6),
    usuario character varying(50) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 74950)
-- Name: persona_id_persona_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.persona_id_persona_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.persona_id_persona_seq OWNER TO postgres;

--
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 235
-- Name: persona_id_persona_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.persona_id_persona_seq OWNED BY public.usuario.id_persona;


--
-- TOC entry 236 (class 1259 OID 74951)
-- Name: ponderacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ponderacion (
    id_ponderacion integer NOT NULL,
    calificacion integer NOT NULL,
    id_cliente integer NOT NULL,
    id_cancha integer NOT NULL,
    CONSTRAINT ponderacion_calificacion_check CHECK (((calificacion >= 1) AND (calificacion <= 5)))
);


ALTER TABLE public.ponderacion OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 74955)
-- Name: ponderacion_id_ponderacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ponderacion_id_ponderacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ponderacion_id_ponderacion_seq OWNER TO postgres;

--
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 237
-- Name: ponderacion_id_ponderacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ponderacion_id_ponderacion_seq OWNED BY public.ponderacion.id_ponderacion;


--
-- TOC entry 238 (class 1259 OID 74956)
-- Name: qr_reserva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qr_reserva (
    id_qr integer NOT NULL,
    fecha_generado timestamp without time zone NOT NULL,
    fecha_expira timestamp without time zone,
    qr_url_imagen text,
    codigo_qr character varying(255),
    estado public.estado_qr_enum,
    id_reserva integer NOT NULL,
    id_control integer,
    verificado boolean DEFAULT false
);


ALTER TABLE public.qr_reserva OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 74962)
-- Name: qr_reserva_id_qr_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.qr_reserva_id_qr_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.qr_reserva_id_qr_seq OWNER TO postgres;

--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 239
-- Name: qr_reserva_id_qr_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.qr_reserva_id_qr_seq OWNED BY public.qr_reserva.id_qr;


--
-- TOC entry 240 (class 1259 OID 74963)
-- Name: reporte_incidencia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reporte_incidencia (
    id_reporte integer NOT NULL,
    detalle text,
    sugerencia text,
    id_encargado integer NOT NULL,
    id_reserva integer NOT NULL,
    verificado boolean DEFAULT false
);


ALTER TABLE public.reporte_incidencia OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 74969)
-- Name: reporte_incidencia_id_reporte_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reporte_incidencia_id_reporte_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reporte_incidencia_id_reporte_seq OWNER TO postgres;

--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 241
-- Name: reporte_incidencia_id_reporte_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reporte_incidencia_id_reporte_seq OWNED BY public.reporte_incidencia.id_reporte;


--
-- TOC entry 242 (class 1259 OID 74970)
-- Name: resena; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resena (
    id_resena integer NOT NULL,
    id_reserva integer NOT NULL,
    estrellas integer,
    comentario text,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado boolean DEFAULT false,
    verificado boolean DEFAULT false,
    id_cliente integer NOT NULL,
    id_cancha integer NOT NULL,
    CONSTRAINT resena_estrellas_check CHECK (((estrellas >= 1) AND (estrellas <= 5)))
);


ALTER TABLE public.resena OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 74979)
-- Name: resena_id_resena_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resena_id_resena_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resena_id_resena_seq OWNER TO postgres;

--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 243
-- Name: resena_id_resena_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resena_id_resena_seq OWNED BY public.resena.id_resena;


--
-- TOC entry 244 (class 1259 OID 74980)
-- Name: reserva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reserva (
    id_reserva integer NOT NULL,
    fecha_reserva date NOT NULL,
    cupo integer,
    monto_total numeric(10,2),
    saldo_pendiente numeric(10,2),
    estado public.estado_reserva_enum NOT NULL,
    id_cliente integer NOT NULL,
    id_cancha integer NOT NULL
);


ALTER TABLE public.reserva OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 99414)
-- Name: reserva_deportista; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reserva_deportista (
    id_reserva_deportista integer NOT NULL,
    id_reserva integer NOT NULL,
    id_persona integer NOT NULL,
    fecha_union timestamp without time zone DEFAULT now() NOT NULL,
    estado character varying(20) DEFAULT 'activo'::character varying NOT NULL
);


ALTER TABLE public.reserva_deportista OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 99413)
-- Name: reserva_deportista_id_reserva_deportista_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reserva_deportista_id_reserva_deportista_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reserva_deportista_id_reserva_deportista_seq OWNER TO postgres;

--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 253
-- Name: reserva_deportista_id_reserva_deportista_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reserva_deportista_id_reserva_deportista_seq OWNED BY public.reserva_deportista.id_reserva_deportista;


--
-- TOC entry 245 (class 1259 OID 74983)
-- Name: reserva_horario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reserva_horario (
    id_horario integer NOT NULL,
    id_reserva integer NOT NULL,
    fecha date,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    monto numeric(10,2)
);


ALTER TABLE public.reserva_horario OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 74986)
-- Name: reserva_horario_id_horario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reserva_horario_id_horario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reserva_horario_id_horario_seq OWNER TO postgres;

--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 246
-- Name: reserva_horario_id_horario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reserva_horario_id_horario_seq OWNED BY public.reserva_horario.id_horario;


--
-- TOC entry 247 (class 1259 OID 74987)
-- Name: reserva_id_reserva_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reserva_id_reserva_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reserva_id_reserva_seq OWNER TO postgres;

--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 247
-- Name: reserva_id_reserva_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reserva_id_reserva_seq OWNED BY public.reserva.id_reserva;


--
-- TOC entry 248 (class 1259 OID 74988)
-- Name: se_practica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.se_practica (
    id_cancha integer NOT NULL,
    id_disciplina integer NOT NULL,
    frecuencia_practica character varying(50)
);


ALTER TABLE public.se_practica OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 83032)
-- Name: solicitud_admin_esp_dep; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitud_admin_esp_dep (
    id_solicitud integer NOT NULL,
    id_usuario integer NOT NULL,
    id_espacio integer NOT NULL,
    motivo text,
    fecha_solicitud timestamp without time zone DEFAULT now() NOT NULL,
    estado public.estado_solicitud_admin_enum DEFAULT 'pendiente'::public.estado_solicitud_admin_enum NOT NULL,
    decidido_por_admin integer,
    fecha_decision timestamp without time zone,
    comentario_decision text
);


ALTER TABLE public.solicitud_admin_esp_dep OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 83031)
-- Name: solicitud_admin_esp_dep_id_solicitud_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitud_admin_esp_dep_id_solicitud_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitud_admin_esp_dep_id_solicitud_seq OWNER TO postgres;

--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 251
-- Name: solicitud_admin_esp_dep_id_solicitud_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitud_admin_esp_dep_id_solicitud_seq OWNED BY public.solicitud_admin_esp_dep.id_solicitud;


--
-- TOC entry 256 (class 1259 OID 99436)
-- Name: solicitud_rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitud_rol (
    id_solicitud integer NOT NULL,
    id_usuario integer NOT NULL,
    rol_destino text NOT NULL,
    motivo text,
    estado text DEFAULT 'pendiente'::text NOT NULL,
    fecha_solicitud timestamp without time zone DEFAULT now() NOT NULL,
    fecha_decision timestamp without time zone,
    decidido_por_admin integer,
    comentario_decision text
);


ALTER TABLE public.solicitud_rol OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 99435)
-- Name: solicitud_rol_id_solicitud_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitud_rol_id_solicitud_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.solicitud_rol_id_solicitud_seq OWNER TO postgres;

--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 255
-- Name: solicitud_rol_id_solicitud_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitud_rol_id_solicitud_seq OWNED BY public.solicitud_rol.id_solicitud;


--
-- TOC entry 249 (class 1259 OID 74991)
-- Name: x_imagen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.x_imagen (
    id_imagen integer NOT NULL,
    imagen text NOT NULL,
    imagen_sec_1 character varying(200),
    nombre character varying(255)
);


ALTER TABLE public.x_imagen OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 74996)
-- Name: x_imagen_id_imagen_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.x_imagen_id_imagen_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.x_imagen_id_imagen_seq OWNER TO postgres;

--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 250
-- Name: x_imagen_id_imagen_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.x_imagen_id_imagen_seq OWNED BY public.x_imagen.id_imagen;


--
-- TOC entry 4827 (class 2604 OID 74997)
-- Name: cancha id_cancha; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancha ALTER COLUMN id_cancha SET DEFAULT nextval('public.cancha_id_cancha_seq'::regclass);


--
-- TOC entry 4829 (class 2604 OID 74998)
-- Name: comentario id_comentario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario ALTER COLUMN id_comentario SET DEFAULT nextval('public.comentario_id_comentario_seq'::regclass);


--
-- TOC entry 4832 (class 2604 OID 74999)
-- Name: disciplina id_disciplina; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplina ALTER COLUMN id_disciplina SET DEFAULT nextval('public.disciplina_id_disciplina_seq'::regclass);


--
-- TOC entry 4833 (class 2604 OID 75000)
-- Name: empresa id_empresa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa ALTER COLUMN id_empresa SET DEFAULT nextval('public.empresa_id_empresa_seq'::regclass);


--
-- TOC entry 4836 (class 2604 OID 75001)
-- Name: espacio_deportivo id_espacio; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.espacio_deportivo ALTER COLUMN id_espacio SET DEFAULT nextval('public.espacio_deportivo_id_espacio_seq'::regclass);


--
-- TOC entry 4837 (class 2604 OID 75002)
-- Name: pago id_pago; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago ALTER COLUMN id_pago SET DEFAULT nextval('public.pago_id_pago_seq'::regclass);


--
-- TOC entry 4840 (class 2604 OID 75003)
-- Name: ponderacion id_ponderacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion ALTER COLUMN id_ponderacion SET DEFAULT nextval('public.ponderacion_id_ponderacion_seq'::regclass);


--
-- TOC entry 4841 (class 2604 OID 75004)
-- Name: qr_reserva id_qr; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva ALTER COLUMN id_qr SET DEFAULT nextval('public.qr_reserva_id_qr_seq'::regclass);


--
-- TOC entry 4843 (class 2604 OID 75005)
-- Name: reporte_incidencia id_reporte; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia ALTER COLUMN id_reporte SET DEFAULT nextval('public.reporte_incidencia_id_reporte_seq'::regclass);


--
-- TOC entry 4845 (class 2604 OID 75006)
-- Name: resena id_resena; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resena ALTER COLUMN id_resena SET DEFAULT nextval('public.resena_id_resena_seq'::regclass);


--
-- TOC entry 4849 (class 2604 OID 75007)
-- Name: reserva id_reserva; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva ALTER COLUMN id_reserva SET DEFAULT nextval('public.reserva_id_reserva_seq'::regclass);


--
-- TOC entry 4855 (class 2604 OID 99417)
-- Name: reserva_deportista id_reserva_deportista; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_deportista ALTER COLUMN id_reserva_deportista SET DEFAULT nextval('public.reserva_deportista_id_reserva_deportista_seq'::regclass);


--
-- TOC entry 4850 (class 2604 OID 75008)
-- Name: reserva_horario id_horario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_horario ALTER COLUMN id_horario SET DEFAULT nextval('public.reserva_horario_id_horario_seq'::regclass);


--
-- TOC entry 4852 (class 2604 OID 83035)
-- Name: solicitud_admin_esp_dep id_solicitud; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_admin_esp_dep ALTER COLUMN id_solicitud SET DEFAULT nextval('public.solicitud_admin_esp_dep_id_solicitud_seq'::regclass);


--
-- TOC entry 4858 (class 2604 OID 99439)
-- Name: solicitud_rol id_solicitud; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_rol ALTER COLUMN id_solicitud SET DEFAULT nextval('public.solicitud_rol_id_solicitud_seq'::regclass);


--
-- TOC entry 4838 (class 2604 OID 75009)
-- Name: usuario id_persona; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN id_persona SET DEFAULT nextval('public.persona_id_persona_seq'::regclass);


--
-- TOC entry 4851 (class 2604 OID 75010)
-- Name: x_imagen id_imagen; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.x_imagen ALTER COLUMN id_imagen SET DEFAULT nextval('public.x_imagen_id_imagen_seq'::regclass);


--
-- TOC entry 5107 (class 0 OID 74879)
-- Dependencies: 215
-- Data for Name: admin_esp_dep; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_esp_dep (id_admin_esp_dep, fecha_ingreso, direccion, estado) FROM stdin;
10	2025-09-28	Dirección 10	t
30	2025-10-08	Av. Fournier  # 22	t
9	2025-09-28	Dirección 9	t
8	2025-09-28	Av Las Palmas	t
47	2025-12-12	Av. Saavedra, Miraflores, La Paz	f
7	2025-09-28	Zona Rio Seco	f
6	2025-09-28	Dirección 6	t
11	2025-11-07	\N	t
78	2025-11-08	\N	t
\.


--
-- TOC entry 5108 (class 0 OID 74883)
-- Dependencies: 216
-- Data for Name: administrador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrador (id_administrador, direccion, estado, ultimo_login, fecha_creacion) FROM stdin;
4	Zona Central #101, Oruro	t	2025-09-28 09:41:10.098087	2025-09-28 12:41:10.098087
5	Av. Potosí #202, Potosí	t	2025-09-28 12:31:10.098087	2025-09-28 12:41:10.098087
3	Av. Beni #789, Santa Cruz	\N	2025-09-23 12:41:10.098087	2025-09-28 12:41:10.098087
1	Av. Ballivián #123, La Paz	t	2025-10-01 02:40:00	2025-09-28 12:41:10.098087
42	Av. CopenJaimer #2343	f	\N	2025-10-12 09:34:30.119918
2	Calle Sucre #456, Cochabamba	\N	2025-10-05 18:39:00	2025-09-28 12:41:10.098087
\.


--
-- TOC entry 5109 (class 0 OID 74890)
-- Dependencies: 217
-- Data for Name: cancha; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cancha (id_cancha, nombre, capacidad, estado, ubicacion, monto_por_hora, imagen_cancha, id_espacio) FROM stdin;
6	Cancha Principal	20	disponible	Calle Falsa 123	100.00	/uploads/cancha/cancha_principal-2025-09-29-11_48_10-510.jpeg	1
3	Cancha Central	20	disponible	Av. Principal 123	50.00	/uploads/cancha/cancha_principal-2025-09-29-11_47_34-405.jpeg	2
4	Cancha Norte	15	ocupada	Calle Norte 456	40.00	/uploads/cancha/cancha_principal-2025-09-29-11_47_46-134.jpeg	1
5	Cancha Sur	25	disponible	Calle Sur 789	60.00	/uploads/cancha/cancha_sur-2025-10-01-06_52_12-377.jpeg	1
2	Taquitaqui	100	disponible	Calle Sur 789	35.00	/Uploads/cancha/Taquitaqui-2025-10-15_16-58-20-39254.jpg	9
9	Cancha Fultbolistica	100	disponible	Segunda Entrada izquierda	80.00	/Uploads/cancha/cancha-2025-10-13_22-37-27-80539.jpg	7
1	La cancha del pueblo	99	ocupada	Planta Baja	200.00	/uploads/cancha/la_cancha_del_pueblo-2025-10-01-02_36_08-703.jpeg	1
7	Super heroe	50	disponible	Segunda Seccion Zona Norte	100.00	/Uploads/cancha/Super_heroe-2025-10-13_22-35-19-98924.jpg	4
18	cancha m	50	disponible	Segundo Piso	50.00	\N	11
10	1	1	disponible	12	1.00	\N	11
\.


--
-- TOC entry 5111 (class 0 OID 74896)
-- Dependencies: 219
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (id_cliente, fecha_registro, fecha_nac, carnet_identidad, ci_complemento) FROM stdin;
13	2025-09-28	1992-11-03	23456789	CB
14	2025-09-28	2000-01-15	34567890	LP
15	2025-09-28	1995-07-30	45678901	OR
11	2025-09-28	1990-05-19	12345678	LP
40	2025-10-09	1989-12-02	432141234	CBB
39	2025-10-08	2000-12-02	79008812	SC
51	2025-10-12	\N	\N	\N
54	2025-10-12	\N	\N	\N
57	2025-10-13	\N	\N	\N
60	2025-11-05	\N	\N	\N
78	2025-11-08	\N	\N	\N
79	2025-11-15	\N	\N	\N
\.


--
-- TOC entry 5112 (class 0 OID 74900)
-- Dependencies: 220
-- Data for Name: comentario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comentario (id_comentario, contenido, fecha_comentario, hora_comentario, id_cancha, id_cliente, estado) FROM stdin;
\.


--
-- TOC entry 5114 (class 0 OID 74907)
-- Dependencies: 222
-- Data for Name: control; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.control (id_control, fecha_asignacion, estado) FROM stdin;
24	2025-09-15	t
25	2025-09-10	f
41	2025-10-09	t
23	2025-09-20	\N
22	2025-09-25	t
45	2022-12-12	t
51	2025-10-12	t
46	2025-10-12	t
12	2025-10-08	\N
21	2025-10-16	t
\.


--
-- TOC entry 5115 (class 0 OID 74911)
-- Dependencies: 223
-- Data for Name: deportista; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deportista (id_deportista, disciplina_principal) FROM stdin;
19	Tenis
16	Fútbol
20	Natacion y aerobico
18	Vóleibol y Futbol
44	Fútbol
17	Natación
50	Maraton
\.


--
-- TOC entry 5116 (class 0 OID 74914)
-- Dependencies: 224
-- Data for Name: disciplina; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disciplina (id_disciplina, nombre, descripcion) FROM stdin;
2	Fútbol	Deporte de equipo donde dos conjuntos de 11 jugadores intentan anotar goles en la portería contraria usando principalmente los pies.
5	Fútbol 7	Variante del fútbol con equipos de 7 jugadores, ideal para canchas más pequeñas y partidos más dinámicos.
6	Fútbol Sala	Fútbol de salón jugado en canchas de superficie dura, con equipos de 5 jugadores y balón de rebote reducido.
4	Básquetbol	Deporte donde dos equipos de 5 jugadores anotan puntos lanzando un balón through un aro elevado.
3	Vóleibol	Deporte donde dos equipos separados por una red alta intentan pasar el balón al campo contrario.
1	Tenis	Deporte de raqueta donde los jugadores golpean una pelota sobre una red hacia el campo contrario.
7	Balonmano	Deporte de equipo donde los jugadores lanzan un balón con la mano hacia la portería contraria.
8	Racquetball	Similar al squash pero con raquetas más cortas y pelota más grande y rápida.
9	Tenis de Mesa	Versión de mesa del tenis, requiriendo gran velocidad y precisión.
10	Futsal	Fútbol de salón oficial FIFA, jugado con balón de poco rebote y reglas específicas.
11	Baloncesto 3x3	Variante urbana del básquetbol con equipos de 3 jugadores y media cancha.
\.


--
-- TOC entry 5118 (class 0 OID 74920)
-- Dependencies: 226
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresa (id_empresa, fecha_registrado, logo_imagen, nombre_sistema, titulo_h1, descripcion_h1, te_ofrecemos, imagen_1, imagen_2, imagen_3, titulo_1, titulo_2, titulo_3, descripcion_1, descripcion_2, descripcion_3, mision, vision, objetivo_1, objetivo_2, objetivo_3, quienes_somos, correo_empresa, direccion, id_administrador, nuestro_objetivo, imagen_hero, telefonos) FROM stdin;
3	2025-10-13 15:56:02.769033	/Uploads/empresa/empresa-2025-10-13_19-56-02-32631.jpg	data2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N
4	2025-10-13 16:02:21.149917	/Uploads/empresa/empresa-2025-10-13_20-02-21-65587.jpg	cancha_X	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	\N	\N
5	2025-10-13 16:02:48.915566	/Uploads/empresa/cancha_X-2025-10-13_21-00-58-49480.jpg	cancha_X	\N	\N	\N	/Uploads/empresa/cancha_X-2025-10-13_21-00-58-30167.jpg	/Uploads/empresa/cancha_X-2025-10-13_21-00-58-36347.jpg	/Uploads/empresa/cancha_X-2025-10-13_21-00-58-87275.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	\N	/Uploads/empresa/cancha_X-2025-10-13_21-00-58-54596.jpg	\N
2	2025-09-28 12:41:22.048553	/Uploads/empresa/lacanchita-2025-10-01-11_52_12-907.png	CanchaStoik	Un CLICK para reservar, Un QR para ingresar.	PlayPass te permite reservar canchas en segundos y acceder fácilmente con un código QR.	Una plataforma moderna que combina deporte y tecnología para simplificar tus reservas.	/Uploads/empresa/lacanchita-2025-09-29-19_34_15-863.webp	/Uploads/empresa/lacanchita-2025-09-29-19_34_15-219.webp	/Uploads/empresa/lacanchita-2025-09-29-19_34_15-785.webp	Reservas en línea	Acceso con QR seguro	Gestión de horarios en tiempo real	Realiza tus reservas de canchas y espacios deportivos en segundos desde nuestro sitio web o tu teléfono móvil.	Accede a tus reservas de forma rápida y confiable mediante un código QR único, sin necesidad de comprobantes impresos.	Consulta la disponibilidad de canchas al instante y organiza tus reservas con una agenda siempre actualizada.	Facilitar el acceso a espacios deportivos mediante una plataforma tecnológica innovadora, que asegure reservas eficientes y un control de ingreso confiable con códigos QR, mejorando la administración y la experiencia de los usuarios.	Convertirnos en el sistema líder de reservas deportivas en Bolivia, reconocido por su seguridad, simplicidad y eficiencia, impulsando la modernización digital en la gestión de actividades deportivas.	Simplificar el proceso de reserva de espacios deportivos en web y móvil.	Garantizar seguridad y control de acceso con códigos QR validados en tiempo real.	Optimizar horarios y canchas evitando duplicaciones y sobreuso.	Somos un equipo apasionado por el deporte y la tecnología.	relax_supremo@company.com	La Paz, Monoblock UMSA #1234	1	Construimos una plataforma moderna, segura y eficiente para la reserva y gestión de espacios deportivos.	/Uploads/empresa/CanchaStoik-2025-10-13_22-29-25-25854.jpg	{"Lorena: +591 63130742","Jimmy: +591 77526144","Mishelle: +591 78796745","Maria: +591 66415209"}
\.


--
-- TOC entry 5120 (class 0 OID 74927)
-- Dependencies: 228
-- Data for Name: encargado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.encargado (id_encargado, responsabilidad, fecha_inicio, hora_ingreso, hora_salida, estado) FROM stdin;
22	Mantenimiento	2025-02-01	09:00:00	17:00:00	t
25	Seguridad	2025-05-05	06:00:00	14:00:00	t
26	Supervisión general	2025-09-01	08:00:00	16:00:00	t
28	Mantenimiento de canchas	2025-09-10	07:30:00	15:30:00	t
29	Atención al cliente	2025-09-12	10:00:00	18:00:00	t
23	Logística	2025-03-15	07:30:00	15:30:00	\N
46	Control de personal	2025-10-07	08:00:00	18:00:00	\N
27	Control de reservas	2025-09-05	09:00:00	17:00:00	\N
54	\N	2025-10-12	\N	\N	t
\.


--
-- TOC entry 5121 (class 0 OID 74931)
-- Dependencies: 229
-- Data for Name: espacio_deportivo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.espacio_deportivo (id_espacio, nombre, direccion, descripcion, latitud, longitud, horario_apertura, horario_cierre, id_admin_esp_dep, imagen_principal, imagen_sec_1, imagen_sec_2, imagen_sec_3, imagen_sec_4) FROM stdin;
9	Complejo Deportivo Cotahuma	Cotahuma, La Paz	Complejo municipal con canchas múltiples y pista de atletismo.	-16.520000	-68.140000	08:00:00	18:00:00	7	/Uploads/espacio/complejo_deportivo_cotahuma-2025-10-01-08_14_41-643.jpg	/Uploads/espacio/complejo_deportivo_cotahuma-2025-10-01-08_14_41-631.jpeg	/Uploads/espacio/complejo_deportivo_cotahuma-2025-10-01-08_14_41-250.jpeg	/Uploads/espacio/complejo_deportivo_cotahuma-2025-10-01-08_14_41-983.jpeg	/Uploads/espacio/complejo_deportivo_cotahuma-2025-10-01-08_14_41-328.jpeg
13	Coliseo Chamoco Chico	Chamoco Chico, La Paz	Coliseo barrial con actividades deportivas y sociales.	-16.512000	-68.138000	08:00:00	17:00:00	8	/Uploads/espacio/coliseo_chamoco_chico-2025-10-01-08_20_02-542.jpg	/Uploads/espacio/coliseo_chamoco_chico-2025-10-01-08_20_02-168.jpg	/Uploads/espacio/coliseo_chamoco_chico-2025-10-01-08_20_02-748.jpeg	/Uploads/espacio/coliseo_chamoco_chico-2025-10-01-08_20_02-786.jpeg	/Uploads/espacio/coliseo_chamoco_chico-2025-10-01-08_20_02-485.jpeg
14	Coliseo Los Andes	Los Andes, El Alto	Coliseo municipal para eventos de futsal y artes marciales.	-16.497000	-68.181000	08:00:00	18:00:00	8	/Uploads/espacio/coliseo_los_andes-2025-10-01-08_21_11-687.jpeg	/Uploads/espacio/coliseo_los_andes-2025-10-01-08_21_11-946.jpeg	/Uploads/espacio/coliseo_los_andes-2025-10-01-08_21_11-847.jpeg	/Uploads/espacio/coliseo_los_andes-2025-10-01-08_21_11-803.jpeg	/Uploads/espacio/coliseo_los_andes-2025-10-01-08_21_11-218.jpeg
5	Centro Acuático de La Paz	Alto Obrajes, La Paz	Piscina olímpica moderna, sede de torneos nacionales e internacionales	-16.520000	-68.122000	08:00:00	21:00:00	6	/Uploads/espacio/centro_acuático_de_la_paz-2025-10-01-08_09_28-517.webp	/Uploads/espacio/centro_acuático_de_la_paz-2025-10-01-08_09_28-189.webp	/Uploads/espacio/centro_acuático_de_la_paz-2025-10-01-08_09_29-353.jpeg	/Uploads/espacio/centro_acuático_de_la_paz-2025-10-01-08_09_29-149.jpeg	/Uploads/espacio/centro_acuático_de_la_paz-2025-10-01-08_09_29-339.jpeg
10	Coliseo Rafael Mendoza	Achumani, La Paz	Coliseo techado del Club The Strongest.	-16.495000	-68.095000	08:00:00	05:00:00	8	/Uploads/espacio/coliseo_rafael_mendoza-2025-10-01-08_16_09-757.jpg	/Uploads/espacio/coliseo_rafael_mendoza-2025-10-01-08_16_09-714.jpeg	/Uploads/espacio/coliseo_rafael_mendoza-2025-10-01-08_16_09-579.jpeg	/Uploads/espacio/coliseo_rafael_mendoza-2025-10-01-08_16_09-616.jpeg	/Uploads/espacio/coliseo_rafael_mendoza-2025-10-01-08_16_09-748.jpeg
2	Coliseo Cerrado Julio Borelli	Av. Saavedra, Miraflores, La Paz	Histórico coliseo cerrado para básquet, vóley y boxeo.	-16.500000	-68.150000	09:00:00	21:00:00	6	/Uploads/espacio/coliseo_cerrado_julio_borelli-2025-10-01-08_01_49-218.jpg	/Uploads/espacio/coliseo_cerrado_julio_borelli-2025-10-01-08_01_49-189.jpg	/Uploads/espacio/coliseo_cerrado_julio_borelli-2025-10-01-08_01_49-156.jpeg	/Uploads/espacio/coliseo_cerrado_julio_borelli-2025-10-01-08_01_49-387.jpeg	/Uploads/espacio/coliseo_cerrado_julio_borelli-2025-10-01-08_01_49-918.jpg
3	Coliseo Max Fernández	Ciudad Satélite, El Alto	Coliseo moderno en El Alto, multiuso para eventos deportivos.	-16.511000	-68.174000	08:30:00	20:30:00	6	/Uploads/espacio/coliseo_max_fernández-2025-10-01-08_05_06-386.webp	/Uploads/espacio/coliseo_max_fernández-2025-10-01-08_05_06-430.jpg	/Uploads/espacio/coliseo_max_fernández-2025-10-01-08_05_06-919.jpg	/Uploads/espacio/coliseo_max_fernández-2025-10-01-08_05_06-521.jpeg	/Uploads/espacio/coliseo_max_fernández-2025-10-01-08_05_06-549.jpeg
4	Complejo de Achumani	Achumani, La Paz	Complejo de entrenamiento del Club The Strongest.	-16.499000	-68.119000	07:00:00	08:00:00	6	/Uploads/espacio/complejo_de_achumani-2025-10-01-08_07_56-881.png	/Uploads/espacio/complejo_de_achumani-2025-10-01-08_07_56-489.jpg	/Uploads/espacio/complejo_de_achumani-2025-10-01-08_07_56-235.jpeg	/Uploads/espacio/complejo_de_achumani-2025-10-01-08_07_56-272.jpeg	/Uploads/espacio/complejo_de_achumani-2025-10-01-08_07_56-310.jpeg
6	Polideportivo Héroes de Octubre	Av. Juan Pablo II, El Alto	Polideportivo de gran capacidad para eventos y torneos.	-16.504000	-68.165000	08:00:00	18:00:00	6	/Uploads/espacio/polideportivo_héroes_de_octubre-2025-10-01-08_10_50-492.jpeg	/Uploads/espacio/polideportivo_héroes_de_octubre-2025-10-01-08_10_50-840.jpeg	/Uploads/espacio/polideportivo_héroes_de_octubre-2025-10-01-08_10_50-372.jpeg	/Uploads/espacio/polideportivo_héroes_de_octubre-2025-10-01-08_10_50-385.jpeg	/Uploads/espacio/polideportivo_héroes_de_octubre-2025-10-01-08_10_50-580.jpeg
7	Estadio de Villa Ingenio	Villa Ingenio, El Alto	Estadio del Club Always Ready, escenario paceño de primera división.	-16.479000	-68.163000	08:00:00	18:00:00	7	/Uploads/espacio/estadio_de_villa_ingenio-2025-10-01-08_12_25-533.jpeg	/Uploads/espacio/estadio_de_villa_ingenio-2025-10-01-08_12_25-678.jpeg	/Uploads/espacio/estadio_de_villa_ingenio-2025-10-01-08_12_25-724.jpeg	/Uploads/espacio/estadio_de_villa_ingenio-2025-10-01-08_12_25-146.jpeg	/Uploads/espacio/estadio_de_villa_ingenio-2025-10-01-08_12_25-814.jpeg
8	Coliseo 12 de Octubre	12 de Octubre, El Alto	Coliseo de barrio con actividad comunitaria intensa.	-16.491000	-68.170000	09:00:00	18:00:00	6	/Uploads/espacio/coliseo_12_de_octubre-2025-10-01-08_13_36-566.jpeg	/Uploads/espacio/coliseo_12_de_octubre-2025-10-01-08_13_36-948.jpeg	/Uploads/espacio/coliseo_12_de_octubre-2025-10-01-08_13_36-698.jpeg	/Uploads/espacio/coliseo_12_de_octubre-2025-10-01-08_13_36-592.jpeg	/Uploads/espacio/coliseo_12_de_octubre-2025-10-01-08_13_36-545.jpg
1	Estadio Hernando Siles X	Av. Saavedra, Miraflores, La Paz	Principal estadio paceño, sede de la selección boliviana.	-16.500000	-68.150000	08:00:00	22:00:00	6	/Uploads/espacio/estadio_hernando_siles-2025-10-01-08_00_14-343.jpeg	/Uploads/espacio/estadio_hernando_siles-2025-10-01-08_00_14-535.jpeg	/Uploads/espacio/estadio_hernando_siles-2025-10-01-08_00_14-856.jpeg	/Uploads/espacio/estadio_hernando_siles-2025-10-01-08_00_14-202.jpeg	/Uploads/espacio/estadio_hernando_siles-2025-10-01-08_00_14-267.jpeg
15	Complejo Deportivo Municipal de Bajo San Antonio	Bajo San Antonio, La Paz	Complejo deportivo con canchas sintéticas y gimnasio.	-16.532000	-68.133000	09:00:00	18:00:00	10	/Uploads/espacio/complejo_deportivo_municipal_de_bajo_san_antonio-2025-10-01-09_17_10-515.jpeg	/Uploads/espacio/complejo_deportivo_municipal_de_bajo_san_antonio-2025-10-01-09_17_10-840.jpeg	/Uploads/espacio/complejo_deportivo_municipal_de_bajo_san_antonio-2025-10-01-09_17_10-109.jpeg	/Uploads/espacio/complejo_deportivo_municipal_de_bajo_san_antonio-2025-10-01-09_17_10-151.jpg	/Uploads/espacio/complejo_deportivo_municipal_de_bajo_san_antonio-2025-10-01-09_17_10-653.jpg
11	Coliseo Villa Esperanza	Villa Esperanza, El Alto	Espacio techado para futsal, básquet y vóley.	-16.495000	-68.177000	09:00:00	20:00:00	78	/Uploads/espacio/coliseo_villa_esperanza-2025-10-01-08_18_01-684.jpeg	/Uploads/espacio/coliseo_villa_esperanza-2025-10-01-08_18_01-149.jpeg	/Uploads/espacio/coliseo_villa_esperanza-2025-10-01-08_18_01-717.jpeg	/Uploads/espacio/coliseo_villa_esperanza-2025-10-01-08_18_01-759.jpeg	/Uploads/espacio/coliseo_villa_esperanza-2025-10-01-08_18_01-740.jpeg
16	Centro Futbolero	\N	\N	\N	\N	\N	\N	7	/Uploads/espacio/Centro_Futbolero-2025-10-13_22-42-37-91300.jpg	/Uploads/espacio/Centro_Futbolero-2025-10-13_22-38-14-11792.jpg	/Uploads/espacio/Centro_Futbolero-2025-10-13_22-38-45-15016.jpg	/Uploads/espacio/Centro_Futbolero-2025-10-13_22-38-45-96496.jpg	/Uploads/espacio/Centro_Futbolero-2025-10-13_22-38-45-94955.jpg
12	Complejo Deportivo Mariscal Braun	Zona Miraflores, La Paz	Complejo de fútbol con tradición liguera paceña.	-16.506000	-68.125000	08:00:00	18:00:00	11	/Uploads/espacio/complejo_deportivo_mariscal_braun-2025-10-01-08_19_00-756.jpg	/Uploads/espacio/complejo_deportivo_mariscal_braun-2025-10-01-08_19_00-427.jpg	/Uploads/espacio/complejo_deportivo_mariscal_braun-2025-10-01-08_19_00-351.jpeg	/Uploads/espacio/complejo_deportivo_mariscal_braun-2025-10-01-08_19_00-698.jpeg	/Uploads/espacio/complejo_deportivo_mariscal_braun-2025-10-01-08_19_00-720.jpeg
18	Estadio Hernando Siles 2025	Zona Cementerio, Calle Esperanza #1233	nuevo estadio La Paz	-16.496483	-68.119300	08:00:00	23:00:00	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 5123 (class 0 OID 74937)
-- Dependencies: 231
-- Data for Name: pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pago (id_pago, monto, metodo_pago, fecha_pago, id_reserva) FROM stdin;
4	60.00	transferencia	2025-09-28	2
3	100.00	efectivo	2025-09-14	1
1	10.00	QR	2025-12-10	19
2	10.00	transferencia	2025-11-03	19
5	10.00	tarjeta	2025-11-12	17
6	20.00	efectivo	2025-11-12	18
7	30.00	QR	2025-11-11	18
8	10.00	QR	2025-11-15	29
9	10.00	tarjeta	2025-11-15	29
10	10.00	tarjeta	2025-11-15	29
12	15.00	efectivo	2025-11-15	29
\.


--
-- TOC entry 5125 (class 0 OID 74941)
-- Dependencies: 233
-- Data for Name: participa_en; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.participa_en (id_deportista, id_reserva, fecha_reserva) FROM stdin;
16	1	2025-10-02
17	1	2025-10-02
18	1	2025-10-02
19	1	2025-10-02
20	1	2025-10-02
16	2	2025-10-04
17	2	2025-10-04
18	2	2025-10-04
16	3	2025-10-01
17	3	2025-10-01
18	3	2025-10-01
19	3	2025-10-01
20	3	2025-10-01
16	4	2025-10-05
17	4	2025-10-05
\.


--
-- TOC entry 5128 (class 0 OID 74951)
-- Dependencies: 236
-- Data for Name: ponderacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ponderacion (id_ponderacion, calificacion, id_cliente, id_cancha) FROM stdin;
\.


--
-- TOC entry 5130 (class 0 OID 74956)
-- Dependencies: 238
-- Data for Name: qr_reserva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qr_reserva (id_qr, fecha_generado, fecha_expira, qr_url_imagen, codigo_qr, estado, id_reserva, id_control, verificado) FROM stdin;
1	2025-09-30 18:00:00	2025-10-02 18:00:00	/Uploads/qr/qr_reserva_1_2025-10-16_09-27-32_83076.png	http://localhost:3000/reserva/dato-individual/1	activo	1	21	f
4	2024-01-15 18:30:00	2024-01-15 20:30:00	/Uploads/qr/qr_reserva_7_2025-10-16_09-27-48_21302.png	http://localhost:3000/reserva/dato-individual/7	usado	7	21	f
2	2025-10-12 14:10:00	2025-10-16 10:10:00	/Uploads/qr/qr_reserva_4_2025-10-14_00-27-57_86564.png	http://localhost:3000/reserva/dato-individual/4	activo	4	24	f
3	2025-10-12 06:11:00	2025-10-14 02:11:00	/Uploads/qr/qr_reserva_3_2025-10-14_00-28-24_16369.png	http://localhost:3000/reserva/dato-individual/3	expirado	3	23	f
7	2025-11-15 16:34:17.158	2025-11-16 16:34:17.158	/Uploads/qr/qr_reserva_29_2025-11-15_16-34-17_97811.png	http://localhost:3000/reserva/dato-individual/29	activo	29	\N	f
9	2025-11-15 20:05:34.034	2025-11-16 20:05:34.034	/Uploads/qr/qr_reserva_30_2025-11-15_20-05-34_54756.png	RESERVA:30:54756	expirado	30	\N	f
10	2025-11-15 20:09:08.791	2025-11-16 20:09:08.791	/Uploads/qr/qr_reserva_17_2025-11-15_20-09-08_97245.png	RESERVA:17:74611	activo	17	\N	f
\.


--
-- TOC entry 5132 (class 0 OID 74963)
-- Dependencies: 240
-- Data for Name: reporte_incidencia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reporte_incidencia (id_reporte, detalle, sugerencia, id_encargado, id_reserva, verificado) FROM stdin;
1	Durante el partido se dañó una de las redes de la cancha.	Reemplazar la red antes del próximo encuentro.	26	1	t
2	Luz quemada en uno de los reflectores de la cancha principal, lo que ocasiona una iluminación deficiente durante los partidos nocturnos y dificulta la visibilidad de los jugadores, árbitros y espectadores en esa zona específica del campo.	Revisar el sistema eléctrico y reemplazar el foco LED dañado.	27	4	t
3	Grietas visibles en el piso de la cancha de baloncesto.	Sellar y nivelar la superficie con resina epóxica deportiva.	26	3	t
\.


--
-- TOC entry 5134 (class 0 OID 74970)
-- Dependencies: 242
-- Data for Name: resena; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resena (id_resena, id_reserva, estrellas, comentario, fecha_creacion, estado, verificado, id_cliente, id_cancha) FROM stdin;
3	3	3	Falto servicios básicos que ayuden al usuario	2025-10-09 01:56:21.649861	t	t	11	3
4	2	1	La cancha estaba en pésimas condiciones, con hoyos y sin mantenimiento	2025-10-21 22:44:20.130459	f	f	14	3
5	7	1	El césped artificial completamente desgastado y peligroso	2025-10-21 22:45:37.357687	f	f	13	3
6	8	2	La cancha tenía zonas resbaladizas y otras con exceso de polvo	2025-10-21 22:46:03.498722	f	f	39	1
7	9	3	Cancha decente pero con algunas áreas desgastadas	2025-10-21 22:46:20.323976	f	f	40	1
8	10	4	Cancha en buen estado, césped bien mantenido	2025-10-21 22:47:24.795332	f	f	54	1
9	11	4	Iluminación adecuada para jugar de noche	2025-10-21 22:47:36.548086	f	f	14	2
10	12	5	Cancha impecable, césped de primera calidad	2025-10-21 22:47:47.944971	f	f	40	5
11	13	3	Cancha aceptable pero líneas desgastadas y redes dañadas	2025-10-21 23:16:06.265488	f	f	39	6
12	14	5	Proceso de reserva rápido y eficiente	2025-10-21 23:16:32.380506	f	f	11	6
13	15	2	Pocas bancas para descansar	2025-10-21 23:16:47.879659	f	f	14	7
14	16	1	El dueño fue grosero y no quiso reembolsar	2025-10-21 23:17:04.028194	f	f	51	9
2	4	5	Excelente servicio	2025-10-09 01:53:04.673144	t	t	15	4
16	17	3	buen ambiente, falta limpieza	2025-11-15 20:38:13.33904	f	t	15	10
1	1	4	Excelente experiencia, la cancha estaba en buen estado.	2025-09-29 18:09:32.531593	t	t	14	4
\.


--
-- TOC entry 5136 (class 0 OID 74980)
-- Dependencies: 244
-- Data for Name: reserva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reserva (id_reserva, fecha_reserva, cupo, monto_total, saldo_pendiente, estado, id_cliente, id_cancha) FROM stdin;
3	2025-10-01	8	300.00	100.00	en_cuotas	11	3
1	2025-10-02	6	250.00	50.00	pendiente	14	4
2	2025-10-04	4	150.00	75.00	en_cuotas	14	3
7	2025-10-23	36	200.00	50.00	pendiente	13	3
8	2025-10-22	16	200.00	\N	pagada	39	1
9	2025-10-23	25	200.00	50.00	pendiente	40	1
10	2025-10-25	19	200.00	\N	pagada	54	1
11	2025-10-23	28	150.00	20.00	pendiente	14	2
12	2025-10-29	27	100.00	100.00	pendiente	40	5
13	2025-10-31	28	100.00	50.00	pendiente	39	6
14	2025-10-30	18	100.00	50.00	pendiente	11	6
15	2025-10-22	10	120.00	10.00	pendiente	14	7
16	2025-10-24	12	150.00	\N	pagada	51	9
19	2025-12-14	10	30.00	10.00	en_cuotas	14	18
18	2025-11-11	20	100.00	50.00	pendiente	39	18
20	2025-12-14	20	50.00	0.00	pagada	11	18
4	2025-12-05	8	400.00	0.00	pendiente	15	4
29	2025-12-05	20	80.00	55.00	en_cuotas	79	4
30	2025-12-13	17	70.00	0.00	cancelada	79	2
17	2025-11-15	15	60.00	0.00	pagada	15	10
\.


--
-- TOC entry 5146 (class 0 OID 99414)
-- Dependencies: 254
-- Data for Name: reserva_deportista; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reserva_deportista (id_reserva_deportista, id_reserva, id_persona, fecha_union, estado) FROM stdin;
2	29	60	2025-11-15 23:14:18.176981	activo
\.


--
-- TOC entry 5137 (class 0 OID 74983)
-- Dependencies: 245
-- Data for Name: reserva_horario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reserva_horario (id_horario, id_reserva, fecha, hora_inicio, hora_fin, monto) FROM stdin;
2	1	2025-10-02	09:00:00	10:00:00	50.00
3	1	2025-10-02	10:00:00	11:00:00	50.00
4	1	2025-10-02	11:00:00	12:00:00	50.00
5	1	2025-10-02	12:00:00	13:00:00	50.00
6	2	2025-10-04	14:00:00	15:30:00	75.00
7	2	2025-10-04	15:30:00	17:00:00	75.00
8	3	2025-10-01	16:00:00	17:00:00	100.00
9	3	2025-10-01	17:00:00	18:00:00	100.00
10	3	2025-10-01	18:00:00	19:00:00	100.00
1	1	2025-10-02	08:00:00	09:00:00	100.00
13	19	2025-12-14	12:00:00	14:00:00	30.00
11	17	2025-11-16	08:00:00	10:00:00	60.00
15	20	2025-12-14	08:00:00	11:00:00	50.00
16	18	2025-11-11	10:30:00	12:30:00	100.00
17	4	2025-12-05	08:00:00	09:00:00	400.00
28	29	2025-12-05	17:00:00	18:00:00	40.00
29	29	2025-12-05	18:00:00	19:00:00	40.00
30	30	2025-12-13	08:00:00	09:00:00	35.00
31	30	2025-12-13	09:00:00	10:00:00	35.00
\.


--
-- TOC entry 5140 (class 0 OID 74988)
-- Dependencies: 248
-- Data for Name: se_practica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.se_practica (id_cancha, id_disciplina, frecuencia_practica) FROM stdin;
3	1	Diaria
3	2	Semanal
3	3	Mensual
4	1	Semanal
4	2	Mensual
4	3	Diaria
5	1	Mensual
5	2	Diaria
6	2	Semanal
6	3	Diaria
2	4	Frecuente
9	2	Regular
1	2	Regular
1	5	Regular
7	2	Regular
7	4	Regular
18	8	Regular
10	1	Regular
10	3	Regular
\.


--
-- TOC entry 5144 (class 0 OID 83032)
-- Dependencies: 252
-- Data for Name: solicitud_admin_esp_dep; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitud_admin_esp_dep (id_solicitud, id_usuario, id_espacio, motivo, fecha_solicitud, estado, decidido_por_admin, fecha_decision, comentario_decision) FROM stdin;
1	11	12	Conozco el lugar, quiero gestionar horarios y reseñas.	2025-11-07 01:09:32.018577	aprobada	1	2025-11-07 01:15:17.941102	\N
2	61	11	Tengo experiencia gestionando el complejo.	2025-11-07 01:33:37.209184	rechazada	1	2025-11-07 20:56:47.206094	no permitido
12	74	11	\N	2025-11-07 23:18:50.128838	rechazada	1	2025-11-08 01:34:04.286632	\N
16	78	11	\N	2025-11-08 12:01:27.887561	aprobada	1	2025-11-08 12:02:13.53212	\N
20	60	18	\N	2025-11-16 03:23:48.993648	pendiente	\N	\N	\N
\.


--
-- TOC entry 5148 (class 0 OID 99436)
-- Dependencies: 256
-- Data for Name: solicitud_rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitud_rol (id_solicitud, id_usuario, rol_destino, motivo, estado, fecha_solicitud, fecha_decision, decidido_por_admin, comentario_decision) FROM stdin;
11	60	encargado	\N	pendiente	2025-11-16 03:34:42.002978	\N	\N	\N
\.


--
-- TOC entry 5126 (class 0 OID 74944)
-- Dependencies: 234
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (id_persona, nombre, apellido, contrasena, telefono, correo, sexo, imagen_perfil, latitud, longitud, usuario, fecha_creacion) FROM stdin;
2	Juan	Vargas	$2b$10$6eFEmrdP5DasGPP0ayouye4nheWhuNfj8UwJl3OPgbNsNHVf0Mx0i		juan2@example.com	masculino	/Uploads/persona/1758986883731-88446451-lego.png	-16.523876	-68.204321	juan2	2025-10-05 20:42:44.853067
7	Pedro	Caceres	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	pedro@example.com	\N	/Uploads/persona/1758926093298-912862954-ancient.jpg	-16.467890	-68.190123	pedro7	2025-10-05 20:42:44.853067
6	Lucia	Tancara Quispe	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	lucia@example.com	femenino	/Uploads/persona/1758976924369-313717056-woman-profile-mascot-illustration-female-avatar-character-icon-cartoon-girl-head-face-business-user-logo-free-vector.jpg	-16.512345	-68.098765	lucia6	2025-10-05 20:42:44.853067
4	Kevin	Paco	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	kevin@example.com	masculino	/Uploads/persona/1758926001488-182654168-image_2.jpg	-16.542345	-68.178901	kevin4	2025-10-05 20:42:44.853067
5	María	Aduviri	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	maria@example.com	femenino	/Uploads/persona/1758976900793-480700748-5ba8f0664fac9942cd55cc17a4270029.jpg	-16.456789	-68.221234	maria5	2025-10-05 20:42:44.853067
13	Santiago	Quispe	$2b$10$l.umZJDsRKmigTRcJ7MB..s5aQjqSv2rVnzd1TPWi0yLtu/oR8xWO	\N	santiago@example.com	masculino	/Uploads/persona/1758987652779-703224593-chubaca.jpg	-16.486543	-68.201234	santiago13	2025-10-05 20:42:44.853067
10	Jenny	Vila	$2b$10$7RcpCNu3Zuy30F8C6vEHrOfo7xOLjkgi/qsm6zHEna7eJTjMfjekG	\N	jenny@example.com	femenino	/Uploads/persona/1758987013779-364663096-6f6b9f012c9b5efa9c6494e2bf2509bb.jpg	-16.574321	-68.123456	jenny10	2025-10-05 20:42:44.853067
9	Lucía	Tito Yupanqui	$2b$10$eLjLB.0Fz8tKkw3xJks.Qe9WgWNsxkbus2wO5wijWqouFp/Xg/Nwi	\N	lucia9@example.com	\N	/Uploads/persona/1758986949406-532497048-23d53ce292754e0902447a133006b0eb.jpg	-16.431234	-68.212345	lucia9	2025-10-05 20:42:44.853067
15	Matías	Quispe Puma	$2b$10$EIL5S3ohsUWNuijh6WicnePMX3L59Dv2IvWWwHm5PiB6RPIs7kz0S	\N	matias@example.com	\N	/Uploads/persona/1758987703313-291939961-mystery.jpg	-16.536789	-68.142345	matias15	2025-10-05 20:42:44.853067
3	Juanita	Jalizco	$2b$10$MIUXuTpU1r31ducNT/kzFeFiOIcl3hapZ9xwV1Md5wNGitFRAMIbW	27122343	juanita@example.com	femenino	/Uploads/persona/1758925482071-745252188-image_3.jpg	-16.478912	-68.115678	juanita3	2025-10-05 20:42:44.853067
12	Diego	Talavera	$2b$10$B.cJ2HuwERtJzgdRo4/LKuSgqio1QQwps0Sk0RK4Sx4lPdTEdk7j2	\N	diego@example.com	\N	/Uploads/persona/1758987628008-427296234-crazy.jpg	-16.562345	-68.154321	diego12	2025-10-05 20:42:44.853067
8	Anabel	Angus	$2b$10$h7NQizjsheLWAbmpBPtvWOeV.b7gXCuY0pcbyD8aHaQlMbAAagCo.	61234323	anabel@example.com	femenino	/Uploads/persona/1758927563599-149871330-fox_sleep.jpg	-16.589012	-68.167890	anabel8	2025-10-05 20:42:44.853067
43	Ilda	Torrez	123456	\N	ilda@gmail.com	\N	\N	-16.547522	-68.105732	ilda_torrez	2025-10-12 09:42:44.392438
18	Natalia	Valencia	$2b$10$/eyWIAY5nTjTda.ghZadcuFv8Eoz8DxBwJ0aG4JQ1CqurH2BF5e2C	\N	natalia@example.com	\N	/Uploads/persona/1758987760648-977665783-Pasted image (4).png	-16.549876	-68.116543	natalia18	2025-10-05 20:42:44.853067
39	Luna	Pérez	$2b$10$vCRxYplANiao27/vh7MrS.PSg6iTwAnkH5aPWBpsUGm1ufCf8spIG	\N	luna_22@gmail.com	\N	\N	-16.461096	-68.128693	luna_sol	2025-10-07 18:11:56.376697
20	Isabella	Vaca	$2b$10$94Dc34Ftmf.3X5kivaq/t.R4WEc7O.JfkEaQebSWqgKB6j02lzvGS	\N	isabella@example.com	\N	/Uploads/persona/1758987802392-606249869-Pasted image (5).png	-16.557890	-68.182345	isabella20	2025-10-05 20:42:44.853067
25	Tomás	Quino	$2b$10$2o4sUz4XXQDhZMOzA0sL2.YuPvv.w134zWKz60Qd.CiqewfytMlGm	\N	tomas@example.com	masculino	/Uploads/persona/1758987916534-335570872-harry_potter.jpg	-16.487654	-68.173456	tomas25	2025-10-05 20:42:44.853067
37	Helena	Callejas	$2b$10$PPJnrfYU3tBhDUV2qaIBeen1gUgN6qJAdCSNw8jJs7uBAPOwqBYzi	78346212	helena1990@example.com	\N	/Uploads/usuario/helenaX-2025-10-03_01-05-19-10952.jpg	\N	\N	helenaX	2025-10-05 20:42:44.853067
19	Emiliano	Puma	$2b$10$AU8d9Vgv3fskb4uikU42ceH0l2nKGaW4tc84p1GyRmnl.H/iVsnyW	\N	emiliano@example.com	\N	/Uploads/persona/1758987787380-120472782-snoopy.jpg	-16.444321	-68.226789	emiliano19	2025-10-05 20:42:44.853067
31	ChiJung	Chung	$2b$10$.hOX.3Ij.ne9KXoKIxArCOgvL4pCvJtC5Z.herN5LZvXkPy27focK	\N	jetin@example.com	\N	/Uploads/persona/ChiJung-2025-09-30_00-47-41.jpg	\N	\N	Jetinkiu	2025-10-05 20:42:44.853067
44	Evaristo	Caceres	123456	\N	evaristo@gmail.com	\N	\N	-16.525229	-68.169482	evaris	2025-10-12 10:05:52.520241
17	Bruno John	Quilla	$2b$10$QbGF/81OWrlXJLfHiu2uLuxqRV1KtQmJrB7P2x3CHfkniHs.5R3vO	\N	bruno@example.com	\N	/Uploads/persona/1758987744640-82053267-incredible.jpg	-16.471234	-68.207890	bruno17	2025-10-05 20:42:44.853067
45	Leandra	Moliné	123456	\N	leandra@gmail.com	\N	\N	-16.484901	-68.122904	leandra	2025-10-12 10:07:20.445052
57	Chamochi	Chico	$2b$10$tvXLLzfFG7b9HiGQH1aVpOUcKQj3h8FSFaX7N.6M2OFo3AZru8waq	\N	chamo@gmail.com	\N	/Uploads/usuario/usuario-2025-10-13_22-19-12-12871.jpg	-16.568455	-68.077876	chamochi2	2025-10-13 18:19:12.983249
23	Andrés	Gomez	$2b$10$F7Ztp5UuEzrkDZjIlfBGDOYgSQRwtb.FsnKIEvy3sTR5iMQRIW.8.	\N	andres@example.com	\N	/Uploads/persona/1758987862517-629923651-batman.jpg	-16.439876	-68.210987	andres23	2025-10-05 20:42:44.853067
32	Lilit	Lopez	$2b$10$ayvR.ZO3qR3v4CjQODr2u.mnvOIGwARasHOdMpmFptZ8BR18iKaYm	73812342	lilit@example.com	masculino	\N	-16.509617	-68.159848	lilit102	2025-10-05 20:42:44.853067
54	Panchito	VillaReal	$2b$10$Y.K6QxB3nsmB4SJnDwpoFe3LfMTac69X/5nCpiHPxTPHIQMHa7z9G	\N	panchito@gmail.com	\N	\N	-16.456153	-68.159093	panchito	2025-10-12 18:42:10.958007
26	Lía	Gutiérrez	$2b$10$abc123examplehash1	77511233	lia26@example.com	femenino	/Uploads/persona/lia26.jpg	-16.525106	-68.196994	lia00	2025-10-05 20:42:44.853067
28	Marco	Paredes	$2b$10$abc123examplehash2	77522344	marco28@example.com	masculino	/Uploads/persona/marco28.jpg	-16.532210	-68.187654	marco28	2025-10-05 20:42:44.853067
29	Camila	Torres	$2b$10$abc123examplehash3	77533455	camila29@example.com	femenino	/Uploads/persona/camila29.jpg	-16.518765	-68.172345	camila29	2025-10-05 20:42:44.853067
30	Diego	Salazar	$2b$10$abc123examplehash4	77544566	diego30@example.com	masculino	/Uploads/persona/diego30.jpg	-16.540987	-68.180123	diego30	2025-10-05 20:42:44.853067
40	Damiana	Aduviri	$2b$10$fdYMgPOTwg7iueEBAHwCIudEnpcTmRXIwxVQw4.EEt3IncjowCn9K	\N	dammy@gmail.com	\N	\N	-16.647472	-68.189496	dammy	2025-10-09 00:00:53.357067
14	Fernanda	Llusco	$2b$10$xF1KQtNvCALJZ9FoJM/SC.z6TXu5tpTC.xEbKk1eyYEPV.iuJ2nTm	\N	fernanda@example.com	\N	/Uploads/persona/1758987682780-108973594-175301007-businesswoman-cartoon-character-people-face-profiles-avatars-and-icons-close-up-image-of-smiling.jpg	-16.452198	-68.175678	fernanda14	2025-10-05 20:42:44.853067
16	Camila	Arredondo	$2b$10$enPBydtCvAO4OTysBizUBeodmHTdGWJFkiukVINZrYjFNmHIb8156	\N	camila@example.com	\N	/Uploads/persona/1758987728821-928409903-Pasted image.png	-16.521234	-68.193456	camila16	2025-10-05 20:42:44.853067
27	Lian	Talavera	$2b$10$Sm0K2Dc7X1Uftnyl2U.O0eqat/LGrdazxosGYjGyQd4am35STs4We	\N	lia22@example.com	\N	\N	-16.525106	-68.196994	lia26	2025-10-05 20:42:44.853067
1	Carlos Renan	VillaReal Fuentes	$2b$10$RLrmAAmBX0aXPeIIkChUC.lZioHdHyjxCh8Rx7awJNswS5W/x4o7e	63130742	michelona1682xd@gmail.com	masculino	/Uploads/usuario/Carlos_Renan-2025-10-13_22-18-24-60883.jpg	-16.495123	-68.133456	carlos1	2025-10-05 20:42:44.853067
22	Paula	Picapiedra	$2b$10$T6xkjzCd4LlO5fhl5jhMEuljnxaee3W7P4dwm9RXYM0yas8xfrtz.	\N	paula@example.com	\N	/Uploads/persona/1758987844121-411179743-Pasted image (6).png	-16.580987	-68.198765	paula22	2025-10-05 20:42:44.853067
48	Melania	Olmedo Quenta	$2b$10$cHhXJ.yifh5iR1KNJmJLse3/A4YZacT.DsfSpjAlHydTDTYkOXgg2	63130742	melania@gmail.com	femenino	\N	-16.523619	-68.188894	melany	2025-10-12 11:33:15.180104
24	Mariana	Martinz	$2b$10$OD2fXx33AtXzPb6gv05OjO/R5jV2jUGZWKaKXBCJFqLvGYOT6hQza	\N	mariana@example.com	\N	/Uploads/persona/1758987897457-109270865-a18b2793fd68ddffcf7d2072dab33440.jpg	-16.514321	-68.125678	mariana24	2025-10-05 20:42:44.853067
47	Isandro	Roldan	123456	\N	isandro@gmail.com	\N	\N	-16.489285	-68.179594	isandro	2025-10-12 10:15:56.766826
41	Himan	Salas	$2b$10$6yghigh.3Ow6/Tn1nSWE8O7wv8iydOpMCxGa7o6ExDMejwPR3R/bK	\N	hi@example.com	\N	\N	-16.624376	-68.169092	hi23423	2025-10-09 08:01:50.369654
42	Eva	Apaza Cadenas	123456	\N	evis@gmail.com	\N	\N	-16.498036	-68.133715	evis60	2025-10-12 09:34:29.932537
55	bugs bunny	\N	$2b$10$dnIhQh79EChyjQkq8SwsV.Ya4xUmJG0c2Om5Pzxq.g0aAbcwMGL..	\N	bugsbunny@gmail.com	\N	/Uploads/usuario/user-2025-10-13_17-22-41-21290.jpg	-16.570615	-68.110701	bugssy	2025-10-13 13:22:41.458192
49	Nuria	Campos	$2b$10$X1mNC72ipaqG0g5LXv1Yy.E1zkxFdNmoUGIdv.ZJc4Xmug2KNTiSS	\N	nuria@gmail.com	\N	\N	-16.460770	-68.218392	nuria_l	2025-10-12 11:43:20.454119
50	Esteban	Peredo	$2b$10$n8CVeecG.EeYDS1rGuAUVehzzr1D4I.VbD1i5pIDaUifhWpayftJi	\N	esteban@gmail.com	\N	\N	-16.521276	-68.214428	esteban	2025-10-12 12:05:33.649618
56	chubaca	\N	$2b$10$B0OBthQBqVyaq3YiZsJRVOMdYAjfezvnY543B6vWYBLoT41NiUaqu	\N	chucaca@gmail.com	\N	/Uploads/usuario/usuario-2025-10-13_21-07-56-63772.jpg	-16.594813	-68.245056	chubaca	2025-10-13 17:07:57.077691
51	Jackson	Mancilla	$2b$10$N7CeMgwKXLS4Zk57.Hk9O.y2ySJV1y915RjpOEK5RJg2FEgJG.J1C	783472819	jackson@gmail.com	\N	\N	-16.490393	-68.068777	jackson	2025-10-12 18:30:13.472032
46	Araceli	Vargas	123456	\N	ara@gmail.com	\N	\N	-16.470242	-68.167732	ara77	2025-10-12 10:13:09.87812
21	Joaquín	Tranca	$2b$10$aEWZCkf6P4vVCEgcYQpMl.aWYWDLHGyU.p30wHfeYbXTqPqajZYRy	\N	joaquin@example.com	\N	/Uploads/persona/1758987823985-359839422-mario.jpg	-16.465432	-68.135678	joaquin21	2025-10-05 20:42:44.853067
11	Valeria	Mendoza Carpio	$2b$10$e76XkR1xW8NhgybGGMHeVeGTXeVprBNiFeUeEJE8Vj1.goXqdBDVe	77544566	valeria@example.com	femenino	/Uploads/usuario/Valeria-2025-10-23_00-29-52-33830.jpg	-16.498765	-68.187654	valeria11	2025-10-05 20:42:44.853067
61	\N	\N	$2b$10$4wDlJwelo0aJGEVQjWWEIuKgwZVrf/9J6EQJ.m/wjyWqqzTbqWYT2	\N	genesis@example.com	\N	\N	-16.502915	-68.225595	genesis	2025-11-07 01:33:37.201653
74	\N	\N	$2b$10$Jew.1GDOt78mee7sVPsoN.JYKz7P1Roj6kQWynfbj9XjjKzh9ks22	\N	maxi01@example.com	\N	\N	-16.521608	-68.098806	maxi01	2025-11-07 23:18:50.124602
78	Camila	Roma	$2b$10$9x6gOth78ri7RNjRcLGNP.pHPGR.kCAMo4OLAaW6F7C7a37avoMIi	\N	cami@gmail.com	\N	\N	-16.532912	-68.227249	cami	2025-11-08 12:01:27.852611
79	\N	\N	$2b$10$0HH0QGbZY5eVnxOj3kHsBeQJ.Q1sVSurhuEzQjQLiy58MaqBD3Hvm	\N	jin@gmail.com	\N	\N	-16.498375	-68.230434	jin	2025-11-15 13:54:33.875939
60	Michelle	Poma	$2b$10$FEJw7VDMZxDobqSlRCPa0uEJUhZxuPwDeivu7ypQ5SvJSxi3CzCKu	65631119	michelle@example.com	femenino	\N	-16.498679	-68.113862	michelle	2025-11-05 23:09:34.579437
\.


--
-- TOC entry 5141 (class 0 OID 74991)
-- Dependencies: 249
-- Data for Name: x_imagen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.x_imagen (id_imagen, imagen, imagen_sec_1, nombre) FROM stdin;
4	/Uploads/x_prueba/img-2025-10-05_18-54-04-90968.jpg	\N	\N
5	/Uploads/x_prueba/usuario-2025-10-13_14-29-19-72573.jpg	\N	\N
6	/Uploads/x_prueba/usuario-2025-10-13_14-59-48-46728.jpg	\N	doggy
\.


--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 218
-- Name: cancha_id_cancha_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cancha_id_cancha_seq', 20, true);


--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 221
-- Name: comentario_id_comentario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comentario_id_comentario_seq', 1, true);


--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 225
-- Name: disciplina_id_disciplina_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.disciplina_id_disciplina_seq', 11, true);


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 227
-- Name: empresa_id_empresa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empresa_id_empresa_seq', 6, true);


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 230
-- Name: espacio_deportivo_id_espacio_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.espacio_deportivo_id_espacio_seq', 18, true);


--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 232
-- Name: pago_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pago_id_pago_seq', 12, true);


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 235
-- Name: persona_id_persona_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.persona_id_persona_seq', 79, true);


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 237
-- Name: ponderacion_id_ponderacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ponderacion_id_ponderacion_seq', 1, true);


--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 239
-- Name: qr_reserva_id_qr_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.qr_reserva_id_qr_seq', 10, true);


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 241
-- Name: reporte_incidencia_id_reporte_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reporte_incidencia_id_reporte_seq', 5, true);


--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 243
-- Name: resena_id_resena_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resena_id_resena_seq', 16, true);


--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 253
-- Name: reserva_deportista_id_reserva_deportista_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reserva_deportista_id_reserva_deportista_seq', 2, true);


--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 246
-- Name: reserva_horario_id_horario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reserva_horario_id_horario_seq', 31, true);


--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 247
-- Name: reserva_id_reserva_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reserva_id_reserva_seq', 30, true);


--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 251
-- Name: solicitud_admin_esp_dep_id_solicitud_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitud_admin_esp_dep_id_solicitud_seq', 20, true);


--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 255
-- Name: solicitud_rol_id_solicitud_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitud_rol_id_solicitud_seq', 11, true);


--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 250
-- Name: x_imagen_id_imagen_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.x_imagen_id_imagen_seq', 6, true);


--
-- TOC entry 4864 (class 2606 OID 75012)
-- Name: admin_esp_dep administrador_esp_deportivo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_esp_dep
    ADD CONSTRAINT administrador_esp_deportivo_pkey PRIMARY KEY (id_admin_esp_dep);


--
-- TOC entry 4866 (class 2606 OID 75014)
-- Name: administrador administrador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT administrador_pkey PRIMARY KEY (id_administrador);


--
-- TOC entry 4868 (class 2606 OID 75016)
-- Name: cancha cancha_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancha
    ADD CONSTRAINT cancha_pkey PRIMARY KEY (id_cancha);


--
-- TOC entry 4870 (class 2606 OID 75018)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (id_cliente);


--
-- TOC entry 4872 (class 2606 OID 75020)
-- Name: comentario comentario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT comentario_pkey PRIMARY KEY (id_comentario);


--
-- TOC entry 4874 (class 2606 OID 75022)
-- Name: control control_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.control
    ADD CONSTRAINT control_pkey PRIMARY KEY (id_control);


--
-- TOC entry 4876 (class 2606 OID 75024)
-- Name: deportista deportista_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportista
    ADD CONSTRAINT deportista_pkey PRIMARY KEY (id_deportista);


--
-- TOC entry 4878 (class 2606 OID 75026)
-- Name: disciplina disciplina_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplina
    ADD CONSTRAINT disciplina_pkey PRIMARY KEY (id_disciplina);


--
-- TOC entry 4880 (class 2606 OID 75028)
-- Name: empresa empresa_correo_empresa_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_correo_empresa_key UNIQUE (correo_empresa);


--
-- TOC entry 4882 (class 2606 OID 75030)
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id_empresa);


--
-- TOC entry 4884 (class 2606 OID 75032)
-- Name: encargado encargado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.encargado
    ADD CONSTRAINT encargado_pkey PRIMARY KEY (id_encargado);


--
-- TOC entry 4886 (class 2606 OID 75034)
-- Name: espacio_deportivo espacio_deportivo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.espacio_deportivo
    ADD CONSTRAINT espacio_deportivo_pkey PRIMARY KEY (id_espacio);


--
-- TOC entry 4888 (class 2606 OID 75036)
-- Name: pago pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pkey PRIMARY KEY (id_pago);


--
-- TOC entry 4892 (class 2606 OID 75038)
-- Name: usuario persona_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT persona_correo_key UNIQUE (correo);


--
-- TOC entry 4894 (class 2606 OID 75040)
-- Name: usuario persona_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT persona_pkey PRIMARY KEY (id_persona);


--
-- TOC entry 4896 (class 2606 OID 75042)
-- Name: usuario persona_usuario_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT persona_usuario_unique UNIQUE (usuario);


--
-- TOC entry 4890 (class 2606 OID 75044)
-- Name: participa_en pk_participa_en; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participa_en
    ADD CONSTRAINT pk_participa_en PRIMARY KEY (id_deportista, id_reserva);


--
-- TOC entry 4916 (class 2606 OID 75046)
-- Name: se_practica pk_se_practica; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.se_practica
    ADD CONSTRAINT pk_se_practica PRIMARY KEY (id_cancha, id_disciplina);


--
-- TOC entry 4898 (class 2606 OID 75048)
-- Name: ponderacion ponderacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT ponderacion_pkey PRIMARY KEY (id_ponderacion);


--
-- TOC entry 4902 (class 2606 OID 75050)
-- Name: qr_reserva qr_reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT qr_reserva_pkey PRIMARY KEY (id_qr);


--
-- TOC entry 4906 (class 2606 OID 75052)
-- Name: reporte_incidencia reporte_incidencia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia
    ADD CONSTRAINT reporte_incidencia_pkey PRIMARY KEY (id_reporte);


--
-- TOC entry 4908 (class 2606 OID 75054)
-- Name: resena resena_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resena
    ADD CONSTRAINT resena_pkey PRIMARY KEY (id_resena);


--
-- TOC entry 4925 (class 2606 OID 99421)
-- Name: reserva_deportista reserva_deportista_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_deportista
    ADD CONSTRAINT reserva_deportista_pkey PRIMARY KEY (id_reserva_deportista);


--
-- TOC entry 4914 (class 2606 OID 75056)
-- Name: reserva_horario reserva_horario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_horario
    ADD CONSTRAINT reserva_horario_pkey PRIMARY KEY (id_horario);


--
-- TOC entry 4912 (class 2606 OID 75058)
-- Name: reserva reserva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT reserva_pkey PRIMARY KEY (id_reserva);


--
-- TOC entry 4920 (class 2606 OID 83041)
-- Name: solicitud_admin_esp_dep solicitud_admin_esp_dep_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_admin_esp_dep
    ADD CONSTRAINT solicitud_admin_esp_dep_pkey PRIMARY KEY (id_solicitud);


--
-- TOC entry 4928 (class 2606 OID 99445)
-- Name: solicitud_rol solicitud_rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_rol
    ADD CONSTRAINT solicitud_rol_pkey PRIMARY KEY (id_solicitud);


--
-- TOC entry 4904 (class 2606 OID 75060)
-- Name: qr_reserva unq_qr_reserva; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT unq_qr_reserva UNIQUE (id_reserva);


--
-- TOC entry 4910 (class 2606 OID 99412)
-- Name: resena unq_resena_reserva_cliente; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resena
    ADD CONSTRAINT unq_resena_reserva_cliente UNIQUE (id_reserva, id_cliente);


--
-- TOC entry 4900 (class 2606 OID 75064)
-- Name: ponderacion uq_cliente_cancha; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT uq_cliente_cancha UNIQUE (id_cliente, id_cancha);


--
-- TOC entry 4918 (class 2606 OID 75066)
-- Name: x_imagen x_imagen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.x_imagen
    ADD CONSTRAINT x_imagen_pkey PRIMARY KEY (id_imagen);


--
-- TOC entry 4922 (class 1259 OID 99434)
-- Name: idx_reserva_deportista_persona; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reserva_deportista_persona ON public.reserva_deportista USING btree (id_persona);


--
-- TOC entry 4923 (class 1259 OID 99433)
-- Name: idx_reserva_deportista_reserva; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reserva_deportista_reserva ON public.reserva_deportista USING btree (id_reserva);


--
-- TOC entry 4926 (class 1259 OID 99432)
-- Name: ux_reserva_deportista_reserva_persona; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_reserva_deportista_reserva_persona ON public.reserva_deportista USING btree (id_reserva, id_persona);


--
-- TOC entry 4921 (class 1259 OID 83057)
-- Name: ux_solicitud_unica_pendiente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_solicitud_unica_pendiente ON public.solicitud_admin_esp_dep USING btree (id_usuario, id_espacio) WHERE (estado = 'pendiente'::public.estado_solicitud_admin_enum);


--
-- TOC entry 4937 (class 2606 OID 75067)
-- Name: empresa fk_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT fk_admin FOREIGN KEY (id_administrador) REFERENCES public.administrador(id_administrador) ON DELETE CASCADE;


--
-- TOC entry 4929 (class 2606 OID 75072)
-- Name: admin_esp_dep fk_admin_esp_dep_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_esp_dep
    ADD CONSTRAINT fk_admin_esp_dep_usuario FOREIGN KEY (id_admin_esp_dep) REFERENCES public.usuario(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4930 (class 2606 OID 75077)
-- Name: administrador fk_administrador_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrador
    ADD CONSTRAINT fk_administrador_usuario FOREIGN KEY (id_administrador) REFERENCES public.usuario(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4943 (class 2606 OID 75082)
-- Name: ponderacion fk_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT fk_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- TOC entry 4931 (class 2606 OID 75087)
-- Name: cancha fk_cancha_espacio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancha
    ADD CONSTRAINT fk_cancha_espacio FOREIGN KEY (id_espacio) REFERENCES public.espacio_deportivo(id_espacio) ON DELETE CASCADE;


--
-- TOC entry 4944 (class 2606 OID 75092)
-- Name: ponderacion fk_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ponderacion
    ADD CONSTRAINT fk_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON DELETE CASCADE;


--
-- TOC entry 4932 (class 2606 OID 75097)
-- Name: cliente fk_cliente_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT fk_cliente_usuario FOREIGN KEY (id_cliente) REFERENCES public.usuario(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4933 (class 2606 OID 75102)
-- Name: comentario fk_comentario_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT fk_comentario_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- TOC entry 4934 (class 2606 OID 75107)
-- Name: comentario fk_comentario_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comentario
    ADD CONSTRAINT fk_comentario_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON DELETE CASCADE;


--
-- TOC entry 4935 (class 2606 OID 75112)
-- Name: control fk_control_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.control
    ADD CONSTRAINT fk_control_usuario FOREIGN KEY (id_control) REFERENCES public.usuario(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4936 (class 2606 OID 75117)
-- Name: deportista fk_deportista_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deportista
    ADD CONSTRAINT fk_deportista_usuario FOREIGN KEY (id_deportista) REFERENCES public.usuario(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4938 (class 2606 OID 75122)
-- Name: encargado fk_encargado_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.encargado
    ADD CONSTRAINT fk_encargado_usuario FOREIGN KEY (id_encargado) REFERENCES public.usuario(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4939 (class 2606 OID 91209)
-- Name: espacio_deportivo fk_espacio_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.espacio_deportivo
    ADD CONSTRAINT fk_espacio_admin FOREIGN KEY (id_admin_esp_dep) REFERENCES public.admin_esp_dep(id_admin_esp_dep) ON DELETE SET NULL;


--
-- TOC entry 4940 (class 2606 OID 75132)
-- Name: pago fk_pago_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT fk_pago_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4941 (class 2606 OID 75137)
-- Name: participa_en fk_participa_deportista; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participa_en
    ADD CONSTRAINT fk_participa_deportista FOREIGN KEY (id_deportista) REFERENCES public.deportista(id_deportista) ON DELETE CASCADE;


--
-- TOC entry 4942 (class 2606 OID 75142)
-- Name: participa_en fk_participa_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participa_en
    ADD CONSTRAINT fk_participa_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4945 (class 2606 OID 75147)
-- Name: qr_reserva fk_qr_reserva_control; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT fk_qr_reserva_control FOREIGN KEY (id_control) REFERENCES public.control(id_control) ON DELETE SET NULL;


--
-- TOC entry 4946 (class 2606 OID 75152)
-- Name: qr_reserva fk_qr_reserva_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_reserva
    ADD CONSTRAINT fk_qr_reserva_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4947 (class 2606 OID 75157)
-- Name: reporte_incidencia fk_reporte_encargado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia
    ADD CONSTRAINT fk_reporte_encargado FOREIGN KEY (id_encargado) REFERENCES public.encargado(id_encargado) ON DELETE CASCADE;


--
-- TOC entry 4948 (class 2606 OID 75162)
-- Name: reporte_incidencia fk_reporte_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_incidencia
    ADD CONSTRAINT fk_reporte_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4949 (class 2606 OID 99406)
-- Name: resena fk_resena_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resena
    ADD CONSTRAINT fk_resena_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- TOC entry 4950 (class 2606 OID 99401)
-- Name: resena fk_resena_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resena
    ADD CONSTRAINT fk_resena_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON DELETE CASCADE;


--
-- TOC entry 4951 (class 2606 OID 75167)
-- Name: resena fk_resena_reserva; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resena
    ADD CONSTRAINT fk_resena_reserva FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4952 (class 2606 OID 75172)
-- Name: reserva fk_reserva_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- TOC entry 4953 (class 2606 OID 75177)
-- Name: reserva fk_reserva_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva
    ADD CONSTRAINT fk_reserva_cliente FOREIGN KEY (id_cliente) REFERENCES public.cliente(id_cliente) ON DELETE CASCADE;


--
-- TOC entry 4954 (class 2606 OID 75182)
-- Name: reserva_horario fk_reserva_horario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_horario
    ADD CONSTRAINT fk_reserva_horario FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4955 (class 2606 OID 75187)
-- Name: se_practica fk_se_practica_cancha; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.se_practica
    ADD CONSTRAINT fk_se_practica_cancha FOREIGN KEY (id_cancha) REFERENCES public.cancha(id_cancha) ON DELETE CASCADE;


--
-- TOC entry 4956 (class 2606 OID 75192)
-- Name: se_practica fk_se_practica_disciplina; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.se_practica
    ADD CONSTRAINT fk_se_practica_disciplina FOREIGN KEY (id_disciplina) REFERENCES public.disciplina(id_disciplina) ON DELETE CASCADE;


--
-- TOC entry 4960 (class 2606 OID 99427)
-- Name: reserva_deportista reserva_deportista_id_persona_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_deportista
    ADD CONSTRAINT reserva_deportista_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.usuario(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4961 (class 2606 OID 99422)
-- Name: reserva_deportista reserva_deportista_id_reserva_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reserva_deportista
    ADD CONSTRAINT reserva_deportista_id_reserva_fkey FOREIGN KEY (id_reserva) REFERENCES public.reserva(id_reserva) ON DELETE CASCADE;


--
-- TOC entry 4957 (class 2606 OID 83052)
-- Name: solicitud_admin_esp_dep solicitud_admin_esp_dep_decidido_por_admin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_admin_esp_dep
    ADD CONSTRAINT solicitud_admin_esp_dep_decidido_por_admin_fkey FOREIGN KEY (decidido_por_admin) REFERENCES public.usuario(id_persona);


--
-- TOC entry 4958 (class 2606 OID 83047)
-- Name: solicitud_admin_esp_dep solicitud_admin_esp_dep_id_espacio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_admin_esp_dep
    ADD CONSTRAINT solicitud_admin_esp_dep_id_espacio_fkey FOREIGN KEY (id_espacio) REFERENCES public.espacio_deportivo(id_espacio) ON DELETE CASCADE;


--
-- TOC entry 4959 (class 2606 OID 83042)
-- Name: solicitud_admin_esp_dep solicitud_admin_esp_dep_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_admin_esp_dep
    ADD CONSTRAINT solicitud_admin_esp_dep_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_persona) ON DELETE CASCADE;


--
-- TOC entry 4962 (class 2606 OID 99451)
-- Name: solicitud_rol solicitud_rol_decidido_por_admin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_rol
    ADD CONSTRAINT solicitud_rol_decidido_por_admin_fkey FOREIGN KEY (decidido_por_admin) REFERENCES public.usuario(id_persona);


--
-- TOC entry 4963 (class 2606 OID 99446)
-- Name: solicitud_rol solicitud_rol_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_rol
    ADD CONSTRAINT solicitud_rol_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_persona);


-- Completed on 2025-11-15 23:40:00

--
-- PostgreSQL database dump complete
--

\unrestrict bxBtF2KPgft1zPZh6mBv26d1zoXh3ETZCtG9vhyAt6BlfvKglivRNghod65Aaeg

