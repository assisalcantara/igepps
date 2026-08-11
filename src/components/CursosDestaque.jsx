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
            <div key={curso.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 text-left flex flex-col justify-between">
              <div>
                {/* Thumbnail / Header do Card igual ao Admin */}
                <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 w-full overflow-hidden">
                  {curso.thumbnail ? (
                    <img 
                      src={curso.thumbnail} 
                      alt={curso.titulo} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">📚</span>
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2">{curso.titulo}</h3>
                  <div 
                    className="text-sm text-gray-600 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: curso.descricao }}
                  />
                  
                  {/* Informações adicionais */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pt-2 border-t border-gray-100">
                    {curso.categoria && (
                      <span className="flex items-center gap-1">
                        <span>📂</span>
                        <span>{curso.categoria}</span>
                      </span>
                    )}
                    {curso.cargaHoraria && (
                      <span className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{curso.cargaHoraria}h</span>
                      </span>
                    )}
                    {curso.modulos && curso.modulos.length > 0 && (
                      <span className="flex items-center gap-1">
                        <span>📖</span>
                        <span>{curso.modulos.length} módulos</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botão no Rodapé */}
              <div className="p-5 pt-0">
                <button 
                  onClick={() => handleSaibaMais(curso.id)}
                  className="w-full bg-blue-900 text-white font-bold py-2.5 rounded-lg hover:bg-blue-800 transition-all text-sm shadow-md hover:shadow-lg"
                >
                  Saiba Mais & Inscreva-se
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
