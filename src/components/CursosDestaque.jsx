import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function CursosDestaque(){
  const router = useRouter();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCursos();
  }, []);

  const carregarCursos = async () => {
    try {
      const response = await fetch('/api/cursos');
      const data = await response.json();
      // Filtrar apenas cursos ativos e pegar os 6 primeiros
      const cursosAtivos = data.filter(c => c.ativo).slice(0, 6);
      setCursos(cursosAtivos);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaibaMais = (cursoId) => {
    router.push(`/curso/${cursoId}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 uppercase tracking-wide">Cursos em Destaque</h2>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (cursos.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-10 uppercase tracking-wide">Cursos em Destaque</h2>
          <p className="text-gray-600">Em breve novos cursos disponíveis...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-10 uppercase tracking-wide">Cursos em Destaque</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cursos.map(curso => (
            <div key={curso.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-4 sm:p-6 text-left flex flex-col items-center">
                {/* Imagem/Ícone no topo */}
                <div className="mb-4 w-[200px]">
                  {curso.thumbnail ? (
                    <img 
                      src={curso.thumbnail} 
                      alt={curso.titulo} 
                      className="h-[100px] w-full object-contain"
                    />
                  ) : (
                    <div className="h-[100px] w-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                      <span className="text-white text-4xl">📚</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2 line-clamp-2 text-center w-full">{curso.titulo}</h3>
                <div 
                  className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3 w-full"
                  dangerouslySetInnerHTML={{ __html: curso.descricao }}
                />
                
                {/* Informações adicionais */}
                <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500 mb-4 w-full">
                  {curso.modulos && curso.modulos.length > 0 && (
                    <span className="flex items-center">
                      <span className="mr-1">📋</span>
                      {curso.modulos.length} módulos
                    </span>
                  )}
                  {curso.cargaHoraria && (
                    <span className="flex items-center">
                      <span className="mr-1">⏱️</span>
                      {curso.cargaHoraria}
                    </span>
                  )}
                </div>

                <button 
                  onClick={() => handleSaibaMais(curso.id)}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 sm:py-2.5 px-6 rounded-md transition-colors duration-300 w-[200px]"
                >
                  Saiba Mais
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
