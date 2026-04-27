export const usuariosService = {
  listarTodos: async () => {
    const res = await fetch("/api/usuarios");
    return await res.json();
  },
  listarPorTipo: async (tipo) => {
    const res = await fetch(`/api/usuarios?tipo=${tipo}`);
    return await res.json();
  },
  criar: async (usuario) => {
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });
    return await res.json();
  },
  atualizar: async (id, usuario) => {
    const res = await fetch(`/api/usuarios?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });
    return await res.json();
  },
  deletar: async (id) => {
    const res = await fetch(`/api/usuarios?id=${id}`, { method: "DELETE" });
    return await res.json();
  }
};
