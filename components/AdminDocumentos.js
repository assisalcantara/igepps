import { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

export default function AdminDocumentos() {
  const [documentos, setDocumentos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCurso, setFiltroCurso] = useState('todos');
  const [carregando, setCarregando] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [comentarioFeedback, setComentarioFeedback] = useState('');

  useEffect(() => {
    carregarDocumentos();
    const interval = setInterval(carregarDocumentos, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const carregarDocumentos = async () => {
    try {
      const response = await fetch('/api/documentos');
      const data = await response.json();
      setDocumentos(data.sort((a, b) => new Date(b.data) - new Date(a.data)));
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setCarregando(false);
    }
  };

  const marcarComoVisualizado = async (id) => {
    try {
      await fetch('/api/documentos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, visualizado: true })
      });
      carregarDocumentos();
    } catch (error) {
      console.error('Erro ao marcar como visualizado:', error);
    }
  };

  const atualizarStatus = async (id, status) => {
    try {
      const response = await fetch('/api/documentos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          status,
          comentario: comentarioFeedback 
        })
      });

      if (response.ok) {
        setModalState({
          isOpen: true,
          title: 'Sucesso',
          message: 'Status do documento atualizado com sucesso!',
          type: 'success',
          onConfirm: () => {
            setModalState({ ...modalState, isOpen: false });
            setDocumentoSelecionado(null);
            setComentarioFeedback('');
            carregarDocumentos();
          }
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setModalState({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao atualizar status do documento.',
        type: 'error',
        onConfirm: () => setModalState({ ...modalState, isOpen: false })
      });
    }
  };

  const excluirDocumento = (id) => {
    setModalState({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.',
      type: 'warning',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/documentos?id=${id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            setModalState({
              isOpen: true,
              title: 'Sucesso',
              message: 'Documento excluído com sucesso!',
              type: 'success',
              onConfirm: () => {
                setModalState({ ...modalState, isOpen: false });
                carregarDocumentos();
              }
            });
          }
        } catch (error) {
          console.error('Erro ao excluir documento:', error);
          setModalState({
            isOpen: true,
            title: 'Erro',
            message: 'Erro ao excluir documento.',
            type: 'error',
            onConfirm: () => setModalState({ ...modalState, isOpen: false })
          });
        }
      }
    });
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

  const cursosUnicos = [...new Set(documentos.map(d => d.cursoNome))];
  const documentosNaoVisualizados = documentos.filter(d => !d.visualizado).length;
  const documentosPendentes = documentos.filter(d => d.status === 'pendente').length;

  const documentosFiltrados = documentos.filter(doc => {
    const filtroStatusOk = filtroStatus === 'todos' || doc.status === filtroStatus;
    const filtroCursoOk = filtroCurso === 'todos' || doc.cursoNome === filtroCurso;
    return filtroStatusOk && filtroCursoOk;
  });

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando documentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />

      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">📤 Documentos dos Alunos</h2>
            <p className="text-purple-100">Gerencie e avalie os documentos enviados</p>
          </div>
          {documentosNaoVisualizados > 0 && (
            <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl animate-pulse">
              {documentosNaoVisualizados} novo{documentosNaoVisualizados > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-blue-600">{documentos.length}</div>
          <div className="text-gray-600 text-sm">Total de Documentos</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-yellow-600">{documentosPendentes}</div>
          <div className="text-gray-600 text-sm">Pendentes</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">
            {documentos.filter(d => d.status === 'aprovado').length}
          </div>
          <div className="text-gray-600 text-sm">Aprovados</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-red-600">
            {documentos.filter(d => d.status === 'reprovado').length}
          </div>
          <div className="text-gray-600 text-sm">Reprovados</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="revisao">Em Revisão</option>
              <option value="aprovado">Aprovados</option>
              <option value="reprovado">Reprovados</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Curso
            </label>
            <select
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="todos">Todos os Cursos</option>
              {cursosUnicos.map((curso, idx) => (
                <option key={idx} value={curso}>{curso}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold">
            📋 Documentos Enviados ({documentosFiltrados.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {documentosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nenhum documento encontrado com os filtros selecionados
            </div>
          ) : (
            documentosFiltrados.map(doc => (
              <div 
                key={doc.id} 
                className={`p-6 hover:bg-gray-50 transition ${!doc.visualizado ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                onClick={() => !doc.visualizado && marcarComoVisualizado(doc.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-bold text-lg">{doc.alunoNome}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{doc.cursoNome}</span>
                          <span>•</span>
                          <span>{doc.aulaNome}</span>
                        </div>
                      </div>
                      {!doc.visualizado && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          NOVO
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(doc.status)}
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(doc.data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {doc.descricao && (
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-700">{doc.descricao}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-purple-100 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-purple-800 mb-1">Arquivo:</p>
                    <p className="text-sm text-gray-700">{doc.arquivoOriginal}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(doc.tamanho / 1024 / 1024).toFixed(2)} MB • {doc.tipo}
                    </p>
                  </div>
                </div>

                {doc.comentario && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-800 mb-1">Feedback:</p>
                    <p className="text-sm text-gray-700">{doc.comentario}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    📥 Download
                  </a>
                  
                  <button
                    onClick={() => setDocumentoSelecionado(doc)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    ✓ Avaliar
                  </button>
                  
                  <button
                    onClick={() => excluirDocumento(doc.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Avaliação */}
      {documentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Avaliar Documento</h3>
            
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold">{documentoSelecionado.alunoNome}</p>
              <p className="text-sm text-gray-600">{documentoSelecionado.arquivoOriginal}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback para o aluno
              </label>
              <textarea
                value={comentarioFeedback}
                onChange={(e) => setComentarioFeedback(e.target.value)}
                placeholder="Deixe um comentário sobre o documento..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => atualizarStatus(documentoSelecionado.id, 'aprovado')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
              >
                ✓ Aprovar
              </button>
              <button
                onClick={() => atualizarStatus(documentoSelecionado.id, 'revisao')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
              >
                🔄 Em Revisão
              </button>
              <button
                onClick={() => atualizarStatus(documentoSelecionado.id, 'reprovado')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition"
              >
                ✗ Reprovar
              </button>
            </div>

            <button
              onClick={() => {
                setDocumentoSelecionado(null);
                setComentarioFeedback('');
              }}
              className="w-full mt-3 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
