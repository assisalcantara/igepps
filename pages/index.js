import Link from 'next/link';
import dynamic from 'next/dynamic';

const Slider = dynamic(() => import('../src/components/SliderNovo'), { 
  ssr: false,
  loading: () => <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 flex items-center justify-center"><p>Carregando Slider...</p></div>
});

const CursosDestaque = dynamic(() => import('../src/components/CursosDestaque'), {
  ssr: false,
  loading: () => <div className="w-full py-16 flex items-center justify-center"><p>Carregando cursos...</p></div>
});

const NoticiasHome = dynamic(() => import('../src/components/NoticiasHome'), {
  ssr: false,
  loading: () => <div className="w-full py-16 flex items-center justify-center"><p>Carregando notícias...</p></div>
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* 1. Cabeçalho Institucional */}
      <header className="bg-blue-900 text-white py-4 md:py-6 shadow-md relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <img src="/images/igepps-logo2.png" alt="EDEP" className="h-10 md:h-14 w-auto" />
              <span className="text-lg md:text-2xl font-bold tracking-wide">Escola Digital de Educação Previdenciária</span>
            </div>
            
            {/* Menu Desktop */}
            <nav className="hidden lg:flex gap-4 items-center">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="#cursos" className="hover:underline">Cursos</Link>
              <Link href="#sobre" className="hover:underline">Sobre</Link>
              <Link href="#contato" className="hover:underline">Contato</Link>
              <Link href="/login" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-4 py-2 rounded shadow transition">Área do Aluno</Link>
              <Link href="/admin/dashboard" className="bg-white hover:bg-yellow-400 text-blue-900 font-semibold px-3 py-2 rounded shadow transition text-sm">Admin</Link>
            </nav>

            {/* Botões Mobile */}
            <div className="flex lg:hidden gap-2">
              <Link href="/login" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-3 py-2 rounded shadow transition text-sm">Área do Aluno</Link>
            </div>
          </div>
          
          {/* Menu Mobile - Links de Navegação */}
          <nav className="flex lg:hidden gap-4 mt-4 text-sm justify-center border-t border-blue-800 pt-3">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="#cursos" className="hover:underline">Cursos</Link>
            <Link href="#sobre" className="hover:underline">Sobre</Link>
            <Link href="/admin/dashboard" className="hover:underline">Admin</Link>
          </nav>
        </div>
      </header>

      {/* 2. Hero Principal / Slider Dinâmico */}
      <div className="w-full">
        <Slider />
      </div>
      {/* Comentário: Para adicionar novas imagens, colocar arquivos em `public/images/` com nomes slide1.jpg, slide2.jpg, slide3.jpg. Ajustar array em `src/components/Slider.jsx` se quiser mais slides. */}

      {/* 3. Cursos em Destaque - Dinâmico do banco de dados */}
      <div id="cursos">
        <CursosDestaque />
      </div>

      {/* 4. Temas Estratégicos NAPS - Cards Estáticos */}
      <section className="container mx-auto px-4 py-10 flex flex-col items-center bg-gray-50">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">TODOS OS CURSOS</h3>
        <div className="grid grid-cols-1 md:grid-grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
          {/* Cards dos temas estratégicos */}
          {[
            {
              id: 'planejamento-aposentadoria',
              titulo: 'Planejamento da Aposentadoria e Vida Pós-Carreira',
              descricao: 'Transição psicossocial, identidade profissional e projetos de vida na maturidade.',
              cargaHoraria: '30h',
              modulos: '3 Módulos'
            },
            {
              id: 'educacao-financeira',
              titulo: 'Educação Financeira e Previdenciária',
              descricao: 'Gestão de orçamento pessoal, investimentos para a maturidade e previdência complementar.',
              cargaHoraria: '20h',
              modulos: '2 Módulos'
            },
            {
              id: 'saude-qualidade-vida',
              titulo: 'Saúde e Qualidade de Vida no Envelhecimento',
              descricao: 'Hábitos saudáveis, prevenção de doenças e longevidade com qualidade de vida.',
              cargaHoraria: '25h',
              modulos: '3 Módulos'
            },
            {
              id: 'direitos-deveres-segurado',
              titulo: 'Direitos e Deveres do Segurado Previdenciário',
              descricao: 'Legislação previdenciária, benefícios do RPPS e garantias constitucionais.',
              cargaHoraria: '40h',
              modulos: '4 Módulos'
            },
            {
              id: 'rpps-gestao-publica',
              titulo: 'O RPPS e a Gestão Pública Participativa',
              descricao: 'Como funciona o Regime Próprio de Previdência Social e o papel do servidor.',
              cargaHoraria: '30h',
              modulos: '3 Módulos'
            },
            {
              id: 'inovacao-tecnologia-servico-publico',
              titulo: 'Inovação e Tecnologia no Serviço Público',
              descricao: 'Ferramentas digitais, produtividade e atendimento ao cidadão.',
              cargaHoraria: '15h',
              modulos: '2 Módulos'
            }
          ].map((tema) => (
            <div key={tema.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-200">
              <div className="bg-blue-900 text-white p-4">
                <span className="text-xs bg-yellow-400 text-blue-950 font-bold px-2.5 py-1 rounded-full uppercase">Tema NAPS</span>
                <h4 className="font-bold text-lg mt-2 line-clamp-2">{tema.titulo}</h4>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{tema.descricao}</p>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-4 pt-3 border-t border-gray-100">
                    <span>⏱️ Carga: <strong>{tema.cargaHoraria}</strong></span>
                    <span>📚 Estrutura: <strong>{tema.modulos}</strong></span>
                  </div>
                  <Link href="/login">
                    <button className="w-full bg-blue-900 text-white font-semibold py-2 rounded hover:bg-blue-800 transition text-sm">
                      Saiba Mais & Inscreva-se
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Depoimentos dos Alunos */}
      <section className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">O que dizem nossos alunos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                nome: "Maria Oliveira",
                cargo: "Servidora Pública Estadual",
                texto: "O curso de Planejamento da Aposentadoria mudou minha visão sobre o futuro. Excelente conteúdo e didática!"
              },
              {
                nome: "João Silva Santos",
                cargo: "Professor da Rede Estadual",
                texto: "Plataforma muito intuitiva e com materiais práticos. Recomendo a todos os colegas servidores do Pará."
              },
              {
                nome: "Ana Paula Souza",
                cargo: "Analista de Gestão",
                texto: "A EDEP facilita o aprendizado continuo. Consegui conciliar os estudos com minha rotina de trabalho facilmente."
              }
            ].map((dep, idx) => (
              <div key={idx} className="bg-white text-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
                <div className="w-16 h-16 bg-yellow-400 text-blue-900 font-bold text-2xl rounded-full flex items-center justify-center mb-4">
                  {dep.nome.charAt(0)}
                </div>
                <h4 className="font-bold text-lg text-blue-900 mb-1">{dep.nome}</h4>
                <p className="text-xs text-gray-500 mb-3">{dep.cargo}</p>
                <p className="text-gray-600 text-center text-sm">{dep.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Notícias / Blog */}
      <NoticiasHome />

      {/* 6.5. Nosso Presidente */}
      <section id="presidente" className="president bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="president__title text-3xl font-bold text-blue-900 text-center mb-12">
            Nosso Presidente
          </h2>
          
          <div className="president__container max-w-5xl mx-auto">
            <div className="president__card bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Imagem */}
                <div className="president__media bg-gray-100 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
                  <img 
                    src="/images/presidente-igepps.jpg" 
                    alt="Presidente Washington Costa de Albuquerque" 
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Conteúdo */}
                <div className="president__content p-8 md:p-10 flex flex-col justify-center">
                  <h3 className="president__name text-2xl font-bold text-blue-900 mb-4">
                    Washington Costa de Albuquerque
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    O Presidente Washington Costa de Albuquerque reforça o compromisso do IGEPPS com a modernização 
                    e o cuidado com nossos segurados. A IGEPPS Academy nasce para ampliar o acesso à informação, 
                    fortalecer a educação previdenciária e oferecer capacitação contínua com praticidade e qualidade.
                  </p>
                  <Link href="/login">
                    <button className="president__btn bg-blue-900 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto">
                      Acessar a IGEPPS Academy
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Sobre o IGEPPS Academy */}
      <section id="sobre" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-900">Sobre a EDEP</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Nossa plataforma de ensino a distância, dedicada a fortalecer a cidadania previdenciária no Pará.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-800">
            <h3 className="font-bold text-lg text-blue-900 mb-3">Missão da EDEP</h3>
            <p className="text-gray-700 text-sm">Promover uma gestão previdenciária eficiente, humanizada e orientada ao fortalecimento da cidadania previdenciária dos servidores públicos do Pará.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-800">
            <h3 className="font-bold text-lg text-blue-900 mb-3">Propósito da Plataforma EAD</h3>
            <p className="text-gray-700 text-sm">Oferecer formação continuada, qualificação profissional e conteúdos estratégicos de educação previdenciária e financeira, utilizando metodologias modernas e acessíveis no ambiente digital.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-800">
            <h3 className="font-bold text-lg text-blue-900 mb-3">Público Atendido</h3>
            <p className="text-gray-700 text-sm">Servidores públicos estaduais e municipais, segurados do RPPS estadual e demais cidadãos interessados em compreender seus direitos, deveres e oportunidades dentro do sistema previdenciário público.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-800">
            <h3 className="font-bold text-lg text-blue-900 mb-3">Nosso Compromisso Educacional</h3>
            <p className="text-gray-700 text-sm">Contribuir para a autonomia do segurado, o desenvolvimento do serviço público e a preparação para a aposentadoria, por meio de cursos online gratuitos, atualizados e alinhados às diretrizes do IGEPPS.</p>
          </div>
        </div>
      </section>

      {/* 8. Chamada para Ação (CTA) */}
      <section className="bg-yellow-400 py-10 flex flex-col items-center justify-center">
        <h3 className="text-2xl font-bold text-blue-900 mb-4">Já tem cadastro? Acesse agora!</h3>
        <Link href="/login" className="bg-blue-900 text-white font-bold px-8 py-3 rounded shadow hover:bg-blue-700 transition">Acessar Plataforma</Link>
      </section>

      {/* 9. Rodapé Institucional */}
      <footer id="contato" className="bg-blue-950 text-white py-8 mt-auto border-t border-blue-900">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <img src="/images/logobranca.png" alt="EDEP" className="h-10 md:h-12 w-auto object-contain" />
            <span className="text-xs md:text-sm font-semibold text-white">Escola Digital de Educação Previdenciária / IGEPPS</span>
          </div>

          <div className="flex items-center gap-4 text-xs md:text-sm">
            <a href="https://www.igepps.pa.gov.br/" target="_blank" rel="noopener" className="underline hover:text-yellow-400">Site Oficial</a>
            <span className="text-blue-700">|</span>
            <Link href="/termos-de-uso" className="underline hover:text-yellow-400">Termos de Uso</Link>
            <span className="text-blue-700">|</span>
            <Link href="/politica-de-privacidade" className="underline hover:text-yellow-400">Política de Privacidade</Link>
          </div>
        </div>
        <div className="text-center text-[11px] text-blue-300/80 mt-4 border-t border-blue-900/60 pt-3">
          &copy; {new Date().getFullYear()} EDEP - Escola Digital de Educação Previdenciária. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
