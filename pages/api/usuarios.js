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

export default async function handler(req, res) {
  const usuarios = carregarUsuarios();
  const { method, query, body } = req;

  if (method === 'GET') {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmlwgvrtissssknqpvbg.supabase.co';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseServiceKey) {
        console.error('SUPABASE_SERVICE_ROLE_KEY não configurada no servidor');
        return res.status(500).json({ error: 'Configuração do servidor incompleta (Service Role Key)' });
      }

      const { createClient } = require('@supabase/supabase-js');
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const { tipo } = query;
      let dbQuery = supabaseAdmin
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: true });

      if (tipo) {
        dbQuery = dbQuery.eq('tipo', String(tipo));
      }

      const { data: dbUsuarios, error: dbError } = await dbQuery;

      if (dbError) {
        console.error('Erro ao consultar usuarios no Supabase:', dbError);
        return res.status(500).json({ error: 'Erro ao consultar usuários no banco de dados', detalhe: dbError.message });
      }

      const usuariosFormatados = (dbUsuarios || []).map(u => ({
        id: u.id,
        nomeCompleto: u.nome_completo || u.nome || '',
        email: u.email || '',
        senha: '',
        tipo: u.tipo || 'aluno',
        cpf: u.cpf || '',
        dataNascimento: u.data_nascimento || '',
        whatsapp: u.whatsapp || '',
        endereco: u.endereco || '',
        cidade: u.cidade || '',
        estado: u.estado || '',
        cep: u.cep || '',
        fotoUrl: u.foto_url || '',
        dataCriacao: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '',
        status: u.status || 'ativo'
      }));

      return res.status(200).json(usuariosFormatados);
    } catch (err) {
      console.error('Exceção ao consultar usuários no Supabase:', err);
      return res.status(500).json({ error: 'Erro interno ao consultar o banco de dados' });
    }
  }

  if (method === 'POST') {
    try {
      const { nomeCompleto, email, senha, cpf, dataNascimento, whatsapp, tipo, status } = body;

      if (!nomeCompleto || !email || !senha) {
        return res.status(400).json({ error: 'Nome completo, e-mail e senha são obrigatórios' });
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmlwgvrtissssknqpvbg.supabase.co';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseServiceKey) {
        console.error('SUPABASE_SERVICE_ROLE_KEY não configurada no servidor');
        return res.status(500).json({ error: 'Configuração do servidor incompleta (Service Role Key)' });
      }

      const { createClient } = require('@supabase/supabase-js');
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const tipoFinal = tipo ? String(tipo).toLowerCase() : 'aluno';
      const statusFinal = status ? String(status).toLowerCase() : 'ativo';

      // 1. Criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: String(email).trim().toLowerCase(),
        password: String(senha),
        email_confirm: true,
        user_metadata: {
          nome_completo: String(nomeCompleto).trim(),
          tipo: tipoFinal
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário no Supabase Auth:', authError);
        if (authError.message?.includes('already registered') || authError.status === 422) {
          return res.status(409).json({ error: 'Este e-mail já está cadastrado no sistema.' });
        }
        return res.status(500).json({ error: 'Erro ao cadastrar usuário no autenticador', detalhe: authError.message });
      }

      const newUserId = authData.user.id;

      // 2. Criar o perfil na tabela public.usuarios (com UUID idêntico ao Auth)
      const { data: perfilData, error: perfilError } = await supabaseAdmin
        .from('usuarios')
        .insert({
          id: newUserId,
          nome_completo: String(nomeCompleto).trim(),
          email: String(email).trim().toLowerCase(),
          cpf: cpf ? String(cpf).trim() : null,
          whatsapp: whatsapp ? String(whatsapp).trim() : null,
          data_nascimento: dataNascimento || null,
          tipo: tipoFinal,
          status: statusFinal
        })
        .select('*')
        .single();

      if (perfilError) {
        console.error('Erro ao criar perfil em public.usuarios, executando rollback no Auth:', perfilError);
        // Rollback: deletar usuário no Auth se a inserção no perfil falhar
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        return res.status(500).json({ error: 'Erro ao salvar perfil no banco de dados', detalhe: perfilError.message });
      }

      const usuarioCriado = {
        id: perfilData.id,
        nomeCompleto: perfilData.nome_completo,
        email: perfilData.email,
        tipo: perfilData.tipo,
        cpf: perfilData.cpf || '',
        dataNascimento: perfilData.data_nascimento || '',
        whatsapp: perfilData.whatsapp || '',
        status: perfilData.status,
        dataCriacao: perfilData.created_at
      };

      return res.status(201).json({
        message: 'Usuário criado com sucesso',
        usuario: usuarioCriado
      });
    } catch (err) {
      console.error('Exceção ao criar usuário no Supabase:', err);
      return res.status(500).json({ error: 'Erro interno do servidor ao cadastrar usuário' });
    }
  }

  if (method === 'PUT') {
    try {
      const targetId = query.id || body.id;

      if (!targetId) {
        return res.status(400).json({ error: 'ID do usuário é obrigatório para atualização' });
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmlwgvrtissssknqpvbg.supabase.co';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseServiceKey) {
        console.error('SUPABASE_SERVICE_ROLE_KEY não configurada no servidor');
        return res.status(500).json({ error: 'Configuração do servidor incompleta (Service Role Key)' });
      }

      const { createClient } = require('@supabase/supabase-js');
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const targetIdStr = String(targetId);

      // 1. Verificar se o usuário existe em public.usuarios
      const { data: usuarioExistente, error: errFetch } = await supabaseAdmin
        .from('usuarios')
        .select('*')
        .eq('id', targetIdStr)
        .single();

      if (errFetch || !usuarioExistente) {
        return res.status(404).json({ error: 'Usuário não encontrado no banco de dados' });
      }

      const { nomeCompleto, cpf, dataNascimento, whatsapp, tipo, status, fotoUrl } = body;

      // 2. Preparar payload de atualização para public.usuarios
      const payloadAtualizacao = {};
      if (nomeCompleto !== undefined) payloadAtualizacao.nome_completo = String(nomeCompleto).trim();
      if (cpf !== undefined) payloadAtualizacao.cpf = cpf ? String(cpf).trim() : null;
      if (whatsapp !== undefined) payloadAtualizacao.whatsapp = whatsapp ? String(whatsapp).trim() : null;
      if (dataNascimento !== undefined) payloadAtualizacao.data_nascimento = dataNascimento || null;
      if (tipo !== undefined) payloadAtualizacao.tipo = String(tipo).toLowerCase();
      if (status !== undefined) payloadAtualizacao.status = String(status).toLowerCase();
      if (fotoUrl !== undefined) payloadAtualizacao.foto_url = String(fotoUrl).trim();

      // 3. Executar atualização em public.usuarios no Supabase
      const { data: usuarioAtualizado, error: errUpdate } = await supabaseAdmin
        .from('usuarios')
        .update(payloadAtualizacao)
        .eq('id', targetIdStr)
        .select('*')
        .single();

      if (errUpdate) {
        console.error('Erro ao atualizar usuário no Supabase:', errUpdate);
        return res.status(500).json({ error: 'Erro ao atualizar usuário no banco de dados', detalhe: errUpdate.message });
      }

      const usuarioFormatado = {
        id: usuarioAtualizado.id,
        nomeCompleto: usuarioAtualizado.nome_completo,
        email: usuarioAtualizado.email,
        tipo: usuarioAtualizado.tipo,
        cpf: usuarioAtualizado.cpf || '',
        dataNascimento: usuarioAtualizado.data_nascimento || '',
        whatsapp: usuarioAtualizado.whatsapp || '',
        status: usuarioAtualizado.status,
        dataCriacao: usuarioAtualizado.created_at
      };

      return res.status(200).json({
        message: 'Usuário atualizado com sucesso',
        usuario: usuarioFormatado
      });
    } catch (err) {
      console.error('Exceção ao atualizar usuário no Supabase:', err);
      return res.status(500).json({ error: 'Erro interno ao atualizar usuário' });
    }
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
