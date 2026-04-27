import React, { useEffect, useState } from 'react';

export default function SliderNovo() {
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
    <section style={{ position: 'relative', width: '100%', height: '600px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
      {/* Imagem de fundo */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <img 
          src={slideAtual.url} 
          alt={slideAtual.titulo}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Overlay escuro */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
          zIndex: 1
        }}
      />

      {/* Textos - INFERIOR ESQUERDO */}
      <div 
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '48px',
          zIndex: 10,
          maxWidth: '850px'
        }}
      >
        <h1 
          style={{
            color: '#ffffff',
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            textShadow: '0 4px 12px rgba(0,0,0,1)',
            lineHeight: '1.2'
          }}
        >
          {slideAtual.titulo}
        </h1>
        
        <div 
          style={{
            color: '#fde047',
            fontSize: 'clamp(1rem, 2.2vw, 1.5rem)',
            fontWeight: '600',
            textShadow: '0 3px 8px rgba(0,0,0,1)',
            lineHeight: '1.7',
            whiteSpace: 'pre-line'
          }}
        >
          {slideAtual.descricao}
        </div>
      </div>

      {/* Botões de navegação */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '1rem',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(30, 58, 138, 0.8)',
              color: 'white',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 20,
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 0.8)'}
          >
            ‹
          </button>
          
          <button 
            onClick={() => setCurrent((current + 1) % slides.length)}
            style={{
              position: 'absolute',
              top: '50%',
              right: '1rem',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(30, 58, 138, 0.8)',
              color: 'white',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              zIndex: 20,
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 0.8)'}
          >
            ›
          </button>
          
          {/* Indicadores */}
          <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 20 }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? '32px' : '12px',
                  height: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: i === current ? '#fbbf24' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
