import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function NoticiasHome() {
  const router = useRouter();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarNoticias();
  }, []);

  const carregarNoticias = async () => {
    try {
      const response = await fetch('/api/noticias');
      const data = await response.json();
      // Filtrar apenas notícias ativas e pegar as 3 mais recentes
      const noticiasAtivas = data.filter(n => n.ativo).slice(0, 3);
      setNoticias(noticiasAtivas);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLerMais = (noticiaId) => {
    router.push(`/noticia/${noticiaId}`);
  };

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 uppercase tracking-wide">Notícias</h2>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (noticias.length === 0) {
    return null; // Não mostra a seção se não houver notícias
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-10 uppercase tracking-wide text-center">
          Últimas Notícias
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {noticias.map(noticia => (
            <article 
              key={noticia.id} 
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              {noticia.imagem && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={noticia.imagem} 
                    alt={noticia.titulo} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {noticia.categoria}
                  </span>
                  <span>{formatarData(noticia.dataPublicacao)}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {noticia.titulo}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {noticia.resumo}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Por {noticia.autor}</span>
                  <button
                    onClick={() => handleLerMais(noticia.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-md whitespace-nowrap"
                  >
                    Ler mais
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
