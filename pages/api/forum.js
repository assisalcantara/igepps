import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmlwgvrtissssknqpvbg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente administrativo exclusivamente via variáveis de ambiente server-side
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Valida o usuário através do Bearer token enviado no header Authorization
async function obterUsuarioAutenticado(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    // Buscar perfil funcional em public.usuarios
    const { data: perfil } = await supabaseAdmin
      .from('usuarios')
      .select('id, nome_completo, email, tipo, status')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      nomeCompleto: perfil?.nome_completo || user.user_metadata?.nome || user.email.split('@')[0],
      tipo: perfil?.tipo || user.user_metadata?.tipo || 'aluno',
      status: perfil?.status || 'ativo'
    };
  } catch (err) {
    console.error('Erro na validação do token Supabase Auth:', err);
    return null;
  }
}

// Verifica se o usuário (seja professor ou admin) pode moderar o curso especificado
async function podeModerarCurso(usuario, cursoId) {
  if (!usuario) return false;
  if (usuario.tipo === 'admin') return true;
  if (usuario.tipo === 'professor') {
    const { data: vinculo } = await supabaseAdmin
      .from('curso_professores')
      .select('curso_id')
      .eq('professor_id', usuario.id)
      .eq('curso_id', String(cursoId))
      .maybeSingle();

    return Boolean(vinculo);
  }
  return false;
}

// Formata o tópico do Supabase para o contrato esperado por components/Forum.js
function formatarTopicoSupabase(topico) {
  const respostas = (topico.forum_respostas || []).map(r => ({
    id: r.id,
    autorId: r.autor_id,
    autorNome: r.usuarios?.nome_completo || 'Usuário',
    autorTipo: r.usuarios?.tipo || 'aluno',
    conteudo: r.conteudo,
    dataCriacao: r.created_at
  })).sort((a, b) => new Date(a.dataCriacao) - new Date(b.dataCriacao));

  return {
    id: topico.id,
    cursoId: topico.curso_id,
    cursoTitulo: topico.cursos?.titulo || 'Curso',
    autorId: topico.autor_id,
    autorNome: topico.usuarios?.nome_completo || 'Usuário',
    autorTipo: topico.usuarios?.tipo || 'aluno',
    titulo: topico.titulo,
    conteudo: topico.conteudo,
    fixado: topico.fixado || false,
    fechado: topico.fechado || false,
    visualizacoes: topico.visualizacoes || 0,
    dataCriacao: topico.created_at,
    dataUltimaResposta: respostas.length > 0 
      ? respostas[respostas.length - 1].dataCriacao 
      : topico.created_at,
    respostas: respostas
  };
}

export default async function handler(req, res) {
  try {
    // -------------------------------------------------------------------------
    // GET: Leitura pública ou autenticada de tópicos
    // -------------------------------------------------------------------------
    if (req.method === 'GET') {
      const { cursoId } = req.query;

      let query = supabaseAdmin
        .from('forum_topicos')
        .select(`
          id, curso_id, autor_id, titulo, conteudo, fixado, fechado, visualizacoes, created_at, updated_at,
          cursos ( id, titulo ),
          usuarios ( id, nome_completo, tipo ),
          forum_respostas (
            id, autor_id, conteudo, created_at,
            usuarios ( id, nome_completo, tipo )
          )
        `)
        .order('created_at', { ascending: false });

      if (cursoId) {
        query = query.eq('curso_id', String(cursoId));
      }

      const { data: dbTopicos, error: dbError } = await query;

      if (dbError) {
        console.error('Erro na consulta do Fórum no Supabase:', dbError);
        return res.status(500).json({ erro: 'Erro ao consultar tópicos do fórum no banco de dados' });
      }

      const topicosFormatados = (dbTopicos || []).map(formatarTopicoSupabase);
      return res.status(200).json(topicosFormatados);
    }

    // -------------------------------------------------------------------------
    // POST: Criar Novo Tópico (Requer Autenticação)
    // -------------------------------------------------------------------------
    if (req.method === 'POST') {
      const usuarioAuth = await obterUsuarioAutenticado(req);
      if (!usuarioAuth) {
        return res.status(401).json({ erro: 'Usuário não autenticado ou token inválido' });
      }

      const { cursoId, titulo, conteudo } = req.body;

      if (!cursoId || !titulo || !conteudo) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando (cursoId, titulo, conteudo)' });
      }

      const { data: novoTopicoDb, error: errInsert } = await supabaseAdmin
        .from('forum_topicos')
        .insert({
          curso_id: String(cursoId),
          autor_id: usuarioAuth.id, // SEMPRE o UUID validado via auth.getUser()
          titulo: String(titulo).trim(),
          conteudo: String(conteudo).trim()
        })
        .select(`
          id, curso_id, autor_id, titulo, conteudo, fixado, fechado, visualizacoes, created_at, updated_at,
          cursos ( id, titulo ),
          usuarios ( id, nome_completo, tipo )
        `)
        .single();

      if (errInsert || !novoTopicoDb) {
        console.error('Erro ao inserir tópico no Supabase:', errInsert);
        return res.status(500).json({ erro: 'Falha ao gravar tópico no banco de dados', detalhe: errInsert?.message });
      }

      const topicoFormatado = formatarTopicoSupabase({ ...novoTopicoDb, forum_respostas: [] });
      return res.status(201).json(topicoFormatado);
    }

    // -------------------------------------------------------------------------
    // PUT: Ações (responder, fixar, fechar, visualizar)
    // -------------------------------------------------------------------------
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { acao, ...dados } = req.body;

      if (!id) {
        return res.status(400).json({ erro: 'ID do tópico não informado' });
      }

      // Buscar tópico no banco para validações de moderador/curso/status
      const { data: topicoExistente, error: errTopico } = await supabaseAdmin
        .from('forum_topicos')
        .select('id, curso_id, autor_id, fixado, fechado, visualizacoes')
        .eq('id', String(id))
        .single();

      if (errTopico || !topicoExistente) {
        return res.status(404).json({ erro: 'Tópico não encontrado' });
      }

      // 1. Ação: Visualizar (pode ser anônima ou autenticada)
      if (acao === 'visualizar') {
        await supabaseAdmin
          .from('forum_topicos')
          .update({ visualizacoes: (topicoExistente.visualizacoes || 0) + 1 })
          .eq('id', String(id));
      } 
      else {
        // Exige autenticação para responder, fixar, fechar ou atualizar
        const usuarioAuth = await obterUsuarioAutenticado(req);
        if (!usuarioAuth) {
          return res.status(401).json({ erro: 'Usuário não autenticado ou token inválido' });
        }

        // 2. Ação: Responder Tópico
        if (acao === 'responder') {
          if (topicoExistente.fechado) {
            return res.status(403).json({ erro: 'Este tópico está fechado e não aceita mais respostas' });
          }

          const { conteudo } = dados;
          if (!conteudo || !String(conteudo).trim()) {
            return res.status(400).json({ erro: 'Conteúdo da resposta é obrigatório' });
          }

          const { error: errResp } = await supabaseAdmin
            .from('forum_respostas')
            .insert({
              topico_id: String(id),
              autor_id: usuarioAuth.id, // SEMPRE o UUID validado
              conteudo: String(conteudo).trim()
            });

          if (errResp) {
            console.error('Erro ao inserir resposta no Supabase:', errResp);
            return res.status(500).json({ erro: 'Falha ao gravar resposta no banco de dados' });
          }
        } 
        // 3. Ação: Fixar Tópico (Requer autorização de moderador/admin)
        else if (acao === 'fixar') {
          const eModerador = await podeModerarCurso(usuarioAuth, topicoExistente.curso_id);
          if (!eModerador) {
            return res.status(403).json({ erro: 'Você não tem permissão para moderar este curso' });
          }

          await supabaseAdmin
            .from('forum_topicos')
            .update({ fixado: !topicoExistente.fixado })
            .eq('id', String(id));
        } 
        // 4. Ação: Fechar Tópico (Requer autorização de moderador/admin)
        else if (acao === 'fechar') {
          const eModerador = await podeModerarCurso(usuarioAuth, topicoExistente.curso_id);
          if (!eModerador) {
            return res.status(403).json({ erro: 'Você não tem permissão para moderar este curso' });
          }

          await supabaseAdmin
            .from('forum_topicos')
            .update({ fechado: !topicoExistente.fechado })
            .eq('id', String(id));
        } 
        // 5. Atualização Geral (Próprio autor ou moderador)
        else {
          const ehAutor = usuarioAuth.id === topicoExistente.autor_id;
          const eModerador = await podeModerarCurso(usuarioAuth, topicoExistente.curso_id);

          if (!ehAutor && !eModerador) {
            return res.status(403).json({ erro: 'Sem permissão para alterar este tópico' });
          }

          const updatePayload = {};
          if (dados.titulo) updatePayload.titulo = String(dados.titulo).trim();
          if (dados.conteudo) updatePayload.conteudo = String(dados.conteudo).trim();

          if (Object.keys(updatePayload).length > 0) {
            await supabaseAdmin
              .from('forum_topicos')
              .update(updatePayload)
              .eq('id', String(id));
          }
        }
      }

      // Retornar o tópico atualizado no contrato esperado
      const { data: topicoAtualizado, error: errFetch } = await supabaseAdmin
        .from('forum_topicos')
        .select(`
          id, curso_id, autor_id, titulo, conteudo, fixado, fechado, visualizacoes, created_at, updated_at,
          cursos ( id, titulo ),
          usuarios ( id, nome_completo, tipo ),
          forum_respostas (
            id, autor_id, conteudo, created_at,
            usuarios ( id, nome_completo, tipo )
          )
        `)
        .eq('id', String(id))
        .single();

      if (errFetch || !topicoAtualizado) {
        return res.status(500).json({ erro: 'Erro ao buscar tópico atualizado' });
      }

      return res.status(200).json(formatarTopicoSupabase(topicoAtualizado));
    }

    // -------------------------------------------------------------------------
    // DELETE: Excluir Tópico ou Resposta
    // -------------------------------------------------------------------------
    if (req.method === 'DELETE') {
      const usuarioAuth = await obterUsuarioAutenticado(req);
      if (!usuarioAuth) {
        return res.status(401).json({ erro: 'Usuário não autenticado ou token inválido' });
      }

      const { id, respostaId } = req.query;

      if (!id) {
        return res.status(400).json({ erro: 'ID do tópico não informado' });
      }

      // 1. Deletar resposta específica
      if (respostaId) {
        const { data: respExistente, error: errFindResp } = await supabaseAdmin
          .from('forum_respostas')
          .select('id, topico_id, autor_id, forum_topicos(curso_id)')
          .eq('id', String(respostaId))
          .single();

        if (errFindResp || !respExistente) {
          return res.status(404).json({ erro: 'Resposta não encontrada' });
        }

        const ehAutorResp = usuarioAuth.id === respExistente.autor_id;
        const eModeradorResp = await podeModerarCurso(usuarioAuth, respExistente.forum_topicos?.curso_id);

        if (!ehAutorResp && !eModeradorResp) {
          return res.status(403).json({ erro: 'Sem permissão para excluir esta resposta' });
        }

        const { error: errDelResp } = await supabaseAdmin
          .from('forum_respostas')
          .delete()
          .eq('id', String(respostaId));

        if (errDelResp) {
          return res.status(500).json({ erro: 'Falha ao excluir resposta no banco' });
        }

        return res.status(200).json({ mensagem: 'Resposta excluída com sucesso' });
      } 
      // 2. Deletar tópico inteiro
      else {
        const { data: topicoExistente, error: errFindTopico } = await supabaseAdmin
          .from('forum_topicos')
          .select('id, curso_id, autor_id')
          .eq('id', String(id))
          .single();

        if (errFindTopico || !topicoExistente) {
          return res.status(404).json({ erro: 'Tópico não encontrado' });
        }

        const ehAutor = usuarioAuth.id === topicoExistente.autor_id;
        const eModerador = await podeModerarCurso(usuarioAuth, topicoExistente.curso_id);

        if (!ehAutor && !eModerador) {
          return res.status(403).json({ erro: 'Sem permissão para excluir este tópico' });
        }

        const { error: errDelTopico } = await supabaseAdmin
          .from('forum_topicos')
          .delete()
          .eq('id', String(id));

        if (errDelTopico) {
          return res.status(500).json({ erro: 'Falha ao excluir tópico no banco' });
        }

        return res.status(200).json({ mensagem: 'Tópico excluído com sucesso' });
      }
    }

    return res.status(405).json({ erro: 'Método não permitido' });

  } catch (error) {
    console.error('Erro não tratado na API do fórum:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor', detalhe: error.message });
  }
}


