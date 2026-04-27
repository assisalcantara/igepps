import { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import ConfirmModal from './ConfirmModal';
import { safeGetItem } from '../lib/storage';

export default function AdminEmails() {
  const [alunos, setAlunos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [visualizacao, setVisualizacao] = useState('enviar'); // enviar, historico
  const [enviando, setEnviando] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: null
  });
  
  const [formData, setFormData] = useState({
    tipoDestinatarios: 'todos',
    destinatariosSelecionados: [],
    assunto: '',
    mensagem: ''
  });

  useEffect(() => {
    carregarAlunos();
    carregarHistorico();
  }, []);

  const carregarAlunos = async () => {
    try {
      const response = await fetch('/api/alunos');
      const data = await response.json();
      setAlunos(data.filter(a => a.status === 'aprovado'));
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const carregarHistorico = async () => {
    try {
      const response = await fetch('/api/enviar-email');
      const data = await response.json();
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    
    if (!formData.assunto || !formData.mensagem) {
      setModalState({
        isOpen: true,
        title: 'Campos Obrigatórios',
        message: 'Por favor, preencha o assunto e a mensagem',
        type: 'alert',
        onConfirm: null
      });
      return;
    }

    setModalState({
      isOpen: true,
      title: 'Confirmar Envio',
      message: `Confirma o envio de e-mail para ${getQuantidadeDestinatarios()} aluno(s)?`,
      type: 'confirm',
      onConfirm: async () => {
        setEnviando(true);

        try {
          const response = await fetch('/api/enviar-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              remetente: JSON.parse(safeGetItem('usuario'))?.nomeCompleto || 'Admin'
            })
          });

          const result = await response.json();

          if (result.success) {
            setFormData({
              tipoDestinatarios: 'todos',
              destinatariosSelecionados: [],
              assunto: '',
              mensagem: ''
            });
            await carregarHistorico();
            setVisualizacao('historico');
            
            setModalState({
              isOpen: true,
              title: 'Sucesso',
              message: `E-mails enviados com sucesso!\n\nTotal: ${result.resultados.total}\nEnviados: ${result.resultados.sucesso}\nFalhas: ${result.resultados.falhas}`,
              type: 'success',
              onConfirm: null
            });
          } else {
            setModalState({
              isOpen: true,
              title: 'Erro',
              message: 'Erro ao enviar e-mails: ' + (result.error || 'Erro desconhecido'),
              type: 'error',
              onConfirm: null
            });
          }
        } catch (error) {
          console.error('Erro:', error);
          setModalState({
            isOpen: true,
            title: 'Erro',
            message: 'Erro ao enviar e-mails',
            type: 'error',
            onConfirm: null
          });
        } finally {
          setEnviando(false);
        }
      }
    });
  };

  const getQuantidadeDestinatarios = () => {
    switch (formData.tipoDestinatarios) {
      case 'todos':
        return alunos.filter(a => a.ativo).length;
      case 'ativos':
        return alunos.filter(a => a.ativo === true).length;
      case 'inativos':
        return alunos.filter(a => a.ativo === false).length;
      case 'selecionados':
        return formData.destinatariosSelecionados.length;
      default:
        return 0;
    }
  };

  const handleSelecionarAluno = (email) => {
    const selecionados = [...formData.destinatariosSelecionados];
    const index = selecionados.indexOf(email);
    
    if (index > -1) {
      selecionados.splice(index, 1);
    } else {
      selecionados.push(email);
    }
    
    setFormData({ ...formData, destinatariosSelecionados: selecionados });
  };

  const handleSelecionarTodos = () => {
    const todosEmails = alunos.filter(a => a.ativo).map(a => a.email);
    setFormData({ ...formData, destinatariosSelecionados: todosEmails });
  };

  const handleDesmarcarTodos = () => {
    setFormData({ ...formData, destinatariosSelecionados: [] });
  };

  // Renderizar formulário de envio
  if (visualizacao === 'enviar') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Enviar E-mails</h2>
          <button
            onClick={() => setVisualizacao('historico')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Ver Histórico
          </button>
        </div>

        <form onSubmit={handleEnviarEmail} className="bg-white rounded-lg shadow p-6">
          {/* Tipo de Destinatários */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Enviar para:</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDestinatarios"
                  value="todos"
                  checked={formData.tipoDestinatarios === 'todos'}
                  onChange={(e) => setFormData({ ...formData, tipoDestinatarios: e.target.value })}
                  className="mr-2"
                />
                <span>Todos os alunos ativos ({alunos.filter(a => a.ativo).length} alunos)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDestinatarios"
                  value="ativos"
                  checked={formData.tipoDestinatarios === 'ativos'}
                  onChange={(e) => setFormData({ ...formData, tipoDestinatarios: e.target.value })}
                  className="mr-2"
                />
                <span>Apenas alunos ativos ({alunos.filter(a => a.ativo === true).length} alunos)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDestinatarios"
                  value="inativos"
                  checked={formData.tipoDestinatarios === 'inativos'}
                  onChange={(e) => setFormData({ ...formData, tipoDestinatarios: e.target.value })}
                  className="mr-2"
                />
                <span>Apenas alunos inativos ({alunos.filter(a => a.ativo === false).length} alunos)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDestinatarios"
                  value="selecionados"
                  checked={formData.tipoDestinatarios === 'selecionados'}
                  onChange={(e) => setFormData({ ...formData, tipoDestinatarios: e.target.value })}
                  className="mr-2"
                />
                <span>Selecionar alunos específicos</span>
              </label>
            </div>
          </div>

          {/* Seleção de Alunos Específicos */}
          {formData.tipoDestinatarios === 'selecionados' && (
            <div className="mb-6 p-4 bg-gray-50 rounded border">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Selecione os alunos ({formData.destinatariosSelecionados.length} selecionados)</h3>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={handleSelecionarTodos}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Selecionar Todos
                  </button>
                  <button
                    type="button"
                    onClick={handleDesmarcarTodos}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Desmarcar Todos
                  </button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {alunos.filter(a => a.ativo).map(aluno => (
                  <label key={aluno.id} className="flex items-center p-2 hover:bg-gray-100 rounded">
                    <input
                      type="checkbox"
                      checked={formData.destinatariosSelecionados.includes(aluno.email)}
                      onChange={() => handleSelecionarAluno(aluno.email)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{aluno.nomeCompleto}</span>
                      <span className="text-sm text-gray-500 ml-2">({aluno.email})</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Assunto */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Assunto *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={formData.assunto}
              onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
              placeholder="Ex: Nova turma disponível, Promoção especial, etc."
            />
          </div>

          {/* Mensagem */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Mensagem *</label>
            <RichTextEditor
              value={formData.mensagem}
              onChange={(content) => setFormData({ ...formData, mensagem: content })}
              placeholder="Digite sua mensagem aqui..."
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Dica: A mensagem será personalizada com o nome de cada aluno automaticamente.
            </p>
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-medium text-blue-900 mb-2">📧 Preview do E-mail:</h3>
            <div className="text-sm">
              <p><strong>Para:</strong> {getQuantidadeDestinatarios()} aluno(s)</p>
              <p><strong>Assunto:</strong> {formData.assunto || '(sem assunto)'}</p>
              <p className="mt-2"><strong>Mensagem:</strong></p>
              <div className="bg-white p-3 rounded mt-1 whitespace-pre-wrap">
                {formData.mensagem || '(sem mensagem)'}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={enviando || getQuantidadeDestinatarios() === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando...' : `Enviar para ${getQuantidadeDestinatarios()} aluno(s)`}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  tipoDestinatarios: 'todos',
                  destinatariosSelecionados: [],
                  assunto: '',
                  mensagem: ''
                });
              }}
              className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
            >
              Limpar
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Renderizar histórico
  if (visualizacao === 'historico') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Histórico de E-mails Enviados</h2>
          <button
            onClick={() => setVisualizacao('enviar')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Novo E-mail
          </button>
        </div>

        {historico.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            <p className="text-lg mb-2">📭 Nenhum e-mail enviado ainda</p>
            <p className="text-sm">Clique em "Novo E-mail" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historico.map(email => (
              <div key={email.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">{email.assunto}</h3>
                    <p className="text-sm text-gray-500">
                      Enviado em: {new Date(email.dataEnvio).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      Por: {email.remetente}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-2">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                        ✓ {email.enviados} enviados
                      </span>
                      {email.falhas > 0 && (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm">
                          ✗ {email.falhas} falhas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Tipo:</strong> {
                      email.tipoDestinatarios === 'todos' ? 'Todos os alunos ativos' :
                      email.tipoDestinatarios === 'ativos' ? 'Alunos ativos' :
                      email.tipoDestinatarios === 'inativos' ? 'Alunos inativos' :
                      'Alunos selecionados'
                    }
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Total de destinatários:</strong> {email.totalDestinatarios}
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:underline">
                      Ver mensagem completa
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                      {email.mensagem}
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {visualizacao === 'enviar' ? renderFormularioEnvio() : renderHistorico()}
      
      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </>
  );
}
