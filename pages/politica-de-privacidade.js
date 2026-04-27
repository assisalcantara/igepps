import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const PoliticaDePrivacidade = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>Política de Privacidade - IGEPPS Academy</title>
      </Head>

      {/* Cabeçalho Institucional */}
      <header className="bg-blue-900 text-white py-4 md:py-6 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 md:gap-3">
              <img src="/images/igepps-logo.png" alt="IGEPPS" className="h-8 md:h-12 w-auto" />
              <span className="text-lg md:text-2xl font-bold tracking-wide">IGEPPS Academy</span>
            </div>
            
            {/* Menu Desktop */}
            <nav className="hidden lg:flex gap-4">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/#cursos" className="hover:underline">Cursos</Link>
              <Link href="/#sobre" className="hover:underline">Sobre</Link>
              <Link href="/#contato" className="hover:underline">Contato</Link>
              <Link href="/login" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-4 py-2 rounded shadow transition">Área do Aluno</Link>
            </nav>

            {/* Botões Mobile */}
            <div className="flex lg:hidden gap-2">
              <Link href="/login" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-3 py-2 rounded shadow transition text-sm">Área do Aluno</Link>
            </div>
          </div>
          
          {/* Menu Mobile - Links de Navegação */}
          <nav className="flex lg:hidden gap-4 mt-4 text-sm justify-center border-t border-blue-800 pt-3">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/#cursos" className="hover:underline">Cursos</Link>
            <Link href="/#sobre" className="hover:underline">Sobre</Link>
          </nav>
        </div>
      </header>

      {/* Título da Página */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Política de Privacidade - IGEPPS Academy
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Última atualização: 14 de novembro de 2025
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">1. Coleta de Informações</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Coletamos informações que você nos fornece diretamente, como quando você cria uma conta, se inscreve em um curso ou se comunica conosco. Isso pode incluir seu nome, e-mail e informações de pagamento.
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">2. Uso das Informações</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Usamos as informações que coletamos para operar, manter e fornecer os recursos e a funcionalidade da plataforma, processar pagamentos, nos comunicar com você e personalizar sua experiência de aprendizado.
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">3. Compartilhamento de Informações</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Não compartilhamos suas informações pessoais com terceiros, exceto conforme descrito nesta política ou com o seu consentimento. Podemos compartilhar informações com fornecedores de serviços que realizam serviços em nosso nome.
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">4. Segurança</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Tomamos medidas razoáveis para proteger suas informações pessoais contra perda, roubo, uso indevido e acesso não autorizado. No entanto, nenhum sistema de segurança é impenetrável.
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">5. Seus Direitos (LGPD)</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de acessar, corrigir, portar, eliminar seus dados, além de confirmar que tratamos seus dados. Para exercer seus direitos, entre em contato conosco.
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">6. Contato</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco através do e-mail: contato@igepps.com.br.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-4">
            <img src="/images/igepps-logo.png" alt="IGEPPS" className="h-12 mx-auto mb-3" />
            <p className="text-gray-300 text-sm max-w-2xl mx-auto">
              IGEPPS - Instituto de Gestão de Políticas Públicas e Sociais
            </p>
          </div>
          <div className="border-t border-gray-700 pt-6 mt-6">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-400">
              <Link href="/termos-de-uso" className="hover:text-white transition">Termos de Uso</Link>
              <span className="hidden md:inline">|</span>
              <Link href="/politica-de-privacidade" className="hover:text-white transition">Política de Privacidade</Link>
              <span className="hidden md:inline">|</span>
              <span>© {new Date().getFullYear()} IGEPPS. Todos os direitos reservados.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PoliticaDePrivacidade;
