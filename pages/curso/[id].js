import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { safeGetItem } from '../../lib/storage';

export default function CursoDetalhes() {
  const router = useRouter();
  const { id } = router.query;
  
  const [curso, setCurso] = useState(null);
  const [primeiraAula, setPrimeiraAula] = useState(null);
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);
  
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    escolaridade: '',
    profissao: '',
    estado: '',
    cidade: '',
    cursoInteresse: ''
  });

  useEffect(() => {
    if (id) {
      carregarCurso();
      // Recarregar dados a cada 30 segundos para pegar alterações do admin em tempo real
      const interval = setInterval(carregarCurso, 30000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const carregarCurso = async () => {
    try {
      // Adiciona timestamp para evitar cache do navegador
      const response = await fetch(`/api/cursos?t=${Date.now()}`);
      const cursos = await response.json();
      const cursoEncontrado = cursos.find(c => c.id === parseInt(id));
      
      if (cursoEncontrado) {
        // Verificar se o usuário é admin
        const usuarioStr = safeGetItem('usuario');
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        const isAdmin = usuario?.tipo === 'admin';
        
        // Se o curso está inativo e o usuário não é admin, redirecionar
        if (!cursoEncontrado.ativo && !isAdmin) {
          router.push('/');
          return;
        }
        
        setCurso(cursoEncontrado);
        setFormData(prev => ({ ...prev, cursoInteresse: cursoEncontrado.titulo }));
        
        // Buscar a primeira aula do primeiro módulo
        if (cursoEncontrado.modulos && cursoEncontrado.modulos.length > 0) {
          const primeiroModulo = cursoEncontrado.modulos[0];
          if (primeiroModulo.aulas && primeiroModulo.aulas.length > 0) {
            setPrimeiraAula(primeiroModulo.aulas[0]);
          }
        }
      } else {
        // Curso não encontrado, redirecionar para home
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
    }
  };

  const calcularDuracaoTotal = () => {
    if (!curso || !curso.modulos) return '0h';
    
    let totalMinutos = 0;
    curso.modulos.forEach(modulo => {
      if (modulo.aulas) {
        modulo.aulas.forEach(aula => {
          if (aula.duracao) {
            totalMinutos += parseInt(aula.duracao) || 0;
          }
        });
      }
    });
    
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const response = await fetch('/api/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'pendente',
          ativo: false
        })
      });

      const result = await response.json();

      if (result.error) {
        alert('Erro: ' + result.error);
      } else {
        alert('Pré-cadastro realizado com sucesso!\n\nEm breve você receberá um e-mail de confirmação.\nAguarde a aprovação do administrador para acessar os cursos.');
        setFormData({
          nomeCompleto: '',
          email: '',
          telefone: '',
          cpf: '',
          dataNascimento: '',
          escolaridade: '',
          profissao: '',
          estado: '',
          cidade: '',
          cursoInteresse: curso?.titulo || ''
        });
        setExibirFormulario(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao realizar pré-cadastro. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const formatarVideoUrl = (url) => {
    if (!url) return '';
    
    // Se for link do YouTube, converter para embed
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  };

  if (!curso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando curso...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{curso.titulo} - IGEPPS Academy</title>
        <meta name="description" content={curso.descricao} />
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
        <div className="max-w-7xl mx-auto px-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/#cursos" className="hover:text-blue-600">Cursos</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{curso.titulo}</span>
          </nav>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gray-50">
        {/* Cabeçalho do Curso */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Imagem do Curso */}
            <div className="lg:w-1/3">
              {curso.thumbnail ? (
                <img 
                  src={curso.thumbnail} 
                  alt={curso.titulo}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-md flex items-center justify-center">
                  <span className="text-white text-5xl">📚</span>
                </div>
              )}
            </div>

            {/* Informações do Curso */}
            <div className="lg:w-2/3">
              <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">{curso.titulo}</h1>
              <div 
                className="text-gray-700 text-lg mb-6"
                dangerouslySetInnerHTML={{ __html: curso.descricao }}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">Duração Total</p>
                  <p className="text-2xl font-bold text-blue-900">{calcularDuracaoTotal()}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">Módulos</p>
                  <p className="text-2xl font-bold text-blue-900">{curso.modulos?.length || 0}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">Categoria</p>
                  <p className="text-lg font-semibold text-blue-900">{curso.categoria || 'Geral'}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">Carga Horária</p>
                  <p className="text-lg font-semibold text-blue-900">{curso.cargaHoraria || calcularDuracaoTotal()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Módulos do Curso */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">📋 Conteúdo do Curso</h2>
          
          {curso.modulos && curso.modulos.length > 0 ? (
            <div className="space-y-4">
              {curso.modulos.map((modulo, index) => (
                <div key={modulo.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">
                    Módulo {index + 1}: {modulo.titulo}
                  </h3>
                  <p className="text-gray-600 mb-3">{modulo.descricao}</p>
                  
                  {modulo.aulas && modulo.aulas.length > 0 && (
                    <div className="ml-4 space-y-2">
                      {modulo.aulas.map((aula, aulaIndex) => (
                        <div key={aula.id} className="flex items-center text-gray-700">
                          <span className="text-blue-600 mr-2">▶</span>
                          <span>Aula {aulaIndex + 1}: {aula.titulo}</span>
                          {aula.duracao && (
                            <span className="ml-auto text-sm text-gray-500">({aula.duracao} min)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Conteúdo em preparação...</p>
          )}
        </div>

        {/* Aula de Apresentação */}
        {primeiraAula && (
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">🎥 Aula de Apresentação</h2>
            
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-blue-800 mb-2">{primeiraAula.titulo}</h3>
              <p className="text-gray-700">{primeiraAula.descricao}</p>
            </div>

            {/* Usar videoApresentacao do curso se disponível, senão usar videoUrl da aula */}
            {(curso.videoApresentacao || primeiraAula.videoUrl) ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={formatarVideoUrl(curso.videoApresentacao || primeiraAula.videoUrl)}
                  className="w-full h-full"
                  allowFullScreen
                  title={primeiraAula.titulo}
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Vídeo em breve...</p>
              </div>
            )}
          </div>
        )}

        {/* Formulário de Pré-cadastro */}
        {exibirFormulario && (
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8" id="formulario">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">📝 Ainda não é nosso aluno? Faça um pré-cadastro</h2>
              <button
                onClick={() => setExibirFormulario(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.nomeCompleto}
                    onChange={(e) => setFormData({...formData, nomeCompleto: e.target.value})}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  />
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>

                {/* Data de Nascimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.dataNascimento}
                    onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                  />
                </div>

                {/* Escolaridade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escolaridade *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.escolaridade}
                    onChange={(e) => setFormData({...formData, escolaridade: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="fundamental-incompleto">Ensino Fundamental Incompleto</option>
                    <option value="fundamental-completo">Ensino Fundamental Completo</option>
                    <option value="medio-incompleto">Ensino Médio Incompleto</option>
                    <option value="medio-completo">Ensino Médio Completo</option>
                    <option value="superior-incompleto">Ensino Superior Incompleto</option>
                    <option value="superior-completo">Ensino Superior Completo</option>
                    <option value="pos-graduacao">Pós-Graduação</option>
                    <option value="mestrado">Mestrado</option>
                    <option value="doutorado">Doutorado</option>
                  </select>
                </div>

                {/* Profissão */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profissão/Ocupação *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.profissao}
                    onChange={(e) => setFormData({...formData, profissao: e.target.value})}
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="PA">Pará</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PR">Paraná</option>
                    <option value="PB">Paraíba</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SE">Sergipe</option>
                    <option value="SP">São Paulo</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.cidade}
                    onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  />
                </div>

                {/* Curso de Interesse */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Curso de Interesse
                  </label>
                  <input
                    type="text"
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={formData.cursoInteresse}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  {enviando ? 'Enviando...' : 'Enviar Pré-cadastro'}
                </button>
                <button
                  type="button"
                  onClick={() => setExibirFormulario(false)}
                  className="sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Cancelar
                </button>
              </div>

              <p className="text-sm text-gray-600 text-center">
                * Campos obrigatórios. Após o envio, você receberá um e-mail de confirmação.
              </p>
            </form>
          </div>
        )}

        {/* Botão CTA Final */}
        {!exibirFormulario && (
          <div className="text-center py-8">
            <button
              onClick={() => {
                setExibirFormulario(true);
                setTimeout(() => {
                  document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-lg text-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              🎓 Quero me Inscrever Agora!
            </button>
          </div>
        )}
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
