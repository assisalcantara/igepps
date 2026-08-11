import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

const forumPath = path.join(process.cwd(), 'data', 'forum.json');

// Função auxiliar para carregar fallback local se Supabase falhar ou estiver vazio
function carregarFallbackLocal() {
  try {
    if (fs.existsSync(forumPath)) {
      return JSON.parse(fs.readFileSync(forumPath, 'utf8'));
    }
  } catch (e) {
    console.error('Erro ao ler fallback local forum.json:', e);
  }
  return [];
}

// Formata o tópico do Supabase para o formato esperado pelo components/Forum.js
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
    // GET: Buscar Tópicos
    // -------------------------------------------------------------------------
    if (req.method === 'GET') {
      const { cursoId } = req.query;

      try {
        let query = supabase
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

        if (!dbError && dbTopicos) {
          const topicosFormatados = dbTopicos.map(formatarTopicoSupabase);
          return res.status(200).json(topicosFormatados);
        } else if (dbError) {
          console.warn('Erro ao consultar Supabase (usando fallback):', dbError.message);
        }
      } catch (errDb) {
        console.warn('Exceção ao consultar Supabase (usando fallback):', errDb.message);
      }

      // Fallback Local JSON
      const topicosLocais = carregarFallbackLocal();
      if (cursoId) {
        const filtrados = topicosLocais.filter(t => String(t.cursoId) === String(cursoId));
        return res.status(200).json(filtrados);
      }
      return res.status(200).json(topicosLocais);
    }

    // -------------------------------------------------------------------------
    // POST: Criar Novo Tópico
    // -------------------------------------------------------------------------
    if (req.method === 'POST') {
      const { cursoId, autorId, autorNome, autorTipo, titulo, conteudo } = req.body;

      if (!cursoId || !autorId || !titulo || !conteudo) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
      }

      try {
        const { data: novoTopicoDb, error: errInsert } = await supabase
          .from('forum_topicos')
          .insert({
            curso_id: String(cursoId),
            autor_id: String(autorId),
            titulo: titulo,
            conteudo: conteudo
          })
          .select(`
            id, curso_id, autor_id, titulo, conteudo, fixado, fechado, visualizacoes, created_at, updated_at,
            cursos ( id, titulo ),
            usuarios ( id, nome_completo, tipo )
          `)
          .single();

        if (!errInsert && novoTopicoDb) {
          const topicoFormatado = formatarTopicoSupabase({ ...novoTopicoDb, forum_respostas: [] });
          return res.status(201).json(topicoFormatado);
        } else if (errInsert) {
          console.warn('Erro ao criar tópico no Supabase (tentando fallback):', errInsert.message);
        }
      } catch (errPostDb) {
        console.warn('Exceção ao criar tópico no Supabase (tentando fallback):', errPostDb.message);
      }

      // Fallback local se Supabase falhar
      const topicosLocais = carregarFallbackLocal();
      const novoTopicoLocal = {
        id: Date.now(),
        cursoId: cursoId,
        autorId,
        autorNome: autorNome || 'Usuário',
        autorTipo: autorTipo || 'aluno',
        titulo,
        conteudo,
        respostas: [],
        visualizacoes: 0,
        fixado: false,
        fechado: false,
        dataCriacao: new Date().toISOString(),
        dataUltimaResposta: new Date().toISOString()
      };
      topicosLocais.push(novoTopicoLocal);
      try {
        fs.writeFileSync(forumPath, JSON.stringify(topicosLocais, null, 2));
      } catch (e) {}

      return res.status(201).json(novoTopicoLocal);
    }

    // -------------------------------------------------------------------------
    // PUT: Ações (responder, fixar, fechar, visualizar) ou Atualização Geral
    // -------------------------------------------------------------------------
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { acao, ...dados } = req.body;

      if (!id) {
        return res.status(400).json({ erro: 'ID do tópico não informado' });
      }

      try {
        // 1. Ação: Responder Tópico
        if (acao === 'responder') {
          const { autorId, conteudo } = dados;
          if (!autorId || !conteudo) {
            return res.status(400).json({ erro: 'Dados da resposta incompletos' });
          }

          const { error: errResp } = await supabase
            .from('forum_respostas')
            .insert({
              topico_id: String(id),
              autor_id: String(autorId),
              conteudo: conteudo
            });

          if (errResp) {
            console.warn('Erro ao inserir resposta no Supabase:', errResp.message);
          }
        } 
        // 2. Ação: Fixar Tópico
        else if (acao === 'fixar') {
          const { data: topicoAtual } = await supabase
            .from('forum_topicos')
            .select('fixado')
            .eq('id', String(id))
            .single();

          if (topicoAtual) {
            await supabase
              .from('forum_topicos')
              .update({ fixado: !topicoAtual.fixado })
              .eq('id', String(id));
          }
        } 
        // 3. Ação: Fechar Tópico
        else if (acao === 'fechar') {
          const { data: topicoAtual } = await supabase
            .from('forum_topicos')
            .select('fechado')
            .eq('id', String(id))
            .single();

          if (topicoAtual) {
            await supabase
              .from('forum_topicos')
              .update({ fechado: !topicoAtual.fechado })
              .eq('id', String(id));
          }
        } 
        // 4. Ação: Visualizar Tópico
        else if (acao === 'visualizar') {
          const { data: topicoAtual } = await supabase
            .from('forum_topicos')
            .select('visualizacoes')
            .eq('id', String(id))
            .single();

          if (topicoAtual) {
            await supabase
              .from('forum_topicos')
              .update({ visualizacoes: (topicoAtual.visualizacoes || 0) + 1 })
              .eq('id', String(id));
          }
        } 
        // 5. Atualização Geral
        else {
          const updatePayload = {};
          if (dados.titulo) updatePayload.titulo = dados.titulo;
          if (dados.conteudo) updatePayload.conteudo = dados.conteudo;
          if (typeof dados.fixado === 'boolean') updatePayload.fixado = dados.fixado;
          if (typeof dados.fechado === 'boolean') updatePayload.fechado = dados.fechado;

          if (Object.keys(updatePayload).length > 0) {
            await supabase
              .from('forum_topicos')
              .update(updatePayload)
              .eq('id', String(id));
          }
        }

        // Retornar tópico atualizado do Supabase
        const { data: topicoAtualizado, error: errFetch } = await supabase
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

        if (!errFetch && topicoAtualizado) {
          return res.status(200).json(formatarTopicoSupabase(topicoAtualizado));
        }
      } catch (errPutDb) {
        console.warn('Exceção no PUT Supabase (tentando fallback local):', errPutDb.message);
      }

      // Fallback local se Supabase não tiver o tópico
      const topicosLocais = carregarFallbackLocal();
      const topicoIndex = topicosLocais.findIndex(t => String(t.id) === String(id));

      if (topicoIndex !== -1) {
        if (acao === 'responder') {
          topicosLocais[topicoIndex].respostas.push({
            id: Date.now(),
            autorId: dados.autorId,
            autorNome: dados.autorNome,
            autorTipo: dados.autorTipo,
            conteudo: dados.conteudo,
            dataCriacao: new Date().toISOString()
          });
          topicosLocais[topicoIndex].dataUltimaResposta = new Date().toISOString();
        } else if (acao === 'fixar') {
          topicosLocais[topicoIndex].fixado = !topicosLocais[topicoIndex].fixado;
        } else if (acao === 'fechar') {
          topicosLocais[topicoIndex].fechado = !topicosLocais[topicoIndex].fechado;
        } else if (acao === 'visualizar') {
          topicosLocais[topicoIndex].visualizacoes += 1;
        } else {
          topicosLocais[topicoIndex] = {
            ...topicosLocais[topicoIndex],
            ...dados,
            dataAtualizacao: new Date().toISOString()
          };
        }

        try {
          fs.writeFileSync(forumPath, JSON.stringify(topicosLocais, null, 2));
        } catch (e) {}

        return res.status(200).json(topicosLocais[topicoIndex]);
      }

      return res.status(404).json({ erro: 'Tópico não encontrado' });
    }

    // -------------------------------------------------------------------------
    // DELETE: Excluir Tópico ou Resposta Específica
    // -------------------------------------------------------------------------
    if (req.method === 'DELETE') {
      const { id, respostaId } = req.query;

      if (!id) {
        return res.status(400).json({ erro: 'ID do tópico não informado' });
      }

      try {
        if (respostaId) {
          // Deletar resposta específica
          const { error: errDelResp } = await supabase
            .from('forum_respostas')
            .delete()
            .eq('id', String(respostaId));

          if (!errDelResp) {
            return res.status(200).json({ mensagem: 'Resposta excluída com sucesso' });
          }
        } else {
          // Deletar tópico inteiro (respostas são apagadas via CASCADE no banco)
          const { error: errDelTopico } = await supabase
            .from('forum_topicos')
            .delete()
            .eq('id', String(id));

          if (!errDelTopico) {
            return res.status(200).json({ mensagem: 'Tópico excluído com sucesso' });
          }
        }
      } catch (errDelDb) {
        console.warn('Exceção no DELETE Supabase (usando fallback):', errDelDb.message);
      }

      // Fallback local se Supabase falhar
      let topicosLocais = carregarFallbackLocal();
      if (respostaId) {
        const topicoIndex = topicosLocais.findIndex(t => String(t.id) === String(id));
        if (topicoIndex !== -1) {
          topicosLocais[topicoIndex].respostas = topicosLocais[topicoIndex].respostas.filter(
            r => String(r.id) !== String(respostaId)
          );
        }
      } else {
        topicosLocais = topicosLocais.filter(t => String(t.id) !== String(id));
      }

      try {
        fs.writeFileSync(forumPath, JSON.stringify(topicosLocais, null, 2));
      } catch (e) {}

      return res.status(200).json({ mensagem: 'Excluído com sucesso' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });

  } catch (error) {
    console.error('Erro na API do fórum:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
}

