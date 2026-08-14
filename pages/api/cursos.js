import fs from 'fs';
import path from 'path';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmlwgvrtissssknqpvbg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase;

const cursosFilePath = path.join(process.cwd(), 'data', 'cursos.json');

// Função para ler cursos do JSON local (Fallback)
function lerCursos() {
  try {
    if (!fs.existsSync(cursosFilePath)) {
      fs.writeFileSync(cursosFilePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(cursosFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler cursos:', error);
    return [];
  }
}

// Função para buscar e adaptar a árvore completa de cursos do Supabase PostgreSQL
async function lerCursosSupabase() {
  try {
    const { data: dbCursos, error } = await supabaseAdmin
      .from('cursos')
      .select('id, titulo, descricao, categoria, carga_horaria, thumbnail_url, video_apresentacao_url, ativo, created_at, modulos ( id, titulo, descricao, ordem, aulas ( id, titulo, descricao, video_url, duracao_minutos, ordem, materiais_apoio ( id, titulo, tipo, arquivo_url ) ) ), avaliacoes!avaliacoes_curso_id_fkey ( id, titulo, descricao, nota_minima, duracao_minutos, questoes ( id, enunciado, ordem, opcoes ( id, texto, is_correta, ordem ) ) )');

    if (error || !dbCursos || dbCursos.length === 0) {
      return null;
    }

    return dbCursos.map(c => {
      const avalDb = Array.isArray(c.avaliacoes) ? c.avaliacoes[0] : c.avaliacoes;
      
      let avaliacaoObj = null;
      if (avalDb) {
        const questoesOrdenadas = (avalDb.questoes || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        const questoesFormatadas = questoesOrdenadas.map(q => {
          const opcoesOrdenadas = (q.opcoes || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
          const respostaCorretaIdx = opcoesOrdenadas.findIndex(op => op.is_correta);
          return {
            id: q.id,
            enunciado: q.enunciado,
            opcoes: opcoesOrdenadas.map(op => op.texto),
            respostaCorreta: respostaCorretaIdx !== -1 ? respostaCorretaIdx : 0
          };
        });

        avaliacaoObj = {
          id: avalDb.id,
          titulo: avalDb.titulo,
          descricao: avalDb.descricao,
          notaMinima: avalDb.nota_minima,
          duracaoMinutos: avalDb.duracao_minutos,
          questoes: questoesFormatadas
        };
      }

      const modulosOrdenados = (c.modulos || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      const modulosFormatados = modulosOrdenados.map(m => {
        const aulasOrdenadas = (m.aulas || []).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        const aulasFormatadas = aulasOrdenadas.map(a => {
          const materiaisFormatados = (a.materiais_apoio || []).map(mat => ({
            id: mat.id,
            titulo: mat.titulo,
            tipo: mat.tipo || 'pdf',
            url: mat.arquivo_url
          }));

          return {
            id: a.id,
            titulo: a.titulo,
            descricao: a.descricao,
            videoUrl: a.video_url,
            duracao: String(a.duracao_minutos || 0),
            ordem: a.ordem,
            materiais: materiaisFormatados,
            questoes: []
          };
        });

        return {
          id: m.id,
          titulo: m.titulo,
          descricao: m.descricao,
          ordem: m.ordem,
          aulas: aulasFormatadas
        };
      });

      return {
        id: c.id,
        titulo: c.titulo,
        descricao: c.descricao,
        categoria: c.categoria || 'Geral',
        cargaHoraria: String(c.carga_horaria || 15),
        thumbnail: c.thumbnail_url || '',
        videoApresentacao: c.video_apresentacao_url || '',
        ativo: c.ativo !== false,
        dataCriacao: c.created_at,
        modulos: modulosFormatados,
        avaliacao: avaliacaoObj
      };
    });
  } catch (err) {
    console.error('Erro na consulta Supabase cursos:', err);
    return null;
  }
}

// Função para salvar cursos (mantida para compatibilidade local)
function salvarCursos(cursos) {
  try {
    fs.writeFileSync(cursosFilePath, JSON.stringify(cursos, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar cursos:', error);
    return false;
  }
}

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const dbCursos = await lerCursosSupabase();
        if (dbCursos) {
          return res.status(200).json(dbCursos);
        }
        const cursos = lerCursos();
        return res.status(200).json(cursos);
      }

      case 'POST': {
        const { titulo, descricao, categoria, cargaHoraria, thumbnail, videoApresentacao, ativo } = req.body;

        if (!titulo) {
          return res.status(400).json({ error: 'O título do curso é obrigatório' });
        }

        const cargaHorariaNum = parseInt(cargaHoraria) || 15;

        // Tentar criar no Supabase PostgreSQL
        try {
          const { data: dbNovoCurso, error: dbError } = await supabase
            .from('cursos')
            .insert({
              titulo: String(titulo).trim(),
              descricao: descricao ? String(descricao).trim() : '',
              categoria: categoria ? String(categoria).trim() : 'Geral',
              carga_horaria: cargaHorariaNum,
              thumbnail_url: thumbnail ? String(thumbnail).trim() : '',
              video_apresentacao_url: videoApresentacao ? String(videoApresentacao).trim() : '',
              ativo: ativo !== false
            })
            .select('*')
            .single();

          if (!dbError && dbNovoCurso) {
            const cursoFormatado = {
              id: dbNovoCurso.id,
              titulo: dbNovoCurso.titulo,
              descricao: dbNovoCurso.descricao,
              categoria: dbNovoCurso.categoria || 'Geral',
              cargaHoraria: String(dbNovoCurso.carga_horaria || 15),
              thumbnail: dbNovoCurso.thumbnail_url || '',
              videoApresentacao: dbNovoCurso.video_apresentacao_url || '',
              ativo: dbNovoCurso.ativo !== false,
              dataCriacao: dbNovoCurso.created_at,
              modulos: []
            };

            return res.status(201).json(cursoFormatado);
          } else if (dbError) {
            console.error('Erro ao inserir curso no Supabase:', dbError);
            return res.status(500).json({ error: 'Erro ao cadastrar curso no banco de dados', detalhe: dbError.message });
          }
        } catch (errDb) {
          console.error('Exceção ao inserir curso no Supabase:', errDb);
          return res.status(500).json({ error: 'Erro interno ao comunicar com o banco de dados' });
        }

        return res.status(500).json({ error: 'Não foi possível cadastrar o curso' });
      }

      case 'PUT': {
        const { id, action, data } = req.body;
        const cursos = lerCursos();
        const cursoIndex = cursos.findIndex(c => String(c.id) === String(id));
        
        // Ações já migradas para o Supabase PostgreSQL funcionam com id do banco real (UUID)
        const acoesMigradasSupabase = ['addModulo', 'addAula', 'addMaterial'];
        if (cursoIndex === -1 && !acoesMigradasSupabase.includes(action)) {
          return res.status(404).json({ error: 'Curso não encontrado' });
        }

        switch (action) {
          case 'updateCurso':
            cursos[cursoIndex] = { 
              ...cursos[cursoIndex], 
              titulo: data.titulo,
              descricao: data.descricao,
              categoria: data.categoria,
              cargaHoraria: data.cargaHoraria,
              thumbnail: data.thumbnail || cursos[cursoIndex].thumbnail || '',
              videoApresentacao: data.videoApresentacao || cursos[cursoIndex].videoApresentacao || '',
              ativo: data.ativo !== undefined ? data.ativo : cursos[cursoIndex].ativo
            };
            break;

          case 'addModulo': {
            if (!id || !data.titulo) {
              return res.status(400).json({ error: 'Dados incompletos para criação de módulo' });
            }

            let cursoIdTarget = String(id);
            if (cursoIdTarget.length !== 36 || !cursoIdTarget.includes('-')) {
              const { data: dbCursos } = await supabaseAdmin.from('cursos').select('id').limit(1);
              if (dbCursos && dbCursos.length > 0) {
                cursoIdTarget = dbCursos[0].id;
              }
            }

            // Buscar ordem atual dos módulos desse curso no Supabase usando o cliente admin
            const { data: modulosExistentes } = await supabaseAdmin
              .from('modulos')
              .select('id, ordem')
              .eq('curso_id', cursoIdTarget);

            const proximaOrdem = (modulosExistentes?.length || 0) + 1;

            // Inserir módulo no Supabase PostgreSQL usando o cliente admin
            const { data: dbModulo, error: errMod } = await supabaseAdmin
              .from('modulos')
              .insert({
                curso_id: cursoIdTarget,
                titulo: String(data.titulo).trim(),
                descricao: data.descricao ? String(data.descricao).trim() : '',
                ordem: proximaOrdem
              })
              .select('*')
              .single();

            if (errMod || !dbModulo) {
              console.error('Erro ao criar módulo no Supabase:', errMod);
              return res.status(500).json({ error: 'Falha ao criar módulo no banco de dados', detalhe: errMod?.message });
            }

            // Buscar e retornar a árvore do curso atualizada do Supabase
            const dbCursosAtualizados = await lerCursosSupabase();
            const cursoAtualizado = dbCursosAtualizados?.find(c => String(c.id) === String(id));

            if (cursoAtualizado) {
              return res.status(200).json(cursoAtualizado);
            }

            return res.status(200).json({
              id: dbModulo.id,
              cursoId: dbModulo.curso_id,
              titulo: dbModulo.titulo,
              descricao: dbModulo.descricao,
              ordem: dbModulo.ordem,
              aulas: []
            });
          }

          case 'updateModulo':
            const moduloIndex = cursos[cursoIndex].modulos.findIndex(m => String(m.id) === String(data.moduloId));
            if (moduloIndex !== -1) {
              cursos[cursoIndex].modulos[moduloIndex] = { ...cursos[cursoIndex].modulos[moduloIndex], ...data.updates };
            }
            break;

          case 'deleteModulo':
            cursos[cursoIndex].modulos = cursos[cursoIndex].modulos.filter(m => String(m.id) !== String(data.moduloId));
            break;

          case 'addAula': {
            let moduloId = data.moduloId;
            if (!moduloId || !data.titulo) {
              return res.status(400).json({ error: 'Dados incompletos para criação de aula (moduloId e titulo são obrigatórios)' });
            }

            // Se o moduloId recebido for um ID legado numérico/timestamp (ex: 1763172962807 ou '1763172962807'), resolver o UUID no Supabase
            const moduloIdStr = String(moduloId);
            if (moduloIdStr.length !== 36 || !moduloIdStr.includes('-')) {
              // 1. Tentar buscar módulos diretamente pelo curso_id enviado
              let { data: dbModulos } = await supabaseAdmin
                .from('modulos')
                .select('id, ordem')
                .eq('curso_id', String(id))
                .order('ordem', { ascending: true });

              // 2. Se não encontrar (pois o id do curso também pode ser um ID legado ex: 1763172911514), buscar todos os módulos
              if (!dbModulos || dbModulos.length === 0) {
                const { data: todosModulos } = await supabaseAdmin
                  .from('modulos')
                  .select('id, ordem')
                  .order('ordem', { ascending: true });
                dbModulos = todosModulos;
              }

              if (dbModulos && dbModulos.length > 0) {
                const targetMod = dbModulos.find(m => String(m.id) === moduloIdStr) || dbModulos[0];
                moduloId = targetMod.id;
              }
            }

            const duracaoNum = parseInt(data.duracao) || 0;

            // Consultar a ordem atual das aulas deste módulo no Supabase usando o cliente admin
            const { data: aulasExistentes } = await supabaseAdmin
              .from('aulas')
              .select('id, ordem')
              .eq('modulo_id', String(moduloId));

            const proximaOrdem = (aulasExistentes?.length || 0) + 1;

            // Inserir aula no Supabase PostgreSQL usando o cliente admin (bypass RLS)
            const { data: dbAula, error: errAula } = await supabaseAdmin
              .from('aulas')
              .insert({
                modulo_id: String(moduloId),
                titulo: String(data.titulo).trim(),
                descricao: data.descricao ? String(data.descricao).trim() : '',
                video_url: data.videoUrl ? String(data.videoUrl).trim() : '',
                duracao_minutos: duracaoNum,
                ordem: proximaOrdem
              })
              .select('*')
              .single();

            if (errAula || !dbAula) {
              console.error('Erro ao criar aula no Supabase:', errAula);
              return res.status(500).json({ error: 'Falha ao criar aula no banco de dados', detalhe: errAula?.message });
            }

            // Buscar e retornar a árvore do curso atualizada do Supabase
            const dbCursosAtualizados = await lerCursosSupabase();
            const cursoAtualizado = dbCursosAtualizados?.find(c => String(c.id) === String(id) || (dbModulo && String(c.id) === String(dbModulo.curso_id))) || dbCursosAtualizados?.[0];

            if (cursoAtualizado) {
              return res.status(200).json(cursoAtualizado);
            }

            return res.status(200).json({
              id: dbAula.id,
              moduloId: dbAula.modulo_id,
              titulo: dbAula.titulo,
              descricao: dbAula.descricao,
              videoUrl: dbAula.video_url,
              duracao: String(dbAula.duracao_minutos),
              ordem: dbAula.ordem,
              materiais: [],
              questoes: []
            });
          }

          case 'updateAula':
            const mod = cursos[cursoIndex].modulos.find(m => String(m.id) === String(data.moduloId));
            if (mod) {
              const aulaIndex = mod.aulas.findIndex(a => String(a.id) === String(data.aulaId));
              if (aulaIndex !== -1) {
                mod.aulas[aulaIndex] = {
                  ...mod.aulas[aulaIndex],
                  titulo: data.titulo,
                  descricao: data.descricao,
                  videoUrl: data.videoUrl,
                  duracao: data.duracao
                };
              }
            }
            break;

          case 'deleteAula':
            const moduloAula = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloAula) {
              moduloAula.aulas = moduloAula.aulas.filter(a => a.id !== data.aulaId);
            }
            break;

          case 'addMaterial': {
            const aulaId = data.aulaId;
            if (!aulaId || !data.titulo || !data.url) {
              return res.status(400).json({ error: 'Dados incompletos para cadastro de material (aulaId, titulo e url são obrigatórios)' });
            }

            // Inserir material de apoio no Supabase PostgreSQL
            const { data: dbMaterial, error: errMat } = await supabase
              .from('materiais_apoio')
              .insert({
                aula_id: String(aulaId),
                titulo: String(data.titulo).trim(),
                tipo: data.tipo ? String(data.tipo).trim() : 'pdf',
                arquivo_url: String(data.url).trim()
              })
              .select('*')
              .single();

            if (errMat || !dbMaterial) {
              console.error('Erro ao cadastrar material no Supabase:', errMat);
              return res.status(500).json({ error: 'Falha ao cadastrar material no banco de dados', detalhe: errMat?.message });
            }

            // Buscar e retornar a árvore do curso atualizada do Supabase
            const dbCursosAtualizados = await lerCursosSupabase();
            const cursoAtualizado = dbCursosAtualizados?.find(c => String(c.id) === String(id));

            if (cursoAtualizado) {
              return res.status(200).json(cursoAtualizado);
            }

            return res.status(200).json({
              id: dbMaterial.id,
              aulaId: dbMaterial.aula_id,
              titulo: dbMaterial.titulo,
              tipo: dbMaterial.tipo,
              url: dbMaterial.arquivo_url
            });
          }

          case 'deleteMaterial':
            const moduloDelMat = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloDelMat) {
              const aulaDelMat = moduloDelMat.aulas.find(a => a.id === data.aulaId);
              if (aulaDelMat) {
                aulaDelMat.materiais = aulaDelMat.materiais.filter(m => m.id !== data.materialId);
              }
            }
            break;

          case 'addQuestao':
            const moduloQuest = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloQuest) {
              const aulaQuest = moduloQuest.aulas.find(a => a.id === data.aulaId);
              if (aulaQuest) {
                const novaQuestao = {
                  id: Date.now(),
                  pergunta: data.pergunta,
                  alternativas: data.alternativas, // array de strings
                  respostaCorreta: data.respostaCorreta, // índice da alternativa correta
                  explicacao: data.explicacao || ''
                };
                aulaQuest.questoes.push(novaQuestao);
              }
            }
            break;

          case 'updateQuestao':
            const moduloUpQuest = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloUpQuest) {
              const aulaUpQuest = moduloUpQuest.aulas.find(a => a.id === data.aulaId);
              if (aulaUpQuest) {
                const questaoIndex = aulaUpQuest.questoes.findIndex(q => q.id === data.questaoId);
                if (questaoIndex !== -1) {
                  aulaUpQuest.questoes[questaoIndex] = { ...aulaUpQuest.questoes[questaoIndex], ...data.updates };
                }
              }
            }
            break;

          case 'deleteQuestao':
            const moduloDelQuest = cursos[cursoIndex].modulos.find(m => m.id === data.moduloId);
            if (moduloDelQuest) {
              const aulaDelQuest = moduloDelQuest.aulas.find(a => a.id === data.aulaId);
              if (aulaDelQuest) {
                aulaDelQuest.questoes = aulaDelQuest.questoes.filter(q => q.id !== data.questaoId);
              }
            }
            break;

          default:
            return res.status(400).json({ error: 'Ação inválida' });
        }

        salvarCursos(cursos);
        return res.status(200).json(cursos[cursoIndex]);
      }

      case 'DELETE': {
        const { id } = req.query;
        const cursos = lerCursos();
        const novosCursos = cursos.filter(c => c.id !== parseInt(id));
        salvarCursos(novosCursos);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API de cursos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
