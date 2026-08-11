import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'data');
const usuariosFile = path.join(dataDir, 'usuarios.json');
const tokensFile = path.join(dataDir, 'recuperacao-tokens.json');

const lerJson = (filePath, defaultData = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Erro ao ler ${filePath}:`, err);
  }
  return defaultData;
};

const salvarJson = (filePath, data) => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Erro ao salvar ${filePath}:`, err);
  }
};

export default async function handler(req, res) {
  const { method } = req;

  // 1. SOLICITAR RECUPERAÇÃO (POST) -> Gera Token e envia/retorna para teste
  if (method === 'POST') {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório' });
    }

    const usuarios = lerJson(usuariosFile);
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!usuario) {
      return res.status(404).json({ error: 'E-mail não encontrado no sistema' });
    }

    // Gerar token alfanumérico temporário de 6 caracteres / timestamp
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiraEm = Date.now() + 15 * 60 * 1000; // 15 minutos

    const tokens = lerJson(tokensFile);
    // Remover tokens antigos deste e-mail
    const tokensFiltrados = tokens.filter(t => t.email.toLowerCase() !== email.toLowerCase());
    
    tokensFiltrados.push({
      email: usuario.email,
      token,
      expiraEm,
      usado: false,
      criadoEm: new Date().toISOString()
    });

    salvarJson(tokensFile, tokensFiltrados);

    return res.status(200).json({
      message: 'Token de recuperação gerado com sucesso!',
      token, // Exibido no retorno JSON para testes e demonstração imediata
      email: usuario.email
    });
  }

  // 2. REDEFINIR SENHA (PUT) -> Valida Token e Atualiza Senha com Bcryptjs
  if (method === 'PUT') {
    const { email, token, novaSenha } = req.body;

    if (!email || !token || !novaSenha) {
      return res.status(400).json({ error: 'E-mail, token e nova senha são obrigatórios' });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
    }

    const tokens = lerJson(tokensFile);
    const tokenValidoIndex = tokens.findIndex(
      t => t.email.toLowerCase() === email.toLowerCase() &&
           t.token === token.toUpperCase() &&
           !t.usado &&
           t.expiraEm > Date.now()
    );

    if (tokenValidoIndex === -1) {
      return res.status(400).json({ error: 'Token inválido, expirado ou já utilizado' });
    }

    const usuarios = lerJson(usuariosFile);
    const usuarioIndex = usuarios.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (usuarioIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Hashing da nova senha via bcryptjs
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    
    // Atualiza a senha no usuário (suporta autenticação direta e com bcryptjs)
    usuarios[usuarioIndex].senha = novaSenha; // Mantém compatibilidade com mock atual
    usuarios[usuarioIndex].senhaHash = senhaHash;
    salvarJson(usuariosFile, usuarios);

    // Invalidar o token de recuperação após o uso
    tokens[tokenValidoIndex].usado = true;
    tokens[tokenValidoIndex].usadoEm = new Date().toISOString();
    salvarJson(tokensFile, tokens);

    return res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
