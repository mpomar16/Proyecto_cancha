const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Función de respuesta estandarizada
const respuesta = (exito, mensaje, datos = null) => ({
  exito,
  mensaje,
  datos,
});

// MODELOS - Funciones puras para operaciones de base de datos

/**
 * Obtener datos específicos de empresas con información del administrador
 */
const obtenerDatosEspecificos = async (limite = 10, offset = 0) => {
  try {
    const queryDatos = `
       SELECT 
        e.id_empresa,
        e.fecha_registrado,
        e.nombre_sistema,
        e.logo_imagen,              -- 👈 AÑADIDO
        e.titulo_h1,                -- 👈 AÑADIDO
        e.descripcion_h1,           -- 👈 AÑADIDO
        e.te_ofrecemos,             -- 👈 AÑADIDO
        e.imagen_1,                 -- 👈 AÑADIDO
        e.imagen_2,                 -- 👈 AÑADIDO
        e.imagen_3,                 -- 👈 AÑADIDO
        e.titulo_1,                 -- 👈 AÑADIDO
        e.titulo_2,                 -- 👈 AÑADIDO
        e.titulo_3,                 -- 👈 AÑADIDO
        e.descripcion_1,            -- 👈 AÑADIDO
        e.descripcion_2,            -- 👈 AÑADIDO
        e.descripcion_3,            -- 👈 AÑADIDO
        e.mision,                   -- 👈 AÑADIDO
        e.vision,                   -- 👈 AÑADIDO
        e.nuestro_objetivo,         -- 👈 AÑADIDO
        e.objetivo_1,               -- 👈 AÑADIDO
        e.objetivo_2,               -- 👈 AÑADIDO
        e.objetivo_3,               -- 👈 AÑADIDO
        e.quienes_somos,            -- 👈 AÑADIDO
        e.correo_empresa,
        e.telefono,
        e.direccion,
        a.id_administrador,
        p.nombre AS admin_nombre,
        p.apellido AS admin_apellido
      FROM empresa e
      JOIN administrador a ON e.id_administrador = a.id_administrador
      JOIN usuario p ON a.id_administrador = p.id_persona
      ORDER BY e.id_empresa
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM empresa`;
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);
    return {
      empresas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener empresas con filtros de ordenamiento
 */
const obtenerEmpresasFiltradas = async (tipoFiltro, limite = 10, offset = 0) => {
  try {
    const ordenesPermitidas = {
      nombre: 'e.nombre_sistema ASC',
      fecha: 'e.fecha_registrado DESC',
      correo: 'e.correo_empresa ASC',
      default: 'e.id_empresa ASC'
    };

    const orden = ordenesPermitidas[tipoFiltro] || ordenesPermitidas.default;

    const queryDatos = `
      SELECT e.id_empresa, e.fecha_registrado, e.nombre_sistema, e.correo_empresa, e.telefono, e.direccion, 
             a.id_administrador, p.nombre AS admin_nombre, p.apellido AS admin_apellido
      FROM empresa e
      JOIN administrador a ON e.id_administrador = a.id_administrador
      JOIN usuario p ON a.id_administrador = p.id_persona
      ORDER BY ${orden}
      LIMIT $1 OFFSET $2
    `;
    const queryTotal = `SELECT COUNT(*) FROM empresa`;

    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [limite, offset]),
      pool.query(queryTotal)
    ]);

    return {
      empresas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw new Error(`Error al obtener empresas filtradas: ${error.message}`);
  }
};

/**
 * Buscar empresas por texto en múltiples campos
 */
const buscarEmpresas = async (texto, limite = 10, offset = 0) => {
  try {
    const queryDatos = `
      SELECT e.id_empresa, e.fecha_registrado, e.nombre_sistema, e.correo_empresa, e.telefono, e.direccion, 
             a.id_administrador, p.nombre AS admin_nombre, p.apellido AS admin_apellido
      FROM empresa e
      JOIN administrador a ON e.id_administrador = a.id_administrador
      JOIN usuario p ON a.id_administrador = p.id_persona
      WHERE 
        e.nombre_sistema ILIKE $1 OR 
        e.correo_empresa ILIKE $1 OR 
        e.direccion ILIKE $1 OR 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1
      ORDER BY e.nombre_sistema
      LIMIT $2 OFFSET $3
    `;

    const queryTotal = `
      SELECT COUNT(*) 
      FROM empresa e
      JOIN administrador a ON e.id_administrador = a.id_administrador
      JOIN usuario p ON a.id_administrador = p.id_persona
      WHERE 
        e.nombre_sistema ILIKE $1 OR 
        e.correo_empresa ILIKE $1 OR 
        e.direccion ILIKE $1 OR 
        p.nombre ILIKE $1 OR 
        p.apellido ILIKE $1
    `;
    
    const sanitizeInput = (input) => input.replace(/[%_\\]/g, '\\$&');
    const terminoBusqueda = `%${sanitizeInput(texto)}%`;
    
    const [resultDatos, resultTotal] = await Promise.all([
      pool.query(queryDatos, [terminoBusqueda, limite, offset]),
      pool.query(queryTotal, [terminoBusqueda])
    ]);

    return {
      empresas: resultDatos.rows,
      total: parseInt(resultTotal.rows[0].count)
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener empresa por ID
 */
const obtenerEmpresaPorId = async (id) => {
  try {
    const query = `
      SELECT e.*, a.id_administrador, p.nombre AS admin_nombre, p.apellido AS admin_apellido, p.correo AS admin_correo
      FROM empresa e
      JOIN administrador a ON e.id_administrador = a.id_administrador
      JOIN usuario p ON a.id_administrador = p.id_persona
      WHERE e.id_empresa = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Crear nueva empresa
 */
const crearEmpresa = async (datosEmpresa) => {
  try {
    // Validaciones básicas
    if (!datosEmpresa.nombre_sistema || datosEmpresa.nombre_sistema.trim() === '') {
      throw new Error('El nombre del sistema es obligatorio');
    }
    if (!datosEmpresa.id_administrador || isNaN(datosEmpresa.id_administrador)) {
      throw new Error('El ID del administrador es obligatorio y debe ser un número');
    }

    // Validar longitud de campos
    if (datosEmpresa.nombre_sistema.length > 100) {
      throw new Error('El nombre del sistema no debe exceder los 100 caracteres');
    }
    if (datosEmpresa.titulo_h1 && datosEmpresa.titulo_h1.length > 150) {
      throw new Error('El título H1 no debe exceder los 150 caracteres');
    }
    if (datosEmpresa.correo_empresa && datosEmpresa.correo_empresa.length > 150) {
      throw new Error('El correo de la empresa no debe exceder los 150 caracteres');
    }
    if (datosEmpresa.telefono && datosEmpresa.telefono.length > 50) {
      throw new Error('El teléfono no debe exceder los 50 caracteres');
    }
    if (datosEmpresa.logo_imagen && datosEmpresa.logo_imagen.length > 255) {
      throw new Error('La URL del logo no debe exceder los 255 caracteres');
    }
    if (datosEmpresa.imagen_1 && datosEmpresa.imagen_1.length > 255) {
      throw new Error('La URL de la imagen 1 no debe exceder los 255 caracteres');
    }
    if (datosEmpresa.imagen_2 && datosEmpresa.imagen_2.length > 255) {
      throw new Error('La URL de la imagen 2 no debe exceder los 255 caracteres');
    }
    if (datosEmpresa.imagen_3 && datosEmpresa.imagen_3.length > 255) {
      throw new Error('La URL de la imagen 3 no debe exceder los 255 caracteres');
    }
    if (datosEmpresa.titulo_1 && datosEmpresa.titulo_1.length > 150) {
      throw new Error('El título 1 no debe exceder los 150 caracteres');
    }
    if (datosEmpresa.titulo_2 && datosEmpresa.titulo_2.length > 150) {
      throw new Error('El título 2 no debe exceder los 150 caracteres');
    }
    if (datosEmpresa.titulo_3 && datosEmpresa.titulo_3.length > 150) {
      throw new Error('El título 3 no debe exceder los 150 caracteres');
    }

    // Validar formato de correo
    if (datosEmpresa.correo_empresa && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosEmpresa.correo_empresa)) {
      throw new Error('El correo de la empresa no es válido');
    }

    // Verificar si el administrador existe
    const adminQuery = `
      SELECT id_administrador FROM administrador WHERE id_administrador = $1
    `;
    const adminResult = await pool.query(adminQuery, [datosEmpresa.id_administrador]);
    if (!adminResult.rows[0]) {
      throw new Error('El administrador asociado no existe');
    }

    const query = `
      INSERT INTO empresa (
        nombre_sistema, logo_imagen, titulo_h1, descripcion_h1, te_ofrecemos, 
        imagen_1, imagen_2, imagen_3, titulo_1, titulo_2, titulo_3, 
        descripcion_1, descripcion_2, descripcion_3, mision, vision, 
        nuestro_objetivo, objetivo_1, objetivo_2, objetivo_3, quienes_somos, 
        correo_empresa, telefono, direccion, id_administrador
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
    `;

    const values = [
      datosEmpresa.nombre_sistema,
      datosEmpresa.logo_imagen || null,
      datosEmpresa.titulo_h1 || null,
      datosEmpresa.descripcion_h1 || null,
      datosEmpresa.te_ofrecemos || null,
      datosEmpresa.imagen_1 || null,
      datosEmpresa.imagen_2 || null,
      datosEmpresa.imagen_3 || null,
      datosEmpresa.titulo_1 || null,
      datosEmpresa.titulo_2 || null,
      datosEmpresa.titulo_3 || null,
      datosEmpresa.descripcion_1 || null,
      datosEmpresa.descripcion_2 || null,
      datosEmpresa.descripcion_3 || null,
      datosEmpresa.mision || null,
      datosEmpresa.vision || null,
      datosEmpresa.nuestro_objetivo || null,
      datosEmpresa.objetivo_1 || null,
      datosEmpresa.objetivo_2 || null,
      datosEmpresa.objetivo_3 || null,
      datosEmpresa.quienes_somos || null,
      datosEmpresa.correo_empresa || null,
      datosEmpresa.telefono || null,
      datosEmpresa.direccion || null,
      datosEmpresa.id_administrador
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (error) {
    console.error('Error al crear empresa:', error.message);
    throw new Error(error.message);
  }
};

/**
 * Actualizar empresa parcialmente
 */
const actualizarEmpresa = async (id, camposActualizar) => {
  try {
    const camposPermitidos = [
      'nombre_sistema', 'logo_imagen', 'titulo_h1', 'descripcion_h1', 'te_ofrecemos',
      'imagen_1', 'imagen_2', 'imagen_3', 'titulo_1', 'titulo_2', 'titulo_3',
      'descripcion_1', 'descripcion_2', 'descripcion_3', 'mision', 'vision',
      'nuestro_objetivo', 'objetivo_1', 'objetivo_2', 'objetivo_3', 'quienes_somos',
      'correo_empresa', 'telefono', 'direccion', 'id_administrador'
    ];

    const campos = Object.keys(camposActualizar).filter(key => 
      camposPermitidos.includes(key)
    );

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Validar longitud de campos
    if (camposActualizar.nombre_sistema && camposActualizar.nombre_sistema.length > 100) {
      throw new Error('El nombre del sistema no debe exceder los 100 caracteres');
    }
    if (camposActualizar.titulo_h1 && camposActualizar.titulo_h1.length > 150) {
      throw new Error('El título H1 no debe exceder los 150 caracteres');
    }
    if (camposActualizar.correo_empresa && camposActualizar.correo_empresa.length > 150) {
      throw new Error('El correo de la empresa no debe exceder los 150 caracteres');
    }
    if (camposActualizar.telefono && camposActualizar.telefono.length > 50) {
      throw new Error('El teléfono no debe exceder los 50 caracteres');
    }
    if (camposActualizar.logo_imagen && camposActualizar.logo_imagen.length > 255) {
      throw new Error('La URL del logo no debe exceder los 255 caracteres');
    }
    if (camposActualizar.imagen_1 && camposActualizar.imagen_1.length > 255) {
      throw new Error('La URL de la imagen 1 no debe exceder los 255 caracteres');
    }
    if (camposActualizar.imagen_2 && camposActualizar.imagen_2.length > 255) {
      throw new Error('La URL de la imagen 2 no debe exceder los 255 caracteres');
    }
    if (camposActualizar.imagen_3 && camposActualizar.imagen_3.length > 255) {
      throw new Error('La URL de la imagen 3 no debe exceder los 255 caracteres');
    }
    if (camposActualizar.titulo_1 && camposActualizar.titulo_1.length > 150) {
      throw new Error('El título 1 no debe exceder los 150 caracteres');
    }
    if (camposActualizar.titulo_2 && camposActualizar.titulo_2.length > 150) {
      throw new Error('El título 2 no debe exceder los 150 caracteres');
    }
    if (camposActualizar.titulo_3 && camposActualizar.titulo_3.length > 150) {
      throw new Error('El título 3 no debe exceder los 150 caracteres');
    }

    // Validar formato de correo
    if (camposActualizar.correo_empresa && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(camposActualizar.correo_empresa)) {
      throw new Error('El correo de la empresa no es válido');
    }

    // Validar administrador si se proporciona
    if (camposActualizar.id_administrador) {
      const adminQuery = `
        SELECT id_administrador FROM administrador WHERE id_administrador = $1
      `;
      const adminResult = await pool.query(adminQuery, [camposActualizar.id_administrador]);
      if (!adminResult.rows[0]) {
        throw new Error('El administrador asociado no existe');
      }
    }

    const setClause = campos.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
    const values = campos.map(campo => camposActualizar[campo] || null);
    
    const query = `
      UPDATE empresa 
      SET ${setClause}
      WHERE id_empresa = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar empresa
 */
const eliminarEmpresa = async (id) => {
  try {
    const query = 'DELETE FROM empresa WHERE id_empresa = $1 RETURNING id_empresa';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

// CONTROLADORES - Manejan las request y response

/**
 * Controlador para GET /datos-especificos
 */
const obtenerDatosEspecificosController = async (req, res) => {
  try {
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { empresas, total } = await obtenerDatosEspecificos(limite, offset);
    
    res.json(respuesta(true, 'Empresas obtenidas correctamente', {
      empresas,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerDatosEspecificos:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /filtro
 */
const obtenerEmpresasFiltradasController = async (req, res) => {
  try {
    const { tipo } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tiposValidos = ['nombre', 'fecha', 'correo'];
    if (!tipo || !tiposValidos.includes(tipo)) {
      return res.status(400).json(respuesta(false, 'El parámetro "tipo" es inválido o no proporcionado'));
    }

    const { empresas, total } = await obtenerEmpresasFiltradas(tipo, limite, offset);

    res.json(respuesta(true, `Empresas filtradas por ${tipo} obtenidas correctamente`, {
      empresas,
      filtro: tipo,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en obtenerEmpresasFiltradas:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /buscar
 */
const buscarEmpresasController = async (req, res) => {
  try {
    const { q } = req.query;
    const limite = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    if (!q) {
      return res.status(400).json(respuesta(false, 'El parámetro de búsqueda "q" es requerido'));
    }

    const { empresas, total } = await buscarEmpresas(q, limite, offset);
    
    res.json(respuesta(true, 'Empresas obtenidas correctamente', {
      empresas,
      paginacion: { limite, offset, total }
    }));
  } catch (error) {
    console.error('Error en buscarEmpresas:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para GET /dato-individual/:id
 */
const obtenerEmpresaPorIdController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de empresa no válido'));
    }

    const empresa = await obtenerEmpresaPorId(parseInt(id));

    if (!empresa) {
      return res.status(404).json(respuesta(false, 'Empresa no encontrada'));
    }

    res.json(respuesta(true, 'Empresa obtenida correctamente', { empresa }));
  } catch (error) {
    console.error('Error en obtenerEmpresaPorId:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para POST - Crear empresa
 */
const crearEmpresaController = async (req, res) => {
  try {
    const datos = req.body;

    // Validaciones básicas
    const camposObligatorios = ['nombre_sistema', 'id_administrador'];
    const faltantes = camposObligatorios.filter(campo => !datos[campo] || datos[campo].toString().trim() === '');

    if (faltantes.length > 0) {
      return res.status(400).json(
        respuesta(false, `Faltan campos obligatorios: ${faltantes.join(', ')}`)
      );
    }

    const nuevaEmpresa = await crearEmpresa(datos);

    res.status(201).json(respuesta(true, 'Empresa creada correctamente', { empresa: nuevaEmpresa }));
  } catch (error) {
    console.error('Error en crearEmpresa:', error.message);
    
    if (error.code === '23505') { // Violación de unique constraint
      return res.status(400).json(respuesta(false, 'El correo de la empresa ya existe'));
    }

    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para PATCH - Actualizar empresa
 */
const actualizarEmpresaController = async (req, res) => {
  try {
    const { id } = req.params;
    const camposActualizar = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de empresa no válido'));
    }

    if (Object.keys(camposActualizar).length === 0) {
      return res.status(400).json(respuesta(false, 'No se proporcionaron campos para actualizar'));
    }

    const empresaActualizada = await actualizarEmpresa(parseInt(id), camposActualizar);

    if (!empresaActualizada) {
      return res.status(404).json(respuesta(false, 'Empresa no encontrada'));
    }

    res.json(respuesta(true, 'Empresa actualizada correctamente', { empresa: empresaActualizada }));
  } catch (error) {
    console.error('Error en actualizarEmpresa:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

/**
 * Controlador para DELETE - Eliminar empresa
 */
const eliminarEmpresaController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json(respuesta(false, 'ID de empresa no válido'));
    }

    const empresaEliminada = await eliminarEmpresa(parseInt(id));

    if (!empresaEliminada) {
      return res.status(404).json(respuesta(false, 'Empresa no encontrada'));
    }

    res.json(respuesta(true, 'Empresa eliminada correctamente'));
  } catch (error) {
    console.error('Error en eliminarEmpresa:', error.message);
    res.status(500).json(respuesta(false, error.message));
  }
};

// RUTAS

// GET endpoints
router.get('/datos-especificos', obtenerDatosEspecificosController);
router.get('/filtro', obtenerEmpresasFiltradasController);
router.get('/buscar', buscarEmpresasController);
router.get('/dato-individual/:id', obtenerEmpresaPorIdController);

// POST, PATCH, DELETE endpoints
router.post('/', crearEmpresaController);
router.patch('/:id', actualizarEmpresaController);
router.delete('/:id', eliminarEmpresaController);

module.exports = router;