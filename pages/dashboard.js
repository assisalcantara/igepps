import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Forum from "@/components/Forum";
import { safeGetItem, safeSetItem, safeRemoveItem } from '../lib/storage';

export default function AlunoDashboard() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [perfilForm, setPerfilForm] = useState({});
  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [cursoSelecionado, setCursoSelecionado] = useState('');
  const [moduloSelecionado, setModuloSelecionado] = useState('');
  const [aulaSelecionada, setAulaSelecionada] = useState('');
  const [documentoFile, setDocumentoFile] = useState(null);
  const [descricaoDocumento, setDescricaoDocumento] = useState('');
  const [enviandoDocumento, setEnviandoDocumento] = useState(false);
  const [meusDocumentos, setMeusDocumentos] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const usu = safeGetItem("usuario");
    if (!usu) {
      router.push("/login");
      return;
    }

    const u = JSON.parse(usu);
    if (u.tipo !== "aluno") {
      router.push("/admin/dashboard");
      return;
    }

    setUsuario(u);
    setPerfilForm(u);
    carregarCursos();
    carregarMeusDocumentos();
  }, []);

  const carregarCursos = async () => {
    setCarregando(true);
    try {
      const response = await fetch('/api/cursos');
      const todosCursos = await response.json();
      
      // Simular cursos inscritos
      const cursosInscritos = todosCursos.filter(c => c.ativo).slice(0, 3).map((curso, idx) => ({
        ...curso,
        progresso: [65, 40, 0][idx] || 0,
        ultimaAula: `Aula ${Math.floor((curso.modulos?.[0]?.aulas?.length || 10) * ([65, 40, 0][idx] / 100))}`,
        dataInscricao: new Date(Date.now() - idx * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      setCursos(cursosInscritos);
    } catch (err) {
      console.error("Erro ao carregar cursos:", err);
    }
    setCarregando(false);
  };

  const carregarMeusDocumentos = async () => {
    try {
      const response = await fetch('/api/documentos');
      const data = await response.json();
      const usuarioStr = safeGetItem('usuario');
      const u = JSON.parse(usuarioStr);
      setMeusDocumentos(data.filter(d => d.alunoId === u.id).sort((a, b) => new Date(b.data) - new Date(a.data)));
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const enviarDocumento = async () => {
    if (!documentoFile) {
      alert('Por favor, selecione um documento para enviar.');
      return;
    }

    if (!cursoSelecionado || !aulaSelecionada) {
      alert('Por favor, selecione o curso e a aula.');
      return;
    }

    setEnviandoDocumento(true);

    try {
      const cursoEncontrado = cursos.find(c => c.id === cursoSelecionado);
      const moduloEncontrado = cursoEncontrado?.modulos?.find(m => m.id === moduloSelecionado);
      const aula = moduloEncontrado?.aulas?.find(a => a.id === aulaSelecionada);
      
      const formData = new FormData();
      formData.append('documento', documentoFile);
      formData.append('cursoId', cursoSelecionado);
      formData.append('cursoNome', cursoEncontrado.titulo);
      formData.append('aulaId', aulaSelecionada);
      formData.append('aulaNome', aula?.titulo || '');
      formData.append('alunoId', usuario?.id);
      formData.append('alunoNome', usuario?.nome);
      formData.append('descricao', descricaoDocumento);

      const response = await fetch('/api/documentos', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Documento enviado com sucesso! Aguarde a análise do professor.');
        setDocumentoFile(null);
        setDescricaoDocumento('');
        setCursoSelecionado('');
        setModuloSelecionado('');
        setAulaSelecionada('');
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
        carregarMeusDocumentos();
      } else {
        alert('Erro ao enviar documento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      alert('Erro ao enviar documento. Tente novamente.');
    } finally {
      setEnviandoDocumento(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pendente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      aprovado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprovado' },
      reprovado: { bg: 'bg-red-100', text: 'text-red-800', label: 'Reprovado' },
      revisao: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Em Revisão' }
    };
    const badge = badges[status] || badges.pendente;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {badge.label}
      </span>
    );
  };

  const cursoDocumento = cursos.find(c => c.id === cursoSelecionado);
  const moduloDocumento = cursoDocumento?.modulos?.find(m => m.id === moduloSelecionado);

  const handleLogout = () => {
    safeRemoveItem("token");
    safeRemoveItem("usuario");
    router.push("/");
  };

  const handleSalvarPerfil = () => {
    safeSetItem("usuario", JSON.stringify(perfilForm));
    setUsuario(perfilForm);
    setEditandoPerfil(false);
    alert("Perfil atualizado com sucesso!");
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    setUploadandoFoto(true);
    const formData = new FormData();
    formData.append('foto', file);

    try {
      const response = await fetch('/api/upload-foto', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        const novoPerfilForm = { ...perfilForm, fotoPerfil: data.url };
        setPerfilForm(novoPerfilForm);
        alert('Foto atualizada com sucesso!');
      } else {
        alert('Erro ao fazer upload da foto: ' + data.erro);
      }
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      alert('Erro ao fazer upload da foto');
    }
    setUploadandoFoto(false);
  };

  const calcularProgressoGeral = () => {
    if (cursos.length === 0) return 0;
    const total = cursos.reduce((acc, curso) => acc + curso.progresso, 0);
    return Math.round(total / cursos.length);
  };

  const cursosCompletos = cursos.filter(c => c.progresso === 100).length;
  const cursosEmProgresso = cursos.filter(c => c.progresso > 0 && c.progresso < 100).length;

  if (!usuario) return <div className="flex items-center justify-center h-screen">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Overlay Mobile */}
      {menuAberto && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b from-blue-800 via-blue-900 to-blue-950 text-white min-h-screen fixed shadow-xl z-50 transition-transform duration-300 ${menuAberto ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6">
          <Link href="/">
            <div className="flex items-center justify-center cursor-pointer hover:opacity-80 transition mb-3">
              <img src="/images/igepps-logo.png" alt="IGEPPS" className="h-16 w-auto" />
            </div>
          </Link>
          <p className="text-xs text-blue-200 mt-2 font-medium tracking-wide text-center">PORTAL DO ALUNO</p>
          
          {/* Foto do Perfil */}
          <div className="mt-6 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-700 border-4 border-yellow-400 flex items-center justify-center shadow-lg">
              {usuario?.fotoPerfil ? (
                <img src={usuario.fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <p className="mt-3 text-sm font-semibold text-center">{usuario?.nomeCompleto || usuario?.nome || 'Aluno'}</p>
          </div>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => setAbaAtiva('visao-geral')}
            className={`w-full text-left px-6 py-3 text-sm font-medium hover:bg-blue-700/40 transition-all ${abaAtiva === 'visao-geral' ? 'bg-blue-700/60 border-l-4 border-yellow-400' : ''}`}
          >
            📊 Visão Geral
          </button>
          <button
            onClick={() => setAbaAtiva('meus-cursos')}
            className={`w-full text-left px-6 py-3 text-sm font-medium hover:bg-blue-700/40 transition-all ${abaAtiva === 'meus-cursos' ? 'bg-blue-700/60 border-l-4 border-yellow-400' : ''}`}
          >
            📚 Meus Cursos
          </button>
          <button
            onClick={() => setAbaAtiva('certificados')}
            className={`w-full text-left px-6 py-3 text-sm font-medium hover:bg-blue-700/40 transition-all ${abaAtiva === 'certificados' ? 'bg-blue-700/60 border-l-4 border-yellow-400' : ''}`}
          >
            🏆 Certificados
          </button>
          <button
            onClick={() => setAbaAtiva('financeiro')}
            className={`w-full text-left px-6 py-3 text-sm font-medium hover:bg-blue-700/40 transition-all ${abaAtiva === 'financeiro' ? 'bg-blue-700/60 border-l-4 border-yellow-400' : ''}`}
          >
            💰 Financeiro
          </button>
          <button
            onClick={() => setAbaAtiva('perfil')}
            className={`w-full text-left px-6 py-3 text-sm font-medium hover:bg-blue-700/40 transition-all ${abaAtiva === 'perfil' ? 'bg-blue-700/60 border-l-4 border-yellow-400' : ''}`}
          >
            👤 Meu Perfil
          </button>
          <button
            onClick={() => setAbaAtiva('forum')}
            className={`w-full text-left px-6 py-3 text-sm font-medium hover:bg-blue-700/40 transition-all ${abaAtiva === 'forum' ? 'bg-blue-700/60 border-l-4 border-yellow-400' : ''}`}
          >
            💬 Fórum
          </button>
          <button
            onClick={() => setAbaAtiva('documentos')}
            className={`w-full text-left px-6 py-3 text-sm font-medium hover:bg-blue-700/40 transition-all ${abaAtiva === 'documentos' ? 'bg-blue-700/60 border-l-4 border-yellow-400' : ''}`}
          >
            📤 Enviar Documentos
          </button>
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t border-blue-700/30">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-all font-semibold shadow-lg text-sm"
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 lg:ml-64 w-full">
        {/* Header */}
        <header className="bg-white shadow sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4 flex justify-between items-center">
            {/* Botão Menu Mobile */}
            <button 
              onClick={() => setMenuAberto(!menuAberto)}
              className="lg:hidden text-gray-700 hover:text-gray-900 mr-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {abaAtiva === 'visao-geral' && 'Visão Geral'}
                {abaAtiva === 'meus-cursos' && 'Meus Cursos'}
                {abaAtiva === 'certificados' && 'Certificados'}
                {abaAtiva === 'financeiro' && 'Financeiro'}
                {abaAtiva === 'perfil' && 'Meu Perfil'}
                {abaAtiva === 'forum' && 'Fórum'}
                {abaAtiva === 'documentos' && 'Enviar Documentos'}
              </h2>
              <p className="text-sm text-gray-600">Bem-vindo, {usuario.nomeCompleto || usuario.nome}!</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                👨‍🎓 Aluno Ativo
              </span>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {/* Visão Geral */}
          {abaAtiva === 'visao-geral' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Cursos Inscritos</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{cursos.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Concluídos</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{cursosCompletos}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Em Progresso</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{cursosEmProgresso}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Progresso Geral</h3>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{calcularProgressoGeral()}%</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Continuar Assistindo</h3>
                {cursos.filter(c => c.progresso > 0 && c.progresso < 100).length === 0 ? (
                  <p className="text-gray-500">Nenhum curso em andamento</p>
                ) : (
                  <div className="space-y-4">
                    {cursos.filter(c => c.progresso > 0 && c.progresso < 100).map(curso => (
                      <div key={curso.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div className="flex-shrink-0">
                          {curso.thumbnail ? (
                            <img src={curso.thumbnail} alt={curso.titulo} className="w-24 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-24 h-16 bg-blue-600 rounded flex items-center justify-center text-white text-2xl">
                              📚
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{curso.titulo}</h4>
                          <p className="text-sm text-gray-600">{curso.ultimaAula}</p>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${curso.progresso}%` }}></div>
                          </div>
                        </div>
                        <Link href={`/assistir/${curso.id}`}>
                          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            Continuar
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Atividade Recente</h3>
                <div className="space-y-3">
                  {cursos.slice(0, 5).map((curso, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <span className="text-2xl">{idx === 0 ? '📖' : idx === 1 ? '✅' : '📝'}</span>
                      <span className="text-gray-600">
                        Você {idx === 0 ? 'assistiu' : idx === 1 ? 'completou' : 'iniciou'} <strong>{curso.titulo}</strong>
                      </span>
                      <span className="text-gray-400 ml-auto">{new Date(curso.dataInscricao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Meus Cursos */}
          {abaAtiva === 'meus-cursos' && (
            <div>
              {carregando ? (
                <div className="text-center py-8">Carregando...</div>
              ) : cursos.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500 text-lg">Você ainda não se inscreveu em nenhum curso</p>
                  <Link href="/">
                    <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                      Explorar Cursos
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {cursos.map(curso => (
                    <div key={curso.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
                      <div className="flex gap-4 mb-4">
                        {curso.thumbnail ? (
                          <img src={curso.thumbnail} alt={curso.titulo} className="w-24 h-24 object-cover rounded" />
                        ) : (
                          <div className="w-24 h-24 bg-blue-600 rounded flex items-center justify-center text-white text-3xl">
                            📚
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800 mb-1">{curso.titulo}</h4>
                          <p className="text-sm text-gray-600">{curso.categoria}</p>
                          <span className="inline-block mt-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {curso.progresso}% Completo
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${curso.progresso}%` }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Módulos</p>
                          <p className="font-bold">{curso.modulos?.length || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Carga Horária</p>
                          <p className="font-bold">{curso.cargaHoraria || 'N/A'}</p>
                        </div>
                      </div>

                      <Link href={`/assistir/${curso.id}`}>
                        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                          Acessar Curso
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Certificados */}
          {abaAtiva === 'certificados' && (
            <div>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Meus Certificados</h3>
                {cursosCompletos === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <p className="text-gray-500 text-lg">Você ainda não possui certificados</p>
                    <p className="text-gray-400 text-sm mt-2">Complete um curso para receber seu certificado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cursos.filter(c => c.progresso === 100).map(curso => (
                      <div key={curso.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-5xl">🏆</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{curso.titulo}</h4>
                          <p className="text-sm text-gray-600">Concluído em {new Date(curso.dataInscricao).toLocaleDateString('pt-BR')}</p>
                          <p className="text-sm text-gray-600">Carga horária: {curso.cargaHoraria}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                            📄 Ver Certificado
                          </button>
                          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm">
                            ⬇️ Download PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Financeiro */}
          {abaAtiva === 'financeiro' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Status</h3>
                  <p className="text-2xl font-bold text-green-600 mt-2">✓ Em Dia</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Próximo Pagamento</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">--</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-600">
                  <h3 className="text-gray-600 text-sm font-semibold">Total Investido</h3>
                  <p className="text-2xl font-bold text-purple-600 mt-2">R$ 0,00</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Histórico de Pagamentos</h3>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💰</div>
                  <p className="text-gray-500 text-lg">Nenhuma transação registrada</p>
                  <p className="text-gray-400 text-sm mt-2">Todos os cursos ativos são gratuitos</p>
                </div>
              </div>
            </div>
          )}

          {/* Perfil */}
          {abaAtiva === 'perfil' && (
            <div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header do Perfil */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-500 border-4 border-white shadow-xl flex items-center justify-center">
                        {(editandoPerfil ? perfilForm.fotoPerfil : usuario?.fotoPerfil) ? (
                          <img src={editandoPerfil ? perfilForm.fotoPerfil : usuario.fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-6xl">👤</span>
                        )}
                      </div>
                      {editandoPerfil && (
                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition">
                          {uploadandoFoto ? '⏳' : '📷'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadFoto}
                            disabled={uploadandoFoto}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl font-bold mb-2">{usuario.nomeCompleto || usuario.nome}</h3>
                      <p className="text-blue-100 mb-1 flex items-center justify-center md:justify-start gap-2">
                        <span>📧</span> {usuario.email}
                      </p>
                      {usuario.telefone && (
                        <p className="text-blue-100 flex items-center justify-center md:justify-start gap-2">
                          <span>📱</span> {usuario.telefone}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!editandoPerfil ? (
                        <button
                          onClick={() => setEditandoPerfil(true)}
                          className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition font-semibold shadow"
                        >
                          ✏️ Editar Perfil
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleSalvarPerfil}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold shadow"
                          >
                            💾 Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditandoPerfil(false);
                              setPerfilForm(usuario);
                            }}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold shadow"
                          >
                            ✕ Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Corpo do Perfil */}
                <div className="p-6">
                  {editandoPerfil ? (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Dica:</strong> Mantenha seus dados atualizados para uma melhor experiência na plataforma.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            value={perfilForm.nomeCompleto || ''}
                            onChange={(e) => setPerfilForm({...perfilForm, nomeCompleto: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            value={perfilForm.email || ''}
                            onChange={(e) => setPerfilForm({...perfilForm, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone / WhatsApp</label>
                          <input
                            type="tel"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            value={perfilForm.telefone || ''}
                            onChange={(e) => setPerfilForm({...perfilForm, telefone: e.target.value})}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            value={perfilForm.cpf || ''}
                            readOnly
                            disabled
                          />
                          <p className="text-xs text-gray-500 mt-1">🔒 Campo não editável</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Nascimento</label>
                          <input
                            type="date"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            value={perfilForm.dataNascimento || ''}
                            onChange={(e) => setPerfilForm({...perfilForm, dataNascimento: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Escolaridade</label>
                          <select
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            value={perfilForm.escolaridade || ''}
                            onChange={(e) => setPerfilForm({...perfilForm, escolaridade: e.target.value})}
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
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Profissão / Ocupação</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            value={perfilForm.profissao || ''}
                            onChange={(e) => setPerfilForm({...perfilForm, profissao: e.target.value})}
                            placeholder="Ex: Professor, Engenheiro, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
                          <select
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            value={perfilForm.estado || ''}
                            onChange={(e) => setPerfilForm({...perfilForm, estado: e.target.value})}
                          >
                            <option value="">Selecione...</option>
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
                            <option value="PA">Pará</option>
                            <option value="PB">Paraíba</option>
                            <option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option>
                            <option value="PI">Piauí</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="SP">São Paulo</option>
                            <option value="SE">Sergipe</option>
                            <option value="TO">Tocantins</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            value={perfilForm.cidade || ''}
                            onChange={(e) => setPerfilForm({...perfilForm, cidade: e.target.value})}
                            placeholder="Digite sua cidade"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                          <span className="text-xl">📋</span> Informações Pessoais
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mt-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nome Completo</p>
                            <p className="text-base font-semibold text-gray-800">{usuario.nomeCompleto || 'Não informado'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                            <p className="text-base font-semibold text-gray-800">{usuario.email}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Telefone</p>
                            <p className="text-base font-semibold text-gray-800">{usuario.telefone || 'Não informado'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">CPF</p>
                            <p className="text-base font-semibold text-gray-800">{usuario.cpf || 'Não informado'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Data de Nascimento</p>
                            <p className="text-base font-semibold text-gray-800">
                              {usuario.dataNascimento ? new Date(usuario.dataNascimento).toLocaleDateString('pt-BR') : 'Não informado'}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cidade / Estado</p>
                            <p className="text-base font-semibold text-gray-800">
                              {usuario.cidade && usuario.estado ? `${usuario.cidade} - ${usuario.estado}` : 'Não informado'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 p-4 rounded-lg">
                        <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                          <span className="text-xl">🎓</span> Informações Acadêmicas / Profissionais
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mt-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Escolaridade</p>
                            <p className="text-base font-semibold text-gray-800">{usuario.escolaridade || 'Não informado'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Profissão / Ocupação</p>
                            <p className="text-base font-semibold text-gray-800">{usuario.profissao || 'Não informado'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-4 rounded-lg">
                        <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                          <span className="text-xl">📊</span> Estatísticas
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mt-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                            <p className="text-3xl font-bold text-blue-600">{cursos.length}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Cursos Inscritos</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                            <p className="text-3xl font-bold text-green-600">{cursosCompletos}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Cursos Concluídos</p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                            <p className="text-3xl font-bold text-purple-600">{calcularProgressoGeral()}%</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Progresso Geral</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fórum */}
          {abaAtiva === 'forum' && (
            <div>
              <Forum usuario={usuario} />
            </div>
          )}

          {/* Enviar Documentos */}
          {abaAtiva === 'documentos' && (
            <div>
              <div className="bg-white p-8 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">📤</span>
                  Enviar Documentos
                </h2>
                <p className="text-gray-600 mb-8">Envie trabalhos, atividades e documentos para avaliação</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Formulário de Envio */}
                  <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
                    <h3 className="text-lg font-bold mb-6">Novo Documento</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Curso *
                        </label>
                        <select
                          value={cursoSelecionado}
                          onChange={(e) => {
                            setCursoSelecionado(e.target.value);
                            setModuloSelecionado('');
                            setAulaSelecionada('');
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione o curso</option>
                          {cursos.map(c => (
                            <option key={c.id} value={c.id}>{c.titulo}</option>
                          ))}
                        </select>
                      </div>

                      {cursoSelecionado && cursoDocumento?.modulos && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Módulo *
                          </label>
                          <select
                            value={moduloSelecionado}
                            onChange={(e) => {
                              setModuloSelecionado(e.target.value);
                              setAulaSelecionada('');
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Selecione o módulo</option>
                            {cursoDocumento.modulos.map(m => (
                              <option key={m.id} value={m.id}>{m.titulo}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {moduloSelecionado && moduloDocumento?.aulas && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Aula *
                          </label>
                          <select
                            value={aulaSelecionada}
                            onChange={(e) => setAulaSelecionada(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Selecione a aula</option>
                            {moduloDocumento.aulas.map(a => (
                              <option key={a.id} value={a.id}>{a.titulo}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Descrição do Documento
                        </label>
                        <textarea
                          value={descricaoDocumento}
                          onChange={(e) => setDescricaoDocumento(e.target.value)}
                          placeholder="Descreva brevemente o conteúdo do documento..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          rows="3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Arquivo *
                        </label>
                        <input
                          id="fileInput"
                          type="file"
                          onChange={(e) => setDocumentoFile(e.target.files[0])}
                          accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Formatos: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (máx. 10MB)
                        </p>
                      </div>

                      {documentoFile && (
                        <div className="bg-white rounded-lg p-4 flex items-center gap-3 border border-gray-200">
                          <span className="text-3xl">📄</span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{documentoFile.name}</p>
                            <p className="text-sm text-gray-600">
                              {(documentoFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setDocumentoFile(null);
                              document.getElementById('fileInput').value = '';
                            }}
                            className="text-red-600 hover:text-red-700 transition font-bold text-xl"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <button
                        onClick={enviarDocumento}
                        disabled={!documentoFile || !cursoSelecionado || !aulaSelecionada || enviandoDocumento}
                        className={`w-full py-4 rounded-lg font-bold text-lg transition ${
                          !documentoFile || !cursoSelecionado || !aulaSelecionada || enviandoDocumento
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {enviandoDocumento ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Enviando...
                          </span>
                        ) : (
                          '📤 Enviar Documento'
                        )}
                      </button>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <span className="text-xl">ℹ️</span>
                        <div>
                          <p className="font-semibold text-blue-800 mb-1 text-sm">Informações importantes:</p>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Selecione o curso e a aula correspondente</li>
                            <li>• Seu documento será revisado pelo professor</li>
                            <li>• Você receberá um feedback sobre sua submissão</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Meus Documentos Enviados */}
                  <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
                    <h3 className="text-lg font-bold mb-6">Meus Documentos ({meusDocumentos.length})</h3>
                    
                    {meusDocumentos.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4 opacity-50">📄</div>
                        <p className="text-gray-500">Nenhum documento enviado ainda</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {meusDocumentos.map(doc => (
                          <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xl">📄</span>
                                  <p className="font-semibold text-gray-800 text-sm">{doc.arquivoOriginal}</p>
                                </div>
                                <p className="text-xs text-gray-600">{doc.cursoNome}</p>
                                <p className="text-xs text-gray-500">{doc.aulaNome}</p>
                              </div>
                              {getStatusBadge(doc.status)}
                            </div>

                            {doc.descricao && (
                              <div className="bg-gray-50 rounded p-3 mb-3">
                                <p className="text-xs text-gray-700">{doc.descricao}</p>
                              </div>
                            )}

                            {doc.comentario && (
                              <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                                <p className="text-xs font-semibold text-green-800 mb-1">Feedback do Professor:</p>
                                <p className="text-xs text-green-700">{doc.comentario}</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {new Date(doc.data).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Download ↓
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
