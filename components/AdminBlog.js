import { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import ConfirmModal from './ConfirmModal';

export default function AdminBlog() {
  const [noticias, setNoticias] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [uploadingImagem, setUploadingImagem] = useState(false);
  const [formData, setFormData] = useState({});
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: null
  });

  useEffect(() => {
    carregarNoticias();
  }, []);

  const carregarNoticias = async () => {
    try {
      const response = await fetch('/api/noticias');
      const data = await response.json();
      setNoticias(data);
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
      setModalState({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao carregar notícias',
        type: 'error',
        onConfirm: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = '/api/noticias';
      const method = modoEdicao ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await carregarNoticias();
        setMostrarForm(false);
        setFormData({});
        setModoEdicao(false);
        setModalState({
          isOpen: true,
          title: 'Sucesso',
          message: modoEdicao ? 'Notícia atualizada com sucesso!' : 'Notícia criada com sucesso!',
          type: 'success',
          onConfirm: null
        });
      }
    } catch (error) {
      console.error('Erro ao salvar notícia:', error);
      setModalState({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao salvar notícia',
        type: 'error',
        onConfirm: null
      });
    }
  };

  const handleDelete = async (id) => {
    setModalState({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.',
      type: 'confirm',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/noticias?id=${id}`, { method: 'DELETE' });
          if (response.ok) {
            await carregarNoticias();
            setModalState({
              isOpen: true,
              title: 'Sucesso',
              message: 'Notícia excluída com sucesso!',
              type: 'success',
              onConfirm: null
            });
          }
        } catch (error) {
          console.error('Erro ao excluir notícia:', error);
          setModalState({
            isOpen: true,
            title: 'Erro',
            message: 'Erro ao excluir notícia',
            type: 'error',
            onConfirm: null
          });
        }
      }
    });
  };

  const abrirFormulario = (noticia = null) => {
    if (noticia) {
      setFormData(noticia);
      setModoEdicao(true);
    } else {
      setFormData({});
      setModoEdicao(false);
    }
    setMostrarForm(true);
  };

  const handleUploadImagem = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalState({
        isOpen: true,
        title: 'Arquivo Inválido',
        message: 'Por favor, selecione apenas arquivos de imagem',
        type: 'error',
        onConfirm: null
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setModalState({
        isOpen: true,
        title: 'Arquivo Muito Grande',
        message: 'A imagem deve ter no máximo 2MB',
        type: 'error',
        onConfirm: null
      });
      return;
    }

    setUploadingImagem(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload-thumbnail', {
        method: 'POST',
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({ ...formData, imagem: data.url });
        setModalState({
          isOpen: true,
          title: 'Sucesso',
          message: 'Imagem enviada com sucesso!',
          type: 'success',
          onConfirm: null
        });
      } else {
        throw new Error('Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setModalState({
        isOpen: true,
        title: 'Erro',
        message: 'Erro ao fazer upload da imagem',
        type: 'error',
        onConfirm: null
      });
    } finally {
      setUploadingImagem(false);
    }
  };

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Blog / Notícias</h2>
        <button
          onClick={() => abrirFormulario()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nova Notícia
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {noticias.map(noticia => (
              <tr key={noticia.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {noticia.imagem && (
                      <img src={noticia.imagem} alt="" className="h-10 w-16 object-cover rounded mr-3" />
                    )}
                    <div className="text-sm font-medium text-gray-900">{noticia.titulo}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{noticia.categoria}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{noticia.autor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatarData(noticia.dataPublicacao)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    noticia.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {noticia.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => abrirFormulario(noticia)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg mr-2 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(noticia.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    🗑️ Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {noticias.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma notícia cadastrada. Clique em "Nova Notícia" para começar.
          </div>
        )}
      </div>

      {/* Modal do Formulário */}
      {mostrarForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{modoEdicao ? 'Editar Notícia' : 'Nova Notícia'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Título *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formData.titulo || ''}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Resumo (para cards) *</label>
                <textarea
                  required
                  rows="2"
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Texto curto que aparece no card da home"
                  value={formData.resumo || ''}
                  onChange={(e) => setFormData({...formData, resumo: e.target.value})}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Conteúdo completo *</label>
                <RichTextEditor
                  value={formData.conteudo || ''}
                  onChange={(content) => setFormData({...formData, conteudo: content})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={formData.categoria || 'Geral'}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  >
                    <option value="Geral">Geral</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Cursos">Cursos</option>
                    <option value="Institucional">Institucional</option>
                    <option value="Parcerias">Parcerias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Autor</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.autor || 'IGEPPS'}
                    onChange={(e) => setFormData({...formData, autor: e.target.value})}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Imagem de destaque</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImagem}
                  disabled={uploadingImagem}
                  className="w-full px-3 py-2 border rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {uploadingImagem ? 'Enviando imagem...' : 'Opcional: imagem que aparece no card e na página (máx. 2MB)'}
                </p>
                {formData.imagem && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-600 mb-1">Preview:</p>
                    <img src={formData.imagem} alt="Preview" className="h-32 w-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, imagem: ''})}
                      className="mt-2 text-xs text-red-600 hover:underline"
                    >
                      Remover imagem
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.ativo !== false}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  />
                  <span className="text-sm">Notícia ativa (visível no site)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {modoEdicao ? 'Atualizar' : 'Publicar'}
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
      )}

      {/* Modal de Confirmação */}
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
