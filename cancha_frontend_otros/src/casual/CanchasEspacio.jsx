/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../Header';

const Cancha = () => {
  const { id } = useParams();
  const [canchas, setCanchas] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(12);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return '';
    const base = api.defaults.baseURL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return `${base}/${cleanPath}`;
  };

  const handleImageError = (e) => {
    console.error('Error cargando imagen:', e.target.src);
    e.target.style.display = 'none';
  };

  const fetchCanchas = async (search = '', filtro = 'default', page = 1) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      const offset = (page - 1) * limit;

      if (search) {
        response = await api.get(`/cancha-espacio-casual/buscar/${id}`, {
          params: { q: search, limit, offset },
        });
      } else if (filtro !== 'default') {
        response = await api.get(`/cancha-espacio-casual/filtro/${id}`, {
          params: { tipo: filtro, limit, offset },
        });
      } else {
        response = await api.get(`/cancha-espacio-casual/datos-especificos/${id}`, {
          params: { limit, offset },
        });
      }

      setCanchas(response.data.datos.canchas);
      setTotal(response.data.datos.paginacion.total);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las canchas');
      setLoading(false);
    }
  };

  const fetchResenas = async (idCancha) => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const resp = await api.get(`/resena-casual/por-cancha/${idCancha}`, {
        params: { limit: 10, offset: 0 },
      });

      if (!resp.data?.exito) {
        setReviews([]);
        setReviewsError(resp.data?.mensaje || 'No se pudieron cargar las resenas');
      } else {
        const datos = resp.data.datos || {};
        setReviews(datos.resenas || []);
      }
    } catch (e) {
      console.error('Error al cargar resenas publicas', e);
      setReviews([]);
      setReviewsError('Error al cargar las resenas');
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchCanchaDetails = async (idCancha) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/cancha-espacio-casual/dato-individual/${idCancha}`);
      setSelectedCancha(response.data.datos.cancha);
      setModalOpen(true);
      setLoading(false);
      fetchResenas(idCancha);
    } catch (err) {
      setError('Error al cargar los detalles de la cancha');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanchas(searchTerm, filter, currentPage);
  }, [id, filter, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCanchas(searchTerm, filter, 1);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCancha(null);
    setReviews([]);
    setReviewsError(null);
  };

  const totalPages = Math.ceil(total / limit);

  const getStarsDisplay = (value) => {
    const n = Math.max(1, Math.min(5, Number(value) || 0));
    const full = '⭐'.repeat(n);
    const empty = '☆'.repeat(5 - n);
    return full + empty;
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-6 font-sans">
      <Header />
      <div className="max-w-7xl mx-auto mt-28">
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <form onSubmit={handleSearch} className="w-full md:w-1/2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar canchas por nombre o ubicacion..."
                    className="w-full px-4 py-2 border border-[#23475F] rounded-md text-[#23475F] focus:outline-none focus:ring-2 focus:ring-[#01CD6C]"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#01CD6C] text-[#FFFFFF] px-3 py-1 rounded-md hover:bg-[#00b359]"
                  >
                    Buscar
                  </button>
                </div>
              </form>
              <div className="w-full md:w-1/3">
                <select
                  value={filter}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-[#23475F] rounded-md text-[#23475F] focus:outline-none focus:ring-2 focus:ring-[#01CD6C]"
                >
                  <option value="default">Sin filtro</option>
                  <option value="nombre">Ordenar por Nombre</option>
                  <option value="monto">Ordenar por Precio</option>
                  <option value="disciplina">Ordenar por Disciplina</option>
                </select>
              </div>
            </div>
            <Link
              to="/espacios-deportivos"
              className="inline-flex items-center gap-2 whitespace-nowrap bg-[#23475F] hover:bg-[#01CD6C] text-[#FFFFFF] font-semibold py-2 px-8 rounded-md transition-all duration-300"
            >
              <span>←</span>
              <span>Volver a Espacios</span>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#0F2634] mb-6">Canchas Disponibles</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#01CD6C]" />
            </div>
          ) : error ? (
            <div className="bg-[#A31621] text-[#FFFFFF] p-4 rounded-lg shadow-sm">
              <p className="font-medium">{error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {canchas.map((cancha) => (
                  <div
                    key={cancha.id_cancha}
                    className="bg-[#FFFFFF] rounded-2xl shadow-sm p-6 border border-[#23475F]/20 hover:shadow-md transition-shadow duration-300"
                  >
                    {cancha.imagen_cancha && (
                      <img
                        src={getImageUrl(cancha.imagen_cancha)}
                        alt={cancha.nombre}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        onError={handleImageError}
                      />
                    )}
                    <h3 className="text-xl font-semibold text-[#0F2634] mb-2">{cancha.nombre}</h3>
                    <p className="text-[#23475F] mb-2">
                      <span className="font-medium">Ubicacion:</span> {cancha.ubicacion}
                    </p>
                    <p className="text-[#01CD6C] font-semibold text-lg mb-2">
                      Bs. {cancha.monto_por_hora} / hora
                    </p>
                    {cancha.disciplinas && cancha.disciplinas.length > 0 && (
                      <p className="text-[#23475F] mb-4">
                        <span className="font-medium">Disciplinas:</span>{' '}
                        {cancha.disciplinas.map((d) => d.nombre).join(', ')}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => fetchCanchaDetails(cancha.id_cancha)}
                        className="bg-[#23475F] hover:bg-[#01CD6C] text-[#FFFFFF] py-2 px-4 rounded-md hover:bg-[#00b359] focus:outline-none focus:ring-2 focus:ring-[#23475F] text-sm"
                      >
                        Mas Informacion
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2 bg-[#FFFFFF] p-4 rounded-lg shadow-sm">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#23475F] text-[#FFFFFF] hover:bg-[#01CD6C]'
                      }`}
                    >
                      ← Anterior
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === pageNum
                              ? 'bg-[#01CD6C] text-[#FFFFFF]'
                              : 'bg-[#23475F] text-[#FFFFFF] hover:bg-[#01CD6C]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#23475F] text-[#FFFFFF] hover:bg-[#01CD6C]'
                      }`}
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}

              {canchas.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-[#23475F] text-lg mb-4">No se encontraron canchas</p>
                  <p className="text-[#23475F] text-sm">
                    Intenta con diferentes criterios de busqueda o filtros
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modalOpen && selectedCancha && (
        <div className="fixed inset-0 bg-[#0F2634] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#FFFFFF] p-6 rounded-lg shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-[#23475F] hover:text-[#01CD6C] text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-[#0F2634] mb-4">{selectedCancha.nombre}</h2>
            
            <div className="space-y-6">
              {selectedCancha.imagen_cancha && (
                <div className="text-center">
                  <img
                    src={getImageUrl(selectedCancha.imagen_cancha)}
                    alt={selectedCancha.nombre}
                    className="w-full max-w-md h-64 object-cover rounded-lg mx-auto"
                    onError={handleImageError}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-[#23475F]">
                    <span className="font-medium text-[#0F2634]">Espacio Deportivo:</span>{' '}
                    <span className="text-[#01CD6C]">{selectedCancha.espacio_nombre}</span>
                  </p>
                  <p className="text-[#23475F]">
                    <span className="font-medium text-[#0F2634]">Direccion del Espacio:</span>{' '}
                    {selectedCancha.espacio_direccion}
                  </p>
                  <p className="text-[#23475F]">
                    <span className="font-medium text-[#0F2634]">Ubicacion en el Espacio:</span>{' '}
                    {selectedCancha.ubicacion}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[#23475F] text-2xl font-bold text-center">
                    <span className="text-[#01CD6C]">Bs. {selectedCancha.monto_por_hora}</span>{' '}
                    <span className="text-sm text-[#23475F]">por hora</span>
                  </p>
                  {selectedCancha.capacidad && (
                    <p className="text-[#23475F] text-center bg-[#01CD6C]/10 p-2 rounded-lg">
                      <span className="font-medium text-[#0F2634]">Capacidad:</span>{' '}
                      <span className="text-[#01CD6C] font-semibold">
                        {selectedCancha.capacidad} personas
                      </span>
                    </p>
                  )}
                  {selectedCancha.estado && (
                    <p
                      className={`text-center p-2 rounded-lg ${
                        selectedCancha.estado === 'disponible'
                          ? 'bg-[#01CD6C]/10 text-[#01CD6C]'
                          : 'bg-[#A31621]/10 text-[#A31621]'
                      }`}
                    >
                      <span className="font-medium text-[#0F2634]">Estado:</span>{' '}
                      <span className="font-semibold">{selectedCancha.estado}</span>
                    </p>
                  )}
                </div>
              </div>

              {selectedCancha.disciplinas && selectedCancha.disciplinas.length > 0 && (
                <div className="bg-[#F8F9FA] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-[#0F2634] mb-3">Disciplinas Disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCancha.disciplinas.map((disciplina) => (
                      <div
                        key={disciplina.id_disciplina}
                        className="bg-[#FFFFFF] p-3 rounded-md border border-[#23475F]/20"
                      >
                        <h4 className="font-medium text-[#0F2634] mb-1">{disciplina.nombre}</h4>
                        <p className="text-[#23475F] text-sm mb-2">
                          {disciplina.descripcion || 'Sin descripcion disponible'}
                        </p>
                        {disciplina.frecuencia_practica && (
                          <p className="text-[#01CD6C] text-sm font-medium">
                            Frecuencia: {disciplina.frecuencia_practica}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-[#23475F]/20">
                <h3 className="text-lg font-semibold text-[#0F2634] mb-3">Resenas de clientes</h3>

                {reviewsLoading && (
                  <p className="text-sm text-[#23475F]">Cargando resenas...</p>
                )}

                {reviewsError && !reviewsLoading && (
                  <p className="text-sm text-red-600">{reviewsError}</p>
                )}

                {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                  <p className="text-sm text-[#64748B]">
                    Aun no hay resenas para esta cancha.
                  </p>
                )}

                {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id_resena}
                        className="bg-[#FFFFFF] border border-[#23475F]/10 rounded-md p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-semibold text-[#0F2634]">
                            👤 {rev.cliente_nombre} {rev.cliente_apellido}
                          </div>
                          <div className="text-xs text-[#64748B]">
                            {rev.fecha_creacion
                              ? String(rev.fecha_creacion).substring(0, 10)
                              : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className="text-[#01CD6C] text-s">
                              {i < rev.estrellas ? "★" : "☆"}
                            </span>
                          ))}
                          <span className="text-[#01CD6C] text-s font-semibold ml-1">
                            {rev.estrellas}/5
                          </span>
                        </div>

                        {rev.comentario && (
                          <p className="text-sm text-[#23475F] whitespace-pre-line">
                            {rev.comentario}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-[#23475F] hover:bg-[#01CD6C] text-[#FFFFFF] py-3 px-6 rounded-md transition-all duration-300 text-center font-semibold"
                >
                  Cerrar
                </button>
                <Link
                  to={`/reservar/${selectedCancha.id_cancha}`}
                  className="flex-1 bg-[#01CD6C] hover:bg-[#00b359] text-[#FFFFFF] py-3 px-6 rounded-md transition-all duration-300 text-center font-semibold shadow-lg hover:shadow-xl"
                >
                  Reservar Ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cancha;
