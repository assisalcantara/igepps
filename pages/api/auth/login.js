export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { email, senha } = req.body;

  const usuarios = [
    { id: 1, nome: 'Admin', email: 'admin@igepps.com', senha: 'admin123', tipo: 'admin' },
    { id: 2, nome: 'João Silva', email: 'joao@igepps.com', senha: 'prof123', tipo: 'professor' },
    { id: 3, nome: 'Maria Santos', email: 'maria@igepps.com', senha: 'aluno123', tipo: 'aluno' }
  ];

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (!usuario) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }

  const token = Buffer.from(JSON.stringify({ id: usuario.id, email: usuario.email, tipo: usuario.tipo })).toString('base64');

  res.status(200).json({
    message: 'Login realizado',
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
  });
}
