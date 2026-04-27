import React, { useEffect, useState } from 'react';

export default function Slider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch('/api/slider');
        if (!res.ok) throw new Error('Falha na resposta da API');
        const data = await res.json();
        if (data && data.length > 0) {
          setSlides(data);
        }
      } catch (error) {
        console.error("Erro ao buscar slides:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrent(prev => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [slides.length]);

  if (loading || slides.length === 0) {
    return (
      <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{loading ? "Carregando slides..." : "Nenhuma imagem no slider"}</h2>
          {!loading && <p>Adicione imagens no painel de administração.</p>}
        </div>
      </section>
    );
  }

  const slideAtual = slides[current];

  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-100">
      {/* Container da imagem */}
      <div className="absolute inset-0">
        <img 
          src={slideAtual.url} 
          alt={slideAtual.titulo} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay gradiente escuro */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Conteúdo de texto - INFERIOR ESQUERDO */}
      <div className="absolute" style={{ bottom: '80px', left: '48px', zIndex: 10, maxWidth: '850px' }}>
        <h2 className="text-white font-bold mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', textShadow: '0 4px 12px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,0.8)', lineHeight: '1.2' }}>
          {slideAtual.titulo}
        </h2>
        <p className="text-yellow-300 font-semibold" style={{ fontSize: 'clamp(1rem, 2.2vw, 1.5rem)', textShadow: '0 3px 8px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,0.8)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
          {slideAtual.descricao}
        </p>
      </div>

      {/* Botões de navegação */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={() => setCurrent((current - 1 + slides.length) % slides.length)} 
            className="absolute top-1/2 left-2 md:left-4 -translate-y-1/2 bg-blue-900/80 hover:bg-blue-900 text-white p-3 rounded-full transition-all z-50 text-xl font-bold"
            style={{ width: '48px', height: '48px' }}
          >
            ‹
          </button>
          <button 
            onClick={() => setCurrent((current + 1) % slides.length)} 
            className="absolute top-1/2 right-2 md:right-4 -translate-y-1/2 bg-blue-900/80 hover:bg-blue-900 text-white p-3 rounded-full transition-all z-50 text-xl font-bold"
            style={{ width: '48px', height: '48px' }}
          >
            ›
          </button>
          
          {/* Indicadores */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-50">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current 
                    ? 'bg-yellow-400 w-8 h-3' 
                    : 'bg-white/60 hover:bg-white/80 w-3 h-3'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}