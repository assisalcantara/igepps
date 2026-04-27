import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../components/Header';
import { safeGetItem } from '../lib/storage';

export default function EnviarDocumentos() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState('');
  const [moduloSelecionado, setModuloSelecionado] = useState('');
  const [aulaSelecionada, setAulaSelecionada] = useState('');
  const [documentoFile, setDocumentoFile] = useState(null);
  const [descricaoDocumento, setDescricaoDocumento] = useState('');
  const [enviandoDocumento, setEnviandoDocumento] = useState(false);
  const [meusDocumentos, setMeusDocumentos] = useState([]);

  useEffect(() => {
    const usuarioStr = safeGetItem('usuario');
    if (!usuarioStr) {
      router.push('/login');
      return;
    }
    
    const u = JSON.parse(usuarioStr);
    if (u.tipo !== 'aluno') {
      router.push('/dashboard');
      return;
    }
    
    setUsuario(u);
    carregarCursos();
    carregarMeusDocumentos();
  }, []);

  const carregarCursos = async () => {
    try {
      const response = await fetch('/api/cursos');
      const data = await response.json();
      setCursos(data.filter(c => c.ativo));
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
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

  const curso = cursos.find(c => c.id === cursoSelecionado);
  const modulo = curso?.modulos?.find(m => m.id === moduloSelecionado);

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
      const aula = modulo?.aulas?.find(a => a.id === aulaSelecionada);
      
      const formData = new FormData();
      formData.append('documento', documentoFile);
      formData.append('cursoId', cursoSelecionado);
      formData.append('cursoNome', curso.titulo);
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
        document.getElementById('fileInput').value = '';
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

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header usuario={usuario} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Cabeçalho */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
            <span>←</span> Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📤 Enviar Documentos</h1>
          <p className="text-gray-600">Envie trabalhos, atividades e documentos para avaliação</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Envio */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Novo Documento</h2>
            
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

              {cursoSelecionado && curso?.modulos && (
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
                    {curso.modulos.map(m => (
                      <option key={m.id} value={m.id}>{m.titulo}</option>
                    ))}
                  </select>
                </div>
              )}

              {moduloSelecionado && modulo?.aulas && (
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
                    {modulo.aulas.map(a => (
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
                <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
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
                    className="text-red-600 hover:text-red-700 transition font-bold"
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
                  <p className="font-semibold text-blue-800 mb-1">Informações importantes:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Selecione o curso e a aula correspondente</li>
                    <li>• Seu documento será revisado pelo professor</li>
                    <li>• Você receberá um feedback sobre sua submissão</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Meus Documentos Enviados */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Meus Documentos ({meusDocumentos.length})</h2>
            
            {meusDocumentos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">📄</div>
                <p className="text-gray-500">Nenhum documento enviado ainda</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {meusDocumentos.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">📄</span>
                          <p className="font-semibold text-gray-800">{doc.arquivoOriginal}</p>
                        </div>
                        <p className="text-sm text-gray-600">{doc.cursoNome}</p>
                        <p className="text-xs text-gray-500">{doc.aulaNome}</p>
                      </div>
                      {getStatusBadge(doc.status)}
                    </div>

                    {doc.descricao && (
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-sm text-gray-700">{doc.descricao}</p>
                      </div>
                    )}

                    {doc.comentario && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                        <p className="text-xs font-semibold text-green-800 mb-1">Feedback do Professor:</p>
                        <p className="text-sm text-green-700">{doc.comentario}</p>
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
  );
}
