import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const usuariosFile = path.join(dataDir, 'usuarios.json');

// Criar diretório se não existir
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Carregar usuários do arquivo
const carregarUsuarios = () => {
  try {
    if (fs.existsSync(usuariosFile)) {
      const data = fs.readFileSync(usuariosFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erro ao carregar usuários:', err);
  }
  
  // Dados padrão se arquivo não existir
  return [
    { 
      id: 1, 
      nomeCompleto: "Admin Sistema", 
      email: "admin@igepps.com", 
      senha: "admin123", 
      tipo: "admin",
      cpf: "000.000.000-00",
      dataNascimento: "1990-01-01",
      whatsapp: "(11) 99999-9999",
      dataCriacao: "2025-11-14",
      status: "ativo"
    },
    { 
      id: 2, 
      nomeCompleto: "João Silva Santos", 
      email: "joao@igepps.com", 
      senha: "prof123", 
      tipo: "professor",
      cpf: "123.456.789-00",
      dataNascimento: "1985-05-15",
      whatsapp: "(11) 98888-8888",
      dataCriacao: "2025-11-14",
      status: "ativo"
    },
    { 
      id: 3, 
      nomeCompleto: "Maria Santos Oliveira", 
      email: "maria@igepps.com", 
      senha: "aluno123", 
      tipo: "aluno",
      cpf: "987.654.321-00",
      dataNascimento: "2000-03-20",
      whatsapp: "(11) 97777-7777",
      dataCriacao: "2025-11-14",
      status: "ativo"
    }
  ];
};

// Salvar usuários no arquivo
const salvarUsuarios = (usuarios) => {
  try {
    fs.writeFileSync(usuariosFile, JSON.stringify(usuarios, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar usuários:', err);
  }
};

export default function handler(req, res) {
  const usuarios = carregarUsuarios();
  const { method, query, body } = req;

  if (method === 'GET') {
    const { tipo } = query;
    if (tipo) return res.status(200).json(usuarios.filter(u => u.tipo === tipo));
    return res.status(200).json(usuarios);
  }

  if (method === 'POST') {
    const { nomeCompleto, email, senha, cpf, dataNascimento, whatsapp, tipo } = body;
    if (!nomeCompleto || !email || !senha || !cpf || !dataNascimento || !whatsapp || !tipo) {
      return res.status(400).json({ error: 'Todos os campos sÃ£o obrigatÃ³rios' });
    }
    if (usuarios.some(u => u.cpf === cpf)) return res.status(409).json({ error: 'CPF jÃ¡ cadastrado' });
    if (usuarios.some(u => u.email === email)) return res.status(409).json({ error: 'Email jÃ¡ cadastrado' });

    const novo = {
      id: Math.max(...usuarios.map(u => u.id), 0) + 1,
      nomeCompleto, email, senha, cpf, dataNascimento, whatsapp, tipo,
      dataCriacao: new Date().toISOString().split('T')[0],
      status: 'ativo'
    };
    usuarios.push(novo);
    salvarUsuarios(usuarios);
    return res.status(201).json({ message: 'Usuário criado com sucesso', usuario: novo });
  }

  if (method === 'PUT') {
    const { id } = query;
    const idx = usuarios.findIndex(u => u.id === parseInt(id));
    if (idx === -1) return res.status(404).json({ error: 'UsuÃ¡rio nÃ£o encontrado' });

    const { nomeCompleto, email, cpf, dataNascimento, whatsapp, tipo, status } = body;

    if (cpf && cpf !== usuarios[idx].cpf && usuarios.some(u => u.cpf === cpf)) return res.status(409).json({ error: 'CPF jÃ¡ cadastrado' });
    if (email && email !== usuarios[idx].email && usuarios.some(u => u.email === email)) return res.status(409).json({ error: 'Email jÃ¡ cadastrado' });

    usuarios[idx] = { ...usuarios[idx], nomeCompleto: nomeCompleto || usuarios[idx].nomeCompleto, email: email || usuarios[idx].email, cpf: cpf || usuarios[idx].cpf, dataNascimento: dataNascimento || usuarios[idx].dataNascimento, whatsapp: whatsapp || usuarios[idx].whatsapp, tipo: tipo || usuarios[idx].tipo, status: status || usuarios[idx].status };

    salvarUsuarios(usuarios);
    return res.status(200).json({ message: 'Usuário atualizado com sucesso', usuario: usuarios[idx] });
  }

  if (method === 'DELETE') {
    const { id } = query;
    const idx = usuarios.findIndex(u => u.id === parseInt(id));
    if (idx === -1) return res.status(404).json({ error: 'Usuário não encontrado' });
    const removed = usuarios.splice(idx, 1)[0];
    salvarUsuarios(usuarios);
    return res.status(200).json({ message: 'Usuário deletado com sucesso', usuario: removed });
  }

  res.status(405).json({ error: 'Método não permitido' });
}
