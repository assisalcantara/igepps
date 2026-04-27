import { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import ConfirmModal from './ConfirmModal';

export default function AdminCursos() {
  const [cursos, setCursos] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [moduloSelecionado, setModuloSelecionado] = useState(null);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [visualizacao, setVisualizacao] = useState('lista'); // lista, curso, modulo, aula
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipoForm, setTipoForm] = useState(''); // curso, modulo, aula, questao, material
  const [modoEdicao, setModoEdicao] = useState(false); // false = criar, true = editar
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  
  // Estados para o modal de confirmação
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: null
  });

  const [formData, setFormData] = useState({});

  useEffect(() => {
    carregarCursos();
  }, []);

  const carregarCursos = async () => {
    try {
      const response = await fetch('/api/cursos');
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      alert('Erro ao carregar cursos');
    }
  };

  const handleSubmitCurso = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicao) {
        // Editar curso existente
        const response = await fetch('/api/cursos', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.id,
            action: 'updateCurso',
            data: formData
          })
        });
        if (response.ok) {
          await carregarCursos();
          setMostrarForm(false);
          setFormData({});
          setModoEdicao(false);
          setModalState({
            isOpen: true,
            title: 'Sucesso!',
            message: 'Curso atualizado com sucesso!',
            type: 'success',
            onConfirm: null
          });
        }
      } else {
        // Criar novo curso
        const response = await fetch('/api/cursos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          await carregarCursos();
          setMostrarForm(false);
          setFormData({});
          setModalState({
            isOpen: true,
            title: 'Sucesso!',
            message: 'Curso criado com sucesso!',
            type: 'success',
            onConfirm: null
          });
        }
      }
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      setModalState({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao salvar curso. Tente novamente.',
        type: 'error',
        onConfirm: null
      });
    }
  };

  const handleSubmitModulo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/cursos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cursoSelecionado.id,
          action: 'addModulo',
          data: formData
        })
      });
      if (response.ok) {
        const cursoAtualizado = await response.json();
        setCursoSelecionado(cursoAtualizado);
        await carregarCursos();
        setMostrarForm(false);
        setFormData({});
        setModalState({
          isOpen: true,
          title: 'Sucesso!',
          message: 'Módulo adicionado com sucesso!',
          type: 'success',
          onConfirm: null
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar módulo:', error);
      setModalState({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao adicionar módulo. Tente novamente.',
        type: 'error',
        onConfirm: null
      });
    }
  };

  const handleSubmitAula = async (e) => {
    e.preventDefault();
    try {
      const action = modoEdicao ? 'updateAula' : 'addAula';
      const body = modoEdicao 
        ? {
            id: cursoSelecionado.id,
            action: action,
            data: {
              moduloId: moduloSelecionado.id,
              aulaId: aulaSelecionada.id,
              ...formData
            }
          }
        : {
            id: cursoSelecionado.id,
            action: action,
            data: {
              moduloId: moduloSelecionado.id,
              ...formData
            }
          };
      
      const response = await fetch('/api/cursos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        const cursoAtualizado = await response.json();
        setCursoSelecionado(cursoAtualizado);
        const moduloAtualizado = cursoAtualizado.modulos.find(m => m.id === moduloSelecionado.id);
        setModuloSelecionado(moduloAtualizado);
        if (modoEdicao) {
          const aulaAtualizada = moduloAtualizado.aulas.find(a => a.id === aulaSelecionada.id);
          setAulaSelecionada(aulaAtualizada);
        }
        await carregarCursos();
        setMostrarForm(false);
        setFormData({});
        setModoEdicao(false);
        setModalState({
          isOpen: true,
          title: 'Sucesso!',
          message: modoEdicao ? 'Aula atualizada com sucesso!' : 'Aula adicionada com sucesso!',
          type: 'success',
          onConfirm: null
        });
      }
    } catch (error) {
      console.error('Erro ao salvar aula:', error);
      setModalState({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao salvar aula. Tente novamente.',
        type: 'error',
        onConfirm: null
      });
    }
  };

  const handleSubmitQuestao = async (e) => {
    e.preventDefault();
    try {
      const alternativas = [
        formData.alternativa1,
        formData.alternativa2,
        formData.alternativa3,
        formData.alternativa4
      ].filter(a => a);

      const response = await fetch('/api/cursos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cursoSelecionado.id,
          action: 'addQuestao',
          data: {
            moduloId: moduloSelecionado.id,
            aulaId: aulaSelecionada.id,
            pergunta: formData.pergunta,
            alternativas: alternativas,
            respostaCorreta: parseInt(formData.respostaCorreta),
            explicacao: formData.explicacao || ''
          }
        })
      });
      if (response.ok) {
        const cursoAtualizado = await response.json();
        setCursoSelecionado(cursoAtualizado);
        const moduloAtualizado = cursoAtualizado.modulos.find(m => m.id === moduloSelecionado.id);
        const aulaAtualizada = moduloAtualizado.aulas.find(a => a.id === aulaSelecionada.id);
        setModuloSelecionado(moduloAtualizado);
        setAulaSelecionada(aulaAtualizada);
        await carregarCursos();
        setMostrarForm(false);
        setFormData({});
        setModalState({
          isOpen: true,
          title: 'Sucesso!',
          message: 'Questão adicionada com sucesso!',
          type: 'success',
          onConfirm: null
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar questão:', error);
      setModalState({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao adicionar questão. Tente novamente.',
        type: 'error',
        onConfirm: null
      });
    }
  };

  const handleUploadMaterial = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('material', file);

    setUploadingMaterial(true);
    try {
      const response = await fetch('/api/upload-material', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, url: data.url });
        setModalState({
          isOpen: true,
          title: 'Sucesso!',
          message: 'Arquivo enviado com sucesso!',
          type: 'success',
          onConfirm: null
        });
      } else {
        setModalState({
          isOpen: true,
          title: 'Erro',
          message: 'Erro ao fazer upload do arquivo.',
          type: 'error',
          onConfirm: null
        });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setModalState({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao fazer upload do arquivo.',
        type: 'error',
        onConfirm: null
      });
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleSubmitMaterial = async (e) => {
    e.preventDefault();
    
    if (!formData.url) {
      setModalState({
        isOpen: true,
        title: 'Atenção',
        message: 'Por favor, faça upload de um arquivo ou insira uma URL.',
        type: 'error',
        onConfirm: null
      });
      return;
    }

    try {
      const response = await fetch('/api/cursos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cursoSelecionado.id,
          action: 'addMaterial',
          data: {
            moduloId: moduloSelecionado.id,
            aulaId: aulaSelecionada.id,
            titulo: formData.titulo,
            tipo: formData.tipo,
            url: formData.url
          }
        })
      });
      if (response.ok) {
        const cursoAtualizado = await response.json();
        setCursoSelecionado(cursoAtualizado);
        const moduloAtualizado = cursoAtualizado.modulos.find(m => m.id === moduloSelecionado.id);
        const aulaAtualizada = moduloAtualizado.aulas.find(a => a.id === aulaSelecionada.id);
        setModuloSelecionado(moduloAtualizado);
        setAulaSelecionada(aulaAtualizada);
        await carregarCursos();
        setMostrarForm(false);
        setFormData({});
        setModalState({
          isOpen: true,
          title: 'Sucesso!',
          message: 'Material adicionado com sucesso!',
          type: 'success',
          onConfirm: null
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      setModalState({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao adicionar material. Tente novamente.',
        type: 'error',
        onConfirm: null
      });
    }
  };

  const handleDeleteCurso = async (id) => {
    setModalState({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.',
      type: 'delete',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/cursos?id=${id}`, { method: 'DELETE' });
          if (response.ok) {
            await carregarCursos();
            setModalState({
              isOpen: true,
              title: 'Sucesso!',
              message: 'Curso excluído com sucesso!',
              type: 'success',
              onConfirm: null
            });
          }
        } catch (error) {
          console.error('Erro ao excluir curso:', error);
          setModalState({
            isOpen: true,
            title: 'Erro',
            message: 'Erro ao excluir curso. Tente novamente.',
            type: 'error',
            onConfirm: null
          });
        }
      }
    });
  };

  const handleToggleStatusCurso = async (id, statusAtual) => {
    const novoStatus = statusAtual === false ? true : false;
    console.log('Toggle Status - ID:', id, 'Status Atual:', statusAtual, 'Novo Status:', novoStatus);
    
    setModalState({
      isOpen: true,
      title: novoStatus ? 'Ativar Curso' : 'Inativar Curso',
      message: `Tem certeza que deseja ${novoStatus ? 'ativar' : 'inativar'} este curso?`,
      type: 'confirm',
      onConfirm: async () => {
        console.log('>>> EXECUTANDO onConfirm <<<');
        try {
          // Fechar modal de confirmação
          setModalState(prev => ({ ...prev, isOpen: false }));
          console.log('Modal fechado, iniciando requisição...');
          
          // Buscar todos os cursos
          const responseCursos = await fetch('/api/cursos');
          const todosOsCursos = await responseCursos.json();
          const cursoAtual = todosOsCursos.find(c => c.id === id);
          
          console.log('Curso encontrado:', cursoAtual);
          
          if (!cursoAtual) {
            throw new Error('Curso não encontrado');
          }
          
          // Preparar dados para atualização
          const dadosAtualizacao = {
            id: id,
            action: 'updateCurso',
            data: {
              titulo: cursoAtual.titulo,
              descricao: cursoAtual.descricao,
              categoria: cursoAtual.categoria,
              cargaHoraria: cursoAtual.cargaHoraria,
              thumbnail: cursoAtual.thumbnail || '',
              ativo: novoStatus
            }
          };
          
          console.log('Enviando atualização:', dadosAtualizacao);
          
          // Enviar atualização
          const responseUpdate = await fetch('/api/cursos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizacao)
          });
          
          console.log('Response status:', responseUpdate.status);
          
          if (responseUpdate.ok) {
            const resultado = await responseUpdate.json();
            console.log('Curso atualizado:', resultado);
            
            // Recarregar lista de cursos
            await carregarCursos();
            
            // Mostrar mensagem de sucesso
            setModalState({
              isOpen: true,
              title: 'Sucesso!',
              message: `Curso ${novoStatus ? 'ativado' : 'inativado'} com sucesso!`,
              type: 'success',
              onConfirm: null
            });
          } else {
            const textoErro = await responseUpdate.text();
            console.error('Erro na resposta:', textoErro);
            throw new Error(`Erro na resposta do servidor: ${responseUpdate.status}`);
          }
        } catch (error) {
          console.error('Erro ao alterar status:', error);
          setModalState({
            isOpen: true,
            title: 'Erro',
            message: `Erro ao alterar status do curso: ${error.message}`,
            type: 'error',
            onConfirm: null
          });
        }
      }
    });
  };

  const handleDeleteModulo = async (moduloId) => {
    setModalState({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este módulo? Esta ação não pode ser desfeita.',
      type: 'delete',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/cursos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: cursoSelecionado.id,
              action: 'deleteModulo',
              data: { moduloId }
            })
          });
          if (response.ok) {
            const cursoAtualizado = await response.json();
            setCursoSelecionado(cursoAtualizado);
            await carregarCursos();
            setModalState({
              isOpen: true,
              title: 'Sucesso!',
              message: 'Módulo excluído com sucesso!',
              type: 'success',
              onConfirm: null
            });
          }
        } catch (error) {
          console.error('Erro ao excluir módulo:', error);
          setModalState({
            isOpen: true,
            title: 'Erro',
            message: 'Erro ao excluir módulo. Tente novamente.',
            type: 'error',
            onConfirm: null
          });
        }
      }
    });
  };

  const handleDeleteAula = async (aulaId) => {
    setModalState({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.',
      type: 'delete',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/cursos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: cursoSelecionado.id,
              action: 'deleteAula',
              data: { moduloId: moduloSelecionado.id, aulaId }
            })
          });
          if (response.ok) {
            const cursoAtualizado = await response.json();
            setCursoSelecionado(cursoAtualizado);
            const moduloAtualizado = cursoAtualizado.modulos.find(m => m.id === moduloSelecionado.id);
            setModuloSelecionado(moduloAtualizado);
            await carregarCursos();
            setVisualizacao('modulo');
            setModalState({
              isOpen: true,
              title: 'Sucesso!',
              message: 'Aula excluída com sucesso!',
              type: 'success',
              onConfirm: null
            });
          }
        } catch (error) {
          console.error('Erro ao excluir aula:', error);
          setModalState({
            isOpen: true,
            title: 'Erro',
            message: 'Erro ao excluir aula. Tente novamente.',
            type: 'error',
            onConfirm: null
          });
        }
      }
    });
  };

  const handleDeleteQuestao = async (questaoId) => {
    setModalState({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir esta questão?',
      type: 'delete',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/cursos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: cursoSelecionado.id,
              action: 'deleteQuestao',
              data: { moduloId: moduloSelecionado.id, aulaId: aulaSelecionada.id, questaoId }
            })
          });
          if (response.ok) {
            const cursoAtualizado = await response.json();
            setCursoSelecionado(cursoAtualizado);
            const moduloAtualizado = cursoAtualizado.modulos.find(m => m.id === moduloSelecionado.id);
            const aulaAtualizada = moduloAtualizado.aulas.find(a => a.id === aulaSelecionada.id);
            setModuloSelecionado(moduloAtualizado);
            setAulaSelecionada(aulaAtualizada);
            await carregarCursos();
            setModalState({
              isOpen: true,
              title: 'Sucesso!',
              message: 'Questão excluída com sucesso!',
              type: 'success',
              onConfirm: null
            });
          }
        } catch (error) {
          console.error('Erro ao excluir questão:', error);
          setModalState({
            isOpen: true,
            title: 'Erro',
            message: 'Erro ao excluir questão. Tente novamente.',
            type: 'error',
            onConfirm: null
          });
        }
      }
    });
  };

  const abrirFormulario = (tipo, dadosExistentes = null) => {
    setTipoForm(tipo);
    if (dadosExistentes) {
      setFormData(dadosExistentes);
      setModoEdicao(true);
    } else {
      setFormData({});
      setModoEdicao(false);
    }
    setMostrarForm(true);
  };

  const handleUploadThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB');
      return;
    }

    setUploadingThumbnail(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload-thumbnail', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, thumbnail: data.url });
        alert('Imagem enviada com sucesso!');
      } else {
        throw new Error('Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const renderFormCurso = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{modoEdicao ? 'Editar Curso' : 'Novo Curso'}</h3>
        <form onSubmit={handleSubmitCurso}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={formData.titulo || ''}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <RichTextEditor
              value={formData.descricao || ''}
              onChange={(content) => setFormData({...formData, descricao: content})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={formData.categoria || ''}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Carga Horária (horas)</label>
            <input
              type="number"
              required
              className="w-full px-3 py-2 border rounded"
              value={formData.cargaHoraria || ''}
              onChange={(e) => setFormData({...formData, cargaHoraria: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Vídeo de Apresentação do Curso (YouTube)</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
              className="w-full px-3 py-2 border rounded"
              value={formData.videoApresentacao || ''}
              onChange={(e) => setFormData({...formData, videoApresentacao: e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">Deixe em branco para usar o vídeo da primeira aula</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Imagem Thumbnail (100px altura)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadThumbnail}
              disabled={uploadingThumbnail}
              className="w-full px-3 py-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              {uploadingThumbnail ? 'Enviando imagem...' : 'Selecione uma imagem (máx. 2MB, recomendado: 100px de altura)'}
            </p>
            {formData.thumbnail && (
              <div className="mt-2 p-2 bg-gray-50 rounded border">
                <p className="text-xs text-gray-600 mb-1">Preview:</p>
                <img src={formData.thumbnail} alt="Preview" className="h-[100px] w-auto object-contain" />
                <button
                  type="button"
                  onClick={() => setFormData({...formData, thumbnail: ''})}
                  className="mt-2 text-xs text-red-600 hover:underline"
                >
                  Remover imagem
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {modoEdicao ? 'Atualizar' : 'Salvar'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setMostrarForm(false);
                setModoEdicao(false);
                setFormData({});
              }} 
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFormModulo = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h3 className="text-xl font-bold mb-4">Novo Módulo</h3>
        <form onSubmit={handleSubmitModulo}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={formData.titulo || ''}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              required
              rows="3"
              className="w-full px-3 py-2 border rounded"
              value={formData.descricao || ''}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Salvar
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFormAula = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{modoEdicao ? 'Editar Aula' : 'Nova Aula'}</h3>
        <form onSubmit={handleSubmitAula}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={formData.titulo || ''}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              required
              rows="3"
              className="w-full px-3 py-2 border rounded"
              value={formData.descricao || ''}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">URL do Vídeo (YouTube)</label>
            <input
              type="url"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border rounded"
              value={formData.videoUrl || ''}
              onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Duração (minutos)</label>
            <input
              type="number"
              required
              className="w-full px-3 py-2 border rounded"
              value={formData.duracao || ''}
              onChange={(e) => setFormData({...formData, duracao: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Salvar
            </button>
            <button type="button" onClick={() => {
              setMostrarForm(false);
              setModoEdicao(false);
              setFormData({});
            }} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFormQuestao = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Nova Questão</h3>
        <form onSubmit={handleSubmitQuestao}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Pergunta</label>
            <textarea
              required
              rows="3"
              className="w-full px-3 py-2 border rounded"
              value={formData.pergunta || ''}
              onChange={(e) => setFormData({...formData, pergunta: e.target.value})}
            />
          </div>
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="mb-3">
              <label className="block text-sm font-medium mb-2">Alternativa {num}</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded"
                value={formData[`alternativa${num}`] || ''}
                onChange={(e) => setFormData({...formData, [`alternativa${num}`]: e.target.value})}
              />
            </div>
          ))}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Resposta Correta</label>
            <select
              required
              className="w-full px-3 py-2 border rounded"
              value={formData.respostaCorreta || ''}
              onChange={(e) => setFormData({...formData, respostaCorreta: e.target.value})}
            >
              <option value="">Selecione...</option>
              <option value="0">Alternativa 1</option>
              <option value="1">Alternativa 2</option>
              <option value="2">Alternativa 3</option>
              <option value="3">Alternativa 4</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Explicação (opcional)</label>
            <textarea
              rows="2"
              className="w-full px-3 py-2 border rounded"
              value={formData.explicacao || ''}
              onChange={(e) => setFormData({...formData, explicacao: e.target.value})}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Salvar
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFormMaterial = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Adicionar Material de Apoio</h3>
        <form onSubmit={handleSubmitMaterial}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={formData.titulo || ''}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              required
              className="w-full px-3 py-2 border rounded"
              value={formData.tipo || 'pdf'}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
            >
              <option value="pdf">PDF</option>
              <option value="video">Vídeo</option>
              <option value="link">Link Externo</option>
              <option value="documento">Documento</option>
              <option value="imagem">Imagem</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Arquivo ou URL</label>
            
            {/* Opção 1: Upload de Arquivo */}
            <div className="mb-3 p-4 border-2 border-dashed rounded-lg bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📁 Fazer Upload de Arquivo
              </label>
              <input
                type="file"
                onChange={handleUploadMaterial}
                className="w-full text-sm"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                disabled={uploadingMaterial}
              />
              {uploadingMaterial && (
                <p className="text-sm text-blue-600 mt-2">📤 Enviando arquivo...</p>
              )}
            </div>

            {/* Opção 2: URL Externa */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔗 Ou insira uma URL externa
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded"
                placeholder="https://..."
                value={formData.url || ''}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>

            {formData.url && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-700">
                  ✅ Link pronto: <span className="font-mono break-all">{formData.url}</span>
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-4 py-2 rounded hover:shadow-lg transition-all">
              Adicionar Material
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderização da lista de cursos
  if (visualizacao === 'lista') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Cursos</h2>
          <button
            onClick={() => abrirFormulario('curso')}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            + Novo Curso
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map(curso => (
            <div key={curso.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900">
                {curso.thumbnail ? (
                  <img 
                    src={curso.thumbnail} 
                    alt={curso.titulo} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">📚</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${curso.ativo ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {curso.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-5">
                <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2">{curso.titulo}</h3>
                <div className="text-sm text-gray-600 mb-3 line-clamp-4" style={{ whiteSpace: 'pre-line' }}>
                  {curso.descricao
                    ?.replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
                    .replace(/<p[^>]*>/gi, '')
                    .replace(/<\/p>/gi, '')
                    .replace(/<div[^>]*>/gi, '')
                    .replace(/<\/div>/gi, '\n')
                    .replace(/<[^>]*>/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/\n\s*\n/g, '\n')
                    .trim()
                  }
                </div>
                
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>📂</span>
                    <span>{curso.categoria}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{curso.cargaHoraria}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📖</span>
                    <span>{curso.modulos?.length || 0} módulos</span>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => abrirFormulario('curso', curso)}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-3 py-2 rounded-lg text-sm hover:shadow-lg transition-all"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setCursoSelecionado(curso);
                      setVisualizacao('curso');
                    }}
                    className="flex-1 bg-green-600 text-white font-semibold px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-all"
                  >
                    Gerenciar
                  </button>
                  <button
                    onClick={() => {
                      console.log('Clicou em ativar/inativar - Curso ID:', curso.id, 'Ativo:', curso.ativo);
                      handleToggleStatusCurso(curso.id, curso.ativo);
                    }}
                    className={`${curso.ativo ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600'} text-white font-semibold px-3 py-2 rounded-lg text-sm transition-all`}
                  >
                    {curso.ativo ? 'Inativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDeleteCurso(curso.id)}
                    className="bg-red-500 text-white font-semibold px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-all"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cursos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum curso cadastrado. Clique em "Novo Curso" para começar.
          </div>
        )}

        {mostrarForm && tipoForm === 'curso' && renderFormCurso()}
        
        <ConfirmModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onConfirm={modalState.onConfirm}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
        />
      </div>
    );
  }

  // Renderização dos módulos do curso
  if (visualizacao === 'curso' && cursoSelecionado) {
    return (
      <div>
        <button
          onClick={() => {
            setVisualizacao('lista');
            setCursoSelecionado(null);
          }}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Voltar para Cursos
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">{cursoSelecionado.titulo}</h2>
          <p className="text-gray-600">{cursoSelecionado.descricao}</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Módulos</h3>
          <button
            onClick={() => abrirFormulario('modulo')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Novo Módulo
          </button>
        </div>

        <div className="space-y-4">
          {cursoSelecionado.modulos?.map((modulo, index) => (
            <div key={modulo.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-bold">Módulo {index + 1}: {modulo.titulo}</h4>
                  <p className="text-sm text-gray-600 mb-2">{modulo.descricao}</p>
                  <p className="text-xs text-gray-500">Aulas: {modulo.aulas?.length || 0}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setModuloSelecionado(modulo);
                      setVisualizacao('modulo');
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Gerenciar
                  </button>
                  <button
                    onClick={() => handleDeleteModulo(modulo.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cursoSelecionado.modulos?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum módulo cadastrado. Clique em "Novo Módulo" para começar.
          </div>
        )}

        {mostrarForm && tipoForm === 'modulo' && renderFormModulo()}
        
        <ConfirmModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onConfirm={modalState.onConfirm}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
        />
      </div>
    );
  }

  // Renderização das aulas do módulo
  if (visualizacao === 'modulo' && moduloSelecionado) {
    return (
      <div>
        <button
          onClick={() => {
            setVisualizacao('curso');
            setModuloSelecionado(null);
          }}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Voltar para Módulos
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">{moduloSelecionado.titulo}</h2>
          <p className="text-gray-600">{moduloSelecionado.descricao}</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Aulas</h3>
          <button
            onClick={() => abrirFormulario('aula')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nova Aula
          </button>
        </div>

        <div className="space-y-4">
          {moduloSelecionado.aulas?.map((aula, index) => (
            <div key={aula.id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-bold">Aula {index + 1}: {aula.titulo}</h4>
                  <p className="text-sm text-gray-600 mb-2">{aula.descricao}</p>
                  <p className="text-xs text-gray-500 mb-1">Duração: {aula.duracao} minutos</p>
                  <p className="text-xs text-gray-500 mb-1">Questões: {aula.questoes?.length || 0}</p>
                  <p className="text-xs text-gray-500">Materiais: {aula.materiais?.length || 0}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAulaSelecionada(aula);
                      setVisualizacao('aula');
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Gerenciar
                  </button>
                  <button
                    onClick={() => handleDeleteAula(aula.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {moduloSelecionado.aulas?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma aula cadastrada. Clique em "Nova Aula" para começar.
          </div>
        )}

        {mostrarForm && tipoForm === 'aula' && renderFormAula()}
        
        <ConfirmModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onConfirm={modalState.onConfirm}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
        />
      </div>
    );
  }

  // Renderização dos detalhes da aula (questões e materiais)
  if (visualizacao === 'aula' && aulaSelecionada) {
    return (
      <div>
        <button
          onClick={() => {
            setVisualizacao('modulo');
            setAulaSelecionada(null);
          }}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Voltar para Aulas
        </button>

        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{aulaSelecionada.titulo}</h2>
              <p className="text-gray-600 mb-2">{aulaSelecionada.descricao}</p>
              <a href={aulaSelecionada.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                Ver vídeo no YouTube →
              </a>
            </div>
            <button
              onClick={() => {
                setFormData({
                  titulo: aulaSelecionada.titulo,
                  descricao: aulaSelecionada.descricao,
                  videoUrl: aulaSelecionada.videoUrl,
                  duracao: aulaSelecionada.duracao
                });
                setModoEdicao(true);
                setTipoForm('aula');
                setMostrarForm(true);
              }}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm font-semibold whitespace-nowrap ml-4"
            >
              Editar Aula
            </button>
          </div>
        </div>

        {/* Banco de Questões */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Banco de Questões</h3>
            <button
              onClick={() => abrirFormulario('questao')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Nova Questão
            </button>
          </div>

          <div className="space-y-4">
            {aulaSelecionada.questoes?.map((questao, index) => (
              <div key={questao.id} className="border rounded-lg p-4 bg-white shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold">Questão {index + 1}</h4>
                  <button
                    onClick={() => handleDeleteQuestao(questao.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
                <p className="mb-3">{questao.pergunta}</p>
                <div className="space-y-2">
                  {questao.alternativas.map((alt, i) => (
                    <div key={i} className={`p-2 rounded ${i === questao.respostaCorreta ? 'bg-green-100 border border-green-500' : 'bg-gray-50'}`}>
                      <span className="font-medium">{String.fromCharCode(65 + i)})</span> {alt}
                      {i === questao.respostaCorreta && <span className="text-green-600 ml-2">✓ Correta</span>}
                    </div>
                  ))}
                </div>
                {questao.explicacao && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm"><strong>Explicação:</strong> {questao.explicacao}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {aulaSelecionada.questoes?.length === 0 && (
            <div className="text-center py-8 text-gray-500 border rounded-lg">
              Nenhuma questão cadastrada.
            </div>
          )}
        </div>

        {/* Material de Apoio */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Material de Apoio</h3>
            <button
              onClick={() => {
                setTipoForm('material');
                setFormData({});
                setMostrarForm(true);
              }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-4 py-2 rounded hover:shadow-lg transition-all"
            >
              + Adicionar Material
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aulaSelecionada.materiais?.map(material => (
              <div key={material.id} className="border rounded-lg p-4 bg-white shadow">
                <p className="font-medium mb-2">{material.titulo}</p>
                <p className="text-sm text-gray-500 mb-3">Tipo: {material.tipo.toUpperCase()}</p>
                <div className="flex gap-2">
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm text-center hover:bg-blue-700"
                  >
                    Abrir
                  </a>
                  <button
                    onClick={() => alert('Função de exclusão em desenvolvimento')}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {aulaSelecionada.materiais?.length === 0 && (
            <div className="text-center py-8 text-gray-500 border rounded-lg">
              Nenhum material cadastrado.
            </div>
          )}
        </div>

        {mostrarForm && tipoForm === 'questao' && renderFormQuestao()}
        {mostrarForm && tipoForm === 'material' && renderFormMaterial()}
        
        <ConfirmModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onConfirm={modalState.onConfirm}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
        />
      </div>
    );
  }

  return null;
}
