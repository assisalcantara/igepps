import React from 'react';

export default function Depoimentos(){
  const depoimentos = [
    { id:1, nome:'Maria Silva', cargo:'Servidora Pública - Belém/PA', texto:'O curso de Gestão Pública do IGEPPS foi transformador! O conteúdo é claro, atualizado e com exemplos práticos da realidade do nosso estado.', foto:'/images/slide1.jpg' },
    { id:2, nome:'João Pereira', cargo:'Gestor Escolar - Santarém/PA', texto:'A metodologia dos cursos é excelente. Consegui aplicar imediatamente os conceitos de finanças públicas no meu trabalho.', foto:'/images/slide2.jpg' },
    { id:3, nome:'Ana Costa', cargo:'Coordenadora de Projetos - Marabá/PA', texto:'O IGEPPS está de parabéns! As aulas são envolventes, os professores virtuais muito didáticos e a plataforma é fácil de usar.', foto:'/images/slide3.jpg' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-blue-900 mb-12 uppercase tracking-wide">Depoimentos de Alunos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {depoimentos.map(dep => (
            <div key={dep.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 text-left">
              <div className="flex items-center mb-4">
                <img src={dep.foto} alt={dep.nome} className="w-16 h-16 rounded-full border-4 border-blue-900 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">{dep.nome}</h3>
                  <p className="text-sm text-gray-500">{dep.cargo}</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed italic">“{dep.texto}”</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
