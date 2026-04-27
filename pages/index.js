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
      <header className="bg-blue-900 text-white py-4 md:py-6 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <img src="/images/igepps-logo.png" alt="IGEPPS" className="h-8 md:h-12 w-auto" />
              <span className="text-lg md:text-2xl font-bold tracking-wide">IGEPPS Academy</span>
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
      <CursosDestaque />

      {/* 4. Temas Estratégicos NAPS - Cards Estáticos */}
      <section className="container mx-auto px-4 py-10 flex flex-col items-center bg-gray-50">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">TODOS OS CURSOS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
          {/* Cards dos temas estratégicos */}
          {[
            {
              id: 'planejamento-aposentadoria',
              titulo: 'Planejamento da Aposentadoria e Vida Pós-Carreira',
              descricao: 'Transição psicossocial, identidade profissional e projetos de vida na maturidade.',
              img: '/images/cursos/aposentadoria.png',
            },
            {
              id: 'educacao-financeira',
              titulo: 'Educação Financeira e Previdenciária',
              descricao: 'Gestão de finanças, previdência complementar e sustentabilidade financeira.',
              img: '/images/cursos/financeira.png',
            },
            {
              id: 'saude-longevidade',
              titulo: 'Saúde Integral e Longevidade',
              descricao: 'Saúde mental, prevenção de doenças e longevidade ativa.',
              img: '/images/cursos/saude.png',
            },
            {
              id: 'direitos-previdenciarios',
              titulo: 'Direitos Previdenciários e Atualizações Normativas',
              descricao: 'Regras de aposentadoria, pensão por morte e reforma da previdência.',
              img: '/images/cursos/direitos.png',
            },
            {
              id: 'cidadania-digital',
              titulo: 'Inovação e Cidadania Digital para Segurados',
              descricao: 'Serviços digitais, cidadania digital e cibersegurança.',
              img: '/images/cursos/digital.png',
            },
          ].map((curso, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center hover:scale-105 transition">
              <img src={curso.img} alt={curso.titulo} className="h-16 w-16 mb-4" />
              <span className="text-lg font-bold text-blue-900 mb-2">{curso.titulo}</span>
              <p className="text-gray-600 mb-2 text-sm">{curso.descricao}</p>
              <Link href={`/curso-estatico/${curso.id}`}>
                <span className="bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 transition cursor-pointer">Saiba Mais</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Áreas de Formação (opcional, oculta) */}
      {/*
      <section className="container mx-auto px-4 py-10">
        <h3 className="text-2xl font-bold text-blue-900 mb-6">Áreas de Formação</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {['Saúde', 'Formação Geral', 'Formação Técnica', 'Administração Pública', 'Cursos Livres'].map((area, idx) => (
            <div key={idx} className="bg-blue-100 rounded-lg p-6 text-center font-semibold text-blue-900 shadow">
              {area}
            </div>
          ))}
        </div>
      </section>
      */}

      {/* 5. Depoimentos / Avaliações - Centralizado */}
      <section className="bg-blue-50 py-10 flex flex-col items-center">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">Depoimentos</h3>
          <div className="flex gap-6 overflow-x-auto pb-4 justify-center">
            {[{
              nome: 'Maria Souza',
              texto: 'O curso foi excelente, aprendi muito e recomendo a todos os servidores!',
              foto: '/images/cursos/aluno1.png',
            }, {
              nome: 'João Silva',
              texto: 'Plataforma fácil de usar e conteúdo de qualidade.',
              foto: '/images/cursos/aluno2.png',
            }, {
              nome: 'Ana Lima',
              texto: 'O suporte do IGEPPS me ajudou em todas as etapas.',
              foto: '/images/cursos/aluno3.png',
            }].map((dep, idx) => (
              <div key={idx} className="min-w-[220px] bg-white rounded-xl shadow-lg p-4 flex flex-col items-center text-center">
                <img src={dep.foto} alt={dep.nome} className="h-16 w-16 rounded-full mb-2 object-cover" />
                <span className="font-bold text-blue-900 mb-1">{dep.nome}</span>
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
          <h2 className="text-3xl font-bold text-blue-900">Sobre o IGEPPS Academy</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Nossa plataforma de ensino a distância, dedicada a fortalecer a cidadania previdenciária no Pará.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-blue-800">
            <h3 className="font-bold text-lg text-blue-900 mb-3">Missão do IGEPPS</h3>
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
      <footer className="bg-blue-900 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} IGEPPS - Instituto de Gestão Previdenciária do Estado do Pará</span>
          <div className="flex gap-4">
            <a href="https://www.igepps.pa.gov.br/" target="_blank" rel="noopener" className="underline hover:text-yellow-400">Site Oficial</a>
            <Link href="/termos-de-uso" className="underline hover:text-yellow-400">Termos de Uso</Link>
            <Link href="/politica-de-privacidade" className="underline hover:text-yellow-400">Política de Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
