import { useState, useEffect } from 'react';

export default function AdminProfessores() {
  const [professores, setProfessores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
    biografia: '',
    foto: '',
    cursosResponsaveis: []
  });

  useEffect(() => {
    carregarProfessores();
    carregarCursos();
  }, []);

  const carregarProfessores = async () => {
    try {
      const response = await fetch('/api/professores');
      const data = await response.json();
      setProfessores(data);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
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
        setForm({ ...form, foto: data.url });
        alert('Foto enviada com sucesso!');
      } else {
        alert('Erro ao fazer upload da foto: ' + data.erro);
      }
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      alert('Erro ao fazer upload da foto');
    }
    setUploadandoFoto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nome || !form.email) {
      alert('Preencha os campos obrigatórios (Nome e Email)');
      return;
    }

    try {
      const url = editando ? `/api/professores?id=${editando}` : '/api/professores';
      const method = editando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        alert(editando ? 'Professor atualizado com sucesso!' : 'Professor cadastrado com sucesso!');
        limparForm();
        carregarProfessores();
      } else {
        const data = await response.json();
        alert('Erro: ' + data.erro);
      }
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
      alert('Erro ao salvar professor');
    }
  };

  const handleEditar = (professor) => {
    setEditando(professor.id);
    setForm(professor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir este professor?')) return;

    try {
      const response = await fetch(`/api/professores?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Professor excluído com sucesso!');
        carregarProfessores();
      } else {
        alert('Erro ao excluir professor');
      }
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      alert('Erro ao excluir professor');
    }
  };

  const limparForm = () => {
    setForm({
      nome: '',
      email: '',
      telefone: '',
      especialidade: '',
      biografia: '',
      foto: '',
      cursosResponsaveis: []
    });
    setEditando(null);
  };

  const toggleCurso = (cursoId) => {
    const cursosAtualizados = form.cursosResponsaveis.includes(cursoId)
      ? form.cursosResponsaveis.filter(id => id !== cursoId)
      : [...form.cursosResponsaveis, cursoId];
    
    setForm({ ...form, cursosResponsaveis: cursosAtualizados });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {editando ? '✏️ Editar Professor' : '➕ Cadastrar Novo Professor'}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8">
        {/* Foto do Professor */}
        <div className="mb-6 flex items-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-blue-600 flex items-center justify-center flex-shrink-0">
            {form.foto ? (
              <img src={form.foto} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl text-gray-400">👤</span>
            )}
          </div>
          <div>
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition inline-block">
              {uploadandoFoto ? '📤 Enviando...' : '📷 Escolher Foto'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFoto}
                disabled={uploadandoFoto}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG ou GIF (máx. 5MB)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
            <input
              type="tel"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.especialidade}
              onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
              placeholder="Ex: Educação Financeira, Psicologia..."
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Biografia</label>
          <textarea
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="4"
            value={form.biografia}
            onChange={(e) => setForm({ ...form, biografia: e.target.value })}
            placeholder="Breve descrição sobre o professor, formação acadêmica, experiência..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cursos Responsáveis
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cursos.map((curso) => (
              <label
                key={curso.id}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                  form.cursosResponsaveis.includes(curso.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.cursosResponsaveis.includes(curso.id)}
                  onChange={() => toggleCurso(curso.id)}
                  className="mr-3 w-5 h-5"
                />
                <span className="font-medium">{curso.titulo}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            {editando ? '💾 Salvar Alterações' : '➕ Cadastrar Professor'}
          </button>
          {editando && (
            <button
              type="button"
              onClick={limparForm}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              ✕ Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de Professores */}
      <h3 className="text-xl font-bold mb-4 text-gray-800">👨‍🏫 Professores Cadastrados</h3>
      
      {professores.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          Nenhum professor cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {professores.map((professor) => (
            <div key={professor.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {professor.foto ? (
                    <img src={professor.foto} alt={professor.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                      👤
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800">{professor.nome}</h4>
                  {professor.especialidade && (
                    <p className="text-sm text-blue-600 font-semibold">{professor.especialidade}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    📧 {professor.email}
                  </p>
                  {professor.telefone && (
                    <p className="text-sm text-gray-600">
                      📱 {professor.telefone}
                    </p>
                  )}
                </div>
              </div>

              {professor.biografia && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                  {professor.biografia}
                </p>
              )}

              {professor.cursosResponsaveis?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Cursos Responsáveis:</p>
                  <div className="flex flex-wrap gap-2">
                    {professor.cursosResponsaveis.map((cursoId) => {
                      const curso = cursos.find(c => c.id === cursoId);
                      return curso ? (
                        <span key={cursoId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {curso.titulo}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => handleEditar(professor)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-semibold"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleExcluir(professor.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm font-semibold"
                >
                  🗑️ Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
