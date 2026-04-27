import { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

export default function AdminAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [visualizacao, setVisualizacao] = useState('aprovados'); // aprovados, pendentes, todos
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipoForm, setTipoForm] = useState(''); // novo, editar, aprovar
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'confirm', onConfirm: null });

  useEffect(() => {
    carregarAlunos();
    carregarCursos();
  }, []);

  const carregarAlunos = async () => {
    try {
      const response = await fetch('/api/alunos');
      const data = await response.json();
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      alert('Erro ao carregar alunos');
    }
  };

  const carregarCursos = async () => {
    try {
      const response = await fetch('/api/cursos');
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('foto', file);

    try {
      const response = await fetch('/api/upload-foto', {
        method: 'POST',
        body: formDataUpload
      });
      const result = await response.json();
      if (result.success) {
        setFormData({ ...formData, foto: result.url });
        setModal({ isOpen: true, title: 'Sucesso!', message: 'Foto enviada com sucesso!', type: 'alert', onConfirm: null });
      } else {
        setModal({ isOpen: true, title: 'Erro', message: 'Erro ao enviar foto: ' + result.error, type: 'error', onConfirm: null });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  };

  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskWhatsApp = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskCEP = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'cpf') maskedValue = maskCPF(value);
    if (name === 'whatsapp') maskedValue = maskWhatsApp(value);
    if (name === 'cep') maskedValue = maskCEP(value);

    setFormData({ ...formData, [name]: maskedValue });
  };

  const handleSubmitNovo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/alunos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tipo: 'completo' })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await carregarAlunos();
        setMostrarForm(false);
        setFormData({});
        setModal({ isOpen: true, title: 'Sucesso!', message: 'Aluno cadastrado com sucesso!', type: 'success', onConfirm: null });
      } else {
        setModal({ isOpen: true, title: 'Erro', message: result.error || 'Erro ao cadastrar aluno', type: 'error', onConfirm: null });
      }
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      alert('Erro ao cadastrar aluno');
    }
  };

  const handleAprovar = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/alunos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alunoSelecionado.id,
          action: 'aprovar',
          data: formData
        })
      });

      if (response.ok) {
        await carregarAlunos();
        setMostrarForm(false);
        setFormData({});
        setAlunoSelecionado(null);
        setModal({ isOpen: true, title: 'Sucesso!', message: 'Aluno aprovado com sucesso!', type: 'success', onConfirm: null });
      }
    } catch (error) {
      console.error('Erro ao aprovar aluno:', error);
      alert('Erro ao aprovar aluno');
    }
  };

  const handleRejeitar = async (id) => {
    setModal({
      isOpen: true,
      title: 'Rejeitar Pré-Cadastro',
      message: 'Tem certeza que deseja rejeitar este pré-cadastro?',
      type: 'delete',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/alunos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: id,
              action: 'rejeitar',
              data: { motivo: '' }
            })
          });

          if (response.ok) {
            await carregarAlunos();
            setModal({ isOpen: true, title: 'Sucesso!', message: 'Pré-cadastro rejeitado', type: 'success', onConfirm: null });
          }
        } catch (error) {
          console.error('Erro ao rejeitar:', error);
          setModal({ isOpen: true, title: 'Erro', message: 'Erro ao rejeitar pré-cadastro', type: 'error', onConfirm: null });
        }
      }
    });
  };

  const handleAtualizar = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/alunos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alunoSelecionado.id,
          action: 'atualizar',
          data: formData
        })
      });

      if (response.ok) {
        await carregarAlunos();
        setMostrarForm(false);
        setFormData({});
        setAlunoSelecionado(null);
        setModal({ isOpen: true, title: 'Sucesso!', message: 'Aluno atualizado com sucesso!', type: 'success', onConfirm: null });
      }
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      alert('Erro ao atualizar aluno');
    }
  };

  const handleVincularCurso = async (alunoId, cursoId) => {
    try {
      const response = await fetch('/api/alunos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: alunoId,
          action: 'vincularCurso',
          data: { cursoId }
        })
      });

      if (response.ok) {
        await carregarAlunos();
        setModal({ isOpen: true, title: 'Sucesso!', message: 'Curso vinculado com sucesso!', type: 'success', onConfirm: null });
      }
    } catch (error) {
      console.error('Erro ao vincular curso:', error);
      alert('Erro ao vincular curso');
    }
  };

  const handleDesvincularCurso = async (alunoId, cursoId) => {
    setModal({
      isOpen: true,
      title: 'Desvincular Curso',
      message: 'Deseja realmente desvincular este curso?',
      type: 'confirm',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/alunos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: alunoId,
              action: 'desvincularCurso',
              data: { cursoId }
            })
          });

          if (response.ok) {
            await carregarAlunos();
            setModal({ isOpen: true, title: 'Sucesso!', message: 'Curso desvinculado com sucesso!', type: 'success', onConfirm: null });
          }
        } catch (error) {
          console.error('Erro ao desvincular curso:', error);
          setModal({ isOpen: true, title: 'Erro', message: 'Erro ao desvincular curso', type: 'error', onConfirm: null });
        }
      }
    });
  };

  const handleDeleteAluno = async (id) => {
    setModal({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.',
      type: 'delete',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/alunos?id=${id}`, { method: 'DELETE' });
          if (response.ok) {
            await carregarAlunos();
            setModal({ isOpen: true, title: 'Sucesso!', message: 'Aluno excluído com sucesso!', type: 'success', onConfirm: null });
          }
        } catch (error) {
          console.error('Erro ao excluir aluno:', error);
          setModal({ isOpen: true, title: 'Erro', message: 'Erro ao excluir aluno', type: 'error', onConfirm: null });
        }
      }
    });
  };

  const alternarStatusAluno = async (aluno) => {
    const novoStatus = aluno.ativo ? false : true;
    setModal({
      isOpen: true,
      title: novoStatus ? 'Ativar Aluno' : 'Inativar Aluno',
      message: `Deseja ${novoStatus ? 'ativar' : 'inativar'} o aluno ${aluno.nomeCompleto}?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/alunos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: aluno.id,
              action: 'atualizar',
              data: { ...aluno, ativo: novoStatus }
            })
          });

          if (response.ok) {
            await carregarAlunos();
            setModal({ isOpen: true, title: 'Sucesso!', message: `Aluno ${novoStatus ? 'ativado' : 'inativado'} com sucesso!`, type: 'success', onConfirm: null });
          }
        } catch (error) {
          console.error('Erro ao alterar status:', error);
          setModal({ isOpen: true, title: 'Erro', message: 'Erro ao alterar status', type: 'error', onConfirm: null });
        }
      }
    });
  };

  const abrirFormNovo = () => {
    setTipoForm('novo');
    setFormData({});
    setAlunoSelecionado(null);
    setMostrarForm(true);
  };

  const abrirFormEditar = (aluno) => {
    setTipoForm('editar');
    setAlunoSelecionado(aluno);
    setFormData({
      nomeCompleto: aluno.nomeCompleto,
      email: aluno.email,
      cpf: aluno.cpf || '',
      whatsapp: aluno.whatsapp,
      dataNascimento: aluno.dataNascimento || '',
      endereco: aluno.endereco || '',
      cidade: aluno.cidade || '',
      estado: aluno.estado || '',
      cep: aluno.cep || '',
      foto: aluno.foto || ''
    });
    setMostrarForm(true);
  };

  const abrirFormAprovar = (aluno) => {
    setTipoForm('aprovar');
    setAlunoSelecionado(aluno);
    setFormData({
      nomeCompleto: aluno.nomeCompleto,
      email: aluno.email,
      whatsapp: aluno.whatsapp,
      cpf: '',
      dataNascimento: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      foto: '',
      senha: '',
      cursos: []
    });
    setMostrarForm(true);
  };

  const renderFormulario = () => {
    const isAprovar = tipoForm === 'aprovar';
    const isEditar = tipoForm === 'editar';
    const titulo = isAprovar ? 'Aprovar Pré-Cadastro' : isEditar ? 'Editar Aluno' : 'Novo Aluno';
    const onSubmit = isAprovar ? handleAprovar : isEditar ? handleAtualizar : handleSubmitNovo;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
          <h3 className="text-xl font-bold mb-4">{titulo}</h3>
          <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Foto */}
              <div className="md:col-span-2 flex items-center gap-4">
                {formData.foto && (
                  <img src={formData.foto} alt="Foto" className="h-24 w-24 rounded-full object-cover border-2 border-gray-300" />
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Foto do Aluno</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFoto}
                    disabled={uploading}
                    className="text-sm"
                  />
                  {uploading && <p className="text-xs text-blue-600 mt-1">Enviando...</p>}
                </div>
              </div>

              {/* Nome Completo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                <input
                  type="text"
                  name="nomeCompleto"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formData.nomeCompleto || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">E-mail *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formData.email || ''}
                  onChange={handleChange}
                  readOnly={isEditar}
                />
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium mb-2">CPF *</label>
                <input
                  type="text"
                  name="cpf"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formData.cpf || ''}
                  onChange={handleChange}
                  maxLength={14}
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp *</label>
                <input
                  type="text"
                  name="whatsapp"
                  required
                  className="w-full px-3 py-2 border rounded"
                  value={formData.whatsapp || ''}
                  onChange={handleChange}
                  maxLength={15}
                />
              </div>

              {/* Data de Nascimento */}
              <div>
                <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                <input
                  type="date"
                  name="dataNascimento"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.dataNascimento || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Endereço */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.endereco || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-sm font-medium mb-2">Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.cidade || ''}
                  onChange={handleChange}
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  name="estado"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.estado || ''}
                  onChange={handleChange}
                >
                  <option value="">Selecione...</option>
                  <option value="PA">Pará</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AM">Amazonas</option>
                  <option value="AP">Amapá</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="PR">Paraná</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SE">Sergipe</option>
                  <option value="SP">São Paulo</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>

              {/* CEP */}
              <div>
                <label className="block text-sm font-medium mb-2">CEP</label>
                <input
                  type="text"
                  name="cep"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.cep || ''}
                  onChange={handleChange}
                  maxLength={9}
                />
              </div>

              {/* Senha - apenas para novo e aprovar */}
              {(tipoForm === 'novo' || tipoForm === 'aprovar') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Senha * {isEditar && '(deixe em branco para não alterar)'}</label>
                  <input
                    type="password"
                    name="senha"
                    required={!isEditar}
                    className="w-full px-3 py-2 border rounded"
                    value={formData.senha || ''}
                    onChange={handleChange}
                    minLength={6}
                  />
                </div>
              )}

              {/* Senha para editar (opcional) */}
              {isEditar && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Nova Senha (deixe em branco para não alterar)</label>
                  <input
                    type="password"
                    name="senha"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.senha || ''}
                    onChange={handleChange}
                    minLength={6}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button type="submit" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarForm(false);
                  setFormData({});
                  setAlunoSelecionado(null);
                }}
                className="bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderGerenciarCursos = (aluno) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Gerenciar Cursos - {aluno.nomeCompleto}</h3>
          
          {/* Cursos Vinculados */}
          <div className="mb-6">
            <h4 className="font-bold text-lg mb-3">Cursos Vinculados</h4>
            {aluno.cursos && aluno.cursos.length > 0 ? (
              <div className="space-y-2">
                {aluno.cursos.map(cursoId => {
                  const curso = cursos.find(c => c.id === cursoId);
                  if (!curso) return null;
                  return (
                    <div key={cursoId} className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                      <span className="font-medium">{curso.titulo}</span>
                      <button
                        onClick={() => handleDesvincularCurso(aluno.id, cursoId)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Remover
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Nenhum curso vinculado</p>
            )}
          </div>

          {/* Cursos Disponíveis */}
          <div>
            <h4 className="font-bold text-lg mb-3">Cursos Disponíveis</h4>
            <div className="space-y-2">
              {cursos
                .filter(curso => !aluno.cursos?.includes(curso.id))
                .map(curso => (
                  <div key={curso.id} className="flex justify-between items-center p-3 bg-gray-50 border rounded">
                    <div>
                      <span className="font-medium">{curso.titulo}</span>
                      <p className="text-xs text-gray-500">{curso.categoria}</p>
                    </div>
                    <button
                      onClick={() => handleVincularCurso(aluno.id, curso.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Adicionar
                    </button>
                  </div>
                ))}
            </div>
            {cursos.filter(curso => !aluno.cursos?.includes(curso.id)).length === 0 && (
              <p className="text-gray-500 text-sm">Todos os cursos já foram vinculados</p>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => setAlunoSelecionado(null)}
              className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const alunosPendentes = alunos.filter(a => a.status === 'pendente');
  const alunosAprovados = alunos.filter(a => a.status === 'aprovado');

  return (
    <div>
      {/* Tabs de Visualização */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setVisualizacao('aprovados')}
          className={`px-4 py-2 font-medium ${visualizacao === 'aprovados' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Alunos Aprovados ({alunosAprovados.length})
        </button>
        <button
          onClick={() => setVisualizacao('pendentes')}
          className={`px-4 py-2 font-medium ${visualizacao === 'pendentes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Pré-Cadastros Pendentes ({alunosPendentes.length})
        </button>
      </div>

      {/* Botão Novo Aluno */}
      {visualizacao === 'aprovados' && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Alunos Cadastrados</h2>
          <button
            onClick={abrirFormNovo}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            + Novo Aluno
          </button>
        </div>
      )}

      {/* Lista de Pré-Cadastros Pendentes */}
      {visualizacao === 'pendentes' && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Pré-Cadastros Aguardando Aprovação</h2>
          <div className="space-y-4">
            {alunosPendentes.map(aluno => (
              <div key={aluno.id} className="border rounded-lg p-4 bg-yellow-50 shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{aluno.nomeCompleto}</h3>
                    <p className="text-sm text-gray-600">Email: {aluno.email}</p>
                    <p className="text-sm text-gray-600">WhatsApp: {aluno.whatsapp}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Cadastrado em: {new Date(aluno.dataCadastro).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirFormAprovar(aluno)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleRejeitar(aluno.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {alunosPendentes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhum pré-cadastro pendente.
            </div>
          )}
        </div>
      )}

      {/* Lista de Alunos Aprovados */}
      {visualizacao === 'aprovados' && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Foto</th>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">CPF</th>
                <th className="p-3 text-left">WhatsApp</th>
                <th className="p-3 text-left">Cursos</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunosAprovados.map(aluno => (
                <tr key={aluno.id} className={`border-t hover:bg-gray-50 ${!aluno.ativo ? 'bg-red-50' : ''}`}>
                  <td className="p-3">
                    {aluno.foto ? (
                      <img src={aluno.foto} alt={aluno.nomeCompleto} className="h-10 w-10 rounded-full object-cover border-2 border-gray-300" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-sm text-white font-bold">
                        {aluno.nomeCompleto.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-medium">{aluno.nomeCompleto}</td>
                  <td className="p-3 text-sm">{aluno.email}</td>
                  <td className="p-3 text-sm">{aluno.cpf || 'Não informado'}</td>
                  <td className="p-3 text-sm">{aluno.whatsapp}</td>
                  <td className="p-3 text-sm">{aluno.cursos?.length || 0}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${aluno.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {aluno.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => abrirFormEditar(aluno)}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-2 py-1 rounded text-sm hover:shadow-lg transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setAlunoSelecionado(aluno)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition-all font-semibold"
                      >
                        Cursos
                      </button>
                      <button
                        onClick={() => alternarStatusAluno(aluno)}
                        className={`px-2 py-1 rounded text-sm font-semibold transition-all ${
                          aluno.ativo
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {aluno.ativo ? 'Inativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleDeleteAluno(aluno.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-all font-semibold"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {visualizacao === 'aprovados' && alunosAprovados.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhum aluno cadastrado. Clique em "Novo Aluno" para começar.
        </div>
      )}

      {/* Modais */}
      {mostrarForm && renderFormulario()}
      {alunoSelecionado && !mostrarForm && renderGerenciarCursos(alunoSelecionado)}
      
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
