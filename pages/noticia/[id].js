import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function NoticiaPage() {
  const router = useRouter();
  const { id } = router.query;
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      carregarNoticia();
    }
  }, [id]);

  const carregarNoticia = async () => {
    try {
      const response = await fetch(`/api/noticias?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setNoticia(data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao carregar notícia:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!noticia) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{noticia.titulo} - IGEPPS Academy</title>
        <meta name="description" content={noticia.resumo} />
      </Head>

      {/* Header */}
      <header className="bg-blue-900 text-white py-4 md:py-6 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition">
              <img src="/images/igepps-logo.png" alt="IGEPPS" className="h-8 md:h-12 w-auto" />
              <span className="text-lg md:text-2xl font-bold tracking-wide">IGEPPS Academy</span>
            </Link>
            
            {/* Menu Desktop */}
            <nav className="hidden lg:flex gap-4 items-center">
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
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Notícia</span>
          </nav>
        </div>
      </div>

      {/* Conteúdo da Notícia */}
      <main className="py-12 bg-white">
        <article className="max-w-4xl mx-auto px-4">
          {/* Categoria e Data */}
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">
              {noticia.categoria}
            </span>
            <span className="text-gray-500 text-sm">
              {formatarData(noticia.dataPublicacao)}
            </span>
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {noticia.titulo}
          </h1>

          {/* Autor */}
          <div className="flex items-center gap-2 mb-8 pb-6 border-b">
            <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
              {noticia.autor.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-900">Por {noticia.autor}</p>
              <p className="text-sm text-gray-500">IGEPPS Academy</p>
            </div>
          </div>

          {/* Imagem de Destaque */}
          {noticia.imagem && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={noticia.imagem} 
                alt={noticia.titulo}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Conteúdo */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
            />
          </div>

          {/* Botão Voltar */}
          <div className="mt-12 pt-8 border-t">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar para Home
            </Link>
          </div>
        </article>
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
    </>
  );
}
