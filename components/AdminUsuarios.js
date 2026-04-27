import { useEffect, useState } from "react";
import { usuariosService } from "@/lib/usuariosService";
import { formatters } from "@/lib/formatters";
import ConfirmModal from "./ConfirmModal";

// Função para aplicar máscara de CPF
const maskCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

// Função para aplicar máscara de WhatsApp
const maskWhatsApp = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'confirm', onConfirm: null });

  const [form, setForm] = useState({
    nomeCompleto: "",
    email: "",
    senha: "",
    cpf: "",
    dataNascimento: "",
    whatsapp: "",
    tipo: "aluno",
    status: "ativo"
  });

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    setCarregando(true);
    try { const d = await usuariosService.listarTodos(); setUsuarios(d); } catch { setErro("Erro ao carregar"); }
    setCarregando(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let maskedValue = value;
    
    if (name === 'cpf') {
      maskedValue = maskCPF(value);
    } else if (name === 'whatsapp') {
      maskedValue = maskWhatsApp(value);
    }
    
    setForm(prev => ({ ...prev, [name]: maskedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErro(""); setSucesso("");
    if (!form.nomeCompleto || !form.email || !form.senha || !form.cpf || !form.dataNascimento || !form.whatsapp) { 
      setModal({ isOpen: true, title: 'Atenção', message: 'Preencha todos os campos obrigatórios', type: 'alert', onConfirm: null });
      return; 
    }
    try {
      if (editando) {
        const res = await usuariosService.atualizar(editando.id, form);
        if (res.message) { setSucesso("Atualizado"); setEditando(null); }
        else setErro(res.error || "Erro ao atualizar");
      } else {
        const res = await usuariosService.criar(form);
        if (res.message) setSucesso("Criado");
        else setErro(res.error || "Erro ao criar");
      }
      setForm({ nomeCompleto: "", email: "", senha: "", cpf: "", dataNascimento: "", whatsapp: "", tipo: "aluno", status: "ativo" });
      setMostrarFormulario(false);
      carregar();
    } catch {
      setErro("Erro na operação");
    }
  };

  const editar = (u) => {
    setEditando(u);
    setForm({ nomeCompleto: u.nomeCompleto, email: u.email, senha: u.senha, cpf: u.cpf, dataNascimento: u.dataNascimento, whatsapp: u.whatsapp, tipo: u.tipo, status: u.status });
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletar = async (id) => {
    setModal({
      isOpen: true,
      title: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      type: 'delete',
      onConfirm: async () => {
        const res = await usuariosService.deletar(id);
        if (res.message) { 
          setModal({ isOpen: true, title: 'Sucesso!', message: 'Usuário excluído com sucesso', type: 'success', onConfirm: null });
          carregar(); 
        } else {
          setModal({ isOpen: true, title: 'Erro', message: res.error || 'Erro ao excluir usuário', type: 'error', onConfirm: null });
        }
      }
    });
  };

  const alternarStatus = async (usuario) => {
    const novoStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo';
    setModal({
      isOpen: true,
      title: novoStatus === 'ativo' ? 'Ativar Usuário' : 'Inativar Usuário',
      message: `Deseja ${novoStatus === 'ativo' ? 'ativar' : 'inativar'} o usuário ${usuario.nomeCompleto}?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          const res = await usuariosService.atualizar(usuario.id, { ...usuario, status: novoStatus });
          if (res.message) {
            setModal({ isOpen: true, title: 'Sucesso!', message: `Usuário ${novoStatus === 'ativo' ? 'ativado' : 'inativado'} com sucesso`, type: 'success', onConfirm: null });
            carregar();
          } else {
            setModal({ isOpen: true, title: 'Erro', message: res.error || 'Erro ao alterar status', type: 'error', onConfirm: null });
          }
        } catch {
          setModal({ isOpen: true, title: 'Erro', message: 'Erro ao alterar status', type: 'error', onConfirm: null });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2><p className="text-sm text-gray-600 mt-1">Total: {usuarios.length}</p></div>
        <button onClick={() => { setMostrarFormulario(!mostrarFormulario); setEditando(null); }} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all duration-200"> {mostrarFormulario ? "✕ Cancelar" : "+ Novo Usuário"} </button>
      </div>

      {erro && <div className="bg-red-100 p-3 rounded text-red-700">{erro}</div>}
      {sucesso && <div className="bg-green-100 p-3 rounded text-green-700">{sucesso}</div>}

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold">Nome Completo *</label>
            <input name="nomeCompleto" value={form.nomeCompleto} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label className="block text-sm font-semibold">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label className="block text-sm font-semibold">Senha *</label>
            <input name="senha" type="password" value={form.senha} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label className="block text-sm font-semibold">CPF *</label>
            <input 
              name="cpf" 
              value={form.cpf} 
              onChange={handleChange} 
              className="w-full border rounded px-3 py-2" 
              placeholder="000.000.000-00"
              maxLength="14"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Data de Nascimento *</label>
            <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>

          <div>
            <label className="block text-sm font-semibold">WhatsApp *</label>
            <input 
              name="whatsapp" 
              value={form.whatsapp} 
              onChange={handleChange} 
              className="w-full border rounded px-3 py-2" 
              placeholder="(00) 00000-0000"
              maxLength="15"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Tipo *</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold">Status *</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-6 py-2 rounded-lg hover:shadow-lg transition-all">{editando ? "Atualizar" : "Criar"}</button>
            <button type="button" onClick={() => { setMostrarFormulario(false); setEditando(null); setForm({ nomeCompleto: "", email: "", senha: "", cpf: "", dataNascimento: "", whatsapp: "", tipo: "aluno", status: "ativo" }); }} className="bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-400 transition-all">Cancelar</button>
          </div>
        </form>
      )}

      {carregando ? <div>Carregando...</div> : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">CPF</th>
                <th className="p-3 text-left">WhatsApp</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className={`border-t hover:bg-gray-50 ${u.status === 'inativo' ? 'bg-red-50' : ''}`}>
                  <td className="p-3">{u.nomeCompleto}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.cpf}</td>
                  <td className="p-3">{u.whatsapp}</td>
                  <td className="p-3">{u.tipo}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${u.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => editar(u)} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 font-semibold px-3 py-1 rounded text-sm hover:shadow-lg transition-all">Editar</button>
                      <button 
                        onClick={() => alternarStatus(u)} 
                        className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                          u.status === 'ativo' 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {u.status === 'ativo' ? 'Inativar' : 'Ativar'}
                      </button>
                      <button onClick={() => deletar(u.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-all">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
